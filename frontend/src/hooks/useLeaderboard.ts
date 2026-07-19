import { useCallback, useEffect, useRef, useState } from 'react'
import { usePublicClient } from 'wagmi'
import type { Address } from 'viem'
import { FOCUS_STAKE_ADDRESS, FOCUS_STAKE_ABI, FOCUS_STAKE_DEPLOY_BLOCK } from '../config/contract'

// Monad testnet's public RPC caps eth_getLogs to a 100-block window per call.
const CHUNK_SIZE = 100n
const CONCURRENCY = 8
const RESYNC_INTERVAL_MS = 20_000
const CACHE_KEY = `focus-stake:leaderboard:${FOCUS_STAKE_ADDRESS}`

interface Cache {
  lastBlock: string // bigint as string
  started: Record<string, { user: Address; amount: string }>
  resolvedCompleted: Record<string, boolean>
}

function loadCache(): Cache {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) throw new Error('empty')
    const parsed = JSON.parse(raw) as Cache
    if (typeof parsed.lastBlock !== 'string') throw new Error('bad shape')
    return parsed
  } catch {
    return { lastBlock: (FOCUS_STAKE_DEPLOY_BLOCK - 1n).toString(), started: {}, resolvedCompleted: {} }
  }
}

function saveCache(cache: Cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // localStorage full or unavailable — non-fatal, just means no cache next visit
  }
}

export interface LeaderboardRow {
  address: Address
  totalStaked: bigint
  totalShame: bigint
  streak: number
  sessionCount: number
}

export function useLeaderboard() {
  const publicClient = usePublicClient()
  const [rows, setRows] = useState<LeaderboardRow[]>([])
  const [isSyncing, setIsSyncing] = useState(true)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)
  const syncingRef = useRef(false)

  const compute = useCallback((cache: Cache): LeaderboardRow[] => {
    const byUser = new Map<
      Address,
      { totalStaked: bigint; totalShame: bigint; sessionCount: number; ordered: { id: number; completed: boolean | null }[] }
    >()

    const startedEntries = Object.entries(cache.started) as [string, { user: Address; amount: string }][]
    startedEntries.sort((a, b) => Number(a[0]) - Number(b[0]))

    for (const [sessionId, rec] of startedEntries) {
      const user = rec.user.toLowerCase() as Address
      const amount = BigInt(rec.amount)
      const resolved = cache.resolvedCompleted[sessionId]
      const completed = resolved === undefined ? null : resolved

      if (!byUser.has(user)) {
        byUser.set(user, { totalStaked: 0n, totalShame: 0n, sessionCount: 0, ordered: [] })
      }
      const entry = byUser.get(user)!
      entry.totalStaked += amount
      entry.sessionCount += 1
      if (completed === false) entry.totalShame += amount
      entry.ordered.push({ id: Number(sessionId), completed })
    }

    const out: LeaderboardRow[] = []
    for (const [address, entry] of byUser) {
      entry.ordered.sort((a, b) => a.id - b.id)
      let streak = 0
      for (let i = entry.ordered.length - 1; i >= 0; i--) {
        if (entry.ordered[i].completed === true) streak++
        else break
      }
      out.push({
        address,
        totalStaked: entry.totalStaked,
        totalShame: entry.totalShame,
        streak,
        sessionCount: entry.sessionCount,
      })
    }
    return out
  }, [])

  const sync = useCallback(async () => {
    if (!publicClient || syncingRef.current) return
    syncingRef.current = true
    setError(null)
    try {
      const cache = loadCache()
      const latest = await publicClient.getBlockNumber()
      let fromBlock = BigInt(cache.lastBlock) + 1n

      if (fromBlock > latest) {
        setRows(compute(cache))
        setIsSyncing(false)
        syncingRef.current = false
        return
      }

      const ranges: { from: bigint; to: bigint }[] = []
      for (let start = fromBlock; start <= latest; start += CHUNK_SIZE) {
        const end = start + CHUNK_SIZE - 1n > latest ? latest : start + CHUNK_SIZE - 1n
        ranges.push({ from: start, to: end })
      }
      setProgress({ done: 0, total: ranges.length })

      const started: Cache['started'] = { ...cache.started }
      const resolvedCompleted: Cache['resolvedCompleted'] = { ...cache.resolvedCompleted }

      let cursor = 0
      let completedChunks = 0
      let highestSynced = fromBlock - 1n

      async function worker() {
        while (cursor < ranges.length) {
          const idx = cursor++
          const { from, to } = ranges[idx]
          const logs = await publicClient!.getLogs({
            address: FOCUS_STAKE_ADDRESS,
            events: [
              FOCUS_STAKE_ABI.find((e) => 'name' in e && e.name === 'SessionStarted')!,
              FOCUS_STAKE_ABI.find((e) => 'name' in e && e.name === 'SessionResolved')!,
            ] as never,
            fromBlock: from,
            toBlock: to,
          })
          for (const log of logs) {
            const args = (log as unknown as { eventName: string; args: Record<string, unknown> }).args
            const eventName = (log as unknown as { eventName: string }).eventName
            if (eventName === 'SessionStarted') {
              const sessionId = (args.sessionId as bigint).toString()
              started[sessionId] = {
                user: (args.user as Address).toLowerCase() as Address,
                amount: (args.amount as bigint).toString(),
              }
            } else if (eventName === 'SessionResolved') {
              const sessionId = (args.sessionId as bigint).toString()
              resolvedCompleted[sessionId] = args.completed as boolean
            }
          }
          completedChunks++
          if (to > highestSynced) highestSynced = to
          setProgress({ done: completedChunks, total: ranges.length })
        }
      }

      const workers = Array.from({ length: Math.min(CONCURRENCY, ranges.length) }, () => worker())
      await Promise.all(workers)

      const newCache: Cache = {
        lastBlock: (highestSynced > BigInt(cache.lastBlock) ? highestSynced : BigInt(cache.lastBlock)).toString(),
        started,
        resolvedCompleted,
      }
      saveCache(newCache)
      setRows(compute(newCache))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync leaderboard from chain.')
      // fall back to whatever's cached so the page isn't empty
      setRows(compute(loadCache()))
    } finally {
      setIsSyncing(false)
      syncingRef.current = false
    }
  }, [publicClient, compute])

  useEffect(() => {
    void sync()
    const interval = setInterval(() => void sync(), RESYNC_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [sync])

  const topStakers = [...rows].sort((a, b) => (b.totalStaked > a.totalStaked ? 1 : -1)).slice(0, 10)
  const longestStreaks = [...rows]
    .filter((r) => r.streak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 10)
  const topShame = [...rows]
    .filter((r) => r.totalShame > 0n)
    .sort((a, b) => (b.totalShame > a.totalShame ? 1 : -1))
    .slice(0, 10)

  return { topStakers, longestStreaks, topShame, isSyncing, progress, error, totalUsers: rows.length }
}

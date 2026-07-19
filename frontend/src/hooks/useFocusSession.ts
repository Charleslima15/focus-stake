import { useCallback, useEffect, useRef, useState } from 'react'
import { useAccount, usePublicClient, useWriteContract } from 'wagmi'
import { decodeEventLog } from 'viem'
import { FOCUS_STAKE_ADDRESS, FOCUS_STAKE_ABI } from '../config/contract'

export type SessionPhase =
  | 'idle'
  | 'staking' // stake() tx submitted, waiting for confirmation
  | 'active' // stake confirmed, countdown running
  | 'resolving' // resolve() tx submitted, waiting for confirmation
  | 'completed' // resolved(true) confirmed — stake refunded
  | 'broken' // resolved(false) confirmed — stake slashed
  | 'error'

export interface ActiveSessionInfo {
  sessionId: bigint
  amountWei: bigint
  durationSeconds: number
  startedAt: number // ms, client-side clock, used only for the UI countdown
}

export function useFocusSession() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()

  const [phase, setPhase] = useState<SessionPhase>('idle')
  const [session, setSession] = useState<ActiveSessionInfo | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)

  // Guards against double-resolving (e.g. blur firing right as the natural
  // countdown completes, or a user mashing a button twice).
  const resolvingRef = useRef(false)

  const resetError = useCallback(() => setErrorMessage(null), [])

  const startSession = useCallback(
    async (amountWei: bigint, durationSeconds: number) => {
      if (!address) {
        setErrorMessage('Connect your wallet first.')
        return
      }
      try {
        setErrorMessage(null)
        setPhase('staking')
        const hash = await writeContractAsync({
          address: FOCUS_STAKE_ADDRESS,
          abi: FOCUS_STAKE_ABI,
          functionName: 'stake',
          args: [BigInt(durationSeconds)],
          value: amountWei,
        })
        setTxHash(hash)

        const receipt = await publicClient!.waitForTransactionReceipt({ hash })

        // Pull the real sessionId out of the SessionStarted event rather than
        // guessing — stake() returns a value but that return data isn't
        // surfaced from a state-changing tx, only from the emitted log.
        let sessionId: bigint | null = null
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: FOCUS_STAKE_ABI,
              eventName: 'SessionStarted',
              data: log.data,
              topics: log.topics,
            })
            if (decoded.args.user.toLowerCase() === address.toLowerCase()) {
              sessionId = decoded.args.sessionId
              break
            }
          } catch {
            // not the event we're looking for, skip
          }
        }

        if (sessionId === null) {
          throw new Error('Could not find SessionStarted event in receipt logs.')
        }

        resolvingRef.current = false
        setSession({
          sessionId,
          amountWei,
          durationSeconds,
          startedAt: Date.now(),
        })
        setPhase('active')
      } catch (err) {
        console.error(err)
        setErrorMessage(err instanceof Error ? err.message : 'Failed to start session.')
        setPhase('error')
      }
    },
    [address, publicClient, writeContractAsync],
  )

  const resolveSession = useCallback(
    async (completed: boolean) => {
      if (!session || resolvingRef.current) return
      resolvingRef.current = true
      try {
        setPhase('resolving')
        const hash = await writeContractAsync({
          address: FOCUS_STAKE_ADDRESS,
          abi: FOCUS_STAKE_ABI,
          functionName: 'resolve',
          args: [session.sessionId, completed],
        })
        setTxHash(hash)
        await publicClient!.waitForTransactionReceipt({ hash })
        setPhase(completed ? 'completed' : 'broken')
      } catch (err) {
        console.error(err)
        setErrorMessage(err instanceof Error ? err.message : 'Failed to resolve session.')
        setPhase('error')
        resolvingRef.current = false
      }
    },
    [session, publicClient, writeContractAsync],
  )

  // The core mechanic: the instant the tab loses focus or visibility during
  // an active session, resolve(false) fires immediately. No delay, no
  // confirmation dialog.
  useEffect(() => {
    if (phase !== 'active') return

    const slash = () => {
      if (resolvingRef.current) return
      void resolveSession(false)
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') slash()
    }
    const onBlur = () => slash()

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('blur', onBlur)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('blur', onBlur)
    }
  }, [phase, resolveSession])

  // Hold a screen wake lock for the duration of an active session so a
  // phone's own screen-timeout can't masquerade as the user switching away.
  // Without this, visibilitychange fires "hidden" identically whether the
  // user opened another app or the OS just dimmed the screen from
  // inactivity — there's no way to tell those apart after the fact, so the
  // fix is to stop the timeout from firing in the first place. Silently
  // no-ops where the API isn't supported (e.g. Firefox).
  useEffect(() => {
    if (phase !== 'active' || !('wakeLock' in navigator)) return

    let sentinel: WakeLockSentinel | null = null
    let cancelled = false

    const acquire = async () => {
      try {
        const lock = await navigator.wakeLock.request('screen')
        if (cancelled) {
          void lock.release()
          return
        }
        sentinel = lock
      } catch {
        // Wake lock can be refused (low battery mode, no user activation,
        // etc.) — the session still runs, it just loses this protection.
      }
    }

    void acquire()

    return () => {
      cancelled = true
      if (sentinel) void sentinel.release()
    }
  }, [phase])

  const reset = useCallback(() => {
    setPhase('idle')
    setSession(null)
    setErrorMessage(null)
    setTxHash(null)
    resolvingRef.current = false
  }, [])

  return {
    phase,
    session,
    errorMessage,
    txHash,
    startSession,
    resolveSession,
    reset,
    resetError,
  }
}

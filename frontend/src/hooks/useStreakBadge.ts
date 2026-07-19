import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { useCallback, useState } from 'react'
import {
  STREAK_BADGE_ADDRESS,
  STREAK_THRESHOLD,
  FOCUS_STREAK_BADGE_ABI,
} from '../config/streakBadge'

export function useStreakBadge() {
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimError, setClaimError] = useState<string | null>(null)

  const enabled = Boolean(STREAK_BADGE_ADDRESS) && Boolean(address)

  const { data: streak, refetch: refetchStreak } = useReadContract({
    address: STREAK_BADGE_ADDRESS || undefined,
    abi: FOCUS_STREAK_BADGE_ABI,
    functionName: 'currentStreak',
    args: address ? [address] : undefined,
    query: { enabled },
  })

  const { data: hasBadge, refetch: refetchHasBadge } = useReadContract({
    address: STREAK_BADGE_ADDRESS || undefined,
    abi: FOCUS_STREAK_BADGE_ABI,
    functionName: 'hasBadge',
    args: address ? [address] : undefined,
    query: { enabled },
  })

  const claim = useCallback(async () => {
    if (!STREAK_BADGE_ADDRESS) return
    setClaimError(null)
    setIsClaiming(true)
    try {
      await writeContractAsync({
        address: STREAK_BADGE_ADDRESS,
        abi: FOCUS_STREAK_BADGE_ABI,
        functionName: 'claimBadge',
      })
      await Promise.all([refetchStreak(), refetchHasBadge()])
    } catch (err) {
      setClaimError(err instanceof Error ? err.message : 'Failed to claim badge.')
    } finally {
      setIsClaiming(false)
    }
  }, [writeContractAsync, refetchStreak, refetchHasBadge])

  return {
    isFeatureEnabled: Boolean(STREAK_BADGE_ADDRESS),
    streak: streak ?? 0n,
    threshold: STREAK_THRESHOLD,
    hasBadge: Boolean(hasBadge),
    isEligible: !hasBadge && (streak ?? 0n) >= BigInt(STREAK_THRESHOLD),
    claim,
    isClaiming,
    claimError,
    refetch: () => Promise.all([refetchStreak(), refetchHasBadge()]),
  }
}

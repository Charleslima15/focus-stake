import { useReadContract } from 'wagmi'
import { FOCUS_STAKE_ADDRESS, FOCUS_STAKE_ABI } from '../config/contract'

/**
 * Polls the public shame pool total (MON ever slashed, across ALL users).
 * This is intentionally not scoped to the current user — it's a public,
 * live-updating number anyone visiting the site should see.
 */
export function useShamePool() {
  const { data, isLoading, error, refetch } = useReadContract({
    address: FOCUS_STAKE_ADDRESS,
    abi: FOCUS_STAKE_ABI,
    functionName: 'getShamePool',
    query: {
      refetchInterval: 4000, // near-real-time polling
    },
  })

  return {
    shamePool: data ?? 0n,
    isLoading,
    error,
    refetch,
  }
}

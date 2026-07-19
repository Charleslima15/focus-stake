import { formatEther } from 'viem'
import { useShamePool } from '../hooks/useShamePool'

export function ShamePoolTicker() {
  const { shamePool, isLoading, error } = useShamePool()

  return (
    <div>
      <p>Shame Pool</p>
      {error ? (
        <p role="alert">Could not load shame pool total.</p>
      ) : (
        <p>{isLoading ? '...' : `${formatEther(shamePool)} MON`}</p>
      )}
      <p>Total MON ever slashed from broken sessions, across every user.</p>
    </div>
  )
}

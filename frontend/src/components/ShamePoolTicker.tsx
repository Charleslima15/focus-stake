import { formatEther } from 'viem'
import { useShamePool } from '../hooks/useShamePool'

export function ShamePoolTicker() {
  const { shamePool, isLoading, error } = useShamePool()

  return (
    <div className="flex items-center justify-between border-t-2 border-steel bg-void px-4 py-3 sm:px-6">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-verdict opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-verdict" />
        </span>
        <span className="font-mono text-xs tracking-[0.2em] text-steel sm:text-sm">
          SHAME POOL — LIVE
        </span>
      </div>

      {error ? (
        <span role="alert" className="font-mono text-xs text-verdict">
          UNAVAILABLE
        </span>
      ) : (
        <span className="font-mono text-sm font-bold text-verdict sm:text-lg">
          {isLoading ? '—' : `${formatEther(shamePool)} MON`}
        </span>
      )}
    </div>
  )
}

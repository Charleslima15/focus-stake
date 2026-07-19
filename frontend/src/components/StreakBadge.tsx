import { useStreakBadge } from '../hooks/useStreakBadge'

/**
 * Shows current streak progress toward the badge threshold, and a claim
 * button once eligible. Renders nothing if the badge contract hasn't been
 * deployed/configured yet (VITE_STREAK_BADGE_ADDRESS unset) — this is a
 * stretch goal, not part of the core loop.
 */
export function StreakBadge() {
  const { isFeatureEnabled, streak, threshold, hasBadge, isEligible, claim, isClaiming, claimError } =
    useStreakBadge()

  if (!isFeatureEnabled) return null

  return (
    <div className="mt-4 flex items-center justify-between rounded-xl border-2 border-steel px-4 py-3">
      <div className="font-mono text-xs tracking-[0.2em] text-steel">
        {hasBadge ? (
          <span className="text-cleared">BADGE CLAIMED</span>
        ) : (
          <span>
            STREAK{' '}
            <span className="text-paper">
              {streak.toString()} / {threshold}
            </span>
          </span>
        )}
      </div>

      {isEligible && (
        <button
          onClick={claim}
          disabled={isClaiming}
          className="border-2 border-citation px-4 py-1 font-mono text-xs tracking-wide text-citation transition-colors hover:bg-citation hover:text-void disabled:opacity-40"
        >
          {isClaiming ? 'CLAIMING…' : 'CLAIM BADGE'}
        </button>
      )}

      {claimError && (
        <p role="alert" className="font-mono text-xs text-verdict">
          {claimError}
        </p>
      )}
    </div>
  )
}

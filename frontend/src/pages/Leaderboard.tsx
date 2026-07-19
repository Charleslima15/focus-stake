import { formatEther } from 'viem'
import { useLeaderboard, type LeaderboardRow } from '../hooks/useLeaderboard'

function short(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function Column({
  title,
  rows,
  valueKey,
  formatValue,
  emptyLabel,
  accent,
}: {
  title: string
  rows: LeaderboardRow[]
  valueKey: keyof LeaderboardRow
  formatValue: (row: LeaderboardRow) => string
  emptyLabel: string
  accent: string
}) {
  return (
    <div className="overflow-hidden rounded-xl border-2 border-steel">
      <div className={`border-b-2 border-steel px-4 py-2 font-mono text-xs tracking-[0.2em] ${accent}`}>
        {title}
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-8 text-center font-mono text-xs text-steel">{emptyLabel}</p>
      ) : (
        <ol>
          {rows.map((row, i) => (
            <li
              key={row.address + String(valueKey)}
              className="flex items-center justify-between border-b border-steel/40 px-4 py-2.5 font-mono text-sm last:border-none"
            >
              <span className="flex items-center gap-3">
                <span className="w-5 text-steel">{(i + 1).toString().padStart(2, '0')}</span>
                <span className="text-paper">{short(row.address)}</span>
              </span>
              <span className="font-bold text-paper">{formatValue(row)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export function Leaderboard() {
  const { topStakers, longestStreaks, topShame, isSyncing, progress, error, totalUsers } =
    useLeaderboard()

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-steel pb-4">
        <h2 className="font-display text-3xl text-paper sm:text-4xl">PUBLIC RECORDS</h2>
        <p className="font-mono text-xs tracking-[0.15em] text-steel">
          {totalUsers} SUBJECT{totalUsers === 1 ? '' : 'S'} ON FILE
        </p>
      </div>

      {isSyncing && (
        <p className="mb-4 font-mono text-xs tracking-wide text-citation">
          PULLING RECORDS FROM THE CHAIN…{' '}
          {progress.total > 0 && `${progress.done}/${progress.total}`}
        </p>
      )}

      {error && (
        <p role="alert" className="mb-4 font-mono text-xs text-verdict">
          {error} — showing last known records.
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="fade-rise fade-rise-1">
          <Column
            title="TOP STAKERS — LIFETIME MON"
            rows={topStakers}
            valueKey="totalStaked"
            formatValue={(r) => `${formatEther(r.totalStaked)} MON`}
            emptyLabel="No stakes recorded yet."
            accent="text-citation"
          />
        </div>
        <div className="fade-rise fade-rise-2">
          <Column
            title="LONGEST ACTIVE STREAKS"
            rows={longestStreaks}
            valueKey="streak"
            formatValue={(r) => `${r.streak}×`}
            emptyLabel="No streaks yet. Be the first."
            accent="text-cleared"
          />
        </div>
        <div className="fade-rise fade-rise-3">
          <Column
            title="BIGGEST SHAME CONTRIBUTORS"
            rows={topShame}
            valueKey="totalShame"
            formatValue={(r) => `${formatEther(r.totalShame)} MON`}
            emptyLabel="Nobody's broken focus yet."
            accent="text-verdict"
          />
        </div>
      </div>

      <p className="mt-8 font-mono text-xs leading-relaxed text-steel">
        Reconstructed live from on-chain SessionStarted / SessionResolved events —
        no off-chain database, nothing fakeable.
      </p>
    </div>
  )
}

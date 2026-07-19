import { Link } from 'react-router-dom'
import { formatEther } from 'viem'
import { useReadContract } from 'wagmi'
import { FOCUS_STAKE_ADDRESS, FOCUS_STAKE_ABI } from '../config/contract'
import { useShamePool } from '../hooks/useShamePool'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { Reveal } from '../components/Reveal'

function short(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function Stat({ label, value, live }: { label: string; value: string; live?: boolean }) {
  return (
    <div className="flex-1 px-4 py-6 text-center sm:px-8">
      <p className="mb-2 font-mono text-[11px] tracking-[0.25em] text-steel">{label}</p>
      <p className={`font-display text-3xl text-paper sm:text-4xl ${live ? 'tick-pulse' : ''}`}>
        {value}
      </p>
    </div>
  )
}

function Exhibit({
  n,
  title,
  body,
}: {
  n: string
  title: string
  body: string
}) {
  return (
    <div className="border-2 border-steel p-5">
      <p className="mb-3 font-mono text-xs tracking-[0.2em] text-citation">EXHIBIT {n}</p>
      <h3 className="mb-2 font-display text-2xl text-paper">{title}</h3>
      <p className="font-mono text-sm leading-relaxed text-steel">{body}</p>
    </div>
  )
}

export function Home() {
  const { shamePool } = useShamePool()
  const { data: nextSessionId } = useReadContract({
    address: FOCUS_STAKE_ADDRESS,
    abi: FOCUS_STAKE_ABI,
    functionName: 'nextSessionId',
    query: { refetchInterval: 6000 },
  })
  const { topStakers, longestStreaks, topShame, totalUsers } = useLeaderboard()

  const mostWanted = topShame[0]
  const longestStreak = longestStreaks[0]
  const topStaker = topStakers[0]
  const hasRecords = totalUsers > 0

  return (
    <div>
      {/* HERO */}
      <section className="grain relative overflow-hidden border-b-2 border-steel px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
        <div className="mx-auto max-w-4xl">
          <p className="fade-rise fade-rise-1 mb-5 inline-flex items-center gap-2 border-2 border-steel px-3 py-1 font-mono text-[11px] tracking-[0.25em] text-steel">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-citation opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-citation" />
            </span>
            MONAD TESTNET — CASE FILE OPEN
          </p>

          <h1 className="fade-rise fade-rise-2 font-display text-5xl leading-[0.95] text-paper sm:text-7xl">
            YOUR ATTENTION
            <br />
            IS NOW ON
            <br />
            THE RECORD.
          </h1>

          <p className="fade-rise fade-rise-3 mt-6 max-w-xl font-mono text-sm leading-relaxed text-steel sm:text-base">
            Stake MON. Start the clock. Hold focus for the full duration and
            your stake comes back — clean. Switch tabs, minimize the window,
            look away for a second, and it's gone: slashed on the spot into a
            public shame pool everyone can watch grow.
          </p>

          <div className="fade-rise fade-rise-4 mt-8 flex flex-wrap gap-3">
            <Link
              to="/app"
              className="border-2 border-citation bg-citation px-6 py-3 font-display text-xl tracking-wide text-void transition-transform hover:-translate-y-0.5"
            >
              OPEN A SESSION
            </Link>
            <Link
              to="/leaderboard"
              className="border-2 border-paper px-6 py-3 font-mono text-sm tracking-wide text-paper transition-colors hover:border-citation hover:text-citation"
            >
              VIEW PUBLIC RECORDS
            </Link>
          </div>
        </div>

        <div
          className="rotated-stamp absolute -right-4 top-16 hidden select-none border-4 border-double border-verdict px-4 py-2 sm:block"
          aria-hidden="true"
        >
          <p className="font-display text-lg tracking-widest text-verdict">
            NO REFUNDS
            <br />
            ON EXCUSES
          </p>
        </div>
      </section>

      {/* LIVE STATS */}
      <section className="border-b-2 border-steel">
        <Reveal className="mx-auto flex max-w-4xl flex-col divide-y-2 divide-steel sm:flex-row sm:divide-x-2 sm:divide-y-0">
          <Stat label="SESSIONS OPENED" value={(nextSessionId ?? 0n).toString()} />
          <Stat label="SUBJECTS ON FILE" value={totalUsers.toString()} />
          <Stat live label="SHAME POOL — LIVE" value={`${formatEther(shamePool)} MON`} />
        </Reveal>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <Reveal>
          <h2 className="mb-8 font-display text-3xl text-paper sm:text-4xl">
            THE PROCEDURE
          </h2>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-3">
          <Reveal delayMs={0}>
            <Exhibit
              n="A"
              title="STAKE"
              body="Set an amount of MON and a duration. Confirm the transaction. The clock does not wait for you — it starts the moment your stake lands on-chain."
            />
          </Reveal>
          <Reveal delayMs={100}>
            <Exhibit
              n="B"
              title="FOCUS"
              body="Keep the tab visible and the window active for the full duration. No exceptions. A visibilitychange or blur event is treated as a confession."
            />
          </Reveal>
          <Reveal delayMs={200}>
            <Exhibit
              n="C"
              title="VERDICT"
              body="Finish clean and your stake is refunded in full. Break focus — even once, even briefly — and it's slashed into the public shame pool instantly."
            />
          </Reveal>
        </div>
      </section>

      {/* THE VERDICT SPLIT */}
      <section className="border-y-2 border-steel">
        <div className="mx-auto grid max-w-4xl sm:grid-cols-2">
          <Reveal className="border-b-2 border-steel px-6 py-10 sm:border-b-0 sm:border-r-2">
            <p className="font-display text-4xl text-cleared">CLEARED</p>
            <p className="mt-3 font-mono text-sm leading-relaxed text-steel">
              Full duration held, no interruptions. Your stake returns to
              your wallet in the same transaction that closes the case.
              Three clean sessions in a row and you're eligible to claim a
              Streak Badge — a permanent, on-chain record of your discipline.
            </p>
          </Reveal>
          <Reveal delayMs={100} className="px-6 py-10">
            <p className="font-display text-4xl text-verdict">BROKEN</p>
            <p className="mt-3 font-mono text-sm leading-relaxed text-steel">
              One lost tab, one alt-tab, one notification you couldn't
              resist. Your stake moves into the shame pool immediately — no
              confirmation dialog, no grace period, no undo. Everyone
              watching the site sees the total grow in real time.
            </p>
          </Reveal>
        </div>
      </section>

      {/* MOST WANTED / LEADERBOARD PREVIEW */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <Reveal className="mb-8 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-3xl text-paper sm:text-4xl">MOST WANTED</h2>
          <Link
            to="/leaderboard"
            className="font-mono text-xs tracking-[0.2em] text-citation hover:underline"
          >
            FULL RECORDS →
          </Link>
        </Reveal>

        {!hasRecords ? (
          <Reveal className="border-2 border-steel px-6 py-12 text-center">
            <p className="font-mono text-sm text-steel">
              No subjects on file yet. The first case opens the record.
            </p>
          </Reveal>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <Reveal delayMs={0} className="border-2 border-steel p-5">
              <p className="mb-3 font-mono text-xs tracking-[0.2em] text-citation">
                TOP STAKER
              </p>
              <p className="font-display text-2xl text-paper">
                {topStaker ? short(topStaker.address) : '—'}
              </p>
              <p className="mt-1 font-mono text-sm text-steel">
                {topStaker ? `${formatEther(topStaker.totalStaked)} MON staked` : 'no data yet'}
              </p>
            </Reveal>
            <Reveal delayMs={100} className="border-2 border-steel p-5">
              <p className="mb-3 font-mono text-xs tracking-[0.2em] text-cleared">
                LONGEST STREAK
              </p>
              <p className="font-display text-2xl text-paper">
                {longestStreak ? short(longestStreak.address) : '—'}
              </p>
              <p className="mt-1 font-mono text-sm text-steel">
                {longestStreak ? `${longestStreak.streak} sessions clean` : 'no data yet'}
              </p>
            </Reveal>
            <Reveal delayMs={200} className="border-2 border-steel p-5">
              <p className="mb-3 font-mono text-xs tracking-[0.2em] text-verdict">
                MOST SHAMED
              </p>
              <p className="font-display text-2xl text-paper">
                {mostWanted ? short(mostWanted.address) : '—'}
              </p>
              <p className="mt-1 font-mono text-sm text-steel">
                {mostWanted ? `${formatEther(mostWanted.totalShame)} MON forfeited` : 'no data yet'}
              </p>
            </Reveal>
          </div>
        )}
      </section>

      {/* FINAL CTA */}
      <section>
        <div className="hazard-stripe h-2 w-full" />
        <Reveal className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-6 py-14 text-center">
          <h2 className="font-display text-3xl text-paper sm:text-4xl">
            THE CLOCK ISN'T RUNNING YET.
          </h2>
          <p className="max-w-md font-mono text-sm text-steel">
            It starts the second you confirm the stake. Everything after that
            is on you.
          </p>
          <Link
            to="/app"
            className="mt-2 border-2 border-citation bg-citation px-8 py-3 font-display text-xl tracking-wide text-void transition-transform hover:-translate-y-0.5"
          >
            OPEN A SESSION
          </Link>
        </Reveal>
        <div className="hazard-stripe h-2 w-full" />
      </section>
    </div>
  )
}

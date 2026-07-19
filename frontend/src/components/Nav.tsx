import { NavLink } from 'react-router-dom'
import { ConnectWallet } from './ConnectWallet'
import { useSoundPref } from '../hooks/useSoundPref'

const links = [
  { to: '/', label: 'CASE FILE', end: true },
  { to: '/app', label: 'OPEN SESSION', end: false },
  { to: '/leaderboard', label: 'RECORDS', end: false },
]

export function Nav() {
  const { muted, toggle } = useSoundPref()

  return (
    <header className="border-b-4 border-void">
      <div className="hazard-stripe h-2 w-full" />
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <NavLink to="/" className="font-display text-2xl tracking-wide text-paper sm:text-3xl">
          FOCUS STAKE
        </NavLink>

        <nav className="flex items-center gap-1 font-mono text-xs tracking-[0.15em] sm:gap-2 sm:text-sm">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `border-2 px-3 py-1.5 transition-colors ${
                  isActive
                    ? 'border-citation bg-citation text-void'
                    : 'border-steel text-paper hover:border-paper'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
            aria-pressed={!muted}
            title={muted ? 'SFX muted' : 'SFX on'}
            className="rounded-full border-2 border-steel px-2.5 py-1.5 font-mono text-xs text-steel transition-colors hover:border-paper hover:text-paper"
          >
            {muted ? 'SFX OFF' : 'SFX ON'}
          </button>
          <ConnectWallet />
        </div>
      </div>
    </header>
  )
}

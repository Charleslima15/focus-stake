import { useAccount } from 'wagmi'
import { useFocusSession } from '../hooks/useFocusSession'
import { SessionSetup } from '../components/SessionSetup'
import { ActiveSession } from '../components/ActiveSession'
import { VerdictStamp } from '../components/VerdictStamp'
import { StreakBadge } from '../components/StreakBadge'

export function FocusApp() {
  const { isConnected } = useAccount()
  const { phase, session, errorMessage, startSession, resolveSession, reset } =
    useFocusSession()

  const showVerdict = phase === 'completed' || phase === 'broken'

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <div
        key={phase === 'staking' || phase === 'idle' ? 'setup' : phase}
        className={`fade-rise relative border-2 border-steel bg-void px-4 py-2 sm:px-6 ${
          showVerdict ? 'case-panel-shake' : ''
        }`}
      >
        {showVerdict && (
          <VerdictStamp verdict={phase === 'completed' ? 'cleared' : 'broken'} />
        )}

        {!isConnected && (
          <p className="py-10 text-center font-mono text-sm text-steel">
            Connect your wallet to open a case file and stake on a focus
            session.
          </p>
        )}

        {isConnected && phase === 'idle' && (
          <SessionSetup disabled={false} onStake={startSession} />
        )}

        {isConnected && phase === 'staking' && (
          <p className="py-16 text-center font-mono text-sm tracking-wide text-citation">
            CONFIRMING STAKE ON-CHAIN…
          </p>
        )}

        {isConnected && phase === 'active' && session && (
          <ActiveSession
            session={session}
            onNaturalCompletion={() => resolveSession(true)}
          />
        )}

        {isConnected && phase === 'resolving' && (
          <p className="py-16 text-center font-mono text-sm tracking-wide text-citation">
            RESOLVING SESSION ON-CHAIN…
          </p>
        )}

        {isConnected && (phase === 'completed' || phase === 'broken') && (
          <div className="py-16 text-center">
            <button
              onClick={reset}
              className="border-2 border-paper px-6 py-2 font-mono text-sm tracking-wide text-paper transition-colors hover:border-citation hover:text-citation"
            >
              {phase === 'completed' ? 'START ANOTHER SESSION' : 'TRY AGAIN'}
            </button>
          </div>
        )}

        {phase === 'error' && (
          <div className="py-10 text-center">
            <p role="alert" className="font-mono text-sm text-verdict">
              {errorMessage}
            </p>
            <button
              onClick={reset}
              className="mt-4 border-2 border-paper px-6 py-2 font-mono text-sm tracking-wide text-paper transition-colors hover:border-citation hover:text-citation"
            >
              RESET
            </button>
          </div>
        )}
      </div>

      {isConnected && <StreakBadge />}
    </div>
  )
}

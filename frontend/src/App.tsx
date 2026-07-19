import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useFocusSession } from './hooks/useFocusSession'
import { SessionSetup } from './components/SessionSetup'
import { ActiveSession } from './components/ActiveSession'
import { ShamePoolTicker } from './components/ShamePoolTicker'

function App() {
  const { isConnected } = useAccount()
  const { phase, session, errorMessage, startSession, resolveSession, reset } =
    useFocusSession()

  return (
    <div>
      <header>
        <h1>Focus Stake</h1>
        <ConnectButton />
      </header>

      <ShamePoolTicker />

      <main>
        {!isConnected && <p>Connect your wallet to stake on a focus session.</p>}

        {isConnected && phase === 'idle' && (
          <SessionSetup disabled={false} onStake={startSession} />
        )}

        {isConnected && phase === 'staking' && <p>Confirming your stake on-chain...</p>}

        {isConnected && phase === 'active' && session && (
          <ActiveSession
            session={session}
            onNaturalCompletion={() => resolveSession(true)}
          />
        )}

        {isConnected && phase === 'resolving' && <p>Resolving session on-chain...</p>}

        {isConnected && phase === 'completed' && (
          <div>
            <p>Session complete. Your stake was refunded.</p>
            <button onClick={reset}>Start another session</button>
          </div>
        )}

        {isConnected && phase === 'broken' && (
          <div>
            <p>Focus broken. Your stake was slashed into the shame pool.</p>
            <button onClick={reset}>Try again</button>
          </div>
        )}

        {phase === 'error' && (
          <div>
            <p role="alert">{errorMessage}</p>
            <button onClick={reset}>Reset</button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App

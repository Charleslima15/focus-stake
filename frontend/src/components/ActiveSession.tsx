import { useEffect, useRef, useState } from 'react'
import { formatEther } from 'viem'
import type { ActiveSessionInfo } from '../hooks/useFocusSession'
import { playTick } from '../lib/sound'

interface Props {
  session: ActiveSessionInfo
  onNaturalCompletion: () => void
}

function formatTime(totalSeconds: number) {
  const clamped = Math.max(0, totalSeconds)
  const m = Math.floor(clamped / 60)
  const s = clamped % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function ActiveSession({ session, onNaturalCompletion }: Props) {
  const [remaining, setRemaining] = useState(() => {
    const elapsed = Math.floor((Date.now() - session.startedAt) / 1000)
    return Math.max(0, session.durationSeconds - elapsed)
  })
  const firedRef = useRef(false)
  const lastTickRef = useRef<number | null>(null)

  useEffect(() => {
    firedRef.current = false
    lastTickRef.current = null
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - session.startedAt) / 1000)
      const left = Math.max(0, session.durationSeconds - elapsed)
      setRemaining(left)
      if (left > 0 && left <= 10 && lastTickRef.current !== left) {
        lastTickRef.current = left
        playTick()
      }
      if (left <= 0 && !firedRef.current) {
        firedRef.current = true
        clearInterval(interval)
        onNaturalCompletion()
      }
    }, 250)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.startedAt, session.durationSeconds])

  const progressPct = Math.min(
    100,
    Math.max(0, (1 - remaining / session.durationSeconds) * 100),
  )

  const isCritical = remaining > 0 && remaining <= 10

  return (
    <div className="py-6">
      <div className="mb-6 flex items-center justify-between">
        <p className="font-mono text-xs tracking-[0.2em] text-steel">
          CASE No. {session.sessionId.toString().padStart(6, '0')}
        </p>
        <p className="font-mono text-xs tracking-[0.2em] text-citation">
          ● STATUS: ACTIVE
        </p>
      </div>

      <p
        className={`text-center font-display text-8xl leading-none sm:text-9xl ${
          isCritical ? 'urgent-pulse text-verdict' : 'text-paper'
        }`}
      >
        {formatTime(remaining)}
      </p>

      <div className="mt-8 flex justify-between font-mono text-sm text-steel">
        <span>
          STAKED{' '}
          <span className="text-paper">{formatEther(session.amountWei)} MON</span>
        </span>
        <span>
          DURATION{' '}
          <span className="text-paper">
            {formatTime(session.durationSeconds)}
          </span>
        </span>
      </div>

      <div className="ticket-progress-track mt-3 h-3 w-full">
        <div
          className="h-3 bg-citation transition-[width] duration-300 ease-linear"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <p className="mt-8 text-center font-mono text-sm text-verdict">
        Do not switch tabs or leave this window. Any loss of focus slashes
        your stake immediately.
      </p>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { formatEther } from 'viem'
import type { ActiveSessionInfo } from '../hooks/useFocusSession'

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

  useEffect(() => {
    firedRef.current = false
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - session.startedAt) / 1000)
      const left = Math.max(0, session.durationSeconds - elapsed)
      setRemaining(left)
      if (left <= 0 && !firedRef.current) {
        firedRef.current = true
        clearInterval(interval)
        onNaturalCompletion()
      }
    }, 250)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.startedAt, session.durationSeconds])

  const progress = 1 - remaining / session.durationSeconds

  return (
    <div>
      <p>Session #{session.sessionId.toString()}</p>
      <p>Staked: {formatEther(session.amountWei)} MON</p>
      <p>{formatTime(remaining)}</p>
      <div>
        <div style={{ width: `${Math.min(100, progress * 100)}%` }} />
      </div>
      <p>Do not switch tabs or leave this window. Any loss of focus slashes your stake immediately.</p>
    </div>
  )
}

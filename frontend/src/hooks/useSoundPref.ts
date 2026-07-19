import { useCallback, useState } from 'react'
import { getMuted, setMuted } from '../lib/sound'

export function useSoundPref() {
  const [muted, setMutedState] = useState(() => getMuted())

  const toggle = useCallback(() => {
    setMutedState((prev) => {
      const next = !prev
      setMuted(next)
      return next
    })
  }, [])

  return { muted, toggle }
}

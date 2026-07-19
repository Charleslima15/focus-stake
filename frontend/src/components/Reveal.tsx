import { useEffect, useRef, useState, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  delayMs?: number
}

/**
 * Fades/rises children into view the first time they cross into the
 * viewport. Pairs with the .reveal / .reveal.is-visible CSS in index.css.
 */
export function Reveal({ children, className = '', delayMs = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delayMs > 0) {
            setTimeout(() => setVisible(true), delayMs)
          } else {
            setVisible(true)
          }
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [delayMs])

  return (
    <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} ${className}`}>
      {children}
    </div>
  )
}

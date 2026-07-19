import { useEffect, useRef, useState } from 'react'
import { formatEther } from 'viem'
import { generateVerdictCardBlob } from '../lib/verdictCard'

interface Props {
  verdict: 'cleared' | 'broken'
  sessionId: bigint
  amountWei: bigint
  durationSeconds: number
  txHash: `0x${string}` | null
}

function humanDuration(seconds: number) {
  const mins = Math.round(seconds / 60)
  return mins === 1 ? '1 minute' : `${mins} minutes`
}

function shortDuration(seconds: number) {
  return `${Math.round(seconds / 60)} MIN`
}

type ShareCapableNavigator = Navigator & {
  canShare?: (data: { files: File[] }) => boolean
  share?: (data: { files?: File[]; title?: string; text?: string; url?: string }) => Promise<void>
}

export function VerdictReceipt({ verdict, sessionId, amountWei, durationSeconds, txHash }: Props) {
  const amount = formatEther(amountWei)
  const duration = humanDuration(durationSeconds)
  const caseNo = sessionId.toString().padStart(6, '0')
  const explorerUrl = txHash ? `https://testnet.monadscan.com/tx/${txHash}` : null
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://focus-stake.xyz'

  const shareText =
    verdict === 'cleared'
      ? `I just held focus for ${duration} straight and kept my ${amount} MON stake on Focus Stake. No phone, no excuses. 🫡`
      : `I broke focus during a ${duration} session and got ${amount} MON slashed into the public shame pool on Focus Stake. 💀`

  const [cardUrl, setCardUrl] = useState<string | null>(null)
  const blobRef = useRef<Blob | null>(null)

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null

    generateVerdictCardBlob({
      verdict,
      caseNo,
      stakeLabel: `${amount} MON`,
      durationLabel: shortDuration(durationSeconds),
    })
      .then((blob) => {
        if (cancelled) return
        blobRef.current = blob
        objectUrl = URL.createObjectURL(blob)
        setCardUrl(objectUrl)
      })
      .catch((err) => console.error('Failed to generate verdict card', err))

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [verdict, caseNo, amount, durationSeconds])

  const downloadCard = () => {
    if (!cardUrl) return
    const a = document.createElement('a')
    a.href = cardUrl
    a.download = `focus-stake-case-${caseNo}.png`
    a.click()
  }

  const shareCard = async () => {
    const nav = navigator as ShareCapableNavigator
    if (blobRef.current && nav.canShare && nav.share) {
      const file = new File([blobRef.current], `focus-stake-case-${caseNo}.png`, { type: 'image/png' })
      if (nav.canShare({ files: [file] })) {
        try {
          await nav.share({ files: [file], title: 'Focus Stake', text: shareText })
          return
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') return
          // fall through to the download + intent-link fallback below
        }
      }
    }
    downloadCard()
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(siteUrl)}`,
      '_blank',
      'noreferrer',
    )
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border-2 border-steel bg-void">
      <div className="px-5 pt-4">
        <p className="font-mono text-[10px] tracking-[0.3em] text-steel">FOCUS STAKE — SHARE YOUR VERDICT</p>
      </div>

      <div className="px-5 pt-3">
        <div className="aspect-[1200/675] w-full overflow-hidden rounded-lg border-2 border-steel bg-void">
          {cardUrl ? (
            <img
              src={cardUrl}
              alt={`Focus Stake verdict card — case ${caseNo}, ${verdict === 'cleared' ? 'CLEARED' : 'BROKEN'}`}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-xs tracking-wide text-steel">
              GENERATING CARD…
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 px-5 py-4">
        <button
          type="button"
          onClick={downloadCard}
          disabled={!cardUrl}
          className="flex-1 border-2 border-steel py-2 text-center font-mono text-xs tracking-[0.15em] text-paper transition-colors hover:border-paper disabled:opacity-40"
        >
          DOWNLOAD
        </button>
        <button
          type="button"
          onClick={shareCard}
          disabled={!cardUrl}
          className="flex-1 border-2 border-paper py-2 text-center font-mono text-xs tracking-[0.15em] text-paper transition-colors hover:border-citation hover:text-citation disabled:opacity-40"
        >
          SHARE
        </button>
      </div>

      {explorerUrl && (
        <div className="px-5 pb-4">
          <a
            href={explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[11px] text-citation underline underline-offset-2 hover:text-paper"
          >
            VERIFY CASE No. {caseNo} ON-CHAIN →
          </a>
        </div>
      )}
    </div>
  )
}

import { formatEther } from 'viem'

interface Props {
  verdict: 'cleared' | 'broken'
  sessionId: bigint
  amountWei: bigint
  durationSeconds: number
  txHash: `0x${string}` | null
}

function durationLabel(seconds: number) {
  const mins = Math.round(seconds / 60)
  return mins === 1 ? '1 minute' : `${mins} minutes`
}

export function VerdictReceipt({ verdict, sessionId, amountWei, durationSeconds, txHash }: Props) {
  const amount = formatEther(amountWei)
  const duration = durationLabel(durationSeconds)
  const explorerUrl = txHash ? `https://testnet.monadscan.com/tx/${txHash}` : null
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://focus-stake.xyz'

  const shareText =
    verdict === 'cleared'
      ? `I just held focus for ${duration} straight and kept my ${amount} MON stake on Focus Stake. No phone, no excuses. 🫡`
      : `I broke focus during a ${duration} session and got ${amount} MON slashed into the public shame pool on Focus Stake. 💀`

  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(siteUrl)}`

  return (
    <div className="mx-auto max-w-sm rounded-xl border-2 border-steel bg-void">
      <div className="px-5 pt-4">
        <p className="font-mono text-[10px] tracking-[0.3em] text-steel">FOCUS STAKE — CITATION RECEIPT</p>
      </div>

      <div className="perforation mx-5 mt-3" />

      <div className="space-y-2.5 px-5 py-4 font-mono text-xs">
        <div className="flex justify-between">
          <span className="text-steel">CASE No.</span>
          <span className="text-paper">{sessionId.toString().padStart(6, '0')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-steel">VERDICT</span>
          <span className={verdict === 'cleared' ? 'text-cleared' : 'text-verdict'}>
            {verdict === 'cleared' ? 'CLEARED' : 'BROKEN'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-steel">STAKE</span>
          <span className="text-paper">{amount} MON</span>
        </div>
        <div className="flex justify-between">
          <span className="text-steel">DURATION</span>
          <span className="text-paper">{duration}</span>
        </div>
        {explorerUrl && (
          <div className="flex justify-between">
            <span className="text-steel">ON-CHAIN</span>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="text-citation underline underline-offset-2 hover:text-paper"
            >
              VERIFY →
            </a>
          </div>
        )}
      </div>

      <div className="perforation mx-5" />

      <div className="px-5 py-4">
        <a
          href={shareUrl}
          target="_blank"
          rel="noreferrer"
          className="block w-full border-2 border-paper py-2 text-center font-mono text-xs tracking-[0.15em] text-paper transition-colors hover:border-citation hover:text-citation"
        >
          SHARE ON X →
        </a>
      </div>
    </div>
  )
}

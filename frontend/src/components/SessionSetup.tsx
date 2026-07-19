import { useState } from 'react'
import { parseEther } from 'viem'

interface Props {
  disabled: boolean
  onStake: (amountWei: bigint, durationSeconds: number) => void
}

export function SessionSetup({ disabled, onStake }: Props) {
  const [amount, setAmount] = useState('0.1')
  const [minutes, setMinutes] = useState(25)
  const [validationError, setValidationError] = useState<string | null>(null)

  const presets = [15, 25, 45]

  const handleSubmit = () => {
    setValidationError(null)
    let amountWei: bigint
    try {
      amountWei = parseEther(amount || '0')
    } catch {
      setValidationError('Enter a valid MON amount.')
      return
    }
    if (amountWei <= 0n) {
      setValidationError('Stake must be greater than 0.')
      return
    }
    if (!Number.isFinite(minutes) || minutes <= 0) {
      setValidationError('Duration must be greater than 0.')
      return
    }
    onStake(amountWei, Math.round(minutes * 60))
  }

  return (
    <div className="space-y-6 py-6">
      <div>
        <p className="mb-2 font-mono text-xs tracking-[0.2em] text-steel">
          STAKE AMOUNT (MON)
        </p>
        <input
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={disabled}
          className="w-full border-2 border-steel bg-transparent px-3 py-2 font-mono text-2xl text-paper outline-none focus:border-citation disabled:opacity-40"
        />
      </div>

      <div>
        <p className="mb-2 font-mono text-xs tracking-[0.2em] text-steel">
          DURATION (MINUTES)
        </p>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              disabled={disabled}
              onClick={() => setMinutes(p)}
              className={`border-2 px-3 py-1 font-mono text-sm transition-colors disabled:opacity-40 ${
                minutes === p
                  ? 'border-citation bg-citation text-void'
                  : 'border-steel text-paper hover:border-paper'
              }`}
            >
              {p}
            </button>
          ))}
          <input
            type="number"
            step="1"
            min="1"
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            disabled={disabled}
            className="w-24 border-2 border-steel bg-transparent px-3 py-1 font-mono text-sm text-paper outline-none focus:border-citation disabled:opacity-40"
          />
        </div>
      </div>

      {validationError && (
        <p role="alert" className="font-mono text-sm text-verdict">
          {validationError}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={disabled}
        className="w-full bg-citation py-4 font-display text-2xl tracking-wide text-void transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-40 sm:text-3xl"
      >
        STAKE &amp; START
      </button>
      <p className="font-mono text-xs leading-relaxed text-steel">
        Once staked, switching tabs or leaving this window at any point during
        the session immediately forfeits your stake to the shame pool. There
        is no confirmation and no undo.
      </p>
    </div>
  )
}

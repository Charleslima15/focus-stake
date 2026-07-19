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
    <div>
      <label>
        Stake amount (MON)
        <input
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={disabled}
        />
      </label>

      <label>
        Duration (minutes)
        <input
          type="number"
          step="1"
          min="1"
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          disabled={disabled}
        />
      </label>

      {validationError && <p role="alert">{validationError}</p>}

      <button onClick={handleSubmit} disabled={disabled}>
        Stake &amp; Start Focus Session
      </button>
    </div>
  )
}

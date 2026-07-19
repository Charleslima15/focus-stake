interface Props {
  verdict: 'cleared' | 'broken'
}

const copy = {
  cleared: {
    label: 'CLEARED',
    detail: 'Stake refunded in full.',
    color: 'text-cleared border-cleared',
  },
  broken: {
    label: 'BROKEN',
    detail: 'Stake forfeited to the shame pool.',
    color: 'text-verdict border-verdict',
  },
} as const

export function VerdictStamp({ verdict }: Props) {
  const v = copy[verdict]
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-void/70 backdrop-blur-[1px]">
      <div
        key={verdict}
        className={`stamp-enter select-none rounded-sm border-[6px] ${v.color} px-8 py-4 text-center`}
        style={{ borderStyle: 'double' }}
      >
        <p className="font-display text-6xl tracking-widest sm:text-7xl">{v.label}</p>
        <p className="mt-1 font-mono text-xs tracking-wide text-paper/80 sm:text-sm">
          {v.detail}
        </p>
      </div>
    </div>
  )
}

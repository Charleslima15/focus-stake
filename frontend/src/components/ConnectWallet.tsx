import { ConnectButton } from '@rainbow-me/rainbowkit'

/**
 * Custom-rendered wallet connect control — RainbowKit's default button reads
 * as a generic dapp widget that clashes with the case-file theme. This one
 * uses the same typography/border language as the rest of the UI, with a
 * "stamped" pop-in the instant a wallet connects.
 */
export function ConnectWallet() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="group relative flex items-center gap-2 border-2 border-citation px-4 py-1.5 font-mono text-xs tracking-[0.15em] text-citation transition-all hover:-translate-y-0.5 hover:bg-citation hover:text-void sm:text-sm"
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-citation opacity-75 group-hover:bg-void" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-citation group-hover:bg-void" />
                    </span>
                    CONNECT WALLET
                  </button>
                )
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="connect-pop border-2 border-verdict px-4 py-1.5 font-mono text-xs tracking-[0.15em] text-verdict transition-all hover:-translate-y-0.5 hover:bg-verdict hover:text-paper sm:text-sm"
                  >
                    WRONG NETWORK
                  </button>
                )
              }

              return (
                <div className="connect-pop flex items-center gap-2">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="hidden border-2 border-steel px-2 py-1.5 font-mono text-xs text-steel transition-colors hover:border-paper hover:text-paper sm:block"
                  >
                    {chain.name?.toUpperCase()}
                  </button>
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="flex items-center gap-2 border-2 border-cleared px-4 py-1.5 font-mono text-xs tracking-[0.1em] text-cleared transition-all hover:-translate-y-0.5 hover:bg-cleared hover:text-void sm:text-sm"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-cleared group-hover:bg-void" />
                    {account.displayName}
                  </button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

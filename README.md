# Focus Stake

**Put your attention on the record.**

Stake MON before starting a timed focus session. Hold focus for the full duration and your stake comes back, clean. Switch tabs, minimize the window, or look away — even once — and your stake is slashed on the spot into a public, live-updating **shame pool** that anyone visiting the site can watch grow in real time.

Built for the BuildAnything **Spark** hackathon on [Monad](https://monad.xyz).

## The problem

Focus is easy to promise and easy to break, and there's rarely any real cost to breaking it. Focus Stake makes the cost real and immediate: money on the line, judged by the browser's own `visibilitychange` and `blur` events, with no confirmation dialog and no undo. Break focus and the consequence isn't private — it's added to a public ledger everyone can see.

## How it works

1. **Stake.** Connect a wallet, set a MON amount and a session duration (or use a 15/25/45-minute preset), and confirm the transaction. The clock starts the moment your stake lands on-chain.
2. **Focus.** Keep the tab visible and the window active for the full duration. The instant the tab is hidden or the window loses focus, the session is immediately resolved as broken — no grace period.
3. **Verdict.** Finish clean and your stake is refunded in the same transaction that closes the case. Break focus and your stake moves into the contract's shame pool, visible to everyone on the site.

Three clean sessions in a row make you eligible to claim a **Streak Badge** — an ERC-721 minted from an on-chain streak, not an off-chain database.

## Architecture

```
focus-stake/
├── contracts/     Solidity contracts (Hardhat), Monad Testnet
└── frontend/      React + Vite dapp
```

### Contracts (Monad Testnet, chainId 10143)

| Contract | Address | Purpose |
|---|---|---|
| [`FocusStake.sol`](contracts/contracts/FocusStake.sol) | [`0x7645d790b9D04e1650eE502173091C1B913438E6`](https://testnet.monadscan.com/address/0x7645d790b9D04e1650eE502173091C1B913438E6#code) | Core staking game — `stake()`, `resolve()`, shame pool accounting |
| [`FocusStreakBadge.sol`](contracts/contracts/FocusStreakBadge.sol) | [`0x5B773fE0D56807ACfac93fC5f2E2784a05db33c7`](https://testnet.monadscan.com/address/0x5B773fE0D56807ACfac93fC5f2E2784a05db33c7#code) | ERC-721 badge, minted after 3 consecutive completed sessions |

Both are verified on MonadScan — see [`contracts/README.md`](contracts/README.md) for the full interface and deploy/verify commands.

### Frontend

React 19 + Vite + TypeScript, wagmi/viem for contract calls, RainbowKit for wallet connection, Tailwind v4 for styling, React Router for the three pages (case file homepage, session app, public leaderboard).

No off-chain database anywhere — the shame pool ticker, session state, and the leaderboard are all read directly from contract state and on-chain event logs (`SessionStarted` / `SessionResolved`), reconstructed client-side with local caching to work around the RPC's 100-block `eth_getLogs` limit.

## Running it locally

### Prerequisites

- Node.js 18+
- A Monad Testnet wallet with test MON — get some from the [faucet](https://faucet.monad.xyz)
- A free WalletConnect project ID from [cloud.reown.com](https://cloud.reown.com) (only needed for WalletConnect-based mobile wallets; injected wallets like MetaMask work without it)

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# edit .env: set VITE_WALLETCONNECT_PROJECT_ID
npm run dev
```

Opens at `http://localhost:5173`. `VITE_STREAK_BADGE_ADDRESS` in `.env` is already pointed at the deployed badge contract above — leave it as-is unless you redeploy your own.

### Contracts (optional — only if you want to redeploy or modify)

```bash
cd contracts
npm install
# create .env with PRIVATE_KEY, MONAD_TESTNET_RPC, ETHERSCAN_API_KEY — see contracts/README.md
npx hardhat compile
npx hardhat run scripts/deploy.js --network monadTestnet
```

The deployed `FocusStake` address above is the live, submitted contract for this hackathon — don't redeploy it unless you're intentionally forking the project.

## Tech stack

- **Contracts:** Solidity, Hardhat, OpenZeppelin (ERC-721), Monad Testnet
- **Frontend:** React, Vite, TypeScript, wagmi, viem, RainbowKit, Tailwind CSS, React Router
- **No backend, no database** — every number on screen comes from real contract state

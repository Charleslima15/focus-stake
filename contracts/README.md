# Focus Stake — contracts

Two contracts on Monad Testnet (chainId `10143`, RPC `https://testnet-rpc.monad.xyz`, explorer `https://testnet.monadscan.com`).

## FocusStake.sol — core staking game

Deployed and verified at [`0x7645d790b9D04e1650eE502173091C1B913438E6`](https://testnet.monadscan.com/address/0x7645d790b9D04e1650eE502173091C1B913438E6#code).

- `stake(uint256 duration) payable returns (uint256 sessionId)` — deposits `msg.value` as MON, opens a session for `duration` seconds.
- `resolve(uint256 sessionId, bool completed)` — `completed=true` only succeeds once `duration` has elapsed, and refunds the stake. `completed=false` moves the stake into `shamePool` at any time.
- `getShamePool()`, `getUserSessions(address)`, `getSession(uint256)` — view functions backing the frontend.

Do not modify or redeploy this contract — it's the live, submitted contract for the hackathon.

## FocusStreakBadge.sol — streak badge (stretch goal)

A separate ERC-721 contract that only *reads* FocusStake's public session data — it never touches anyone's staked MON.

Deployed and verified at [`0x5B773fE0D56807ACfac93fC5f2E2784a05db33c7`](https://testnet.monadscan.com/address/0x5B773fE0D56807ACfac93fC5f2E2784a05db33c7#code), constructed against the FocusStake address above.

`currentStreak(user)` walks a user's sessions from most recent to oldest and counts consecutive `Completed` ones, stopping at the first `Broken` session. Hit 3 in a row (`STREAK_THRESHOLD`) and `claimBadge()` mints one ERC-721 badge to that address — one badge per address, ever, tied entirely to real on-chain session history.

## Setup

```shell
npm install
```

Create `.env` (see `.gitignore` — never commit this file):

```
PRIVATE_KEY=<deployer private key, testnet only>
MONAD_TESTNET_RPC=https://testnet-rpc.monad.xyz
ETHERSCAN_API_KEY=<any value works for MonadScan's Etherscan-v2-compatible API>
```

## Compile, deploy, verify

```shell
npx hardhat compile
npx hardhat run scripts/deploy.js --network monadTestnet            # FocusStake
npx hardhat run scripts/deployStreakBadge.js --network monadTestnet # FocusStreakBadge
npx hardhat verify --network monadTestnet <address> [constructorArgs...]
```

After deploying `FocusStreakBadge`, copy its address into `frontend/.env` as `VITE_STREAK_BADGE_ADDRESS` to activate the badge UI.

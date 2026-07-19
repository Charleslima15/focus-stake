import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { monadTestnet } from './chains'

// Get a free WalletConnect Cloud project ID at https://cloud.reown.com
// and put it in a .env file as VITE_WALLETCONNECT_PROJECT_ID=...
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID'

export const wagmiConfig = getDefaultConfig({
  appName: 'Focus Stake',
  projectId,
  chains: [monadTestnet],
  ssr: false,
})

import { http, cookieStorage, createConfig, createStorage } from 'wagmi'
import { Chain } from 'viem'
import { walletConnect, injected } from 'wagmi/connectors'

// Define Hedera Testnet chain
export const hederaTestnet = {
  id: 296,
  name: 'Hedera Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    default: { http: ['https://testnet.hashio.io/api'] },
    public: { http: ['https://testnet.hashio.io/api'] },
  },
  blockExplorers: {
    default: { name: 'HashScan', url: 'https://hashscan.io/testnet' },
  },
  testnet: true,
} as const satisfies Chain

// Define Hedera Mainnet chain
export const hederaMainnet = {
  id: 295,
  name: 'Hedera Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    default: { http: ['https://mainnet.hashio.io/api'] },
    public: { http: ['https://mainnet.hashio.io/api'] },
  },
  blockExplorers: {
    default: { name: 'HashScan', url: 'https://hashscan.io/mainnet' },
  },
  testnet: false,
} as const satisfies Chain

// Configure wagmi for Hedera only (no Base connectors)
export const config = createConfig({
  chains: [hederaTestnet, hederaMainnet],
  connectors: [
    injected({ target: 'metaMask' }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
      metadata: {
        name: 'OneSafeBet',
        description: 'Gamified No-Loss Prediction Platform on Hedera',
        url: 'https://onesafebet.com',
        icons: ['https://onesafebet.com/icon.svg'],
      },
      showQrModal: true,
    }),
  ],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [hederaTestnet.id]: http(),
    [hederaMainnet.id]: http(),
  },
})

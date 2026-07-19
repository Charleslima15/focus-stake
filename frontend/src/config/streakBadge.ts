// Set after you deploy contracts/FocusStreakBadge.sol — see contracts/README.md
export const STREAK_BADGE_ADDRESS = (import.meta.env.VITE_STREAK_BADGE_ADDRESS ||
  '') as `0x${string}` | ''

export const STREAK_THRESHOLD = 3

export const FOCUS_STREAK_BADGE_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'currentStreak',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'isEligible',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'hasBadge',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claimBadge',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'streakLength', type: 'uint256' },
    ],
    name: 'BadgeMinted',
    type: 'event',
  },
] as const

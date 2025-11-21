// PredictionMarket Smart Contract Integration
// This file contains the ABI and address for the PredictionMarket contract

export const PREDICTION_MARKET_ADDRESS = "0x1eb7D3769a12CBD08C28FEEF7c4c8ebdAa989756" // Deployed on Hedera Testnet

export const PREDICTION_MARKET_ABI = [
  // Read Functions
  {
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "getMarket",
    outputs: [
      {
        components: [
          { name: "id", type: "uint256" },
          { name: "question", type: "string" },
          { name: "category", type: "string" },
          { name: "createdAt", type: "uint256" },
          { name: "endTime", type: "uint256" },
          { name: "yesPool", type: "uint256" },
          { name: "noPool", type: "uint256" },
          { name: "yesVoters", type: "uint256" },
          { name: "noVoters", type: "uint256" },
          { name: "minStake", type: "uint256" },
          { name: "isResolved", type: "bool" },
          { name: "outcome", type: "bool" },
          { name: "isActive", type: "bool" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalMarkets",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "user", type: "address" },
    ],
    name: "getUserVote",
    outputs: [
      { name: "", type: "uint8" },
      { name: "", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "choice", type: "bool" },
      { name: "amount", type: "uint256" },
    ],
    name: "calculatePotentialWin",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  // Write Functions
  {
    inputs: [
      { name: "question", type: "string" },
      { name: "category", type: "string" },
      { name: "duration", type: "uint256" },
      { name: "minStake", type: "uint256" },
    ],
    name: "createMarket",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "choice", type: "bool" },
      { name: "amount", type: "uint256" },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "marketId", type: "uint256" }],
    name: "claimReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "depositPrizePool",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },

  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "marketId", type: "uint256" },
      { indexed: false, name: "question", type: "string" },
      { indexed: false, name: "category", type: "string" },
      { indexed: false, name: "endTime", type: "uint256" },
      { indexed: false, name: "minStake", type: "uint256" },
    ],
    name: "MarketCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "marketId", type: "uint256" },
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "choice", type: "bool" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "VoteCast",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "marketId", type: "uint256" },
      { indexed: false, name: "outcome", type: "bool" },
      { indexed: false, name: "totalPool", type: "uint256" },
    ],
    name: "MarketResolved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "marketId", type: "uint256" },
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "RewardClaimed",
    type: "event",
  },
] as const

// Helper types for TypeScript
export interface Market {
  id: bigint
  question: string
  category: string
  createdAt: bigint
  endTime: bigint
  yesPool: bigint
  noPool: bigint
  yesVoters: bigint
  noVoters: bigint
  minStake: bigint
  isResolved: boolean
  outcome: boolean
  isActive: boolean
}

export interface UserVote {
  choice: number // 0 = not voted, 1 = YES, 2 = NO
  amount: bigint
}

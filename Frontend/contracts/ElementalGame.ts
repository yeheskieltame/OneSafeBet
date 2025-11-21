// ElementalGame Smart Contract Integration
// This file contains the ABI and address for the ElementalGame contract

export const ELEMENTAL_GAME_ADDRESS = "0x6F00756F10cbDf14dbC05b43404ECaAf8d0dB73f" as const // Hedera Testnet

export const ELEMENTAL_GAME_ABI = [
  // Read Functions
  {
    inputs: [],
    name: "currentRoundId",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "roundId", type: "uint256" }],
    name: "getRoundInfo",
    outputs: [
      {
        components: [
          { name: "id", type: "uint256" },
          { name: "startTime", type: "uint256" },
          { name: "lockTime", type: "uint256" },
          { name: "endTime", type: "uint256" },
          { name: "totalPowerFire", type: "uint256" },
          { name: "totalPowerWater", type: "uint256" },
          { name: "totalPowerWind", type: "uint256" },
          { name: "totalYieldPot", type: "uint256" },
          { name: "winningFaction", type: "uint8" },
          { name: "isResolved", type: "bool" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "roundId", type: "uint256" },
      { name: "user", type: "address" },
    ],
    name: "getUserVote",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "roundId", type: "uint256" },
      { name: "user", type: "address" },
    ],
    name: "hasClaimed",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },

  // Write Functions
  {
    inputs: [{ name: "faction", type: "uint8" }],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "resolveRound",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "roundId", type: "uint256" }],
    name: "claimReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "depositYield",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },

  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "roundId", type: "uint256" },
      { indexed: false, name: "startTime", type: "uint256" },
      { indexed: false, name: "lockTime", type: "uint256" },
      { indexed: false, name: "endTime", type: "uint256" },
    ],
    name: "RoundStarted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "roundId", type: "uint256" },
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "faction", type: "uint8" },
      { indexed: false, name: "power", type: "uint256" },
    ],
    name: "Voted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "roundId", type: "uint256" },
      { indexed: false, name: "winningFaction", type: "uint8" },
    ],
    name: "RoundResolved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "roundId", type: "uint256" },
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "RewardClaimed",
    type: "event",
  },
] as const

// Helper constants
export const FACTIONS = {
  NONE: 0,
  FIRE: 1,
  WATER: 2,
  WIND: 3,
} as const

export type Faction = typeof FACTIONS[keyof typeof FACTIONS]

// Helper types for TypeScript
export interface Round {
  id: bigint
  startTime: bigint
  lockTime: bigint
  endTime: bigint
  totalPowerFire: bigint
  totalPowerWater: bigint
  totalPowerWind: bigint
  totalYieldPot: bigint
  winningFaction: number
  isResolved: boolean
}

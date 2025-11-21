import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { ELEMENTAL_GAME_ADDRESS, ELEMENTAL_GAME_ABI, FACTIONS, type Round } from '@/contracts/ElementalGame'
import { useEffect } from 'react'

export function useElementalGame() {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  // Debug logging
  useEffect(() => {
    console.log('[useElementalGame] User address:', address)
    console.log('[useElementalGame] Contract:', ELEMENTAL_GAME_ADDRESS)
  }, [address])

  // Read current round ID
  const { data: currentRoundId, refetch: refetchRoundId } = useReadContract({
    address: ELEMENTAL_GAME_ADDRESS,
    abi: ELEMENTAL_GAME_ABI,
    functionName: 'currentRoundId',
    query: {
      refetchInterval: 5000, // Refetch every 5 seconds
      staleTime: 0,
      gcTime: 0,
    },
  })

  // Read current round info
  const { data: roundInfo, refetch: refetchRoundInfo } = useReadContract({
    address: ELEMENTAL_GAME_ADDRESS,
    abi: ELEMENTAL_GAME_ABI,
    functionName: 'getRoundInfo',
    args: currentRoundId ? [currentRoundId] : undefined,
    query: {
      enabled: !!currentRoundId,
      refetchInterval: 5000,
      staleTime: 0,
      gcTime: 0,
    },
  })

  // Read user's vote for current round
  const { data: userVote, refetch: refetchUserVote } = useReadContract({
    address: ELEMENTAL_GAME_ADDRESS,
    abi: ELEMENTAL_GAME_ABI,
    functionName: 'getUserVote',
    args: currentRoundId && address ? [currentRoundId, address] : undefined,
    query: {
      enabled: !!(currentRoundId && address),
      refetchInterval: 3000,
      staleTime: 0,
      gcTime: 0,
    },
  })

  // Read if user has claimed for current round
  const { data: hasClaimed, refetch: refetchHasClaimed } = useReadContract({
    address: ELEMENTAL_GAME_ADDRESS,
    abi: ELEMENTAL_GAME_ABI,
    functionName: 'hasClaimed',
    args: currentRoundId && address ? [currentRoundId, address] : undefined,
    query: {
      enabled: !!(currentRoundId && address),
      refetchInterval: 3000,
      staleTime: 0,
      gcTime: 0,
    },
  })

  // Debug round info
  useEffect(() => {
    if (currentRoundId) {
      console.log('[useElementalGame] Current Round ID:', currentRoundId.toString())
    }
    if (roundInfo) {
      console.log('[useElementalGame] Round Info:', roundInfo)
    }
    if (userVote !== undefined) {
      console.log('[useElementalGame] User Vote:', userVote)
    }
  }, [currentRoundId, roundInfo, userVote])

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  })

  // Auto-refetch when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      const refetchData = async () => {
        setTimeout(async () => {
          await refetchRoundId()
          await refetchRoundInfo()
          await refetchUserVote()
          await refetchHasClaimed()
        }, 1000)

        setTimeout(async () => {
          await refetchRoundId()
          await refetchRoundInfo()
          await refetchUserVote()
          await refetchHasClaimed()
        }, 3000)
      }

      refetchData()
    }
  }, [isConfirmed, refetchRoundId, refetchRoundInfo, refetchUserVote, refetchHasClaimed])

  /**
   * Vote for a faction
   * @param faction 1=Fire, 2=Water, 3=Wind
   */
  const vote = async (faction: number) => {
    try {
      writeContract({
        address: ELEMENTAL_GAME_ADDRESS,
        abi: ELEMENTAL_GAME_ABI,
        functionName: 'vote',
        args: [faction],
      })
    } catch (err) {
      console.error('Vote error:', err)
      throw err
    }
  }

  /**
   * Claim reward for a specific round
   */
  const claimReward = async (roundId: bigint) => {
    try {
      writeContract({
        address: ELEMENTAL_GAME_ADDRESS,
        abi: ELEMENTAL_GAME_ABI,
        functionName: 'claimReward',
        args: [roundId],
      })
    } catch (err) {
      console.error('Claim reward error:', err)
      throw err
    }
  }

  /**
   * Calculate faction percentages
   */
  const getFactionPercentages = () => {
    if (!roundInfo) return { fire: 0, water: 0, wind: 0 }

    const round = roundInfo as Round
    const total = round.totalPowerFire + round.totalPowerWater + round.totalPowerWind

    if (total === 0n) {
      return { fire: 0, water: 0, wind: 0 }
    }

    return {
      fire: Number((round.totalPowerFire * 100n) / total),
      water: Number((round.totalPowerWater * 100n) / total),
      wind: Number((round.totalPowerWind * 100n) / total),
    }
  }

  /**
   * Calculate net advantage scores
   */
  const getAdvantageScores = () => {
    const percentages = getFactionPercentages()

    return {
      fire: percentages.wind - percentages.water,
      water: percentages.fire - percentages.wind,
      wind: percentages.water - percentages.fire,
    }
  }

  /**
   * Get time remaining until lock
   */
  const getTimeUntilLock = () => {
    if (!roundInfo) return 0
    const round = roundInfo as Round
    const now = BigInt(Math.floor(Date.now() / 1000))
    const remaining = round.lockTime - now
    return remaining > 0n ? Number(remaining) : 0
  }

  /**
   * Get time remaining until end
   */
  const getTimeUntilEnd = () => {
    if (!roundInfo) return 0
    const round = roundInfo as Round
    const now = BigInt(Math.floor(Date.now() / 1000))
    const remaining = round.endTime - now
    return remaining > 0n ? Number(remaining) : 0
  }

  /**
   * Check if voting is locked
   */
  const isLocked = () => {
    if (!roundInfo) return true
    const round = roundInfo as Round
    const now = BigInt(Math.floor(Date.now() / 1000))
    return now >= round.lockTime
  }

  /**
   * Refresh all data
   */
  const refetchAll = () => {
    refetchRoundId()
    refetchRoundInfo()
    refetchUserVote()
    refetchHasClaimed()
  }

  return {
    // Data
    currentRoundId: currentRoundId || 0n,
    roundInfo: roundInfo as Round | undefined,
    userVote: (userVote as number) || 0,
    hasClaimed: hasClaimed || false,

    // Computed values
    factionPercentages: getFactionPercentages(),
    advantageScores: getAdvantageScores(),
    timeUntilLock: getTimeUntilLock(),
    timeUntilEnd: getTimeUntilEnd(),
    isLocked: isLocked(),

    // Functions
    vote,
    claimReward,
    refetchAll,

    // Transaction state
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,

    // Constants
    FACTIONS,
  }
}

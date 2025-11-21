import { useReadContract, useAccount } from 'wagmi'
import { QUEST_MANAGER_ADDRESS, QUEST_MANAGER_ABI } from '@/contracts/QuestManager'
import { useEffect } from 'react'

export function useQuestManager() {
  const { address } = useAccount()

  // Debug logging
  useEffect(() => {
    console.log('[useQuestManager] User address:', address)
    console.log('[useQuestManager] QuestManager contract:', QUEST_MANAGER_ADDRESS)
  }, [address])

  // Read user stats (total wins and win streak)
  const {
    data: userStats,
    refetch: refetchUserStats,
    isLoading: isStatsLoading,
    error: statsError,
  } = useReadContract({
    address: QUEST_MANAGER_ADDRESS,
    abi: QUEST_MANAGER_ABI,
    functionName: 'getUserStats',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000, // Refetch every 5 seconds
      staleTime: 0,
      gcTime: 0,
    },
  })

  // Read novice badge address
  const { data: noviceBadgeAddress } = useReadContract({
    address: QUEST_MANAGER_ADDRESS,
    abi: QUEST_MANAGER_ABI,
    functionName: 'noviceBadge',
  })

  // Read loyalist badge address
  const { data: loyalistBadgeAddress } = useReadContract({
    address: QUEST_MANAGER_ADDRESS,
    abi: QUEST_MANAGER_ABI,
    functionName: 'loyalistBadge',
  })

  // Read whale badge address
  const { data: whaleBadgeAddress } = useReadContract({
    address: QUEST_MANAGER_ADDRESS,
    abi: QUEST_MANAGER_ABI,
    functionName: 'whaleBadge',
  })

  // Check if user has novice badge
  const { data: hasNoviceBadge } = useReadContract({
    address: QUEST_MANAGER_ADDRESS,
    abi: QUEST_MANAGER_ABI,
    functionName: 'hasBadge',
    args: address && noviceBadgeAddress ? [address, noviceBadgeAddress] : undefined,
    query: {
      enabled: !!address && !!noviceBadgeAddress,
      refetchInterval: 5000,
    },
  })

  // Check if user has loyalist badge
  const { data: hasLoyalistBadge } = useReadContract({
    address: QUEST_MANAGER_ADDRESS,
    abi: QUEST_MANAGER_ABI,
    functionName: 'hasBadge',
    args: address && loyalistBadgeAddress ? [address, loyalistBadgeAddress] : undefined,
    query: {
      enabled: !!address && !!loyalistBadgeAddress,
      refetchInterval: 5000,
    },
  })

  // Check if user has whale badge
  const { data: hasWhaleBadge } = useReadContract({
    address: QUEST_MANAGER_ADDRESS,
    abi: QUEST_MANAGER_ABI,
    functionName: 'hasBadge',
    args: address && whaleBadgeAddress ? [address, whaleBadgeAddress] : undefined,
    query: {
      enabled: !!address && !!whaleBadgeAddress,
      refetchInterval: 5000,
    },
  })

  // Debug stats
  useEffect(() => {
    if (userStats) {
      console.log('[useQuestManager] User stats:', {
        wins: userStats[0]?.toString(),
        streak: userStats[1]?.toString(),
      })
    }
    if (statsError) {
      console.error('[useQuestManager] Stats error:', statsError)
    }
  }, [userStats, statsError])

  // Parse stats
  const totalWins = userStats ? Number(userStats[0]) : 0
  const winStreak = userStats ? Number(userStats[1]) : 0

  return {
    // User stats
    totalWins,
    winStreak,
    isStatsLoading,

    // Badge status
    hasNoviceBadge: hasNoviceBadge || false,
    hasLoyalistBadge: hasLoyalistBadge || false,
    hasWhaleBadge: hasWhaleBadge || false,

    // Badge addresses
    noviceBadgeAddress,
    loyalistBadgeAddress,
    whaleBadgeAddress,

    // Functions
    refetchUserStats,

    // Error state
    error: statsError,
  }
}

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI, type Market } from '@/contracts/PredictionMarket'
import { parseEther } from 'viem'
import { useState, useEffect } from 'react'

export function usePredictionMarket() {
  const { address, isConnected } = useAccount()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const [markets, setMarkets] = useState<Market[]>([])

  // Read total markets
  const { data: totalMarkets, refetch: refetchTotalMarkets } = useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'getTotalMarkets',
  })

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  /**
   * Fetch all markets
   */
  const fetchMarkets = async () => {
    if (!totalMarkets || totalMarkets === 0n) {
      setMarkets([])
      return
    }

    try {
      const marketPromises = []
      for (let i = 1n; i <= totalMarkets; i++) {
        // We'll need to make individual read calls for each market
        // In a production app, you might want to use multicall for better performance
        marketPromises.push(
          fetch(`/api/market/${i}`).catch(() => null) // Fallback to API if available
        )
      }

      // For now, we'll fetch markets one by one
      // You can implement a backend API or use multicall for batch reading
      const marketIds = Array.from({ length: Number(totalMarkets) }, (_, i) => i + 1)
      setMarkets([]) // Clear for now - will be populated by individual reads
    } catch (err) {
      console.error('Failed to fetch markets:', err)
    }
  }

  /**
   * Get a specific market
   */
  const useMarket = (marketId: bigint) => {
    const { data: market } = useReadContract({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'getMarket',
      args: [marketId],
      query: {
        enabled: marketId > 0n,
      },
    })

    return market as Market | undefined
  }

  /**
   * Get user's vote on a market
   */
  const useUserVote = (marketId: bigint) => {
    const { data: voteData } = useReadContract({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'getUserVote',
      args: marketId && address ? [marketId, address] : undefined,
      query: {
        enabled: !!(marketId && address),
      },
    })

    return voteData as [number, bigint] | undefined
  }

  /**
   * Calculate potential win
   */
  const useCalculatePotentialWin = (marketId: bigint, choice: boolean, amount: bigint) => {
    const { data: potentialWin } = useReadContract({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'calculatePotentialWin',
      args: [marketId, choice, amount],
      query: {
        enabled: marketId > 0n && amount > 0n,
      },
    })

    return potentialWin as bigint | undefined
  }

  /**
   * Create a new prediction market
   */
  const createMarket = async (
    question: string,
    category: string,
    durationDays: number,
    minStake: string
  ) => {
    if (!isConnected) {
      throw new Error('Please connect your wallet')
    }

    try {
      const durationSeconds = BigInt(durationDays * 24 * 60 * 60)
      const minStakeWei = parseEther(minStake)

      writeContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'createMarket',
        args: [question, category, durationSeconds, minStakeWei],
      })
    } catch (err) {
      console.error('Create market error:', err)
      throw err
    }
  }

  /**
   * Vote on a prediction market
   * @param marketId Market ID
   * @param choice true for YES, false for NO
   * @param amount Amount of Battle Power to stake (in HBAR)
   */
  const vote = async (marketId: bigint, choice: boolean, amount: string) => {
    if (!isConnected) {
      throw new Error('Please connect your wallet')
    }

    try {
      const amountWei = parseEther(amount)

      writeContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'vote',
        args: [marketId, choice, amountWei],
      })
    } catch (err) {
      console.error('Vote error:', err)
      throw err
    }
  }

  /**
   * Claim rewards from a resolved market
   */
  const claimReward = async (marketId: bigint) => {
    if (!isConnected) {
      throw new Error('Please connect your wallet')
    }

    try {
      writeContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'claimReward',
        args: [marketId],
      })
    } catch (err) {
      console.error('Claim reward error:', err)
      throw err
    }
  }

  // Auto-fetch markets when totalMarkets changes
  useEffect(() => {
    if (totalMarkets) {
      fetchMarkets()
    }
  }, [totalMarkets])

  // Refetch on confirmation
  useEffect(() => {
    if (isConfirmed) {
      refetchTotalMarkets()
      fetchMarkets()
    }
  }, [isConfirmed])

  return {
    // State
    markets,
    totalMarkets: totalMarkets || 0n,
    isConnected,
    address,

    // Functions
    fetchMarkets,
    createMarket,
    vote,
    claimReward,
    refetchTotalMarkets,

    // Hooks for individual market data
    useMarket,
    useUserVote,
    useCalculatePotentialWin,

    // Transaction state
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  }
}

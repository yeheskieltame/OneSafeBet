import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI, type Market } from '@/contracts/PredictionMarket'
import { parseUnits } from 'viem'

// Hedera uses 8 decimals for contract storage balance (tinybars)
const HBAR_STORAGE_DECIMALS = 8

export function usePredictionMarket() {
  const { address, isConnected } = useAccount()
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  // Read total markets
  const { data: totalMarkets, refetch: refetchTotalMarkets } = useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'getTotalMarkets',
    query: {
      refetchInterval: 5000,
      staleTime: 0,
      gcTime: 0,
    },
  })

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  })

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
      const minStakeWei = parseUnits(minStake, HBAR_STORAGE_DECIMALS)

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
      const amountWei = parseUnits(amount, HBAR_STORAGE_DECIMALS)

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

  // Hook factories for use in child components
  const useMarket = (marketId: bigint) => {
    const { data: market } = useReadContract({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'getMarket',
      args: [marketId],
      query: {
        enabled: marketId > 0n,
        refetchInterval: 5000,
        staleTime: 0,
        gcTime: 0,
      },
    })

    return market as Market | undefined
  }

  const useUserVote = (marketId: bigint) => {
    const { data: voteData } = useReadContract({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'getUserVote',
      args: marketId && address ? [marketId, address] : undefined,
      query: {
        enabled: !!(marketId && address),
        refetchInterval: 3000,
        staleTime: 0,
        gcTime: 0,
      },
    })

    return voteData as [number, bigint] | undefined
  }

  return {
    // State
    totalMarkets: totalMarkets || 0n,
    isConnected,
    address,

    // Functions
    createMarket,
    vote,
    claimReward,
    refetchTotalMarkets,

    // Hook factories for child components
    useMarket,
    useUserVote,

    // Transaction state
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  }
}

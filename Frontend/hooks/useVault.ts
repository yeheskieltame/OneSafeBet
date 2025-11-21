import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { VAULT_ADDRESS, VAULT_ABI } from '@/contracts/Vault'
import { formatUnits, parseUnits } from 'viem'
import { useEffect } from 'react'

// Hedera decimals: 18 for transactions (msg.value), 8 for storage/balance (tinybars)
const HBAR_TX_DECIMALS = 18  // For deposit/withdraw transactions (msg.value)
const HBAR_STORAGE_DECIMALS = 8  // For balance storage in contract (tinybars)

export function useVault() {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract()

  // Debug logging
  useEffect(() => {
    console.log('[useVault] User address:', address)
    console.log('[useVault] Vault contract:', VAULT_ADDRESS)
  }, [address])

  // Read user balance (Battle Power)
  const {
    data: balance,
    refetch: refetchBalance,
    isLoading: isBalanceLoading,
    error: balanceError,
    isError: isBalanceError
  } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: 'getBalance',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 3000, // Refetch every 3 seconds
      staleTime: 0, // Always consider data stale
      gcTime: 0, // Don't cache data
    },
  })

  // Debug balance data
  useEffect(() => {
    console.log('[useVault] Balance data:', balance)
    console.log('[useVault] Balance loading:', isBalanceLoading)
    console.log('[useVault] Balance error:', isBalanceError, balanceError)
  }, [balance, isBalanceLoading, isBalanceError, balanceError])

  // Read total staked
  const { data: totalStaked, refetch: refetchTotalStaked, error: totalStakedError } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: 'totalStaked',
    query: {
      refetchInterval: 5000, // Refetch every 5 seconds
      staleTime: 0, // Always consider data stale
      gcTime: 0, // Don't cache data
    },
  })

  // Debug total staked
  useEffect(() => {
    console.log('[useVault] Total staked:', totalStaked)
    if (totalStakedError) {
      console.error('[useVault] Total staked error:', totalStakedError)
    }
  }, [totalStaked, totalStakedError])

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
      // Wait for blockchain to update and refetch multiple times to ensure update
      const refetchData = async () => {
        // First refetch after 1 second
        setTimeout(async () => {
          await refetchBalance()
          await refetchTotalStaked()
        }, 1000)

        // Second refetch after 2 seconds (Hedera finality)
        setTimeout(async () => {
          await refetchBalance()
          await refetchTotalStaked()
        }, 2000)

        // Third refetch after 4 seconds (ensure we get the latest)
        setTimeout(async () => {
          await refetchBalance()
          await refetchTotalStaked()
        }, 4000)
      }

      refetchData()
    }
  }, [isConfirmed, refetchBalance, refetchTotalStaked])

  /**
   * Deposit HBAR to vault
   */
  const deposit = async (amount: string) => {
    try {
      const amountInWei = parseUnits(amount, HBAR_TX_DECIMALS)
      console.log('[useVault] Depositing:', amount, 'HBAR =', amountInWei.toString(), 'wei (18 decimals)')

      writeContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: 'deposit',
        value: amountInWei,
      })
    } catch (err) {
      console.error('Deposit error:', err)
      throw err
    }
  }

  /**
   * Withdraw HBAR from vault
   */
  const withdraw = async (amount: string) => {
    try {
      const amountInTinybar = parseUnits(amount, HBAR_STORAGE_DECIMALS)
      console.log('[useVault] Withdrawing:', amount, 'HBAR =', amountInTinybar.toString(), 'tinybar (8 decimals)')

      writeContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: 'withdraw',
        args: [amountInTinybar],
      })
    } catch (err) {
      console.error('Withdraw error:', err)
      throw err
    }
  }

  return {
    // Data
    balance: balance || 0n,
    balanceFormatted: balance ? formatUnits(balance, HBAR_STORAGE_DECIMALS) : '0',
    totalStaked: totalStaked || 0n,
    totalStakedFormatted: totalStaked ? formatUnits(totalStaked, HBAR_STORAGE_DECIMALS) : '0',

    // Functions
    deposit,
    withdraw,
    refetchBalance,
    reset, // Add reset function to clear transaction state

    // Transaction state
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  }
}

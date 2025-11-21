"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Zap, Lock, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { useVault } from "@/hooks/useVault"
import { useAccount, useBalance } from "wagmi"
import { toast } from "sonner"
import { formatUnits } from "viem"

// Hedera uses 8 decimals for HBAR
const HBAR_DECIMALS = 8

export function VaultCard() {
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")

  const { address, isConnected } = useAccount()
  const {
    balance: vaultBalance,
    balanceFormatted,
    totalStaked,
    totalStakedFormatted,
    deposit,
    withdraw,
    refetchBalance,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash
  } = useVault()

  // Get wallet HBAR balance
  const { data: walletBalanceData } = useBalance({
    address: address,
  })

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash) {
      toast.success("Transaction Successful!", {
        description: `View on HashScan`,
        action: {
          label: "View",
          onClick: () => window.open(`https://hashscan.io/testnet/transaction/${hash}`, '_blank')
        },
        duration: 5000,
      })

      // Force multiple refetches to ensure balance updates
      const forceRefresh = async () => {
        // Immediate refetch
        await refetchBalance()

        // Refetch again after 2 seconds
        setTimeout(async () => {
          await refetchBalance()
        }, 2000)

        // Final refetch after 5 seconds
        setTimeout(async () => {
          await refetchBalance()
        }, 5000)
      }

      forceRefresh()

      // Clear input
      setDepositAmount("")
      setWithdrawAmount("")
    }
  }, [isConfirmed, hash, refetchBalance])

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error("Transaction Failed", {
        description: error.message || "Please try again",
        duration: 5000,
      })
    }
  }, [error])

  const handleDeposit = async () => {
    if (!isConnected) {
      toast.error("Wallet Not Connected", {
        description: "Please connect your wallet first"
      })
      return
    }

    const val = parseFloat(depositAmount)
    if (!val || val <= 0) {
      toast.error("Invalid Amount", {
        description: "Please enter a valid amount"
      })
      return
    }

    const walletBalance = walletBalanceData ? parseFloat(formatUnits(walletBalanceData.value, HBAR_DECIMALS)) : 0
    if (val > walletBalance) {
      toast.error("Insufficient Balance", {
        description: "You don't have enough HBAR in your wallet"
      })
      return
    }

    try {
      toast.loading("Preparing transaction...", { id: "deposit-tx" })
      await deposit(depositAmount)
      toast.dismiss("deposit-tx")
    } catch (err) {
      toast.dismiss("deposit-tx")
      console.error("Deposit error:", err)
    }
  }

  const handleWithdraw = async () => {
    if (!isConnected) {
      toast.error("Wallet Not Connected", {
        description: "Please connect your wallet first"
      })
      return
    }

    const val = parseFloat(withdrawAmount)
    if (!val || val <= 0) {
      toast.error("Invalid Amount", {
        description: "Please enter a valid amount"
      })
      return
    }

    const stakedBalance = parseFloat(balanceFormatted)
    if (val > stakedBalance) {
      toast.error("Insufficient Staked Balance", {
        description: "You don't have enough HBAR staked in the vault"
      })
      return
    }

    try {
      toast.loading("Preparing transaction...", { id: "withdraw-tx" })
      await withdraw(withdrawAmount)
      toast.dismiss("withdraw-tx")
    } catch (err) {
      toast.dismiss("withdraw-tx")
      console.error("Withdraw error:", err)
    }
  }

  const walletBalance = walletBalanceData ? formatUnits(walletBalanceData.value, HBAR_DECIMALS) : "0"
  const walletBalanceNumber = parseFloat(walletBalance)

  // Debug wallet balance
  useEffect(() => {
    if (walletBalanceData) {
      console.log('[VaultCard] Wallet balance raw:', walletBalanceData.value.toString())
      console.log('[VaultCard] Wallet balance formatted:', walletBalance, 'HBAR')
    }
  }, [walletBalanceData, walletBalance])

  return (
    <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
      {/* Stats Card */}
      <Card className="bg-card/50 border-primary/20 backdrop-blur-sm h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Shield className="w-6 h-6 text-green-400" />
            Vault Status
          </CardTitle>
          <CardDescription>Your secure assets and generated power</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isConnected ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">Connect your wallet to view your vault</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Principal Balance (Safe)</span>
                  <span className="text-green-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Secured
                  </span>
                </div>
                <div className="text-4xl font-bold text-white tracking-tight">
                  {parseFloat(balanceFormatted).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                  <span className="text-lg text-muted-foreground">HBAR</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ width: `${Math.min((parseFloat(balanceFormatted) / 20000) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Contract: {vaultBalance?.toString().slice(0, 20)}...
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-border/50">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Battle Power (Yield)</span>
                  <span className="text-yellow-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Ready for Arena
                  </span>
                </div>
                <div className="text-4xl font-bold text-yellow-400 tracking-tight">
                  {parseFloat(balanceFormatted).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                  <span className="text-lg text-yellow-400/70">BP</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your Battle Power equals your vault balance. Use this to play games without risking your principal.
                </p>
              </div>

              {/* Total Staked Across All Users */}
              <div className="pt-4 border-t border-border/50">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Total Value Locked (TVL)</span>
                  <span>All Users</span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {parseFloat(totalStakedFormatted).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} HBAR
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Card */}
      <Card className="bg-card/50 border-primary/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Manage Assets</CardTitle>
          <CardDescription>Deposit HBAR to generate Battle Power</CardDescription>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">Connect your wallet to start</p>
              <p className="text-sm text-muted-foreground/70">
                Click "Connect Wallet" in the navigation to continue
              </p>
            </div>
          ) : (
            <Tabs defaultValue="deposit" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="deposit" disabled={isPending || isConfirming}>Deposit</TabsTrigger>
                <TabsTrigger value="withdraw" disabled={isPending || isConfirming}>Withdraw</TabsTrigger>
              </TabsList>

              <TabsContent value="deposit" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Amount to Deposit</label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      disabled={isPending || isConfirming}
                      className="pl-4 pr-16 bg-background/50 border-primary/20 focus:border-primary"
                      step="0.01"
                      min="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                      HBAR
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Wallet Balance: {walletBalanceNumber.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} HBAR</span>
                    <button
                      onClick={() => setDepositAmount(Math.max(walletBalanceNumber - 0.1, 0).toFixed(2))}
                      className="text-primary hover:underline"
                      disabled={isPending || isConfirming}
                    >
                      Max
                    </button>
                  </div>
                </div>

                <div className="bg-primary/10 rounded-lg p-4 text-sm text-primary/80 border border-primary/20">
                  <p className="flex items-start gap-2">
                    <Shield className="w-4 h-4 mt-0.5 shrink-0" />
                    Your principal is 100% safe. Only the yield generated is used for gaming.
                  </p>
                </div>

                {/* Transaction Status */}
                {(isPending || isConfirming) && (
                  <div className="bg-blue-500/10 rounded-lg p-4 text-sm text-blue-400 border border-blue-500/20 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isPending && <span>Waiting for confirmation...</span>}
                    {isConfirming && <span>Transaction confirming...</span>}
                  </div>
                )}

                {isConfirmed && (
                  <div className="bg-green-500/10 rounded-lg p-4 text-sm text-green-400 border border-green-500/20 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Deposit successful!</span>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 rounded-lg p-4 text-sm text-red-400 border border-red-500/20 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Transaction failed. Please try again.</span>
                  </div>
                )}

                <Button
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6"
                  onClick={handleDeposit}
                  disabled={isPending || isConfirming || !depositAmount || parseFloat(depositAmount) <= 0}
                >
                  {isPending || isConfirming ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isPending ? "Confirming..." : "Processing..."}
                    </>
                  ) : (
                    "Deposit & Activate Power"
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="withdraw" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Amount to Withdraw</label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      disabled={isPending || isConfirming}
                      className="pl-4 pr-16 bg-background/50 border-primary/20 focus:border-primary"
                      step="0.01"
                      min="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                      HBAR
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Staked Balance: {parseFloat(balanceFormatted).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} HBAR</span>
                    <button
                      onClick={() => setWithdrawAmount(balanceFormatted)}
                      className="text-primary hover:underline"
                      disabled={isPending || isConfirming}
                    >
                      Max
                    </button>
                  </div>
                </div>

                {/* Transaction Status */}
                {(isPending || isConfirming) && (
                  <div className="bg-blue-500/10 rounded-lg p-4 text-sm text-blue-400 border border-blue-500/20 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isPending && <span>Waiting for confirmation...</span>}
                    {isConfirming && <span>Transaction confirming...</span>}
                  </div>
                )}

                {isConfirmed && (
                  <div className="bg-green-500/10 rounded-lg p-4 text-sm text-green-400 border border-green-500/20 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Withdrawal successful!</span>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 rounded-lg p-4 text-sm text-red-400 border border-red-500/20 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Transaction failed. Please try again.</span>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 py-6 bg-transparent"
                  onClick={handleWithdraw}
                  disabled={isPending || isConfirming || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                >
                  {isPending || isConfirming ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isPending ? "Confirming..." : "Processing..."}
                    </>
                  ) : (
                    "Withdraw to Wallet"
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

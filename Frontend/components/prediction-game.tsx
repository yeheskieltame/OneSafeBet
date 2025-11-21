"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Users, Trophy, Clock, Zap, Search, Filter, AlertTriangle, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePredictionMarket } from "@/hooks/usePredictionMarket"
import { useVault } from "@/hooks/useVault"
import { useAccount } from "wagmi"
import { formatUnits } from "viem"
import { toast } from "sonner"

// Hedera uses 8 decimals for contract storage balance (tinybars)
const HBAR_STORAGE_DECIMALS = 8

interface PredictionGameProps {
  limit?: number
  showFilters?: boolean
  title?: string
}

export function PredictionGame({ limit, showFilters = false, title = "Prediction Markets" }: PredictionGameProps) {
  const [selectedPrediction, setSelectedPrediction] = useState<bigint | null>(null)
  const [selectedChoice, setSelectedChoice] = useState<"yes" | "no" | null>(null)
  const [stakeAmount, setStakeAmount] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [marketIds, setMarketIds] = useState<bigint[]>([])
  const [lastProcessedHash, setLastProcessedHash] = useState<string | null>(null)

  const { isConnected } = useAccount()
  const { balanceFormatted } = useVault()
  const {
    totalMarkets,
    vote,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
    refetchTotalMarkets,
  } = usePredictionMarket()

  const availableBP = parseFloat(balanceFormatted)

  const categories = ["All", "Crypto", "Technology", "Sports", "Politics", "Space"]

  // Generate market IDs based on totalMarkets
  useEffect(() => {
    if (totalMarkets > 0n) {
      const ids = Array.from({ length: Number(totalMarkets) }, (_, i) => BigInt(i + 1))
      setMarketIds(ids)
    } else {
      setMarketIds([])
    }
  }, [totalMarkets])

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash && hash !== lastProcessedHash) {
      console.log('[PredictionGame] Transaction confirmed, showing toast for hash:', hash)

      toast.success("Transaction Successful!", {
        description: "Your vote has been recorded on-chain",
        action: {
          label: "View",
          onClick: () => window.open(`https://hashscan.io/testnet/transaction/${hash}`, '_blank')
        },
        duration: 5000,
      })

      // Mark this hash as processed
      setLastProcessedHash(hash)

      // Reset form
      setStakeAmount("")
      setSelectedChoice(null)
      setSelectedPrediction(null)

      // Refetch data
      setTimeout(() => {
        refetchTotalMarkets()
      }, 2000)
    }
  }, [isConfirmed, hash, lastProcessedHash, refetchTotalMarkets])

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error("Transaction Failed", {
        description: error.message || "Please try again",
        duration: 5000,
      })
    }
  }, [error])

  const handleVote = async () => {
    if (!isConnected) {
      toast.error("Wallet Not Connected", {
        description: "Please connect your wallet first"
      })
      return
    }

    if (!selectedPrediction || !selectedChoice) {
      toast.error("No Selection Made", {
        description: "Please select a market and choice"
      })
      return
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error("Invalid Amount", {
        description: "Please enter a valid stake amount"
      })
      return
    }

    if (parseFloat(stakeAmount) > availableBP) {
      toast.error("Insufficient Battle Power", {
        description: `You only have ${availableBP.toFixed(2)} BP available`
      })
      return
    }

    try {
      await vote(selectedPrediction, selectedChoice === "yes", stakeAmount)
    } catch (err) {
      console.error("Vote error:", err)
    }
  }

  const calculateOdds = (myPool: bigint, oppositePool: bigint) => {
    const myPoolNum = Number(formatUnits(myPool, HBAR_STORAGE_DECIMALS))
    const oppositePoolNum = Number(formatUnits(oppositePool, HBAR_STORAGE_DECIMALS))

    if (myPoolNum === 0) return "0.00"

    const total = myPoolNum + oppositePoolNum
    const potentialReturn = (total / myPoolNum) * 100
    return potentialReturn.toFixed(2)
  }

  const formatTimeRemaining = (endTime: bigint) => {
    const now = Math.floor(Date.now() / 1000)
    const remaining = Number(endTime) - now

    if (remaining <= 0) return "Ended"

    const days = Math.floor(remaining / 86400)
    const hours = Math.floor((remaining % 86400) / 3600)
    const mins = Math.floor((remaining % 3600) / 60)

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  }

  const displayMarketIds = limit ? marketIds.slice(0, limit) : marketIds

  return (
    <Card className="bg-card border-border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border bg-linear-to-r from-primary/5 to-chart-2/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">Vote YES or NO using your Battle Power (Yield)</p>
          </div>
          {!showFilters && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 self-start md:self-auto">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm font-bold text-accent">Live</span>
            </div>
          )}
          {showFilters && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search markets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-background/50 border border-border text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        {showFilters && (
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Predictions List */}
      <div className="p-6 space-y-4">
        {totalMarkets === 0n ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Markets Available</h3>
            <p className="text-sm text-muted-foreground">
              Be the first to create a prediction market!
            </p>
          </div>
        ) : (
          displayMarketIds.map((marketId) => (
            <MarketCard
              key={marketId.toString()}
              marketId={marketId}
              selectedPrediction={selectedPrediction}
              selectedChoice={selectedChoice}
              stakeAmount={stakeAmount}
              isPending={isPending}
              isConfirming={isConfirming}
              isConfirmed={isConfirmed}
              onSelectPrediction={setSelectedPrediction}
              onSelectChoice={setSelectedChoice}
              onStakeAmountChange={setStakeAmount}
              onVote={handleVote}
              calculateOdds={calculateOdds}
              formatTimeRemaining={formatTimeRemaining}
            />
          ))
        )}

        {limit && marketIds.length > limit && (
          <div className="text-center pt-4">
            <Link href="/games/prediction-market">
              <Button variant="outline" className="border-primary/30 hover:bg-primary/10 text-primary bg-transparent">
                View All Predictions
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  )
}

interface MarketCardProps {
  marketId: bigint
  selectedPrediction: bigint | null
  selectedChoice: "yes" | "no" | null
  stakeAmount: string
  isPending: boolean
  isConfirming: boolean
  isConfirmed: boolean
  onSelectPrediction: (id: bigint) => void
  onSelectChoice: (choice: "yes" | "no") => void
  onStakeAmountChange: (amount: string) => void
  onVote: () => void
  calculateOdds: (myPool: bigint, oppositePool: bigint) => string
  formatTimeRemaining: (endTime: bigint) => string
}

function MarketCard({
  marketId,
  selectedPrediction,
  selectedChoice,
  stakeAmount,
  isPending,
  isConfirming,
  isConfirmed,
  onSelectPrediction,
  onSelectChoice,
  onStakeAmountChange,
  onVote,
  calculateOdds,
  formatTimeRemaining,
}: MarketCardProps) {
  const { useMarket, useUserVote } = usePredictionMarket()
  const market = useMarket(marketId)
  const userVote = useUserVote(marketId)

  if (!market) {
    return (
      <Card className="p-8 text-center border-border">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Loading market...</p>
      </Card>
    )
  }

  if (!market.isActive) return null

  const isSelected = selectedPrediction === marketId
  const hasVoted = userVote && userVote[0] > 0
  const userVotedYes = userVote && userVote[0] === 1

  const totalPool = market.yesPool + market.noPool
  const yesPercentage = totalPool > 0n ? Number((market.yesPool * 100n) / totalPool) : 0
  const noPercentage = totalPool > 0n ? Number((market.noPool * 100n) / totalPool) : 0

  const totalVoters = Number(market.yesVoters) + Number(market.noVoters)
  const minStake = parseFloat(formatUnits(market.minStake, HBAR_STORAGE_DECIMALS))

  return (
    <div
      className={cn(
        "border rounded-xl transition-all duration-300 overflow-hidden",
        isSelected ? "border-primary shadow-lg shadow-primary/20" : "border-border hover:border-primary/50",
      )}
    >
      {/* Question Header */}
      <div className="p-4 bg-secondary/30">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                {market.category}
              </span>
              {market.isResolved && (
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Resolved
                </span>
              )}
              {hasVoted && !market.isResolved && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Voted
                </span>
              )}
            </div>
            <h4 className="text-lg font-bold text-foreground">{market.question}</h4>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 text-muted-foreground justify-end">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{market.isResolved ? "Ended" : "Ends in"}</span>
            </div>
            <span className="text-sm font-bold text-foreground">{formatTimeRemaining(market.endTime)}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-background/50">
            <Trophy className="w-4 h-4 mx-auto text-accent mb-1" />
            <p className="text-xs text-muted-foreground">Prize Pool</p>
            <p className="text-sm font-bold text-foreground">
              {parseFloat(formatUnits(totalPool, HBAR_STORAGE_DECIMALS)).toLocaleString(undefined, { maximumFractionDigits: 2 })} HBAR
            </p>
          </div>
          <div className="text-center p-2 rounded-lg bg-background/50">
            <Users className="w-4 h-4 mx-auto text-chart-2 mb-1" />
            <p className="text-xs text-muted-foreground">Voters</p>
            <p className="text-sm font-bold text-foreground">{totalVoters}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-background/50">
            <Zap className="w-4 h-4 mx-auto text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Min BP</p>
            <p className="text-sm font-bold text-foreground">{minStake.toFixed(0)} BP</p>
          </div>
        </div>
      </div>

      {/* Voting Interface */}
      <div className="p-4 space-y-4">
        {/* Pool Distribution Bar */}
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted-foreground">YES: {yesPercentage.toFixed(1)}%</span>
            <span className="text-muted-foreground">NO: {noPercentage.toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-red-500/20 flex">
            <div
              className="bg-linear-to-r from-green-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${yesPercentage}%` }}
            />
          </div>
        </div>

        {/* Vote Buttons */}
        {!hasVoted && !market.isResolved ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onSelectPrediction(marketId)
                  onSelectChoice("yes")
                }}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all duration-300 group hover:scale-105",
                  isSelected && selectedChoice === "yes"
                    ? "border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20"
                    : "border-green-500/30 hover:border-green-500 hover:bg-green-500/5",
                )}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp
                    className={cn(
                      "w-6 h-6 transition-colors",
                      isSelected && selectedChoice === "yes"
                        ? "text-green-400"
                        : "text-green-500/70 group-hover:text-green-500",
                    )}
                  />
                  <span
                    className={cn(
                      "text-2xl font-bold transition-colors",
                      isSelected && selectedChoice === "yes"
                        ? "text-green-400"
                        : "text-green-500/70 group-hover:text-green-500",
                    )}
                  >
                    YES
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Pool</span>
                    <span className="font-bold text-foreground">
                      {parseFloat(formatUnits(market.yesPool, HBAR_STORAGE_DECIMALS)).toLocaleString(undefined, { maximumFractionDigits: 0 })} BP
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Potential Return</span>
                    <span className="font-bold text-green-500">
                      {calculateOdds(market.yesPool, market.noPool)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-2">
                    <Users className="w-3 h-3" />
                    <span>{Number(market.yesVoters)} voters</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  onSelectPrediction(marketId)
                  onSelectChoice("no")
                }}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all duration-300 group hover:scale-105",
                  isSelected && selectedChoice === "no"
                    ? "border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20"
                    : "border-red-500/30 hover:border-red-500 hover:bg-red-500/5",
                )}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingDown
                    className={cn(
                      "w-6 h-6 transition-colors",
                      isSelected && selectedChoice === "no"
                        ? "text-red-400"
                        : "text-red-500/70 group-hover:text-red-500",
                    )}
                  />
                  <span
                    className={cn(
                      "text-2xl font-bold transition-colors",
                      isSelected && selectedChoice === "no"
                        ? "text-red-400"
                        : "text-red-500/70 group-hover:text-red-500",
                    )}
                  >
                    NO
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Pool</span>
                    <span className="font-bold text-foreground">
                      {parseFloat(formatUnits(market.noPool, HBAR_STORAGE_DECIMALS)).toLocaleString(undefined, { maximumFractionDigits: 0 })} BP
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Potential Return</span>
                    <span className="font-bold text-red-500">
                      {calculateOdds(market.noPool, market.yesPool)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-2">
                    <Users className="w-3 h-3" />
                    <span>{Number(market.noVoters)} voters</span>
                  </div>
                </div>
              </button>
            </div>

            {/* Stake Input - Show when selected */}
            {isSelected && selectedChoice && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Commit Battle Power (Min: {minStake.toFixed(0)} BP)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Enter BP amount"
                      value={stakeAmount}
                      onChange={(e) => onStakeAmountChange(e.target.value)}
                      className="flex-1 h-12 px-4 rounded-lg bg-background border border-border text-foreground outline-none focus:border-primary transition-colors"
                      min={minStake}
                    />
                    <Button variant="outline" onClick={() => onStakeAmountChange("100")} className="border-primary/30">
                      100
                    </Button>
                    <Button variant="outline" onClick={() => onStakeAmountChange("500")} className="border-primary/30">
                      500
                    </Button>
                  </div>

                  {stakeAmount && Number(stakeAmount) >= minStake && (
                    <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/30">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Potential Win</span>
                        <span className="font-bold text-primary">
                          {(
                            (Number(stakeAmount) *
                              (selectedChoice === "yes"
                                ? Number(calculateOdds(market.yesPool, market.noPool))
                                : Number(calculateOdds(market.noPool, market.yesPool)))) /
                            100
                          ).toFixed(2)}{" "}
                          HBAR
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-yellow-500" />
                        Only your Battle Power (Yield) is at risk. Principal is safe.
                      </p>
                    </div>
                  )}
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
                    <span>Vote successful!</span>
                  </div>
                )}

                <Button
                  size="lg"
                  className={cn(
                    "w-full font-bold text-lg transition-all",
                    selectedChoice === "yes"
                      ? "bg-linear-to-r from-green-600 to-emerald-500 hover:opacity-90 shadow-lg shadow-green-500/30"
                      : "bg-linear-to-r from-red-600 to-rose-500 hover:opacity-90 shadow-lg shadow-red-500/30",
                  )}
                  disabled={!stakeAmount || Number(stakeAmount) < minStake || isPending || isConfirming}
                  onClick={onVote}
                >
                  {isPending || isConfirming ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {isPending ? "Confirming..." : "Processing..."}
                    </>
                  ) : (
                    `Vote ${selectedChoice.toUpperCase()} with ${stakeAmount || "0"} BP`
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4 px-4 bg-secondary/20 rounded-lg border border-border">
            {hasVoted && !market.isResolved && (
              <div className="space-y-2">
                <CheckCircle2 className="w-12 h-12 text-blue-500 mx-auto" />
                <p className="text-sm font-medium text-foreground">
                  You voted <span className={cn("font-bold", userVotedYes ? "text-green-500" : "text-red-500")}>
                    {userVotedYes ? "YES" : "NO"}
                  </span> with{" "}
                  <span className="font-bold text-primary">
                    {parseFloat(formatUnits(userVote[1], HBAR_STORAGE_DECIMALS)).toFixed(2)} BP
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">Wait for resolution to claim rewards</p>
              </div>
            )}
            {market.isResolved && (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Market Resolved: <span className={cn("font-bold", market.outcome ? "text-green-500" : "text-red-500")}>
                    {market.outcome ? "YES" : "NO"}
                  </span>
                </p>
                {hasVoted && (
                  <Button className="mt-2 bg-linear-to-r from-green-500 to-emerald-600">
                    Claim Reward
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

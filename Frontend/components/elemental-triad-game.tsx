"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Flame, Droplets, Wind, Shield, Swords, Trophy, Info, Timer, Users, Zap, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useElementalGame } from "@/hooks/useElementalGame"
import { useVault } from "@/hooks/useVault"
import { useAccount } from "wagmi"
import { toast } from "sonner"
import { formatUnits } from "viem"

// Hedera uses 8 decimals for contract storage balance (tinybars)
const HBAR_STORAGE_DECIMALS = 8

type FactionId = "fire" | "water" | "wind"

interface FactionDisplay {
  id: FactionId
  name: string
  icon: React.ReactNode
  color: string
  bgGradient: string
  prey: string
  predator: string
  contractId: number // 1=Fire, 2=Water, 3=Wind
}

const factionsDisplay: FactionDisplay[] = [
  {
    id: "fire",
    name: "IGNIS",
    icon: <Flame className="w-8 h-8" />,
    color: "text-red-500",
    bgGradient: "from-red-500/20 to-orange-600/5",
    prey: "Zephyr",
    predator: "Aqua",
    contractId: 1,
  },
  {
    id: "water",
    name: "AQUA",
    icon: <Droplets className="w-8 h-8" />,
    color: "text-blue-500",
    bgGradient: "from-blue-500/20 to-cyan-600/5",
    prey: "Ignis",
    predator: "Zephyr",
    contractId: 2,
  },
  {
    id: "wind",
    name: "ZEPHYR",
    icon: <Wind className="w-8 h-8" />,
    color: "text-green-500",
    bgGradient: "from-green-500/20 to-emerald-600/5",
    prey: "Aqua",
    predator: "Ignis",
    contractId: 3,
  },
]

export function ElementalTriadGame() {
  const [selectedFaction, setSelectedFaction] = useState<FactionId | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [lastProcessedHash, setLastProcessedHash] = useState<string | null>(null)

  const { isConnected } = useAccount()
  const { balanceFormatted } = useVault()
  const {
    currentRoundId,
    roundInfo,
    userVote,
    hasClaimed,
    factionPercentages,
    advantageScores,
    timeUntilLock,
    timeUntilEnd,
    isLocked: votingLocked,
    vote,
    claimReward,
    refetchAll,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
    FACTIONS,
  } = useElementalGame()

  const availableBP = parseFloat(balanceFormatted)
  const hasVoted = userVote > 0

  // Update countdown timer
  useEffect(() => {
    setTimeLeft(votingLocked ? timeUntilEnd : timeUntilLock)
    const interval = setInterval(() => {
      setTimeLeft(votingLocked ? timeUntilEnd : timeUntilLock)
    }, 1000)
    return () => clearInterval(interval)
  }, [votingLocked, timeUntilLock, timeUntilEnd])

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash && hash !== lastProcessedHash) {
      console.log('[ElementalGame] Transaction confirmed, showing toast for hash:', hash)

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

      // Refetch all data
      setTimeout(() => {
        refetchAll()
      }, 2000)
    }
  }, [isConfirmed, hash, lastProcessedHash, refetchAll])

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

    if (!selectedFaction) {
      toast.error("No Faction Selected", {
        description: "Please select a faction to vote for"
      })
      return
    }

    if (availableBP <= 0) {
      toast.error("No Battle Power", {
        description: "You need Battle Power from the Vault to vote"
      })
      return
    }

    const faction = factionsDisplay.find(f => f.id === selectedFaction)
    if (!faction) return

    try {
      await vote(faction.contractId)
    } catch (err) {
      console.error("Vote error:", err)
    }
  }

  const handleClaim = async () => {
    if (!roundInfo || !roundInfo.isResolved) {
      toast.error("Round Not Resolved", {
        description: "Wait for the round to be resolved"
      })
      return
    }

    try {
      await claimReward(currentRoundId)
    } catch (err) {
      console.error("Claim error:", err)
    }
  }

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const mins = Math.floor((seconds % 3600) / 60)

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  }

  const getUserVotedFaction = () => {
    if (userVote === 0) return null
    return factionsDisplay.find(f => f.contractId === userVote)
  }

  const votedFaction = getUserVotedFaction()
  const totalYield = roundInfo ? formatUnits(
    roundInfo.totalPowerFire + roundInfo.totalPowerWater + roundInfo.totalPowerWind,
    HBAR_STORAGE_DECIMALS
  ) : "0"

  return (
    <div className="space-y-8">
      {/* Game Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/30 border-white/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Timer className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Phase</p>
              <p className="font-bold text-white">
                {!roundInfo ? "Loading..." : roundInfo.isResolved ? "Resolved" : votingLocked ? "Locked" : "Voting Open"}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={`${
            votingLocked ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : "bg-green-500/10 text-green-500 border-green-500/20"
          } ${!votingLocked && "animate-pulse"}`}>
            {votingLocked ? "Battle Locked" : "Live Voting"}
          </Badge>
        </Card>

        <Card className="bg-card/30 border-white/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-chart-2/20 rounded-lg">
              <Shield className="w-5 h-5 text-chart-2" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {votingLocked ? "Time Until Resolution" : "Time Until Lock"}
              </p>
              <p className="font-bold text-white">{formatTime(timeLeft)}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-card/30 border-white/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Yield at Stake</p>
              <p className="font-bold text-white">{parseFloat(totalYield).toLocaleString(undefined, { maximumFractionDigits: 2 })} HBAR</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Game Area */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Faction Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Swords className="w-6 h-6 text-red-500" /> The Arena
            </h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                  <Info className="w-4 h-4 mr-2" /> Rules of Engagement
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle>The Arena Rules</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    1. <strong className="text-white">Staking is Ammo:</strong> Use your Battle Power (Yield) to fight.
                    Your principal is never at risk.
                  </p>
                  <p>
                    2. <strong className="text-white">Circular Hierarchy:</strong> Ignis beats Zephyr, Zephyr beats
                    Aqua, Aqua beats Ignis.
                  </p>
                  <p>
                    3. <strong className="text-white">Vote with Power:</strong> Your Battle Power determines your vote weight. Winners share the yield pool.
                  </p>
                  <p>
                    4. <strong className="text-white">Risk:</strong> If your faction loses, you lose the committed BP
                    (Yield), but your Vault balance remains safe.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Triangle Map Visualization */}
          <div className="relative h-[400px] bg-black/40 rounded-xl border border-white/5 p-8 flex items-center justify-center overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/40 blur-[50px]" />
              <div className="absolute bottom-10 left-10 w-32 h-32 bg-blue-500/40 blur-[50px]" />
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-green-500/40 blur-[50px]" />
            </div>

            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-50">
              <line
                x1="50%"
                y1="20%"
                x2="20%"
                y2="80%"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white/20"
                strokeDasharray="5,5"
              />
              <line
                x1="50%"
                y1="20%"
                x2="80%"
                y2="80%"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white/20"
                strokeDasharray="5,5"
              />
              <line
                x1="20%"
                y1="80%"
                x2="80%"
                y2="80%"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white/20"
                strokeDasharray="5,5"
              />
            </svg>

            {/* Faction Nodes - Fire */}
            <div className="absolute top-[15%] left-1/2 -translate-x-1/2 z-10">
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => !hasVoted && !votingLocked && setSelectedFaction("fire")}
                disabled={hasVoted || votingLocked}
                className={`w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 transition-all ${
                  selectedFaction === "fire" || votedFaction?.id === "fire"
                    ? "border-red-500 bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                    : "border-red-500/30 bg-black/50"
                } ${(hasVoted || votingLocked) && votedFaction?.id !== "fire" && "opacity-50 cursor-not-allowed"}`}
              >
                <Flame className="w-8 h-8 text-red-500 mb-1" />
                <span className="text-xs font-bold text-red-500">IGNIS</span>
              </motion.button>
            </div>

            {/* Faction Nodes - Water */}
            <div className="absolute bottom-[15%] left-[15%] z-10">
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => !hasVoted && !votingLocked && setSelectedFaction("water")}
                disabled={hasVoted || votingLocked}
                className={`w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 transition-all ${
                  selectedFaction === "water" || votedFaction?.id === "water"
                    ? "border-blue-500 bg-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.5)]"
                    : "border-blue-500/30 bg-black/50"
                } ${(hasVoted || votingLocked) && votedFaction?.id !== "water" && "opacity-50 cursor-not-allowed"}`}
              >
                <Droplets className="w-8 h-8 text-blue-500 mb-1" />
                <span className="text-xs font-bold text-blue-500">AQUA</span>
              </motion.button>
            </div>

            {/* Faction Nodes - Wind */}
            <div className="absolute bottom-[15%] right-[15%] z-10">
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => !hasVoted && !votingLocked && setSelectedFaction("wind")}
                disabled={hasVoted || votingLocked}
                className={`w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 transition-all ${
                  selectedFaction === "wind" || votedFaction?.id === "wind"
                    ? "border-green-500 bg-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.5)]"
                    : "border-green-500/30 bg-black/50"
                } ${(hasVoted || votingLocked) && votedFaction?.id !== "wind" && "opacity-50 cursor-not-allowed"}`}
              >
                <Wind className="w-8 h-8 text-green-500 mb-1" />
                <span className="text-xs font-bold text-green-500">ZEPHYR</span>
              </motion.button>
            </div>
          </div>

          {/* Live Stats Chart */}
          <Card className="bg-card/20 border-white/10 p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary" /> Live Power Distribution
            </h3>
            <div className="space-y-6">
              {factionsDisplay.map((faction) => {
                const percentage = faction.id === "fire" ? factionPercentages.fire :
                                 faction.id === "water" ? factionPercentages.water :
                                 factionPercentages.wind

                const powerRaw = faction.id === "fire" ? roundInfo?.totalPowerFire :
                                faction.id === "water" ? roundInfo?.totalPowerWater :
                                roundInfo?.totalPowerWind

                const power = powerRaw ? parseFloat(formatUnits(powerRaw, HBAR_STORAGE_DECIMALS)) : 0

                return (
                  <div key={faction.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2 text-white">
                        {faction.icon} {faction.name}
                      </span>
                      <span className="text-muted-foreground">
                        {percentage.toFixed(1)}% ({power.toLocaleString(undefined, { maximumFractionDigits: 2 })} HBAR)
                      </span>
                    </div>
                    <Progress
                      value={percentage}
                      className="h-2 bg-slate-800"
                    />
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-1">
          <Card className="bg-card/30 backdrop-blur-md border-white/10 p-6 sticky top-24">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" /> Channel Power
            </h3>

            {!isConnected ? (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">Connect your wallet to participate</p>
                <p className="text-sm text-muted-foreground/70">
                  Click "Connect Wallet" in the navigation
                </p>
              </div>
            ) : !hasVoted ? (
              <div className="space-y-6">
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-yellow-200">Available Battle Power</span>
                    <span className="font-bold text-yellow-400">{availableBP.toLocaleString(undefined, { maximumFractionDigits: 2 })} BP</span>
                  </div>
                  <Progress
                    value={Math.min((availableBP / 10000) * 100, 100)}
                    className="h-1.5 bg-yellow-900/20"
                    indicatorClassName="bg-yellow-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Selected Faction</label>
                  <div className="p-3 bg-black/20 rounded-lg border border-white/5 text-white font-medium flex items-center gap-2 h-12">
                    {selectedFaction ? (
                      <>
                        {factionsDisplay.find((f) => f.id === selectedFaction)?.icon}
                        <span className={factionsDisplay.find((f) => f.id === selectedFaction)?.color}>
                          {factionsDisplay.find((f) => f.id === selectedFaction)?.name}
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground italic">Select a faction on the map...</span>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-sm">
                  <p className="text-primary/80">
                    <strong className="text-primary">Note:</strong> Your entire Battle Power ({availableBP.toLocaleString(undefined, { maximumFractionDigits: 2 })} HBAR) will be used for this vote.
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
                    <span>Vote successful!</span>
                  </div>
                )}

                <div className="pt-4">
                  <Button
                    className={`w-full font-bold py-6 transition-all ${
                      selectedFaction
                        ? "bg-gradient-to-r from-primary to-purple-600 text-white hover:opacity-90"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!selectedFaction || availableBP <= 0 || isPending || isConfirming || votingLocked}
                    onClick={handleVote}
                  >
                    {isPending || isConfirming ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isPending ? "Confirming..." : "Processing..."}
                      </>
                    ) : votingLocked ? (
                      "Voting Locked"
                    ) : selectedFaction ? (
                      `Vote for ${factionsDisplay.find((f) => f.id === selectedFaction)?.name}`
                    ) : (
                      "Select Faction"
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-3 flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Only Yield (BP) is at risk. Principal is safe.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-gradient-to-br ${votedFaction?.bgGradient}`}
                >
                  {votedFaction?.icon}
                </div>
                <h3 className="text-xl font-bold text-white">Power Channeled!</h3>
                <p className="text-muted-foreground">
                  You have committed <span className="text-white font-bold">{availableBP.toLocaleString(undefined, { maximumFractionDigits: 2 })} BP</span> to the{" "}
                  <span className={`${votedFaction?.color} font-bold`}>
                    {votedFaction?.name}
                  </span>{" "}
                  faction.
                </p>
                <div className="p-4 bg-black/20 rounded-lg border border-white/5 mt-4">
                  <p className="text-xs text-muted-foreground mb-1">Your Vote Weight</p>
                  <p className="text-lg font-bold text-primary">{availableBP.toLocaleString(undefined, { maximumFractionDigits: 2 })} HBAR</p>
                </div>

                {roundInfo?.isResolved && !hasClaimed && (
                  <Button
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-6"
                    onClick={handleClaim}
                    disabled={isPending || isConfirming}
                  >
                    {isPending || isConfirming ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Claiming...
                      </>
                    ) : (
                      "Claim Reward"
                    )}
                  </Button>
                )}

                {hasClaimed && (
                  <div className="bg-green-500/10 rounded-lg p-4 text-sm text-green-400 border border-green-500/20">
                    ✅ Reward Claimed!
                  </div>
                )}

                {!roundInfo?.isResolved && (
                  <p className="text-xs text-muted-foreground">
                    Wait for the round to be resolved to claim your reward
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Users, Trophy, Clock, Zap, Search, Filter, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Prediction {
  id: number
  question: string
  category: string
  yesPool: number
  noPool: number
  yesVoters: number
  noVoters: number
  endTime: Date
  minStake: number
  isHot?: boolean
}

const activePredictions: Prediction[] = [
  {
    id: 1,
    question: "Will Bitcoin hit $150,000 by end of 2025?",
    category: "Crypto",
    yesPool: 25000,
    noPool: 21000,
    yesVoters: 156,
    noVoters: 134,
    endTime: new Date(Date.now() + 72 * 60 * 60 * 1000),
    minStake: 10,
    isHot: true,
  },
  {
    id: 2,
    question: "Will Ethereum upgrade succeed this month?",
    category: "Technology",
    yesPool: 18000,
    noPool: 15000,
    yesVoters: 98,
    noVoters: 87,
    endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
    minStake: 10,
    isHot: true,
  },
  {
    id: 3,
    question: "Will SpaceX launch Starship successfully in Q3?",
    category: "Space",
    yesPool: 12000,
    noPool: 8000,
    yesVoters: 45,
    noVoters: 32,
    endTime: new Date(Date.now() + 120 * 60 * 60 * 1000),
    minStake: 5,
  },
  {
    id: 4,
    question: "Will AI regulation bill pass in US Senate?",
    category: "Politics",
    yesPool: 35000,
    noPool: 42000,
    yesVoters: 210,
    noVoters: 245,
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    minStake: 20,
    isHot: true,
  },
  {
    id: 5,
    question: "Will Real Madrid win the Champions League?",
    category: "Sports",
    yesPool: 50000,
    noPool: 48000,
    yesVoters: 320,
    noVoters: 310,
    endTime: new Date(Date.now() + 168 * 60 * 60 * 1000),
    minStake: 15,
  },
]

interface PredictionGameProps {
  limit?: number
  showFilters?: boolean
  title?: string
}

export function PredictionGame({ limit, showFilters = false, title = "Prediction Markets" }: PredictionGameProps) {
  const [selectedPrediction, setSelectedPrediction] = useState<number | null>(null)
  const [selectedChoice, setSelectedChoice] = useState<"yes" | "no" | null>(null)
  const [stakeAmount, setStakeAmount] = useState("")
  const [isVoting, setIsVoting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")

  const categories = ["All", "Crypto", "Technology", "Sports", "Politics", "Space"]

  const filteredPredictions = activePredictions.filter((p) => {
    const matchesSearch = p.question.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const displayPredictions = limit ? filteredPredictions.slice(0, limit) : filteredPredictions

  const handleVote = async () => {
    if (!selectedChoice || !stakeAmount) return

    setIsVoting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsVoting(false)
    setStakeAmount("")
    setSelectedChoice(null)
  }

  const calculateOdds = (myPool: number, oppositePool: number) => {
    const total = myPool + oppositePool
    const potentialReturn = (total / myPool) * 100
    return potentialReturn.toFixed(2)
  }

  return (
    <Card className="bg-card border-border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-chart-2/5">
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
        {displayPredictions.map((prediction) => {
          const totalPool = prediction.yesPool + prediction.noPool
          const yesPercentage = (prediction.yesPool / totalPool) * 100
          const noPercentage = (prediction.noPool / totalPool) * 100
          const isSelected = selectedPrediction === prediction.id

          return (
            <div
              key={prediction.id}
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
                        {prediction.category}
                      </span>
                      {prediction.isHot && (
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-500/10 text-orange-500 font-medium flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Hot
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-bold text-foreground">{prediction.question}</h4>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-muted-foreground justify-end">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">Ends in</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">3d 12h</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-background/50">
                    <Trophy className="w-4 h-4 mx-auto text-accent mb-1" />
                    <p className="text-xs text-muted-foreground">Prize Pool</p>
                    <p className="text-sm font-bold text-foreground">{totalPool.toLocaleString()} HBAR</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-background/50">
                    <Users className="w-4 h-4 mx-auto text-chart-2 mb-1" />
                    <p className="text-xs text-muted-foreground">Voters</p>
                    <p className="text-sm font-bold text-foreground">{prediction.yesVoters + prediction.noVoters}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-background/50">
                    <Zap className="w-4 h-4 mx-auto text-primary mb-1" />
                    <p className="text-xs text-muted-foreground">Min BP</p>
                    <p className="text-sm font-bold text-foreground">{prediction.minStake} BP</p>
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
                      className="bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${yesPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Vote Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setSelectedPrediction(prediction.id)
                      setSelectedChoice("yes")
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
                        <span className="font-bold text-foreground">{prediction.yesPool.toLocaleString()} BP</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Potential Return</span>
                        <span className="font-bold text-green-500">
                          {calculateOdds(prediction.yesPool, prediction.noPool)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-2">
                        <Users className="w-3 h-3" />
                        <span>{prediction.yesVoters} voters</span>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedPrediction(prediction.id)
                      setSelectedChoice("no")
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
                        <span className="font-bold text-foreground">{prediction.noPool.toLocaleString()} BP</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Potential Return</span>
                        <span className="font-bold text-red-500">
                          {calculateOdds(prediction.noPool, prediction.yesPool)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-2">
                        <Users className="w-3 h-3" />
                        <span>{prediction.noVoters} voters</span>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Stake Input - Show when selected */}
                {isSelected && selectedChoice && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Commit Battle Power (Min: {prediction.minStake} BP)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Enter BP amount"
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(e.target.value)}
                          className="flex-1 h-12 px-4 rounded-lg bg-background border border-border text-foreground outline-none focus:border-primary transition-colors"
                          min={prediction.minStake}
                        />
                        <Button variant="outline" onClick={() => setStakeAmount("100")} className="border-primary/30">
                          100
                        </Button>
                        <Button variant="outline" onClick={() => setStakeAmount("500")} className="border-primary/30">
                          500
                        </Button>
                      </div>

                      {stakeAmount && Number(stakeAmount) >= prediction.minStake && (
                        <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/30">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Potential Win</span>
                            <span className="font-bold text-primary">
                              {(
                                (Number(stakeAmount) *
                                  (selectedChoice === "yes"
                                    ? Number(calculateOdds(prediction.yesPool, prediction.noPool))
                                    : Number(calculateOdds(prediction.noPool, prediction.yesPool)))) /
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

                    <Button
                      size="lg"
                      className={cn(
                        "w-full font-bold text-lg transition-all",
                        selectedChoice === "yes"
                          ? "bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-90 shadow-lg shadow-green-500/30"
                          : "bg-gradient-to-r from-red-600 to-rose-500 hover:opacity-90 shadow-lg shadow-red-500/30",
                      )}
                      disabled={!stakeAmount || Number(stakeAmount) < prediction.minStake || isVoting}
                      onClick={handleVote}
                    >
                      {isVoting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Submitting Vote...
                        </>
                      ) : (
                        `Vote ${selectedChoice.toUpperCase()} with ${stakeAmount || "0"} BP`
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {limit && filteredPredictions.length > limit && (
          <div className="text-center pt-4">
            <Link href="/predictions">
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

"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Target, Zap, CheckCircle2, Star, Award } from "lucide-react"
import { motion } from "framer-motion"
import { FloatingNav } from "@/components/floating-nav"
import { useQuestManager } from "@/hooks/useQuestManager"
import { useVault } from "@/hooks/useVault"

export default function MissionsPage() {
  const { totalWins, winStreak, hasNoviceBadge, hasLoyalistBadge, hasWhaleBadge, isStatsLoading } = useQuestManager()
  const { balance, balanceFormatted } = useVault()

  // Calculate XP based on total wins (100 XP per win)
  const xp = totalWins * 100
  const level = Math.floor(xp / 1000) + 1
  const nextLevelXp = level * 1000
  const progress = ((xp % 1000) / 1000) * 100

  // Convert balance to HBAR (8 decimals)
  const balanceInHbar = parseFloat(balanceFormatted)

  // Quests based on smart contract conditions
  const achievementBadges = [
    {
      id: 1,
      title: "First Victory",
      description: "Win your first game",
      reward: "Novice Badge",
      progress: totalWins >= 1 ? 1 : totalWins,
      total: 1,
      completed: hasNoviceBadge,
      icon: <Target className="w-5 h-5 text-green-400" />,
      badgeType: "novice",
    },
    {
      id: 2,
      title: "Win Streak Master",
      description: "Achieve a 3-game win streak",
      reward: "Loyalist Badge",
      progress: winStreak,
      total: 3,
      completed: hasLoyalistBadge,
      icon: <Trophy className="w-5 h-5 text-purple-400" />,
      badgeType: "loyalist",
    },
    {
      id: 3,
      title: "Whale Status",
      description: "Deposit 10,000 HBAR into the Vault",
      reward: "Whale Badge",
      progress: balanceInHbar,
      total: 10000,
      completed: hasWhaleBadge,
      icon: <Star className="w-5 h-5 text-gold-400" />,
      badgeType: "whale",
    },
  ]

  const statCards = [
    {
      id: 4,
      title: "Total Wins",
      description: "Your all-time victories",
      value: totalWins.toString(),
      icon: <Award className="w-5 h-5 text-blue-400" />,
    },
    {
      id: 5,
      title: "Current Streak",
      description: "Consecutive wins",
      value: winStreak.toString(),
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
    },
  ]

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 md:px-8 relative overflow-hidden">
      <FloatingNav />
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-2 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Missions
              </span>
            </h1>
            <p className="text-gray-400 text-lg">Complete quests, earn rewards, and level up your profile.</p>
          </div>

          {/* Level Card */}
          <div className="bg-card/30 border border-white/10 rounded-2xl p-6 backdrop-blur-md w-full md:w-auto min-w-[300px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl font-bold text-white">Level {level}</span>
              <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                Elite
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>{xp} XP</span>
              <span>{nextLevelXp} XP</span>
            </div>
            <Progress
              value={progress}
              className="h-2 bg-white/10"
              indicatorClassName="bg-gradient-to-r from-purple-500 to-pink-500"
            />
          </div>
        </div>

        {/* Missions Tabs */}
        <Tabs defaultValue="achievements" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 bg-white/5 border border-white/10">
            <TabsTrigger value="achievements">Achievement Badges</TabsTrigger>
            <TabsTrigger value="stats">Your Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="space-y-4">
            {isStatsLoading ? (
              <div className="text-center text-gray-400 py-8">Loading quests...</div>
            ) : (
              achievementBadges.map((mission) => <MissionCard key={mission.id} mission={mission} />)
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            {isStatsLoading ? (
              <div className="text-center text-gray-400 py-8">Loading stats...</div>
            ) : (
              statCards.map((stat) => <StatCard key={stat.id} stat={stat} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function MissionCard({ mission }: { mission: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-xl border ${
        mission.completed ? "border-green-500/30 bg-green-500/5" : "border-white/10 bg-card/20"
      } p-6 backdrop-blur-sm transition-all hover:border-white/20`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${mission.completed ? "bg-green-500/20" : "bg-white/5"}`}>
          {mission.completed ? <CheckCircle2 className="w-6 h-6 text-green-400" /> : mission.icon}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-bold text-lg ${mission.completed ? "text-green-400" : "text-white"}`}>
              {mission.title}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-yellow-400">{mission.reward}</span>
              {mission.completed && (
                <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-none">Earned</Badge>
              )}
            </div>
          </div>

          <p className="text-gray-400 text-sm mb-3">{mission.description}</p>

          {!mission.completed && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progress</span>
                <span>
                  {typeof mission.progress === "number" && mission.progress > mission.total
                    ? mission.total
                    : mission.progress.toFixed(2)}{" "}
                  / {mission.total}
                </span>
              </div>
              <Progress
                value={Math.min((mission.progress / mission.total) * 100, 100)}
                className="h-1.5 bg-white/5"
              />
            </div>
          )}

          {mission.completed && (
            <div className="text-green-400 text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Badge earned on-chain
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function StatCard({ stat }: { stat: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border border-white/10 bg-card/20 p-6 backdrop-blur-sm transition-all hover:border-white/20"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full bg-white/5">{stat.icon}</div>

        <div className="flex-1">
          <h3 className="font-bold text-lg text-white mb-1">{stat.title}</h3>
          <p className="text-gray-400 text-sm">{stat.description}</p>
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            {stat.value}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

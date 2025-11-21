"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Target, Zap, CheckCircle2, Lock, Star } from "lucide-react"
import { motion } from "framer-motion"
import { FloatingNav } from "@/components/floating-nav"

export default function MissionsPage() {
  const [xp, setXp] = useState(1250)
  const level = Math.floor(xp / 1000) + 1
  const nextLevelXp = level * 1000
  const progress = ((xp % 1000) / 1000) * 100

  const dailyMissions = [
    {
      id: 1,
      title: "First Blood",
      description: "Win your first prediction of the day",
      reward: "50 BP",
      progress: 1,
      total: 1,
      completed: true,
      icon: <Target className="w-5 h-5 text-red-400" />,
    },
    {
      id: 2,
      title: "Power Up",
      description: "Deposit 100 HBAR into the Vault",
      reward: "100 XP",
      progress: 0,
      total: 100,
      completed: false,
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
    },
    {
      id: 3,
      title: "Strategist",
      description: "Participate in Elemental Triad",
      reward: "75 BP",
      progress: 0,
      total: 1,
      completed: false,
      icon: <Trophy className="w-5 h-5 text-purple-400" />,
    },
  ]

  const weeklyMissions = [
    {
      id: 4,
      title: "High Roller",
      description: "Accumulate 10,000 BP in winnings",
      reward: "Badge + 500 XP",
      progress: 4500,
      total: 10000,
      completed: false,
      icon: <Star className="w-5 h-5 text-gold-400" />,
    },
    {
      id: 5,
      title: "Loyal Guardian",
      description: "Keep funds in Vault for 7 days",
      reward: "Mystery Box",
      progress: 3,
      total: 7,
      completed: false,
      icon: <Lock className="w-5 h-5 text-green-400" />,
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
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 bg-white/5 border border-white/10">
            <TabsTrigger value="daily">Daily Quests</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Challenges</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            {dailyMissions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            {weeklyMissions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
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
            <h3 className={`font-bold text-lg ${mission.completed ? "text-gray-400 line-through" : "text-white"}`}>
              {mission.title}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-yellow-400">{mission.reward}</span>
              {mission.completed && (
                <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-none">Claimed</Badge>
              )}
            </div>
          </div>

          <p className="text-gray-400 text-sm mb-3">{mission.description}</p>

          {!mission.completed && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progress</span>
                <span>
                  {mission.progress} / {mission.total}
                </span>
              </div>
              <Progress value={(mission.progress / mission.total) * 100} className="h-1.5 bg-white/5" />
            </div>
          )}
        </div>

        {!mission.completed && mission.progress >= mission.total && (
          <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold hover:opacity-90 shadow-[0_0_20px_rgba(250,204,21,0.3)]">
            Claim
          </Button>
        )}
      </div>
    </motion.div>
  )
}

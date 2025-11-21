"use client"

import { useState, useEffect } from "react"
import { FloatingNav } from "@/components/floating-nav"
import { PrizeOrb } from "@/components/prize-orb"
import { Leaderboard } from "@/components/leaderboard"
import { CountdownTimer } from "@/components/countdown-timer"
import { HeroSection } from "@/components/hero-section"
import { HowItWorks } from "@/components/how-it-works"
import { Stats } from "@/components/stats"
import { PredictionGame } from "@/components/prediction-game"
import Link from "next/link"
import { ArrowRight, Shield, Zap } from "lucide-react"

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <main className="relative min-h-screen bg-gradient-cosmic overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-primary rounded-full animate-pulse-slow" />
        <div className="absolute top-40 right-20 w-1 h-1 bg-chart-2 rounded-full animate-pulse" />
        <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-accent rounded-full animate-pulse-slow" />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-primary rounded-full animate-pulse" />
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-chart-2 rounded-full animate-pulse-slow" />
      </div>

      <FloatingNav />

      <div className={`transition-opacity duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
        <HeroSection />

        <section id="dashboard" className="container mx-auto px-4 py-12 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Live Dashboard</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Monitor the prize pool, check the leaderboard, and manage your vault status in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Left Column: Prize & Timer */}
            <div className="space-y-8">
              <PrizeOrb />
              <CountdownTimer />
            </div>

            {/* Middle Column: Vault Preview */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-card/30 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    Your Vault Status
                  </h3>
                  <Link href="/vault" className="text-sm text-primary hover:underline flex items-center">
                    Manage Vault <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                    <p className="text-sm text-gray-400 mb-1">Principal Balance</p>
                    <p className="text-2xl font-bold text-white">0 HBAR</p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                    <p className="text-sm text-gray-400 mb-1">Battle Power</p>
                    <p className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
                      0 BP <Zap className="w-4 h-4" />
                    </p>
                  </div>
                </div>
              </div>

              <Leaderboard />
            </div>
          </div>
        </section>

        <section id="predictions" className="container mx-auto px-4 py-12 md:py-20 bg-black/20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Trending Predictions</h2>
              <p className="text-gray-400">Use your Battle Power to predict outcomes</p>
            </div>
            <Link
              href="/games"
              className="text-primary hover:text-primary/80 flex items-center transition-colors px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
            >
              Explore All Games <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
          <PredictionGame limit={2} showFilters={false} />
        </section>

        <Stats />
        <HowItWorks />
      </div>
    </main>
  )
}

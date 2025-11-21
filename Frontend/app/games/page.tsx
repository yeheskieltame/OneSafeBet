"use client"

import { FloatingNav } from "@/components/floating-nav"
import Link from "next/link"
import { ArrowRight, TrendingUp, Flame, Droplets, Wind } from "lucide-react"
import { motion } from "framer-motion"

export default function GamesPage() {
  return (
    <main className="relative min-h-screen bg-gradient-cosmic overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-primary rounded-full animate-pulse-slow" />
        <div className="absolute top-40 right-20 w-1 h-1 bg-chart-2 rounded-full animate-pulse" />
        <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-accent rounded-full animate-pulse-slow" />
      </div>

      <FloatingNav />

      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gradient-gold mb-4">Game Center</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your arena. Predict the future or survive the elemental war.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Prediction Market Card */}
          <Link href="/games/prediction-market">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="group relative h-full bg-card/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 overflow-hidden hover:border-primary/50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>

                <h2 className="text-3xl font-bold text-white mb-4">Prediction Markets</h2>
                <p className="text-muted-foreground mb-8 flex-grow">
                  Use your knowledge to predict real-world outcomes. Crypto, Sports, Politics, and more. High liquidity,
                  instant settlements.
                </p>

                <div className="flex items-center text-primary font-semibold group-hover:translate-x-2 transition-transform">
                  Enter Market <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Elemental Triad Card */}
          <Link href="/games/elemental-triad">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="group relative h-full bg-card/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 overflow-hidden hover:border-chart-2/50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-chart-2/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-chart-2/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <div className="flex gap-1">
                    <Flame className="w-4 h-4 text-red-500" />
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <Wind className="w-4 h-4 text-green-500" />
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-white mb-4">Elemental Triad</h2>
                <p className="text-muted-foreground mb-8 flex-grow">
                  A massive multiplayer strategy game. Join a faction (Ignis, Aqua, Zephyr), analyze the population, and
                  survive the predator.
                </p>

                <div className="flex items-center text-chart-2 font-semibold group-hover:translate-x-2 transition-transform">
                  Play Now <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>
    </main>
  )
}

'use client'

import { FloatingNav } from '@/components/floating-nav'
import { PredictionGame } from '@/components/prediction-game'
import { Stats } from '@/components/stats'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PredictionMarketPage() {
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
        <Link href="/games" className="inline-flex items-center text-muted-foreground hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gradient-gold mb-4">
            Prediction Markets
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Predict the future, stake your tokens, and win big. Browse our active markets below.
          </p>
        </div>

        <PredictionGame showFilters={true} title="All Active Markets" />
      </div>

      <Stats />
    </main>
  )
}

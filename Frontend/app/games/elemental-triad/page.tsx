'use client'

import { FloatingNav } from '@/components/floating-nav'
import { ElementalTriadGame } from '@/components/elemental-triad-game'
import { Stats } from '@/components/stats'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ElementalTriadPage() {
  return (
    <main className="relative min-h-screen bg-gradient-cosmic overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-red-500/20 rounded-full animate-pulse-slow" />
        <div className="absolute top-40 right-20 w-1 h-1 bg-blue-500/20 rounded-full animate-pulse" />
        <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-green-500/20 rounded-full animate-pulse-slow" />
      </div>

      <FloatingNav />

      <div className="container mx-auto px-4 py-24 md:py-32">
        <Link href="/games" className="inline-flex items-center text-muted-foreground hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-blue-400 to-green-400 mb-4">
            The Elemental Triad
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hunt the Many. Avoid the Predator. Survival of the Smartest.
          </p>
        </div>

        <ElementalTriadGame />
      </div>

      <Stats />
    </main>
  )
}

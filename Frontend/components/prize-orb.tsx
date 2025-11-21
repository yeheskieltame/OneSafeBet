'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

export function PrizeOrb() {
  const [prizeAmount, setPrizeAmount] = useState(125847.50)

  useEffect(() => {
    const interval = setInterval(() => {
      setPrizeAmount(prev => prev + Math.random() * 10)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-secondary/30 border-primary/30 p-8 md:p-12">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-accent/20 rounded-full blur-2xl animate-pulse" />
      </div>

      <div className="relative z-10 text-center space-y-6">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-accent to-accent/60 glow-gold animate-float">
          <Trophy className="w-10 h-10 text-accent-foreground" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <p className="text-sm md:text-base text-muted-foreground uppercase tracking-wider">
            Current Prize Pool
          </p>
          <h2 className="text-5xl md:text-7xl font-bold text-gradient-gold animate-pulse-slow">
            ${prizeAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <p className="text-sm text-muted-foreground">
            ≈ {(prizeAmount * 0.025).toLocaleString()} $ONE
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-6">
          <div className="space-y-1">
            <p className="text-2xl md:text-3xl font-bold text-foreground">1,247</p>
            <p className="text-xs text-muted-foreground">Active Players</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl md:text-3xl font-bold text-foreground">$2.4M</p>
            <p className="text-xs text-muted-foreground">Total Staked</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl md:text-3xl font-bold text-foreground">156</p>
            <p className="text-xs text-muted-foreground">Winners</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

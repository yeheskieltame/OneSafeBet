'use client'

import { Card } from '@/components/ui/card'
import { Lock, Coins, Trophy, ArrowRight } from 'lucide-react'

const steps = [
  {
    icon: Coins,
    title: 'Stake Your Tokens',
    description: 'Deposit your $HBAR tokens into the prize pool. Your principal is always safe and withdrawable.',
    color: 'text-chart-2'
  },
  {
    icon: Lock,
    title: 'Earn Yield Together',
    description: 'All staked tokens generate yield through DeFi strategies. The collective earnings form the prize pool.',
    color: 'text-primary'
  },
  {
    icon: Trophy,
    title: 'Win Big Prizes',
    description: 'Weekly draws select winners who receive the entire yield. Non-winners keep their principal safe.',
    color: 'text-accent'
  }
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          How It Works
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          A revolutionary approach to staking that combines DeFi yield with the excitement of winning prizes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.title} className="relative">
            <Card className="bg-card border-border p-8 h-full space-y-6 hover:border-primary/30 transition-all hover:glow-purple group">
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center font-bold text-primary-foreground glow-purple">
                {index + 1}
              </div>

              {/* Icon */}
              <div className={`w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center ${step.color} group-hover:scale-110 transition-transform`}>
                <step.icon className="w-8 h-8" />
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </Card>

            {/* Arrow (desktop only) */}
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                <ArrowRight className="w-8 h-8 text-primary animate-pulse-slow" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Security Notice */}
      <div className="mt-12 max-w-3xl mx-auto">
        <Card className="bg-gradient-to-br from-primary/10 to-chart-2/10 border-primary/30 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-foreground">100% Principal Protection</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your staked tokens are never at risk. We only redistribute the yield generated from collective staking. 
                You can withdraw your full principal amount at any time, no questions asked.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}

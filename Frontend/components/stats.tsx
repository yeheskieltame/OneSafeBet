'use client'

import { Card } from '@/components/ui/card'
import { Users, DollarSign, Trophy, TrendingUp } from 'lucide-react'

const stats = [
  {
    icon: DollarSign,
    label: 'Total Value Locked',
    value: '$12.4M',
    change: '+15.3%',
    color: 'text-accent'
  },
  {
    icon: Users,
    label: 'Total Participants',
    value: '8,247',
    change: '+23.1%',
    color: 'text-chart-2'
  },
  {
    icon: Trophy,
    label: 'Total Prizes Won',
    value: '$3.8M',
    change: '+45.7%',
    color: 'text-primary'
  },
  {
    icon: TrendingUp,
    label: 'Average APY',
    value: '12.5%',
    change: '+2.3%',
    color: 'text-chart-4'
  }
]

export function Stats() {
  return (
    <section id="stats" className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Platform Statistics
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Real-time metrics showing the power of our community
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="bg-card border-border p-6 space-y-4 hover:border-primary/30 transition-all hover:glow-purple group"
          >
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-sm font-medium ${stat.color}`}>
                {stat.change}
              </span>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}

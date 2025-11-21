'use client'

import { Card } from '@/components/ui/card'
import { Trophy, Medal } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const winners = [
  { name: 'SatoshiDream', amount: 125847.50, avatar: '1', rank: 1, prediction: 'BTC $150K', daysAgo: 3 },
  { name: 'CryptoNinja', amount: 98234.20, avatar: '2', rank: 2, prediction: 'ETH Upgrade', daysAgo: 5 },
  { name: 'MoonWalker', amount: 87456.80, avatar: '3', rank: 3, prediction: 'BTC $150K', daysAgo: 7 },
  { name: 'DiamondHands', amount: 72341.30, avatar: '4', rank: 4, prediction: 'Market Rally', daysAgo: 2 },
]

export function Leaderboard() {
  return (
    <Card className="bg-card border-border p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-bold text-foreground">Recent Winners</h3>
      </div>

      <div className="space-y-3">
        {winners.map((winner, index) => (
          <div
            key={winner.name}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-secondary/50 border border-transparent hover:border-primary/20 ${
              index === 0 ? 'bg-accent/5 border-accent/20' : ''
            }`}
          >
            <div className="relative">
              <Avatar className="w-10 h-10 border-2 border-primary/30">
                <AvatarImage src={`/anime-avatar-.jpg?height=40&width=40&query=anime-avatar-${winner.avatar}`} />
                <AvatarFallback className="bg-primary/20 text-primary font-bold">
                  {winner.name[0]}
                </AvatarFallback>
              </Avatar>
              {winner.rank <= 3 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                  <Medal className="w-3 h-3 text-accent-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{winner.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                Won on: {winner.prediction}
              </p>
            </div>

            <div className="text-right">
              <p className="font-bold text-accent">${winner.amount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                {winner.daysAgo}d ago
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

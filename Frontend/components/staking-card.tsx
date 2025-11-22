'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Lock, TrendingUp } from 'lucide-react'

export function StakingCard() {
  const [amount, setAmount] = useState('')
  const [isStaking, setIsStaking] = useState(false)

  const handleStake = async () => {
    setIsStaking(true)
    // Simulate staking
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsStaking(false)
    setAmount('')
  }

  const quickAmounts = [100, 500, 1000, 5000]

  return (
    <Card className="bg-card border-border p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-foreground">Enter the Pool</h3>
        <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30">
          <span className="text-sm font-medium text-primary">Your Balance: 50,000 $HBAR</span>
        </div>
      </div>

      {/* Your Staking Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Your Staked Amount
          </p>
          <p className="text-2xl font-bold text-foreground">1,500 $HBAR</p>
          <p className="text-xs text-muted-foreground">≈ $60,000.00</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Your Win Chance
          </p>
          <p className="text-2xl font-bold text-primary">3.24%</p>
          <p className="text-xs text-muted-foreground">Based on pool share</p>
        </div>
      </div>

      {/* Stake More */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-foreground">Stake More $HBAR</label>
        <div className="relative">
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-14 text-lg pr-20 bg-secondary/30 border-border"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
            $HBAR
          </span>
        </div>

        {/* Quick Amount Buttons */}
        <div className="flex flex-wrap gap-2">
          {quickAmounts.map((amt) => (
            <Button
              key={amt}
              variant="outline"
              size="sm"
              onClick={() => setAmount(amt.toString())}
              className="border-primary/30 hover:bg-primary/10"
            >
              <Plus className="w-3 h-3 mr-1" />
              {amt}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAmount('50000')}
            className="border-accent/30 hover:bg-accent/10 text-accent"
          >
            Max
          </Button>
        </div>
      </div>

      {/* Stake Button */}
      <Button
        size="lg"
        className="w-full bg-gradient-to-r from-primary to-chart-4 hover:opacity-90 transition-all glow-purple text-lg font-bold"
        disabled={!amount || isStaking}
        onClick={handleStake}
      >
        {isStaking ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            Staking...
          </>
        ) : (
          'Stake & Enter Pool'
        )}
      </Button>

      {/* Info */}
      <p className="text-sm text-center text-muted-foreground">
        Your principal is 100% safe and can be withdrawn anytime
      </p>
    </Card>
  )
}

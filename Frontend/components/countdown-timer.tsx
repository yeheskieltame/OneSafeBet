'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Clock } from 'lucide-react'

export function CountdownTimer() {
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 32,
    seconds: 45
  })

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Prevent hydration mismatch by only showing dynamic content after mount
  if (!mounted) {
    return (
      <Card className="bg-gradient-to-br from-card to-secondary/30 border-chart-2/30 p-6 space-y-4 glow-teal">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-chart-2" />
          <h3 className="text-lg font-bold text-foreground">Next Draw In</h3>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {['Days', 'Hours', 'Mins', 'Secs'].map((label) => (
            <div
              key={label}
              className="bg-secondary/50 rounded-lg p-3 text-center border border-border"
            >
              <p className="text-2xl md:text-3xl font-bold text-chart-2">--</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
        <div className="pt-2 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Draw Type</span>
            <span className="text-foreground font-medium">Weekly Mega</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Entries</span>
            <span className="text-foreground font-medium">1,247</span>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-card to-secondary/30 border-chart-2/30 p-6 space-y-4 glow-teal">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-chart-2" />
        <h3 className="text-lg font-bold text-foreground">Next Draw In</h3>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Mins', value: timeLeft.minutes },
          { label: 'Secs', value: timeLeft.seconds }
        ].map((item) => (
          <div
            key={item.label}
            className="bg-secondary/50 rounded-lg p-3 text-center border border-border"
          >
            <p className="text-2xl md:text-3xl font-bold text-chart-2">
              {item.value.toString().padStart(2, '0')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="pt-2 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Draw Type</span>
          <span className="text-foreground font-medium">Weekly Mega</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Entries</span>
          <span className="text-foreground font-medium">1,247</span>
        </div>
      </div>
    </Card>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, TrendingUp, Zap } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  const scrollToDashboard = () => {
    document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section id="hero" className="relative container mx-auto px-4 pt-32 md:pt-40 pb-20 md:pb-32">
      <div className="text-center space-y-8 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 animate-pulse-slow">
          <Zap className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">Powered by Hedera</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
          <span className="text-gradient-gold">Win Big</span>
          <br />
          <span className="text-foreground">Without</span> <span className="text-gradient-purple">Losing Anything</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Stake your crypto, win amazing prizes, and withdraw your principal anytime. The revolutionary no-loss
          prediction platform on Hedera.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/games">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-chart-4 hover:opacity-90 transition-all glow-purple text-lg px-8 group"
            >
              Start Playing
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/docs">
            <Button
              size="lg"
              variant="outline"
              className="border-primary/30 hover:bg-primary/10 text-lg px-8 bg-transparent"
            >
              Learn More
            </Button>
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
            <Shield className="w-4 h-4 text-chart-2" />
            <span className="text-sm">100% Principal Safe</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="text-sm">Earn Yield Rewards</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm">Instant Withdrawal</span>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute top-1/3 right-10 w-40 h-40 bg-chart-2/20 rounded-full blur-3xl animate-pulse-slow" />
    </section>
  )
}

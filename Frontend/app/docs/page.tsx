"use client"

import { Button } from "@/components/ui/button"
import { FloatingNav } from "@/components/floating-nav"
import { Card } from "@/components/ui/card"
import {
  BookOpen,
  Flame,
  Droplet,
  Wind,
  TrendingUp,
  Shield,
  Coins,
  Trophy,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview")

  const sections = [
    { id: "overview", label: "Platform Overview", icon: BookOpen },
    { id: "vault", label: "The Vault (Staking)", icon: Coins },
    { id: "prediction", label: "Prediction Markets", icon: TrendingUp },
    { id: "elemental", label: "Elemental Triad", icon: Flame },
  ]

  const scrollToSection = (id: string) => {
    setActiveSection(id)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <FloatingNav />
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient-gold">Documentation</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn how OneSafeBet works and master our games
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 shrink-0">
            <Card className="p-4 sticky top-24 bg-card/50 backdrop-blur-sm border-primary/20">
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        activeSection === section.id
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "hover:bg-primary/10 text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{section.label}</span>
                    </button>
                  )
                })}
              </nav>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-16">
            {/* Platform Overview */}
            <section id="overview" className="scroll-mt-24">
              <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="w-8 h-8 text-accent" />
                  <h2 className="text-3xl font-bold">Platform Overview</h2>
                </div>

                <div className="space-y-6 text-muted-foreground leading-relaxed">
                  <p className="text-lg">
                    <span className="text-gradient-gold font-semibold">OneSafeBet</span> is a revolutionary no-loss
                    gaming platform built on Hedera. Stake your HBAR, play games, and win prizes while keeping your
                    principal 100% safe.
                  </p>

                  <div className="grid md:grid-cols-3 gap-4 my-8">
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <Shield className="w-8 h-8 text-chart-2 mb-3" />
                      <h3 className="font-semibold text-foreground mb-2">Principal Protected</h3>
                      <p className="text-sm">
                        Your initial deposit is locked in a smart contract and never used for gambling.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <Trophy className="w-8 h-8 text-accent mb-3" />
                      <h3 className="font-semibold text-foreground mb-2">Yield as Ammo</h3>
                      <p className="text-sm">Staking rewards (yield) become "Battle Power" to use in games.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <Coins className="w-8 h-8 text-primary mb-3" />
                      <h3 className="font-semibold text-foreground mb-2">Win Big</h3>
                      <p className="text-sm">Compete for the pooled yield of all participants.</p>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">How It Works</h3>
                  <ol className="space-y-4">
                    <li className="flex gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold shrink-0">
                        1
                      </span>
                      <div>
                        <strong className="text-foreground">Deposit to Vault:</strong> Deposit HBAR into The Vault. This
                        generates Battle Power (BP).
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold shrink-0">
                        2
                      </span>
                      <div>
                        <strong className="text-foreground">Enter the Arena:</strong> Use your Battle Power to play
                        Prediction Markets or Elemental Triad.
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold shrink-0">
                        3
                      </span>
                      <div>
                        <strong className="text-foreground">Win Rewards:</strong> If you win, you get a share of the
                        total yield pool.
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold shrink-0">
                        4
                      </span>
                      <div>
                        <strong className="text-foreground">Risk-Free:</strong> If you lose, you only lose the yield
                        (BP). Your principal remains safe.
                      </div>
                    </li>
                  </ol>
                </div>
              </Card>
            </section>

            {/* The Vault */}
            <section id="vault" className="scroll-mt-24">
              <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20">
                <div className="flex items-center gap-3 mb-6">
                  <Coins className="w-8 h-8 text-accent" />
                  <h2 className="text-3xl font-bold">The Vault (Staking)</h2>
                </div>

                <div className="space-y-6 text-muted-foreground leading-relaxed">
                  <p className="text-lg">
                    The Vault is the heart of OneSafeBet. It's where you store your HBAR to generate the energy needed
                    for gaming.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">Staking is Ammo</h3>
                  <p>We separate your assets into two categories:</p>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li>
                      <strong className="text-white">Principal Balance:</strong> Your actual HBAR deposit. This is
                      natively staked to Hedera nodes and is 100% safe.
                    </li>
                    <li>
                      <strong className="text-white">Battle Power (BP):</strong> A representation of the yield your
                      deposit generates. This is your "ammo" for games.
                    </li>
                  </ul>

                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 my-6">
                    <h4 className="font-semibold text-foreground mb-3">Native Staking on Hedera</h4>
                    <p className="text-sm">
                      Your funds are staked directly to Hedera network nodes, securing the network while earning
                      rewards. Smart contracts ensure your principal cannot be touched by game logic.
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Prediction Markets */}
            <section id="prediction" className="scroll-mt-24">
              <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-8 h-8 text-accent" />
                  <h2 className="text-3xl font-bold">Prediction Markets</h2>
                </div>

                <div className="space-y-6 text-muted-foreground leading-relaxed">
                  <p className="text-lg">
                    Predict future events using your Battle Power. Vote YES or NO on real-world outcomes.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">Game Mechanics</h3>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <CheckCircle2 className="w-6 h-6 text-chart-2 shrink-0 mt-1" />
                      <div>
                        <strong className="text-foreground">Choose a Market:</strong> Browse active prediction markets.
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <CheckCircle2 className="w-6 h-6 text-chart-2 shrink-0 mt-1" />
                      <div>
                        <strong className="text-foreground">Commit Battle Power:</strong> Vote YES or NO by committing
                        your BP (Yield).
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <CheckCircle2 className="w-6 h-6 text-chart-2 shrink-0 mt-1" />
                      <div>
                        <strong className="text-foreground">Win Rewards:</strong> Winners split the total BP pool
                        (converted to HBAR) proportionally.
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Elemental Triad */}
            <section id="elemental" className="scroll-mt-24">
              <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20">
                <div className="flex items-center gap-3 mb-6">
                  <Flame className="w-8 h-8 text-orange-500" />
                  <h2 className="text-3xl font-bold">Elemental Triad (The Arena)</h2>
                </div>

                <div className="space-y-6 text-muted-foreground leading-relaxed">
                  <p className="text-lg">
                    A strategic faction war where you channel your Battle Power to support one of three elements.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">The Three Factions</h3>

                  <div className="grid md:grid-cols-3 gap-4 my-6">
                    <div className="p-6 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
                      <Flame className="w-10 h-10 text-orange-500 mb-3" />
                      <h4 className="font-bold text-foreground text-lg mb-2">Ignis</h4>
                      <p className="text-sm">Beats Zephyr. Weak against Aqua.</p>
                    </div>
                    <div className="p-6 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                      <Droplet className="w-10 h-10 text-blue-500 mb-3" />
                      <h4 className="font-bold text-foreground text-lg mb-2">Aqua</h4>
                      <p className="text-sm">Beats Ignis. Weak against Zephyr.</p>
                    </div>
                    <div className="p-6 rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/30">
                      <Wind className="w-10 h-10 text-teal-500 mb-3" />
                      <h4 className="font-bold text-foreground text-lg mb-2">Zephyr</h4>
                      <p className="text-sm">Beats Aqua. Weak against Ignis.</p>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">How to Play</h3>
                  <ol className="space-y-4">
                    <li className="flex gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold shrink-0">
                        1
                      </span>
                      <div>
                        <strong className="text-foreground">Scout:</strong> Analyze the population and power
                        distribution of each faction.
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold shrink-0">
                        2
                      </span>
                      <div>
                        <strong className="text-foreground">Channel Power:</strong> Commit your Battle Power to a
                        faction. This locks your yield for the week.
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold shrink-0">
                        3
                      </span>
                      <div>
                        <strong className="text-foreground">Resolution:</strong> If your faction wins, you earn a share
                        of the losing factions' yield + NFT badges.
                      </div>
                    </li>
                  </ol>
                </div>
              </Card>
            </section>

            {/* CTA */}
            <Card className="p-8 bg-gradient-to-r from-primary/20 to-chart-4/20 border-primary/30 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Start Playing?</h2>
              <p className="text-muted-foreground mb-6">
                Join OneSafeBet today and experience the future of no-loss gaming.
              </p>
              <Link href="/games">
                <Button size="lg" className="bg-gradient-to-r from-primary to-chart-4 hover:opacity-90 glow-purple">
                  Explore Games
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}

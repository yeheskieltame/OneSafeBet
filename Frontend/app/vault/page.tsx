"use client"
import { VaultCard } from "@/components/vault-card"
import { FloatingNav } from "@/components/floating-nav"
import { Shield, Zap, Lock, Hexagon, ArrowUpRight } from "lucide-react"
import { motion } from "framer-motion"

export default function VaultPage() {
  return (
    <div className="min-h-screen bg-[#030303] text-white pt-24 pb-12 px-4 md:px-8 relative overflow-hidden font-sans">
      <FloatingNav />
      {/* Immersive Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-green-500/5 rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[120px]" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              <span>Audited & Secure Smart Contracts</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              The{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-teal-500">
                Vault
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Deposit HBAR. Generate Battle Power. <br />
              <span className="text-white font-medium">Your principal never leaves the safety of the vault.</span>
            </p>
          </motion.div>
        </div>

        {/* Main Vault Interface */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative"
        >
          {/* Decorative Elements */}
          <div className="absolute -top-12 -left-12 w-24 h-24 border-t-2 border-l-2 border-green-500/20 rounded-tl-3xl hidden md:block" />
          <div className="absolute -bottom-12 -right-12 w-24 h-24 border-b-2 border-r-2 border-green-500/20 rounded-br-3xl hidden md:block" />

          <VaultCard />
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <FeatureCard
            icon={<Lock className="w-8 h-8 text-green-400" />}
            title="Principal Protected"
            description="Your initial deposit is locked in a smart contract and natively staked. It is never used for gambling."
            delay={0.4}
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-yellow-400" />}
            title="Yield as Ammo"
            description="Staking rewards are converted into Battle Power (BP). This is your risk-free ammunition for the Arena."
            delay={0.5}
          />
          <FeatureCard
            icon={<Hexagon className="w-8 h-8 text-blue-400" />}
            title="No-Loss Gaming"
            description="Lose a game? You only lose the yield. Your principal deposit remains 100% intact and withdrawable."
            delay={0.6}
          />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: { icon: any; title: string; description: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-green-500/30 transition-all duration-300"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="mb-6 p-4 rounded-2xl bg-white/5 w-fit group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>

      <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-green-400 transition-colors">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>

      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
        <ArrowUpRight className="w-5 h-5 text-green-500" />
      </div>
    </motion.div>
  )
}

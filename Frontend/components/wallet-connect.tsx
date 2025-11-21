"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { Button } from "@/components/ui/button"
import { Wallet, LogOut, Zap, Shield, ChevronDown, Copy, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useVault } from "@/hooks/useVault"

export function WalletConnect() {
  const [isHovered, setIsHovered] = useState(false)
  const [copied, setCopied] = useState(false)
  const { address, isConnected } = useAccount()
  const { balance, balanceFormatted } = useVault()

  const copyAddress = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated')

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
            className="relative z-50"
            onMouseEnter={() => connected && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <AnimatePresence mode="wait">
              {!connected ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    onClick={openConnectModal}
                    className="bg-gradient-to-r from-primary to-chart-4 hover:opacity-90 transition-all glow-purple font-bold tracking-wide"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  {chain?.unsupported ? (
                    <Button
                      onClick={openChainModal}
                      variant="destructive"
                      className="font-bold"
                    >
                      Wrong network
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className={`border-primary/50 bg-background/50 backdrop-blur-md hover:bg-primary/10 transition-all group ${isHovered ? "rounded-b-none border-b-0" : ""}`}
                    >
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                      <span className="font-mono text-primary mr-2">
                        {account?.displayName || (address && formatAddress(address))}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-[10px] font-bold text-white ml-1 border border-white/20">
                        OS
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 ml-2 text-muted-foreground transition-transform duration-300 ${isHovered ? "rotate-180" : ""}`}
                      />
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {connected && isHovered && !chain?.unsupported && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 w-64 bg-card/95 backdrop-blur-xl border border-primary/30 border-t-0 rounded-b-xl shadow-2xl overflow-hidden"
                >
                  <div className="p-4 space-y-4">
                    {/* Account Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">My Account</span>
                      <button
                        onClick={copyAddress}
                        className="text-xs flex items-center text-primary hover:text-primary/80 transition-colors"
                      >
                        {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                        {copied ? "Copied" : "Copy Address"}
                      </button>
                    </div>

                    {/* Network Badge */}
                    {chain && (
                      <div className="flex items-center gap-2 p-2 bg-black/40 rounded-lg border border-white/5">
                        {chain.hasIcon && chain.iconUrl && (
                          <div
                            style={{
                              background: chain.iconBackground,
                              width: 16,
                              height: 16,
                              borderRadius: 999,
                              overflow: 'hidden',
                            }}
                          >
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              style={{ width: 16, height: 16 }}
                            />
                          </div>
                        )}
                        <span className="text-xs font-medium">{chain.name}</span>
                      </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/40 rounded-lg p-2 border border-white/5">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Shield className="w-3 h-3 text-blue-400" />
                          <span>Wallet</span>
                        </div>
                        <div className="font-mono font-bold text-white">
                          {account?.displayBalance || '0'} <span className="text-[10px] text-muted-foreground">HBAR</span>
                        </div>
                      </div>
                      <div className="bg-black/40 rounded-lg p-2 border border-white/5">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Zap className="w-3 h-3 text-yellow-400" />
                          <span>Power</span>
                        </div>
                        <div className="font-mono font-bold text-yellow-400">
                          {parseFloat(balanceFormatted).toFixed(2)} <span className="text-[10px] text-muted-foreground">BP</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start hover:bg-primary/10 h-8 text-sm"
                        onClick={openAccountModal}
                      >
                        <Wallet className="w-3 h-3 mr-2" />
                        View Details
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 text-sm"
                        onClick={openAccountModal}
                      >
                        <LogOut className="w-3 h-3 mr-2" />
                        Disconnect
                      </Button>
                    </div>
                  </div>

                  {/* Decorative bottom bar */}
                  <div className="h-1 w-full bg-gradient-to-r from-primary via-purple-500 to-blue-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

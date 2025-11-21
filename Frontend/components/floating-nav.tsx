"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Home, Menu, X, Gamepad2, Lock, Target } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { WalletConnect } from "@/components/wallet-connect"

export function FloatingNav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    if (pathname !== "/") {
      router.push(`/#${id}`)
      return
    }
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: "smooth" })
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <nav
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
          isScrolled
            ? "w-[95%] md:w-auto md:px-6 backdrop-blur-xl bg-card/80 border border-primary/30 shadow-lg glow-purple"
            : "w-[95%] md:w-auto md:px-8 backdrop-blur-md bg-card/60 border border-border"
        } rounded-full`}
      >
        <div className="flex items-center justify-between gap-4 py-3 px-4 md:px-2">
          <Link
            href="/"
            className="text-lg md:text-xl font-bold text-gradient-gold tracking-wider hover:scale-105 transition-transform"
          >
            OneSafeBet
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection("dashboard")}
              className="hover:bg-primary/20 hover:text-primary transition-all"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Link href="/games">
              <Button
                variant="ghost"
                size="sm"
                className={`hover:bg-primary/20 hover:text-primary transition-all ${pathname.startsWith("/games") ? "bg-primary/10 text-primary" : ""}`}
              >
                <Gamepad2 className="w-4 h-4 mr-2" />
                Games
              </Button>
            </Link>
            <Link href="/vault">
              <Button
                variant="ghost"
                size="sm"
                className={`hover:bg-primary/20 hover:text-primary transition-all ${pathname.startsWith("/vault") ? "bg-primary/10 text-primary" : ""}`}
              >
                <Lock className="w-4 h-4 mr-2" />
                The Vault
              </Button>
            </Link>
            <Link href="/missions">
              <Button
                variant="ghost"
                size="sm"
                className={`hover:bg-primary/20 hover:text-primary transition-all ${pathname.startsWith("/missions") ? "bg-primary/10 text-primary" : ""}`}
              >
                <Target className="w-4 h-4 mr-2" />
                Missions
              </Button>
            </Link>
            <div className="hidden md:block">
              <WalletConnect />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute top-20 left-4 right-4 bg-card border border-primary/30 rounded-2xl p-6 space-y-4 animate-in slide-in-from-top-5 glow-purple">
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-primary/20"
              onClick={() => scrollToSection("dashboard")}
            >
              <Home className="w-4 h-4 mr-3" />
              Dashboard
            </Button>
            <Link href="/games" onClick={() => setIsMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                className={`w-full justify-start hover:bg-primary/20 ${pathname.startsWith("/games") ? "bg-primary/10 text-primary" : ""}`}
              >
                <Gamepad2 className="w-4 h-4 mr-3" />
                Games
              </Button>
            </Link>
            <Link href="/vault" onClick={() => setIsMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                className={`w-full justify-start hover:bg-primary/20 ${pathname.startsWith("/vault") ? "bg-primary/10 text-primary" : ""}`}
              >
                <Lock className="w-4 h-4 mr-3" />
                The Vault
              </Button>
            </Link>
            <Link href="/missions" onClick={() => setIsMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                className={`w-full justify-start hover:bg-primary/20 ${pathname.startsWith("/missions") ? "bg-primary/10 text-primary" : ""}`}
              >
                <Target className="w-4 h-4 mr-3" />
                Missions
              </Button>
            </Link>
            <div className="pt-2">
              <WalletConnect />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

import type React from "react"
import type { Metadata } from "next"
import { Orbitron } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Web3Providers } from "@/lib/web3/providers"
import { Toaster } from "sonner"
import "./globals.css"

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
})

export const metadata: Metadata = {
  title: "OneSafeBet - No-Loss Prediction Platform",
  description: "The Gamified No-Loss Prediction Platform on Hedera. Stake, Win, Never Lose Your Principal.",
  generator: "v0.app",
  icons: {
    icon: "/onesafebet.png",
    apple: "/onesafebet.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${orbitron.variable} font-sans antialiased`}>
        <Web3Providers>
          {children}
        </Web3Providers>
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  )
}

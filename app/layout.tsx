"use client"

import { useState, useEffect } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { wagmiConfig } from "@/lib/wagmi-config"
import { ThemeProvider } from "@/components/theme-provider"
import { Inter } from "next/font/google"
import "./globals.css"

// Load Inter font with Latin subset for better performance
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

// Metadata for the application
export const metadata = {
  title: "Crefy-Mems | NFT Minting Platform",
  description: "Mint unique NFTs on Ethereum Mainnet and Sepolia testnet with ease.",
  keywords: ["NFT", "Ethereum", "Web3", "Blockchain", "Minting", "Digital Art"],
  authors: [{ name: "Fadhil Mulinya" }],
  creator: "Fadhil Mulinya",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://crefy-mems.vercel.app",
    title: "Crefy-Mems | NFT Minting Platform",
    description: "Mint unique NFTs on Ethereum Mainnet and Sepolia testnet with ease.",
    siteName: "Crefy-Mems",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crefy-Mems | NFT Minting Platform",
    description: "Mint unique NFTs on Ethereum Mainnet and Sepolia testnet with ease.",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(() => new QueryClient())
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch with theme
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#6366f1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-background to-background/80 antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {mounted && (
            <WagmiProvider config={wagmiConfig}>
              <QueryClientProvider client={queryClient}>
                <div className="relative flex min-h-screen flex-col">
                  <main className="flex-1">{children}</main>
                </div>
              </QueryClientProvider>
            </WagmiProvider>
          )}
        </ThemeProvider>
      </body>
    </html>
  )
}

/**
 * Main application page component
 * Orchestrates the wallet connection and NFT minting interface
 */
"use client"

import { useState, useEffect } from "react"
import { WalletConnection } from "@/components/wallet-connection"
import { NFTMinter } from "@/components/nft-minter"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAccount } from "wagmi"
import { ContractStats } from "@/components/contract-stats"
import { NFTGallery } from "@/components/nft-gallery"
import { AppNavigation } from "@/components/app-navigation"
import { Button } from "@/components/ui/button"
import { Sparkles, Wallet, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export default function HomePage() {
  const { isConnected, address } = useAccount()
  const [scrolled, setScrolled] = useState(false)
  
  // Handle scroll effect for floating header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="relative min-h-screen">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse-subtle" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-accent/20 blur-[120px] animate-pulse-subtle" />
        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px] animate-pulse-subtle" />
      </div>

      {/* App Navigation */}
      <AppNavigation />

      {/* Hero section with gradient text */}
      <section className="pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight animate-fade-in">
            <span className="text-gradient">NFT Minting</span>
            <span className="block text-foreground mt-1">Simplified</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up">
            Connect your wallet and mint your unique NFT. Supports Ethereum Mainnet and Sepolia testnet.
          </p>
          
          {!isConnected && (
            <div className="flex justify-center animate-slide-up" style={{ animationDelay: "200ms" }}>
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity">
                <Wallet className="h-5 w-5 mr-2" />
                Connect to Start
              </Button>
            </div>
          )}
          
          <div className="mt-12 flex justify-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full animate-bounce opacity-70"
              onClick={() => window.scrollTo({ top: window.innerHeight * 0.6, behavior: 'smooth' })}
            >
              <ChevronDown className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-4xl px-4 pb-20">
        {/* Contract Stats Card */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: "300ms" }}>
          <ContractStats />
        </div>

        {/* Main Card */}
        <Card className="mb-10 overflow-hidden border-0 card-shadow hover-lift animate-slide-up" style={{ animationDelay: "400ms" }}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary" />
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-center">
              {isConnected ? "Ready to Mint" : "Connect Wallet"}
            </CardTitle>
            <CardDescription className="text-center">
              {isConnected 
                ? "Click the button below to mint your NFT" 
                : "Please connect your wallet to continue"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <WalletConnection />
            {isConnected && <NFTMinter />}
          </CardContent>
        </Card>

        {/* NFT Gallery Section */}
        {isConnected && (
          <div className="mt-16 animate-slide-up" style={{ animationDelay: "500ms" }}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Your NFT Collection</h2>
              <p className="text-muted-foreground">View and manage your minted NFTs</p>
            </div>
            <NFTGallery />
          </div>
        )}
      </div>
    </div>
  )
}

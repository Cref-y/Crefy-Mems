"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sparkles, Menu, X, Wallet, ExternalLink } from "lucide-react"
import { useAccount } from "wagmi"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEnsName, useEnsAvatar } from "wagmi"

export function AppNavigation() {
  const { address, isConnected } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName ?? undefined })
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle scroll effect for floating header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Format wallet address for display
  const formatAddress = (addr: string | undefined) => {
    if (!addr) return ""
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!mounted) return null

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-3",
        scrolled ? "bg-background/80 backdrop-blur-lg shadow-sm" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-1.5 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Sparkles className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <h2 className="font-bold text-xl hidden sm:block">Crefy-Mems</h2>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/gallery" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Gallery
            </Link>
            <Link 
              href="/about" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
          </div>
          
          {/* Right Side: Wallet Status and Theme Toggle */}
          <div className="flex items-center space-x-4">
            {/* Wallet Connection Status */}
            {isConnected && address && (
              <div className="hidden sm:block">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link 
                        href={`https://etherscan.io/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2"
                      >
                        <Badge 
                          variant="outline" 
                          className="py-1.5 px-3 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors group"
                        >
                          <Avatar className="h-5 w-5 mr-2 ring-1 ring-primary/20">
                            {ensAvatar ? (
                              <AvatarImage src={ensAvatar} alt={ensName || address} />
                            ) : (
                              <AvatarFallback className="bg-gradient-primary text-white text-xs">
                                {address.slice(2, 4).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span>{ensName || formatAddress(address)}</span>
                          <ExternalLink className="h-3 w-3 ml-1.5 opacity-0 group-hover:opacity-70 transition-opacity" />
                        </Badge>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View on Etherscan</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-6 border-b">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 rounded-full bg-primary/10">
                            <Sparkles className="h-5 w-5 text-primary" />
                          </div>
                          <h2 className="font-bold text-xl">Crefy-Mems</h2>
                        </div>
                        <SheetClose asChild>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close menu</span>
                          </Button>
                        </SheetClose>
                      </div>
                      
                      {/* Mobile Wallet Status */}
                      {isConnected && address ? (
                        <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-border/50">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                              {ensAvatar ? (
                                <AvatarImage src={ensAvatar} alt={ensName || address} />
                              ) : (
                                <AvatarFallback className="bg-gradient-primary text-white">
                                  {address.slice(2, 4).toUpperCase()}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <div className="font-medium">{ensName || formatAddress(address)}</div>
                              <Link 
                                href={`https://etherscan.io/address/${address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-muted-foreground flex items-center hover:text-foreground transition-colors"
                              >
                                View on Etherscan
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                          size="lg"
                        >
                          <Wallet className="h-5 w-5 mr-2" />
                          Connect Wallet
                        </Button>
                      )}
                    </div>
                    
                    {/* Mobile Navigation Links */}
                    <div className="flex-1 overflow-auto py-6 px-6">
                      <nav className="space-y-6">
                        <SheetClose asChild>
                          <Link 
                            href="/" 
                            className="flex items-center py-3 px-4 rounded-lg hover:bg-muted transition-colors"
                          >
                            <span className="text-lg font-medium">Home</span>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link 
                            href="/gallery" 
                            className="flex items-center py-3 px-4 rounded-lg hover:bg-muted transition-colors"
                          >
                            <span className="text-lg font-medium">Gallery</span>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link 
                            href="/about" 
                            className="flex items-center py-3 px-4 rounded-lg hover:bg-muted transition-colors"
                          >
                            <span className="text-lg font-medium">About</span>
                          </Link>
                        </SheetClose>
                      </nav>
                    </div>
                    
                    {/* Footer */}
                    <div className="p-6 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">© 2025 Crefy-Mems</span>
                        <ThemeToggle />
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

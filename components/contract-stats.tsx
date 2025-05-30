/**
 * Contract statistics component
 * Displays general information about the NFT contract
 */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, Coins, Sparkles, Info } from "lucide-react"
import { useContractInfo } from "@/hooks/use-contract-info"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export function ContractStats() {
  const { name, symbol, mintLimit, totalHolders } = useContractInfo()
  const [isLoading, setIsLoading] = useState(true)
  const [showAnimation, setShowAnimation] = useState(false)
  
  // Simulate loading state and trigger animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    
    setShowAnimation(true)
    const animTimer = setTimeout(() => setShowAnimation(false), 1000)
    
    return () => {
      clearTimeout(timer)
      clearTimeout(animTimer)
    }
  }, [])

  return (
    <Card 
      className={cn(
        "overflow-hidden border-0 card-shadow hover-lift relative",
        "bg-gradient-to-br from-background to-background/80",
        showAnimation ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0",
        "transition-all duration-500 ease-out"
      )}
    >
      {/* Decorative top border with gradient */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-foreground text-lg group">
            <BarChart3 className="h-5 w-5 mr-2 text-primary group-hover:rotate-12 transition-transform" />
            Contract Information
          </CardTitle>
          
          <Badge 
            variant="outline" 
            className="bg-background border-border/50 text-accent flex items-center gap-1.5"
          >
            <Sparkles className="h-3 w-3 text-primary animate-pulse-subtle" />
            <span>NFT</span>
          </Badge>
        </div>
        
        <CardDescription className="text-muted-foreground">
          {isLoading ? (
            <Skeleton className="h-4 w-40 bg-muted/50 animate-pulse" />
          ) : (
            name && symbol ? `${name} (${symbol})` : "Contract details unavailable"
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          {/* Mint Limit Stat */}
          <div className="relative group">
            <div className={cn(
              "rounded-xl p-4 space-y-2 transition-all duration-300",
              "bg-gradient-to-br from-background to-primary/5",
              "border border-border/50 group-hover:border-primary/20"
            )}>
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Coins className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <span className="font-medium">Mint Limit</span>
              </div>
              
              {isLoading ? (
                <div className="h-8 flex items-center justify-center">
                  <Skeleton className="h-6 w-16 bg-muted/50 animate-pulse" />
                </div>
              ) : (
                <div className="text-center">
                  <span className="text-2xl font-bold">{mintLimit ?? "N/A"}</span>
                </div>
              )}
            </div>
            
            {/* Decorative corner accent */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          {/* Total Holders Stat */}
          <div className="relative group">
            <div className={cn(
              "rounded-xl p-4 space-y-2 transition-all duration-300",
              "bg-gradient-to-br from-background to-accent/5",
              "border border-border/50 group-hover:border-accent/20"
            )}>
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                  <Users className="h-4 w-4 text-accent group-hover:scale-110 transition-transform" />
                </div>
                <span className="font-medium">Total Holders</span>
              </div>
              
              {isLoading ? (
                <div className="h-8 flex items-center justify-center">
                  <Skeleton className="h-6 w-16 bg-muted/50 animate-pulse" />
                </div>
              ) : (
                <div className="text-center">
                  <span className="text-2xl font-bold">{totalHolders ?? "N/A"}</span>
                </div>
              )}
            </div>
            
            {/* Decorative corner accent */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        
        {/* Info text at bottom */}
        <div className="mt-4 flex items-center text-xs text-muted-foreground">
          <Info className="h-3 w-3 mr-1.5" />
          <span>Contract data refreshes automatically</span>
        </div>
      </CardContent>
    </Card>
  )
}

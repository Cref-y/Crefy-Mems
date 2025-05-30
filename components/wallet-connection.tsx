/**
 * Wallet connection component
 * Handles wallet connectivity using Wagmi
 */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, LogOut, CheckCircle, Loader2, ExternalLink, Copy, ChevronRight } from "lucide-react"
import { useAccount, useConnect, useDisconnect, useEnsName, useEnsAvatar } from "wagmi"
import { injected } from "wagmi/connectors"
import { cn } from "@/lib/utils"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function WalletConnection() {
  const { address, isConnected } = useAccount()
  const { connect, isPending, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: ensName } = useEnsName({ address })
  // Fix TypeScript error by ensuring we only pass string | undefined to useEnsAvatar
  const { data: ensAvatar } = useEnsAvatar({ name: ensName ?? undefined })
  const [copied, setCopied] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)

  // Show animation when component mounts
  useEffect(() => {
    setShowAnimation(true)
    const timer = setTimeout(() => setShowAnimation(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Reset copy state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [copied])

  const handleConnect = () => {
    connect({ connector: injected() })
  }

  const handleDisconnect = () => {
    disconnect()
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
    }
  }

  if (isConnected && address) {
    return (
      <div className={cn(
        "space-y-4 transition-all duration-500 ease-in-out",
        showAnimation ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      )}>
        <div className="rounded-xl overflow-hidden border bg-card card-shadow">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-5 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 ring-2 ring-primary/20 bg-primary/10">
                  {ensAvatar ? (
                    <AvatarImage src={ensAvatar} alt={ensName || address} />
                  ) : (
                    <AvatarFallback className="bg-gradient-primary text-white">
                      {address.slice(2, 4).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">
                      {ensName || formatAddress(address)}
                    </h3>
                    <Badge 
                      variant="outline" 
                      className="bg-green-500/10 text-green-600 border-green-200 dark:border-green-900 flex items-center gap-1 px-2"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      Connected
                    </Badge>
                  </div>
                  
                  <div className="flex items-center mt-1 text-sm text-muted-foreground">
                    <span>{formatAddress(address)}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 ml-1 text-muted-foreground hover:text-foreground"
                            onClick={copyToClipboard}
                          >
                            {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{copied ? "Copied!" : "Copy address"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View on Etherscan</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
              
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
          
          <div className="p-4 bg-card">
            <Button 
              onClick={handleDisconnect} 
              variant="outline" 
              className="w-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors group"
            >
              <LogOut className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-0.5" />
              Disconnect Wallet
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "transition-all duration-500 ease-in-out",
      showAnimation ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
    )}>
      <Button 
        onClick={handleConnect} 
        disabled={isPending} 
        className="w-full h-12 text-lg bg-gradient-primary hover:opacity-90 transition-opacity"
      >
        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="h-5 w-5 mr-2" />
            Connect Wallet
            <ChevronRight className="h-5 w-5 ml-1 opacity-70" />
          </>
        )}
      </Button>
      
      <p className="text-xs text-center mt-3 text-muted-foreground">
        Connect your wallet to start minting NFTs
      </p>
    </div>
  )
}

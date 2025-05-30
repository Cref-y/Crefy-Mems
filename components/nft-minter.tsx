/**
 * NFT minting component
 * Provides the interface for minting NFTs and displays user information
 */
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2, Sparkles, Info, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react"
import { useMintNFT } from "@/hooks/use-mint-nft"
import { useAddressInfo } from "@/hooks/use-address-info"
import { useAccount, useChainId } from "wagmi"
import { mainnet, sepolia } from "wagmi/chains"
import { useState, useEffect } from "react"
import { TransactionStatus } from "@/components/transaction-status"
import { GasEstimator } from "@/components/gas-estimator"
import { NetworkSwitcher } from "@/components/network-switcher"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export function NFTMinter() {
  const { address } = useAccount()
  const { mintNFT, isPending, isSuccess, error, hash, reset } = useMintNFT()
  const { data: addressInfo, isLoading: isLoadingInfo, refetch } = useAddressInfo(address)

  const [showTransactionStatus, setShowTransactionStatus] = useState(false)
  const [mintProgress, setMintProgress] = useState(0)

  const chainId = useChainId()
  const isUnsupportedNetwork = ![mainnet.id, sepolia.id].includes(chainId)

  // Simulate progress during minting
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isPending && !hash) {
      setMintProgress(0)
      interval = setInterval(() => {
        setMintProgress(prev => {
          const increment = Math.random() * 5
          const newValue = prev + increment
          return newValue < 90 ? newValue : prev
        })
      }, 500)
    } else if (hash) {
      setMintProgress(95)
    } else if (isSuccess) {
      setMintProgress(100)
    } else {
      setMintProgress(0)
    }
    
    return () => clearInterval(interval)
  }, [isPending, hash, isSuccess])

  // Refetch address info when transaction is successful
  useEffect(() => {
    if (isSuccess) {
      // Refetch data after successful transaction
      setTimeout(() => {
        refetch()
      }, 2000) // Wait 2 seconds for blockchain to update
    }
  }, [isSuccess, refetch])

  const handleMint = async () => {
    try {
      setShowTransactionStatus(true)
      reset() // Reset previous transaction state
      await mintNFT()
    } catch (err) {
      console.error("Minting failed:", err)
      setShowTransactionStatus(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* User Address Information */}
      {isLoadingInfo ? (
        <Card className="border-0 card-shadow overflow-hidden animate-pulse">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2 text-primary" />
            <span className="text-muted-foreground">Loading your address information...</span>
          </CardContent>
        </Card>
      ) : (
        addressInfo && (
          <Card className="overflow-hidden border-0 card-shadow animate-fade-in hover-lift">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-accent" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground group">
                <BarChart3 className="h-5 w-5 mr-2 text-accent group-hover:rotate-12 transition-transform" />
                Your Address Stats
              </CardTitle>
              <CardDescription>
                Data automatically updates every 2 minutes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="space-y-2 p-3 rounded-lg bg-gradient-to-br from-background to-accent/5 border border-border/50">
                  <p className="text-2xl font-bold text-foreground">{addressInfo.currentBalance}</p>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                </div>
                <div className="space-y-2 p-3 rounded-lg bg-gradient-to-br from-background to-primary/5 border border-border/50">
                  <p className="text-2xl font-bold text-foreground">{addressInfo.totalMinted}</p>
                  <p className="text-sm text-muted-foreground">Total Minted</p>
                </div>
                <div className="space-y-2 p-3 rounded-lg bg-gradient-to-br from-background to-accent/5 border border-border/50">
                  <p className="text-2xl font-bold text-foreground">{addressInfo.remainingMints}</p>
                  <p className="text-sm text-muted-foreground">Remaining Mints</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      )}

      {/* Network Status */}
      <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
        <NetworkSwitcher />
      </div>

      {/* Gas Estimation */}
      {!isUnsupportedNetwork && (
        <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <GasEstimator />
        </div>
      )}

      {/* Transaction Status */}
      {showTransactionStatus && hash && (
        <div className="animate-fade-in">
          <TransactionStatus hash={hash} onClose={() => setShowTransactionStatus(false)} />
        </div>
      )}

      {/* Minting Interface */}
      <Card className="overflow-hidden border-0 card-shadow animate-fade-in hover-lift" style={{ animationDelay: "300ms" }}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary" />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center group">
              <Sparkles className="h-5 w-5 mr-2 text-primary group-hover:scale-110 transition-transform" />
              Mint Your NFT
            </CardTitle>
            {isPending && (
              <Badge variant="outline" className="bg-primary/10 text-primary animate-pulse">
                Processing
              </Badge>
            )}
          </div>
          <CardDescription>
            Click the button below to mint a new NFT to your wallet
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isPending && (
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {hash ? "Confirming transaction..." : "Submitting transaction..."}
                </span>
                <span className="font-medium">{Math.round(mintProgress)}%</span>
              </div>
              <Progress value={mintProgress} className="h-1.5" />
            </div>
          )}
          
          <Button
            onClick={handleMint}
            disabled={isPending || addressInfo?.remainingMints === 0 || isUnsupportedNetwork}
            className={cn(
              "w-full h-12 text-lg transition-all",
              isPending ? "bg-primary/80" : "bg-gradient-primary hover:opacity-90"
            )}
            size="lg"
          >
            {isPending ? (
              <div className="flex items-center">
                <span className="relative flex h-6 w-6 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
                  <Loader2 className="relative inline-flex h-6 w-6 animate-spin" />
                </span>
                {hash ? "Confirming..." : "Submitting..."}
              </div>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Mint NFT
              </>
            )}
          </Button>
        </CardContent>
        
        <CardFooter className="block p-0">
          {/* Status Messages - Only show success after transaction is confirmed */}
          {isSuccess && (
            <div className="p-4 bg-green-500/10 border-t border-green-200 dark:border-green-900/30 animate-slide-up">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-700 dark:text-green-300 font-medium">NFT minted successfully!</p>
                  <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                    Transaction confirmed on the blockchain. Your address stats will update shortly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border-t border-red-200 dark:border-red-900/30 animate-slide-up">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-700 dark:text-red-300 font-medium">Minting failed</p>
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error.message}</p>
                </div>
              </div>
            </div>
          )}

          {addressInfo?.remainingMints === 0 && (
            <div className="p-4 bg-yellow-500/10 border-t border-yellow-200 dark:border-yellow-900/30 animate-slide-up">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-yellow-700 dark:text-yellow-300 font-medium">Mint limit reached</p>
                  <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">
                    You have reached your maximum mint limit for this contract.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isUnsupportedNetwork && (
            <div className="p-4 bg-red-500/10 border-t border-red-200 dark:border-red-900/30 animate-slide-up">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-700 dark:text-red-300 font-medium">Unsupported Network</p>
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                    Please switch to Ethereum Mainnet or Sepolia testnet to mint NFTs.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

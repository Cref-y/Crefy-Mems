/**
 * NFT minting component
 * Provides the interface for minting NFTs and displays user information
 */
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Sparkles, Info } from "lucide-react"
import { useMintNFT } from "@/hooks/use-mint-nft"
import { useAddressInfo } from "@/hooks/use-address-info"
import { useAccount, useChainId } from "wagmi"
import { mainnet, sepolia } from "wagmi/chains"
import { useState, useEffect } from "react"
import { TransactionStatus } from "@/components/transaction-status"
import { GasEstimator } from "@/components/gas-estimator"
import { NetworkSwitcher } from "@/components/network-switcher"

export function NFTMinter() {
  const { address } = useAccount()
  const { mintNFT, isPending, isSuccess, error, hash, reset } = useMintNFT()
  const { data: addressInfo, isLoading: isLoadingInfo, refetch } = useAddressInfo(address)

  const [showTransactionStatus, setShowTransactionStatus] = useState(false)

  const chainId = useChainId()
  const isUnsupportedNetwork = ![mainnet.id, sepolia.id].includes(chainId)

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
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading your address information...</span>
          </CardContent>
        </Card>
      ) : (
        addressInfo && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <Info className="h-5 w-5 mr-2" />
                Your Address Stats
              </CardTitle>
              <CardDescription className="text-blue-700">Data automatically updates every 2 minutes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-900">{addressInfo.currentBalance}</p>
                  <p className="text-sm text-blue-700">Current Balance</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-900">{addressInfo.totalMinted}</p>
                  <p className="text-sm text-blue-700">Total Minted</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-900">{addressInfo.remainingMints}</p>
                  <p className="text-sm text-blue-700">Remaining Mints</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      )}

      {/* Network Status */}
      <NetworkSwitcher />

      {/* Gas Estimation */}
      {!isUnsupportedNetwork && <GasEstimator />}

      {/* Transaction Status */}
      {showTransactionStatus && hash && (
        <TransactionStatus hash={hash} onClose={() => setShowTransactionStatus(false)} />
      )}

      {/* Minting Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            Mint Your NFT
          </CardTitle>
          <CardDescription>Click the button below to mint a new NFT to your wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleMint}
            disabled={isPending || addressInfo?.remainingMints === 0 || isUnsupportedNetwork}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {isPending ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {hash ? "Confirming..." : "Submitting..."}
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Mint NFT
              </>
            )}
          </Button>

          {/* Status Messages - Only show success after transaction is confirmed */}
          {isSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">✅ NFT minted successfully!</p>
              <p className="text-green-600 text-sm mt-1">
                Transaction confirmed on the blockchain. Your address stats will update shortly.
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">❌ Minting failed</p>
              <p className="text-red-600 text-sm mt-1">{error.message}</p>
            </div>
          )}

          {addressInfo?.remainingMints === 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium">⚠️ Mint limit reached</p>
              <p className="text-yellow-600 text-sm mt-1">
                You have reached your maximum mint limit for this contract.
              </p>
            </div>
          )}

          {isUnsupportedNetwork && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">⚠️ Unsupported Network</p>
              <p className="text-red-600 text-sm mt-1">
                Please switch to Ethereum Mainnet or Sepolia testnet to mint NFTs.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

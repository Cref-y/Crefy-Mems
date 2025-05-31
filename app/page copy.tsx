/**
 * Main application page component
 * Orchestrates the wallet connection and NFT minting interface
 */
"use client"

import { WalletConnection } from "@/components/wallet-connection"
import { NFTMinter } from "@/components/nft-minter"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAccount } from "wagmi"
// Import the new ContractStats component
import { ContractStats } from "@/components/contract-stats"
import { NFTGallery } from "@/components/nft-gallery"

export default function HomePage() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">NFT Minter</h1>
          <p className="text-lg text-gray-600">
            Connect your wallet and mint your unique NFT. Supports Ethereum Mainnet and Sepolia testnet.
          </p>
        </div>

        {/* Add the ContractStats component before the main card */}
        <div className="mb-6">
          <ContractStats />
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">{isConnected ? "Ready to Mint" : "Connect Wallet"}</CardTitle>
            <CardDescription className="text-center">
              {isConnected ? "Click the button below to mint your NFT" : "Please connect your wallet to continue"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <WalletConnection />
            {isConnected && <NFTMinter />}
          </CardContent>
        </Card>

        {/* Add NFT Gallery after the main card */}
        {isConnected && (
          <div className="mt-8">
            <NFTGallery />
          </div>
        )}
      </div>
    </div>
  )
}

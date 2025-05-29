/**
 * Enhanced NFT Gallery with comprehensive token ID scanning and improved card flipping
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ExternalLink,
  Image,
  RefreshCw,
  Grid3X3,
  AlertCircle,
  Copy,
  Info,
  CheckCircle,
  QrCode,
  Eye,
  Search,
  RotateCcw,
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"

// Mock types - replace with your actual types
interface UserNFT {
  tokenId: number
  contractAddress: string
  tokenURI: string
  metadata?: {
    name?: string
    description?: string
    image?: string
    attributes?: Array<{ trait_type: string; value: string }>
  }
  isLoading: boolean
  error?: string
}

interface NFTCardProps {
  nft: UserNFT
  onViewOnEtherscan: (tokenId: number) => void
  onCopyContract: (contractAddress: string) => void
}

function NFTCard({ nft, onViewOnEtherscan, onCopyContract }: NFTCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [isUsed, setIsUsed] = useState(false)
  const [usageCount, setUsageCount] = useState(0)
  const [uniqueId, setUniqueId] = useState<string>("")

  // Generate QR code and check usage status
  useEffect(() => {
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const generatedUniqueId = `${nft.tokenId}-${timestamp}-${randomId}`
    setUniqueId(generatedUniqueId)

    // Create QR code data
    const qrData = {
      contractAddress: nft.contractAddress,
      tokenId: nft.tokenId,
      tokenURI: nft.tokenURI,
      timestamp,
      uniqueId: generatedUniqueId,
    }

    // Create the QR code URL
    const qrDataString = JSON.stringify(qrData)
    const encodedData = encodeURIComponent(qrDataString)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedData}`
    setQrCodeUrl(qrUrl)

    // Check usage status using in-memory storage (no localStorage in artifacts)
    checkUsageStatus(nft.tokenId)
  }, [nft.tokenId, nft.contractAddress, nft.tokenURI])

  const checkUsageStatus = (tokenId: number) => {
    // In a real implementation, this would check your actual storage system
    // For now, we'll simulate some usage data
    const simulatedUsage = Math.random() > 0.7 // 30% chance of being "used"
    if (simulatedUsage) {
      setIsUsed(true)
      setUsageCount(Math.floor(Math.random() * 3) + 1)
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleQRCodeClick = () => {
    // Mark as used when QR code is clicked
    setIsUsed(true)
    setUsageCount(prev => prev + 1)
    
    // Open NFT view
    const viewUrl = `${window.location.origin}/nft/view/${uniqueId}`
    window.open(viewUrl, "_blank")
  }

  return (
    <div className="relative w-full h-[500px]" style={{ perspective: '1000px' }}>
      <div
        className={`relative w-full h-full transition-transform duration-1000 ease-in-out`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Front Side */}
        <Card className="absolute inset-0 w-full h-full overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer" 
              style={{ backfaceVisibility: 'hidden' }}
              onClick={handleFlip}>
          {/* USED Badge on Front */}
          {isUsed && (
            <div className="absolute top-3 left-3 z-10">
              <Badge variant="destructive" className="text-xs font-semibold">
                USED ({usageCount}x)
              </Badge>
            </div>
          )}

          {/* Flip indicator */}
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-black bg-opacity-50 rounded-full p-2 text-white">
              <QrCode className="h-4 w-4" />
            </div>
          </div>

          <div className="aspect-square relative bg-gray-100 h-64">
            {nft.isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : nft.metadata?.image && !imageError ? (
              <div className="relative w-full h-full">
                <img
                  src={nft.metadata.image || "/placeholder.svg"}
                  alt={nft.metadata.name || `NFT #${nft.tokenId}`}
                  className={`w-full h-full object-cover ${isUsed ? "opacity-50" : ""}`}
                  onError={() => setImageError(true)}
                />
                {isUsed && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <Badge variant="destructive" className="text-lg px-6 py-3 font-bold">
                      USED
                    </Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Image className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>

          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold text-gray-800">
              {nft.isLoading ? (
                <div className="animate-pulse bg-gray-200 h-7 w-32 rounded"></div>
              ) : (
                nft.metadata?.name || `NFT #${nft.tokenId}`
              )}
            </CardTitle>
            <CardDescription className="text-base">
              <div className="space-y-2">
                <div className="font-medium">Token ID: {nft.tokenId}</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Contract:</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onCopyContract(nft.contractAddress)
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-mono"
                    title="Click to copy contract address"
                  >
                    {nft.contractAddress.slice(0, 8)}...{nft.contractAddress.slice(-6)}
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {nft.isLoading ? (
              <div className="space-y-3">
                <div className="animate-pulse bg-gray-200 h-5 w-full rounded"></div>
                <div className="animate-pulse bg-gray-200 h-5 w-3/4 rounded"></div>
              </div>
            ) : (
              <>
                {nft.metadata?.description && (
                  <p className="text-base text-gray-700 line-clamp-3 leading-relaxed">{nft.metadata.description}</p>
                )}

                {nft.metadata?.attributes && nft.metadata.attributes.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-base font-semibold text-gray-800">Attributes:</p>
                    <div className="flex flex-wrap gap-2">
                      {nft.metadata.attributes.slice(0, 2).map((attr: any, index: number) => (
                        <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                          {attr.trait_type}: {attr.value}
                        </Badge>
                      ))}
                      {nft.metadata.attributes.length > 2 && (
                        <Badge variant="outline" className="text-sm px-3 py-1">
                          +{nft.metadata.attributes.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {nft.error && (
                  <div className="flex items-center text-yellow-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {nft.error}
                  </div>
                )}
              </>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button 
                onClick={(e) => {
                  e.stopPropagation()
                  onViewOnEtherscan(nft.tokenId)
                }} 
                variant="outline" 
                size="default"
                className="h-11"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Etherscan
              </Button>
              <Button 
                onClick={(e) => {
                  e.stopPropagation()
                  handleFlip()
                }} 
                variant="default" 
                size="default"
                className="h-11 bg-blue-600 hover:bg-blue-700"
              >
                <QrCode className="h-4 w-4 mr-2" />
                QR Code
              </Button>
            </div>
            
            {/* Click to flip instruction */}
            <div className="text-center text-sm text-gray-500 italic">
              Click anywhere on card to view QR code
            </div>
          </CardContent>
        </Card>

        {/* Back Side - QR Code */}
        <Card className="absolute inset-0 w-full h-full overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
              onClick={handleFlip}>
          {/* USED Badge on Back */}
          {isUsed && (
            <div className="absolute top-3 left-3 z-10">
              <Badge variant="destructive" className="text-xs font-semibold">
                USED ({usageCount}x)
              </Badge>
            </div>
          )}

          {/* Back indicator */}
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-black bg-opacity-50 rounded-full p-2 text-white">
              <RotateCcw className="h-4 w-4" />
            </div>
          </div>

          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-center text-xl font-bold">
              <QrCode className="h-6 w-6 mr-3" />
              QR Code
            </CardTitle>
            <CardDescription className="text-base text-center font-medium">
              Scan to view NFT #{nft.tokenId}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* QR Code Display */}
            <div className="flex justify-center">
              <div className="relative">
                {qrCodeUrl && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleQRCodeClick()
                    }} 
                    className="block"
                  >
                    <img
                      src={qrCodeUrl || "/placeholder.svg"}
                      alt={`QR Code for NFT #${nft.tokenId}`}
                      className={`w-56 h-56 border-2 border-gray-300 rounded-xl cursor-pointer hover:shadow-lg transition-shadow hover:border-blue-400 ${
                        isUsed ? "opacity-50" : ""
                      }`}
                    />
                  </button>
                )}
                {isUsed && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-xl pointer-events-none">
                    <Badge variant="destructive" className="text-lg px-6 py-3 font-bold">
                      USED
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* NFT Information */}
            <div className="space-y-3 text-base">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Token ID:</span>
                <span className="font-mono text-lg">#{nft.tokenId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Status:</span>
                <Badge variant={isUsed ? "destructive" : "secondary"} className="text-sm px-3 py-1">
                  {isUsed ? `Used ${usageCount}x` : "Unused"}
                </Badge>
              </div>
            </div>

            {/* Back Button */}
            <Button 
              onClick={(e) => {
                e.stopPropagation()
                handleFlip()
              }} 
              variant="outline" 
              size="default" 
              className="w-full h-11"
            >
              <Eye className="h-4 w-4 mr-2" />
              Back to NFT
            </Button>

            {/* Instructions */}
            <div className="text-sm text-gray-500 text-center space-y-1">
              <p className="font-medium">Click QR code to open view page</p>
              <p>Status updates when scanned</p>
              <p className="italic">Click anywhere on card to flip back</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function NFTGallery() {
  // Mock wallet connection - replace with your actual wallet connection
  const [isConnected, setIsConnected] = useState(true)
  const [address, setAddress] = useState("0x1234...5678")
  const [chainId, setChainId] = useState(1) // mainnet
  
  const [nfts, setNfts] = useState<UserNFT[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<{
    current: number
    total: number
    found: number
    currentRange: string
    timeElapsed: number
  } | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  
  // Mock contract data - replace with your actual contract
  const contractAddress = "0xC373774...F07Cb149"
  const balance = 4

  // Enhanced scanning function
  const scanForNFTs = useCallback(async () => {
    if (!isConnected) return

    setIsLoading(true)
    setError(null)
    setNfts([])
    
    const startTime = Date.now()
    const foundNFTs: UserNFT[] = []
    
    try {
      // Define comprehensive scanning ranges
      const scanRanges = [
        { start: 1, end: 100, name: "1-100" },
        { start: 101, end: 500, name: "101-500" },
        { start: 501, end: 1000, name: "501-1000" },
        { start: 1001, end: 5000, name: "1001-5000" },
        { start: 5001, end: 10000, name: "5001-10000" },
        { start: 10001, end: 50000, name: "10001-50000" },
        { start: 50001, end: 100000, name: "50001-100000" },
        // Add more ranges for very high token IDs
        { start: 100001, end: 500000, name: "100001-500000" },
        { start: 500001, end: 1000000, name: "500001-1000000" },
      ]

      const totalChecks = scanRanges.reduce((sum, range) => sum + (range.end - range.start + 1), 0)
      let currentCheck = 0

      // Simulate comprehensive scanning
      for (const range of scanRanges) {
        setProgress({
          current: currentCheck,
          total: totalChecks,
          found: foundNFTs.length,
          currentRange: range.name,
          timeElapsed: Date.now() - startTime
        })

        // Simulate finding NFTs in different ranges
        // In real implementation, this would call your contract methods
        if (foundNFTs.length < balance) {
          // Simulate finding NFTs in this range
          const shouldFindInRange = Math.random() > 0.7 // 30% chance per range
          
          if (shouldFindInRange) {
            // Generate random token IDs within this range
            const numToFind = Math.min(
              Math.floor(Math.random() * 2) + 1, 
              balance - foundNFTs.length
            )
            
            for (let i = 0; i < numToFind; i++) {
              const tokenId = Math.floor(Math.random() * (range.end - range.start + 1)) + range.start
              
              // Avoid duplicates
              if (!foundNFTs.some(nft => nft.tokenId === tokenId)) {
                const mockNFT: UserNFT = {
                  tokenId,
                  contractAddress,
                  tokenURI: `https://api.example.com/token/${tokenId}`,
                  metadata: {
                    name: `Cool NFT #${tokenId}`,
                    description: `This is a cool NFT with token ID ${tokenId}. It features unique artwork and special properties that make it valuable to collectors.`,
                    image: `https://picsum.photos/400/400?random=${tokenId}`,
                    attributes: [
                      { trait_type: "Rarity", value: Math.random() > 0.5 ? "Common" : "Rare" },
                      { trait_type: "Color", value: ["Red", "Blue", "Green", "Purple"][Math.floor(Math.random() * 4)] }
                    ]
                  },
                  isLoading: false
                }
                
                foundNFTs.push(mockNFT)
              }
            }
          }
        }

        // Update progress
        currentCheck += (range.end - range.start + 1)
        
        // Add small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 150))
        
        // Stop if we found all NFTs
        if (foundNFTs.length >= balance) {
          break
        }
      }

      setNfts(foundNFTs)
      
      if (foundNFTs.length === 0 && balance > 0) {
        setError(`Expected to find ${balance} NFTs but found none. Your NFTs might have very high token IDs beyond our scan range, or there might be an issue with the contract interface.`)
      }
      
    } catch (err) {
      setError(`Failed to scan for NFTs: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
      setProgress(null)
    }
  }, [isConnected, contractAddress, balance])

  // Auto-scan on mount
  useEffect(() => {
    if (isConnected) {
      scanForNFTs()
    }
  }, [isConnected, scanForNFTs])

  const getEtherscanUrl = (tokenId: number) => {
    const baseUrl = chainId === 1 ? "https://etherscan.io" : "https://sepolia.etherscan.io"
    return `${baseUrl}/token/${contractAddress}?a=${tokenId}`
  }

  const handleViewOnEtherscan = (tokenId: number) => {
    window.open(getEtherscanUrl(tokenId), "_blank")
  }

  const handleCopyContract = async (contractAddr: string) => {
    try {
      await navigator.clipboard.writeText(contractAddr)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error("Failed to copy contract address:", err)
    }
  }

  const handleRefresh = () => {
    scanForNFTs()
  }

  if (!isConnected) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="text-center py-12">
          <p className="text-gray-600 mb-6 text-lg">Please connect your wallet to view your NFTs</p>
          <Button onClick={() => setIsConnected(true)} size="lg">Connect Wallet (Demo)</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-7xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Grid3X3 className="h-6 w-6 mr-3" />
            <CardTitle className="text-2xl">Your NFT Collection</CardTitle>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="default" disabled={isLoading}>
            <RefreshCw className={`h-5 w-5 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        <CardDescription className="text-base">
          {isLoading ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                <span>Comprehensive scanning for your NFTs...</span>
              </div>
              {progress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      Progress: {progress.current.toLocaleString()} / {progress.total.toLocaleString()}
                    </span>
                    <span>Found: {progress.found} NFTs</span>
                  </div>
                  <Progress value={(progress.current / progress.total) * 100} className="h-3" />
                  <div className="flex justify-between text-sm">
                    <span>Range: {progress.currentRange}</span>
                    <span>Time: {(progress.timeElapsed / 1000).toFixed(1)}s</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>{`Found ${nfts.length} NFT${nfts.length !== 1 ? "s" : ""} in your wallet`}</span>
              </div>
              <div className="text-sm text-blue-600 mt-2 font-medium">💡 Click on any NFT card to flip and see its QR code</div>
            </div>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Contract and Balance Information */}
        <div className="mb-6 space-y-3">
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold">Contract Address:</span>
              <button
                onClick={() => handleCopyContract(contractAddress)}
                className="text-base text-blue-600 hover:text-blue-800 flex items-center gap-2 font-mono"
                title="Click to copy contract address"
              >
                {contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold">Your Balance:</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-base px-4 py-1">
                {balance} NFT{balance !== 1 ? "s" : ""}
              </Badge>
            </div>
          </div>

          {copySuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-base text-center font-medium">
              ✅ Contract address copied to clipboard!
            </div>
          )}
        </div>

        {error && (
          <div className="p-5 bg-red-50 border border-red-200 rounded-xl mb-6">
            <p className="text-red-800 font-semibold text-lg">❌ Scanning Issue</p>
            <p className="text-red-600 text-base mt-2">{error}</p>
            <div className="mt-4 space-y-2 text-base text-red-700">
              <p><strong>Possible solutions:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-3">
                <li>Your NFTs might have very high token IDs (beyond 1M)</li>
                <li>Check if the contract address is correct</li>
                <li>Verify you're on the correct network</li>
                <li>Try the enhanced scan again</li>
              </ul>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="default" className="mt-4">
              Try Enhanced Scan Again
            </Button>
          </div>
        )}

        {isLoading && nfts.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg">Comprehensive scanning in progress...</p>
            <p className="text-base text-gray-500 mt-3">
              {progress
                ? `Scanning range ${progress.currentRange} (${(progress.timeElapsed / 1000).toFixed(1)}s elapsed)`
                : "Scanning multiple token ID ranges from 1 to 1,000,000+"}
            </p>
            {balance > 0 && <p className="text-base text-blue-600 mt-2 font-medium">Expected to find {balance} NFTs</p>}
          </div>
        ) : nfts.length === 0 && !isLoading ? (
          <div className="text-center py-16">
            <Grid3X3 className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No NFTs Found</h3>
            <p className="text-gray-600 mb-6 text-base max-w-md mx-auto">
              {balance > 0
                ? `You have ${balance} NFT${balance !== 1 ? "s" : ""} but they weren't found in our comprehensive scan. They might have extremely high token IDs or be in an unexpected range.`
                : "You don't have any NFTs from this collection yet."}
            </p>
            {balance > 0 && (
              <div className="space-y-3">
                <Button onClick={handleRefresh} variant="outline" size="default">
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Run Comprehensive Scan Again
                </Button>
                <p className="text-sm text-gray-500">
                  Our enhanced scan checks ranges from 1 to 1,000,000+
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {nfts.map((nft) => (
              <NFTCard
                key={nft.tokenId}
                nft={nft}
                onViewOnEtherscan={handleViewOnEtherscan}
                onCopyContract={handleCopyContract}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
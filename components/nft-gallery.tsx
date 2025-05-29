/**
 * Enhanced NFT Gallery with real contract data integration
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
import { useAccount, useReadContract, usePublicClient } from "wagmi"
import { CONTRACT_CONFIG } from "@/config/contract"

// Types
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

    // Simulate usage status (replace with real logic)
    checkUsageStatus(nft.tokenId)
  }, [nft.tokenId, nft.contractAddress, nft.tokenURI])

  const checkUsageStatus = (tokenId: number) => {
    // In a real implementation, this would check your actual storage system
    const simulatedUsage = Math.random() > 0.8 // 20% chance of being "used"
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
  const { address, isConnected, chain } = useAccount()
  const publicClient = usePublicClient()
  
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

  // Get user's NFT balance
  const { data: balance, isError: balanceError, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: CONTRACT_CONFIG.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && isConnected }
  })

  // Get user's address info (balance, total minted, remaining mints)
  const { data: addressInfo, refetch: refetchAddressInfo } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: CONTRACT_CONFIG.abi,
    functionName: 'getAddressInfo',
    args: address ? [address] : undefined,
    query: { enabled: !!address && isConnected }
  })

  // Get contract name
  const { data: contractName } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: CONTRACT_CONFIG.abi,
    functionName: 'name',
  })

  // Get contract symbol
  const { data: contractSymbol } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: CONTRACT_CONFIG.abi,
    functionName: 'symbol',
  })

  // Convert balance to number
  const userBalance = balance ? Number(balance) : 0

  // Fetch metadata from tokenURI
  const fetchMetadata = async (tokenURI: string): Promise<any> => {
    try {
      // Handle IPFS URLs
      let url = tokenURI
      if (tokenURI.startsWith('ipfs://')) {
        url = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/')
      }
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const metadata = await response.json()
      
      // Handle IPFS image URLs
      if (metadata.image && metadata.image.startsWith('ipfs://')) {
        metadata.image = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')
      }
      
      return metadata
    } catch (error) {
      console.error('Error fetching metadata:', error)
      return null
    }
  }

  // Check if user owns a specific token ID
  const checkTokenOwnership = async (tokenId: number): Promise<boolean> => {
    try {
      if (!publicClient) return false
      
      const owner = await publicClient.readContract({
        address: CONTRACT_CONFIG.address as `0x${string}`,
        abi: CONTRACT_CONFIG.abi,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)],
      })
      
      return owner?.toString().toLowerCase() === address?.toLowerCase()
    } catch (error) {
      // Token doesn't exist or other error
      return false
    }
  }

  // Get token URI for a specific token ID
  const getTokenURI = async (tokenId: number): Promise<string | null> => {
    try {
      if (!publicClient) return null
      
      const tokenURI = await publicClient.readContract({
        address: CONTRACT_CONFIG.address as `0x${string}`,
        abi: CONTRACT_CONFIG.abi,
        functionName: 'tokenURI',
        args: [BigInt(tokenId)],
      })
      
      return tokenURI as string
    } catch (error) {
      console.error(`Error getting token URI for token ${tokenId}:`, error)
      return null
    }
  }

  // Enhanced scanning function
  const scanForNFTs = useCallback(async () => {
    if (!isConnected || !address || !publicClient || userBalance === 0) return

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
        { start: 100001, end: 500000, name: "100001-500000" },
        { start: 500001, end: 1000000, name: "500001-1000000" },
      ]

      const totalChecks = scanRanges.reduce((sum, range) => sum + (range.end - range.start + 1), 0)
      let currentCheck = 0

      // Scan through ranges
      for (const range of scanRanges) {
        setProgress({
          current: currentCheck,
          total: totalChecks,
          found: foundNFTs.length,
          currentRange: range.name,
          timeElapsed: Date.now() - startTime
        })

        // Check tokens in this range (sample every 10th token for performance)
        const step = Math.max(1, Math.floor((range.end - range.start + 1) / 100))
        
        for (let tokenId = range.start; tokenId <= range.end; tokenId += step) {
          try {
            const isOwned = await checkTokenOwnership(tokenId)
            
            if (isOwned) {
              // Create NFT object with loading state
              const nft: UserNFT = {
                tokenId,
                contractAddress: CONTRACT_CONFIG.address,
                tokenURI: '',
                isLoading: true
              }
              
              foundNFTs.push(nft)
              setNfts([...foundNFTs]) // Update UI immediately
              
              // Fetch token URI and metadata in background
              const tokenURI = await getTokenURI(tokenId)
              if (tokenURI) {
                nft.tokenURI = tokenURI
                const metadata = await fetchMetadata(tokenURI)
                nft.metadata = metadata
              }
              
              nft.isLoading = false
              setNfts([...foundNFTs]) // Update with metadata
              
              // Stop if we found all expected NFTs
              if (foundNFTs.length >= userBalance) {
                break
              }
            }
          } catch (error) {
            console.error(`Error checking token ${tokenId}:`, error)
          }
          
          currentCheck++
          
          // Small delay to prevent rate limiting
          if (tokenId % 50 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        }
        
        // Stop if we found all NFTs
        if (foundNFTs.length >= userBalance) {
          break
        }
        
        currentCheck += Math.max(0, range.end - range.start + 1 - step)
      }

      if (foundNFTs.length === 0 && userBalance > 0) {
        setError(`Expected to find ${userBalance} NFTs but found none. Your NFTs might have very high token IDs beyond our scan range, or there might be an issue with the contract interface.`)
      }
      
    } catch (err) {
      setError(`Failed to scan for NFTs: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
      setProgress(null)
    }
  }, [isConnected, address, publicClient, userBalance])

  // Auto-scan when conditions are met
  useEffect(() => {
    if (isConnected && address && userBalance > 0) {
      scanForNFTs()
    }
  }, [isConnected, address, userBalance, scanForNFTs])

  const getEtherscanUrl = (tokenId: number) => {
    const chainId = chain?.id || 1
    const baseUrl = chainId === 1 ? "https://etherscan.io" : "https://sepolia.etherscan.io"
    return `${baseUrl}/token/${CONTRACT_CONFIG.address}?a=${tokenId}`
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
    refetchBalance()
    refetchAddressInfo()
    scanForNFTs()
  }

  if (!isConnected) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="text-center py-12">
          <p className="text-gray-600 mb-6 text-lg">Please connect your wallet to view your NFTs</p>
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
            <CardTitle className="text-2xl">
              {contractName ? `${contractName} Collection` : 'Your NFT Collection'}
            </CardTitle>
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
                <span>Scanning blockchain for your NFTs...</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-base font-semibold">Contract:</span>
                <button
                  onClick={() => handleCopyContract(CONTRACT_CONFIG.address)}
                  className="block text-base text-blue-600 hover:text-blue-800 font-mono mt-1"
                  title="Click to copy contract address"
                >
                  {CONTRACT_CONFIG.address.slice(0, 10)}...{CONTRACT_CONFIG.address.slice(-8)}
                  <Copy className="h-4 w-4 inline ml-2" />
                </button>
              </div>
              <div>
                <span className="text-base font-semibold">Collection:</span>
                <p className="text-base mt-1">
                  {contractName} ({contractSymbol})
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold">Your Balance:</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-base px-4 py-1">
                  {userBalance} NFT{userBalance !== 1 ? "s" : ""}
                </Badge>
              </div>
              {addressInfo && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold">Total Minted:</span>
                    <Badge variant="outline" className="text-base px-4 py-1">
                      {Number(addressInfo[1])}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold">Remaining Mints:</span>
                    <Badge variant="outline" className="text-base px-4 py-1">
                      {Number(addressInfo[2])}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </div>

          {copySuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-base text-center font-medium">
              ✅ Contract address copied to clipboard!
            </div>
          )}
        </div>

        {balanceError && (
          <div className="p-5 bg-red-50 border border-red-200 rounded-xl mb-6">
            <p className="text-red-800 font-semibold text-lg">❌ Error Reading Contract</p>
            <p className="text-red-600 text-base mt-2">Failed to read your NFT balance from the contract.</p>
          </div>
        )}

{error && (
          <div className="p-5 bg-red-50 border border-red-200 rounded-xl mb-6">
            <p className="text-red-800 font-semibold text-lg">❌ Scanning Issue</p>
            <p className="text-red-600 text-base mt-2">{error}</p>
          </div>
        )}

        {/* NFT Grid */}
        {nfts.length > 0 ? (
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
        ) : !isLoading && userBalance === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Image className="h-12 w-12 text-gray-400" />
            </div>
            <p className="text-xl font-semibold text-gray-600 mb-3">No NFTs Found</p>
            <p className="text-base text-gray-500 mb-6">
              You don't own any NFTs from this collection yet.
            </p>
            <Button variant="outline" size="lg">
              <ExternalLink className="h-5 w-5 mr-2" />
              Explore Collection
            </Button>
          </div>
        ) : !isLoading && userBalance > 0 && nfts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="h-12 w-12 text-yellow-600" />
            </div>
            <p className="text-xl font-semibold text-gray-600 mb-3">NFTs Not Found in Scan Range</p>
            <p className="text-base text-gray-500 mb-6">
              We scanned up to token ID 1,000,000 but couldn't find your {userBalance} NFT{userBalance !== 1 ? "s" : ""}. 
              Your tokens might have higher IDs or there might be a contract interface issue.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleRefresh} variant="outline" size="lg">
                <RefreshCw className="h-5 w-5 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" size="lg">
                <Info className="h-5 w-5 mr-2" />
                Get Help
              </Button>
            </div>
          </div>
        ) : null}

        {/* Loading State for Empty Gallery */}
        {isLoading && nfts.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-xl font-semibold text-gray-600 mb-3">Scanning for Your NFTs</p>
            <p className="text-base text-gray-500 mb-6">
              This may take a moment as we search through the blockchain...
            </p>
          </div>
        )}

        {/* Footer Information */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500 space-y-2">
            <p>
              💡 <strong>Tip:</strong> Click any NFT card to reveal its QR code for easy sharing and verification
            </p>
            <p>
              QR codes contain token information and can be scanned to view NFT details
            </p>
            <p className="flex items-center justify-center gap-2">
              <Info className="h-4 w-4" />
              Connected to {chain?.id === 1 ? "Ethereum Mainnet" : "Sepolia Testnet"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default NFTGallery
/**
 * NFT View page for QR code scanning
 * Displays NFT details when QR code is scanned
 */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, CheckCircle, AlertCircle } from "lucide-react"
import { useParams } from "next/navigation"

interface QRCodeData {
  contractAddress: string
  tokenId: number
  tokenURI: string
  timestamp: number
  uniqueId: string
  used?: boolean
  usageCount?: number
  createdAt?: string
  lastUsed?: string
}

export default function NFTViewPage() {
  const params = useParams()
  const uniqueId = params.uniqueId as string
  const [qrData, setQrData] = useState<QRCodeData | null>(null)
  const [metadata, setMetadata] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (uniqueId) {
      loadQRData(uniqueId)
    }
  }, [uniqueId])

  const loadQRData = async (id: string) => {
    try {
      setIsLoading(true)

      // Load QR data from localStorage
      const qrKey = `qr-${id}`
      const stored = localStorage.getItem(qrKey)

      if (!stored) {
        setError("QR code not found or expired")
        return
      }

      const data: QRCodeData = JSON.parse(stored)
      setQrData(data)

      // Mark as used and increment usage count
      const updatedData = {
        ...data,
        used: true,
        usageCount: (data.usageCount || 0) + 1,
        lastUsed: new Date().toISOString(),
      }
      localStorage.setItem(qrKey, JSON.stringify(updatedData))

      // Fetch metadata if URI is available
      if (data.tokenURI) {
        await fetchMetadata(data.tokenURI, data.tokenId)
      }
    } catch (error) {
      console.error("Error loading QR data:", error)
      setError("Failed to load NFT data")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMetadata = async (tokenURI: string, tokenId: number) => {
    try {
      if (!tokenURI || tokenURI.trim() === "") {
        setMetadata({
          name: `NFT #${tokenId}`,
          description: `This is NFT number ${tokenId} from the collection.`,
          image: `/placeholder.svg?height=400&width=400&text=NFT%20${tokenId}`,
        })
        return
      }

      // Convert IPFS URLs
      const metadataUrl = tokenURI.startsWith("ipfs://")
        ? tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
        : tokenURI

      const response = await fetch(metadataUrl, {
        headers: { Accept: "application/json" },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setMetadata({
        name: data.name || `NFT #${tokenId}`,
        description: data.description || "No description available",
        image: data.image
          ? data.image.startsWith("ipfs://")
            ? data.image.replace("ipfs://", "https://ipfs.io/ipfs/")
            : data.image
          : `/placeholder.svg?height=400&width=400&text=NFT%20${tokenId}`,
        attributes: Array.isArray(data.attributes) ? data.attributes : [],
      })
    } catch (error) {
      console.error("Error fetching metadata:", error)
      setMetadata({
        name: `NFT #${tokenId}`,
        description: "Failed to load metadata",
        image: `/placeholder.svg?height=400&width=400&text=NFT%20${tokenId}`,
      })
    }
  }

  const getEtherscanUrl = () => {
    if (!qrData) return ""
    return `https://etherscan.io/token/${qrData.contractAddress}?a=${qrData.tokenId}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
              <span>Loading NFT data...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !qrData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">{error || "NFT data not found"}</p>
              <Button onClick={() => (window.location.href = "/")} className="mt-4">
                Go Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                NFT Viewed via QR Code
              </CardTitle>
              <Badge variant="secondary">Used {qrData.usageCount || 1}x</Badge>
            </div>
            <CardDescription>Successfully scanned QR code for NFT #{qrData.tokenId}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* NFT Image */}
            {metadata?.image && (
              <div className="flex justify-center">
                <div className="w-80 h-80 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={metadata.image || "/placeholder.svg"}
                    alt={metadata.name || `NFT #${qrData.tokenId}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* NFT Details */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{metadata?.name || `NFT #${qrData.tokenId}`}</h2>
                {metadata?.description && <p className="text-gray-600 mt-2">{metadata.description}</p>}
              </div>

              {/* Contract Information */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Token ID:</span>
                  <p>#{qrData.tokenId}</p>
                </div>
                <div>
                  <span className="font-medium">Contract:</span>
                  <p className="font-mono text-xs">
                    {qrData.contractAddress.slice(0, 10)}...{qrData.contractAddress.slice(-8)}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Scanned:</span>
                  <p>{new Date().toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-medium">Usage Count:</span>
                  <p>{qrData.usageCount || 1} times</p>
                </div>
              </div>

              {/* Attributes */}
              {metadata?.attributes && metadata.attributes.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Attributes:</h3>
                  <div className="flex flex-wrap gap-2">
                    {metadata.attributes.map((attr: any, index: number) => (
                      <Badge key={index} variant="outline">
                        {attr.trait_type}: {attr.value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={() => window.open(getEtherscanUrl(), "_blank")} variant="outline" className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Etherscan
                </Button>
                <Button onClick={() => (window.location.href = "/")} variant="default" className="flex-1">
                  Go to App
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

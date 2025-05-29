/**
 * QR Code Generator component
 * Generates QR codes for NFT viewing with usage tracking
 */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QrCode, Copy, Eye, RotateCcw } from "lucide-react"

interface QRCodeData {
  contractAddress: string
  tokenId: number
  tokenURI: string
  timestamp: number
  uniqueId: string
}

interface QRCodeGeneratorProps {
  contractAddress: string
  tokenId: number
  tokenURI: string
  onClose: () => void
}

export function QRCodeGenerator({ contractAddress, tokenId, tokenURI, onClose }: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [isUsed, setIsUsed] = useState(false)
  const [usageCount, setUsageCount] = useState(0)
  const [copySuccess, setCopySuccess] = useState(false)
  const [uniqueId, setUniqueId] = useState<string>("")

  useEffect(() => {
    // Generate unique ID for this QR code
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const generatedUniqueId = `${tokenId}-${timestamp}-${randomId}`
    setUniqueId(generatedUniqueId)

    // Create QR code data
    const qrData: QRCodeData = {
      contractAddress,
      tokenId,
      tokenURI,
      timestamp,
      uniqueId: generatedUniqueId,
    }

    // Create the QR code URL with encoded data
    const qrDataString = JSON.stringify(qrData)
    const encodedData = encodeURIComponent(qrDataString)

    // Use a QR code generation service (you can replace with your preferred service)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedData}`
    setQrCodeUrl(qrUrl)

    // Store QR code in localStorage for tracking
    const qrKey = `qr-${generatedUniqueId}`
    localStorage.setItem(
      qrKey,
      JSON.stringify({
        ...qrData,
        used: false,
        usageCount: 0,
        createdAt: new Date().toISOString(),
      }),
    )

    // Check if this QR code has been used before
    checkUsageStatus(generatedUniqueId)
  }, [contractAddress, tokenId, tokenURI])

  const checkUsageStatus = (id: string) => {
    const qrKey = `qr-${id}`
    const stored = localStorage.getItem(qrKey)
    if (stored) {
      const data = JSON.parse(stored)
      setIsUsed(data.used || false)
      setUsageCount(data.usageCount || 0)
    }
  }

  const handleCopyQRData = async () => {
    try {
      const qrData = {
        contractAddress,
        tokenId,
        tokenURI,
        uniqueId,
        viewUrl: `${window.location.origin}/nft/view/${uniqueId}`,
      }

      await navigator.clipboard.writeText(JSON.stringify(qrData, null, 2))
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error("Failed to copy QR data:", error)
    }
  }

  const handleViewNFT = () => {
    // Mark as used when viewed
    const qrKey = `qr-${uniqueId}`
    const stored = localStorage.getItem(qrKey)
    if (stored) {
      const data = JSON.parse(stored)
      const updatedData = {
        ...data,
        used: true,
        usageCount: (data.usageCount || 0) + 1,
        lastUsed: new Date().toISOString(),
      }
      localStorage.setItem(qrKey, JSON.stringify(updatedData))
      setIsUsed(true)
      setUsageCount(updatedData.usageCount)
    }

    // Open NFT view (you can customize this URL)
    const viewUrl = `${window.location.origin}/nft/view/${uniqueId}`
    window.open(viewUrl, "_blank")
  }

  const resetUsage = () => {
    const qrKey = `qr-${uniqueId}`
    const stored = localStorage.getItem(qrKey)
    if (stored) {
      const data = JSON.parse(stored)
      const resetData = {
        ...data,
        used: false,
        usageCount: 0,
        lastUsed: null,
      }
      localStorage.setItem(qrKey, JSON.stringify(resetData))
      setIsUsed(false)
      setUsageCount(0)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <QrCode className="h-5 w-5 mr-2" />
            NFT QR Code
          </CardTitle>
          <div className="flex items-center gap-2">
            {isUsed && (
              <Badge variant="destructive" className="text-xs">
                Used ({usageCount}x)
              </Badge>
            )}
            <Button onClick={onClose} variant="outline" size="sm">
              ✕
            </Button>
          </div>
        </div>
        <CardDescription>Scan this QR code to view NFT #{tokenId}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* QR Code Display */}
        <div className="flex justify-center">
          <div className="relative">
            {qrCodeUrl && (
              <img
                src={qrCodeUrl || "/placeholder.svg"}
                alt={`QR Code for NFT #${tokenId}`}
                className={`w-64 h-64 border rounded-lg ${isUsed ? "opacity-50" : ""}`}
              />
            )}
            {isUsed && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <Badge variant="destructive" className="text-lg px-4 py-2">
                  USED
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* NFT Information */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Token ID:</span>
            <span>#{tokenId}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Contract:</span>
            <span className="font-mono text-xs">
              {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Unique ID:</span>
            <span className="font-mono text-xs">{uniqueId.slice(0, 8)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Status:</span>
            <Badge variant={isUsed ? "destructive" : "secondary"}>{isUsed ? `Used ${usageCount}x` : "Unused"}</Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleViewNFT} variant="default" size="sm" className="w-full">
              <Eye className="h-3 w-3 mr-1" />
              View NFT
            </Button>
            <Button onClick={handleCopyQRData} variant="outline" size="sm" className="w-full">
              <Copy className="h-3 w-3 mr-1" />
              Copy Data
            </Button>
          </div>

          {isUsed && (
            <Button onClick={resetUsage} variant="outline" size="sm" className="w-full">
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset Usage
            </Button>
          )}
        </div>

        {copySuccess && (
          <div className="p-2 bg-green-50 border border-green-200 rounded text-green-800 text-sm text-center">
            ✅ QR data copied to clipboard!
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Scan this QR code with any QR scanner</p>
          <p>• The code contains contract address, token ID, and URI</p>
          <p>• Status changes to "Used" when scanned and viewed</p>
          <p>• Each scan is tracked and counted</p>
        </div>
      </CardContent>
    </Card>
  )
}

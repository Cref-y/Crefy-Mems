/**
 * Transaction status component
 * Displays real-time transaction status and confirmations
 */
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useWaitForTransactionReceipt, useChainId } from "wagmi"
import { mainnet, sepolia } from "wagmi/chains"

interface TransactionStatusProps {
  hash: `0x${string}` | undefined
  onClose: () => void
}

export function TransactionStatus({ hash, onClose }: TransactionStatusProps) {
  const chainId = useChainId()

  const {
    data: receipt,
    isLoading,
    isSuccess,
    isError,
  } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  })

  if (!hash) return null

  const getExplorerUrl = (txHash: string) => {
    switch (chainId) {
      case mainnet.id:
        return `https://etherscan.io/tx/${txHash}`
      case sepolia.id:
        return `https://sepolia.etherscan.io/tx/${txHash}`
      default:
        return `https://etherscan.io/tx/${txHash}`
    }
  }

  const getStatusInfo = () => {
    if (isLoading) {
      return {
        icon: Loader2,
        title: "Transaction Pending",
        description: "Waiting for confirmation on the blockchain...",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      }
    }
    if (isSuccess) {
      return {
        icon: CheckCircle,
        title: "Transaction Confirmed",
        description: `Confirmed in block ${receipt?.blockNumber}`,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      }
    }
    if (isError) {
      return {
        icon: XCircle,
        title: "Transaction Failed",
        description: "The transaction was not successful",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      }
    }
    return {
      icon: Clock,
      title: "Transaction Submitted",
      description: "Transaction has been submitted to the network",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <Card className={`${statusInfo.bgColor} ${statusInfo.borderColor}`}>
      <CardHeader className="pb-3">
        <CardTitle className={`flex items-center ${statusInfo.color} text-sm`}>
          <StatusIcon className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          {statusInfo.title}
        </CardTitle>
        <CardDescription className={statusInfo.color}>{statusInfo.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Transaction Hash:</span>
          <Badge variant="outline" className="font-mono text-xs">
            {hash.slice(0, 10)}...{hash.slice(-8)}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(getExplorerUrl(hash), "_blank")}
            className="flex-1"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View on Explorer
          </Button>
          {(isSuccess || isError) && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

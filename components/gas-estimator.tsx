/**
 * Gas estimation component
 * Shows estimated gas costs for minting transactions
 */
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Fuel, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { useEstimateGas, useGasPrice } from "wagmi"
import { CONTRACT_CONFIG } from "@/config/contract"
import { useAccount } from "wagmi"
import { formatEther } from "viem"

export function GasEstimator() {
  const { address, isConnected } = useAccount()

  const { data: gasEstimate } = useEstimateGas({
    to: CONTRACT_CONFIG.address as `0x${string}`,
    data: "0x", // mintFromContract function call data
    query: {
      enabled: isConnected,
    },
  })

  const { data: gasPrice } = useGasPrice({
    query: {
      enabled: isConnected,
      refetchInterval: 30000, // Update every 30 seconds
    },
  })

  if (!isConnected || !gasEstimate || !gasPrice) {
    return null
  }

  const estimatedCost = gasEstimate * gasPrice
  const costInEth = formatEther(estimatedCost)
  const costNumber = Number.parseFloat(costInEth)

  const getGasPriceLevel = (price: bigint) => {
    const priceInGwei = Number(price) / 1e9
    if (priceInGwei < 20) return { level: "Low", icon: TrendingDown, color: "text-green-600" }
    if (priceInGwei < 50) return { level: "Medium", icon: Minus, color: "text-yellow-600" }
    return { level: "High", icon: TrendingUp, color: "text-red-600" }
  }

  const gasPriceInfo = getGasPriceLevel(gasPrice)
  const GasPriceIcon = gasPriceInfo.icon

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-blue-900 text-sm">
          <Fuel className="h-4 w-4 mr-2" />
          Gas Estimation
        </CardTitle>
        <CardDescription className="text-blue-700">Estimated cost for minting transaction</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">Estimated Cost:</span>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {costNumber.toFixed(6)} ETH
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">Gas Price:</span>
          <div className="flex items-center space-x-1">
            <GasPriceIcon className={`h-3 w-3 ${gasPriceInfo.color}`} />
            <Badge variant="outline" className={gasPriceInfo.color}>
              {gasPriceInfo.level}
            </Badge>
          </div>
        </div>

        <div className="text-xs text-blue-600 mt-2">Gas prices update every 30 seconds. Actual cost may vary.</div>
      </CardContent>
    </Card>
  )
}

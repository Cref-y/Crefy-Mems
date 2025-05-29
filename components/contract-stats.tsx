/**
 * Contract statistics component
 * Displays general information about the NFT contract
 */
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, Coins } from "lucide-react"
import { useContractInfo } from "@/hooks/use-contract-info"

export function ContractStats() {
  const { name, symbol, mintLimit, totalHolders } = useContractInfo()

  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-purple-900 text-sm">
          <BarChart3 className="h-4 w-4 mr-2" />
          Contract Information
        </CardTitle>
        <CardDescription className="text-purple-700">
          {name && symbol ? `${name} (${symbol})` : "Loading contract details..."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Coins className="h-4 w-4 text-purple-600 mr-1" />
              <span className="text-sm font-medium text-purple-900">Mint Limit</span>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              {mintLimit ?? "Loading..."}
            </Badge>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-purple-600 mr-1" />
              <span className="text-sm font-medium text-purple-900">Total Holders</span>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              {totalHolders ?? "Loading..."}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

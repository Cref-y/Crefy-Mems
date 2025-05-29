/**
 * Network switcher component
 * Allows users to switch between different blockchain networks
 */
"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Network, AlertTriangle } from "lucide-react"
import { useAccount, useChainId, useSwitchChain } from "wagmi"
import { mainnet, sepolia } from "wagmi/chains"

const SUPPORTED_CHAINS = [mainnet, sepolia]

export function NetworkSwitcher() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending } = useSwitchChain()

  if (!isConnected) return null

  const currentChain = SUPPORTED_CHAINS.find((chain) => chain.id === chainId)
  const isUnsupportedNetwork = !currentChain

  return (
    <Card className={isUnsupportedNetwork ? "border-yellow-200 bg-yellow-50" : "border-gray-200"}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-sm">
          <Network className="h-4 w-4 mr-2" />
          Network
        </CardTitle>
        {isUnsupportedNetwork && (
          <CardDescription className="flex items-center text-yellow-700">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Unsupported network detected
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Current Network:</span>
          <Badge variant={isUnsupportedNetwork ? "destructive" : "secondary"}>{currentChain?.name || "Unknown"}</Badge>
        </div>

        {isUnsupportedNetwork && (
          <div className="space-y-2">
            <p className="text-sm text-yellow-700">Please switch to a supported network to continue minting.</p>
            <div className="flex gap-2">
              {SUPPORTED_CHAINS.map((chain) => (
                <Button
                  key={chain.id}
                  onClick={() => switchChain({ chainId: chain.id })}
                  disabled={isPending}
                  size="sm"
                  variant="outline"
                >
                  {isPending ? "Switching..." : `Switch to ${chain.name}`}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

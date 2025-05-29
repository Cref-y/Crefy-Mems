/**
 * Wallet connection component
 * Handles wallet connectivity using Wagmi
 */
"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, LogOut, CheckCircle } from "lucide-react"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { injected } from "wagmi/connectors"

export function WalletConnection() {
  const { address, isConnected } = useAccount()
  const { connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const handleConnect = () => {
    connect({ connector: injected() })
  }

  const handleDisconnect = () => {
    disconnect()
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Wallet Connected</p>
              <p className="text-sm text-green-700">{formatAddress(address)}</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Connected
          </Badge>
        </div>

        <Button onClick={handleDisconnect} variant="outline" className="w-full">
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect Wallet
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={handleConnect} disabled={isPending} className="w-full h-12 text-lg">
      <Wallet className="h-5 w-5 mr-2" />
      {isPending ? "Connecting..." : "Connect Wallet"}
    </Button>
  )
}

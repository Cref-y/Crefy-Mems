/**
 * Custom hook for fetching detailed address information
 * Uses the getAddressInfo function from the smart contract
 * Automatically refetches data every 2 minutes (120 seconds)
 */
"use client"

import { useReadContract } from "wagmi"
import { CONTRACT_CONFIG } from "@/config/contract"

interface AddressInfo {
  currentBalance: number
  totalMinted: number
  remainingMints: number
}

export function useAddressInfo(address: `0x${string}` | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: CONTRACT_CONFIG.abi,
    functionName: "getAddressInfo",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 120000, // Refetch every 2 minutes (120 seconds)
      staleTime: 60000, // Consider data stale after 1 minute
    },
  })

  const addressInfo: AddressInfo | undefined = data
    ? {
        currentBalance: Number(data[0]),
        totalMinted: Number(data[1]),
        remainingMints: Number(data[2]),
      }
    : undefined

  return {
    data: addressInfo,
    isLoading,
    error,
    refetch,
  }
}

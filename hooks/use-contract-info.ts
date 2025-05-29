/**
 * Custom hook for fetching general contract information
 * Retrieves contract name, symbol, and total supply
 */
"use client"

import { useReadContract } from "wagmi"
import { CONTRACT_CONFIG } from "@/config/contract"

export function useContractInfo() {
  const { data: name } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: CONTRACT_CONFIG.abi,
    functionName: "name",
  })

  const { data: symbol } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: CONTRACT_CONFIG.abi,
    functionName: "symbol",
  })

  const { data: mintLimit } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: CONTRACT_CONFIG.abi,
    functionName: "mintLimit",
  })

  const { data: totalHolders } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: CONTRACT_CONFIG.abi,
    functionName: "getTotalHoldersCount",
    query: {
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  })

  return {
    name: name as string,
    symbol: symbol as string,
    mintLimit: mintLimit ? Number(mintLimit) : undefined,
    totalHolders: totalHolders ? Number(totalHolders) : undefined,
  }
}

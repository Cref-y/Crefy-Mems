/**
 * Enhanced NFT discovery hook with expanded scan range
 * Designed to find NFTs with higher token IDs
 */
"use client"

import { useState, useCallback, useEffect } from "react"
import { useAccount, useReadContract } from "wagmi"
import { CONTRACT_CONFIG } from "@/config/contract"

export interface NFTMetadata {
  name?: string
  description?: string
  image?: string
  attributes?: Array<{
    trait_type: string
    value: string | number
  }>
}

export interface UserNFT {
  tokenId: number
  tokenURI: string
  metadata?: NFTMetadata
  contractAddress: string
  isLoading: boolean
  error?: string
}

export interface DiscoveryProgress {
  current: number
  total: number
  found: number
  timeElapsed: number
  currentRange: string
}

export function useUserNFTs() {
  const { address } = useAccount()
  const [nfts, setNfts] = useState<UserNFT[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<DiscoveryProgress | null>(null)
  const [discoveryMethod, setDiscoveryMethod] = useState<string>("")
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  // Get user's NFT balance using wagmi
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: CONTRACT_CONFIG.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Simple function to check if user owns a token with abort controller
  const checkTokenOwnership = async (tokenId: number, controller: AbortController): Promise<boolean> => {
    try {
      const response = await fetch("/api/nft/check-ownership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId,
          userAddress: address,
          contractAddress: CONTRACT_CONFIG.address,
        }),
        signal: controller.signal,
      })

      if (!response.ok) return false
      const result = await response.json()
      return result.isOwner || false
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Fetch aborted")
        return false
      }
      console.error(`Error checking ownership for token ${tokenId}:`, error)
      return false
    }
  }

  // Simple function to get token URI with abort controller
  const getTokenURI = async (tokenId: number, controller: AbortController): Promise<string> => {
    try {
      const response = await fetch("/api/nft/token-uri", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId,
          contractAddress: CONTRACT_CONFIG.address,
        }),
        signal: controller.signal,
      })

      if (!response.ok) return ""
      const result = await response.json()
      return result.tokenURI || ""
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Fetch aborted")
        return ""
      }
      console.error(`Error getting token URI for ${tokenId}:`, error)
      return ""
    }
  }

  // Generate placeholder metadata (no fetch required)
  const getPlaceholderMetadata = (tokenId: number): NFTMetadata => {
    return {
      name: `NFT #${tokenId}`,
      description: `This is NFT number ${tokenId} from the collection.`,
      image: `/placeholder.svg?height=400&width=400&text=NFT%20${tokenId}`,
      attributes: [
        { trait_type: "Token ID", value: tokenId },
        { trait_type: "Status", value: "Loading Metadata..." },
      ],
    }
  }

  // Enhanced discovery function with multiple scan ranges
  const discoverNFTs = async () => {
    if (!address || !balance) {
      console.log("No address or balance available")
      return
    }

    const userBalance = Number(balance)
    if (userBalance === 0) {
      console.log("User has no NFTs")
      setNfts([])
      setDiscoveryMethod("No NFTs found")
      return
    }

    console.log(`Starting NFT discovery for ${address}, expected balance: ${userBalance}`)

    // Create abort controller for timeouts
    const controller = new AbortController()
    setAbortController(controller)

    // Set a hard timeout of 30 seconds (increased from 20 for better coverage)
    const timeoutId = setTimeout(() => {
      console.log("30-second timeout reached, aborting all operations")
      controller.abort()
    }, 30000)

    const foundNFTs: UserNFT[] = []
    const startTime = Date.now()

    try {
      // Define multiple scan ranges to cover different token ID patterns
      const scanRanges = [
        { start: 1, end: 50, name: "Early tokens (1-50)" },
        { start: 100, end: 200, name: "Mid-range tokens (100-200)" },
        { start: 500, end: 600, name: "Higher tokens (500-600)" },
        { start: 1000, end: 1100, name: "High tokens (1000-1100)" },
        { start: 51, end: 99, name: "Remaining early (51-99)" },
        { start: 201, end: 499, name: "Extended mid-range (201-499)" },
      ]

      let totalChecked = 0
      const totalToCheck = scanRanges.reduce((sum, range) => sum + (range.end - range.start + 1), 0)

      for (const range of scanRanges) {
        if (controller.signal.aborted) break

        console.log(`Scanning range: ${range.name}`)
        setProgress({
          current: totalChecked,
          total: totalToCheck,
          found: foundNFTs.length,
          timeElapsed: Date.now() - startTime,
          currentRange: range.name,
        })

        // Scan this range
        for (let tokenId = range.start; tokenId <= range.end; tokenId++) {
          if (controller.signal.aborted) break

          totalChecked++
          const timeElapsed = Date.now() - startTime

          setProgress({
            current: totalChecked,
            total: totalToCheck,
            found: foundNFTs.length,
            timeElapsed,
            currentRange: `${range.name} - Token ${tokenId}`,
          })

          const isOwner = await checkTokenOwnership(tokenId, controller)
          if (isOwner) {
            console.log(`Found owned NFT: Token ID ${tokenId}`)
            const tokenURI = await getTokenURI(tokenId, controller)

            // Use placeholder metadata initially for speed
            const nft: UserNFT = {
              tokenId,
              tokenURI,
              metadata: getPlaceholderMetadata(tokenId),
              contractAddress: CONTRACT_CONFIG.address,
              isLoading: false, // Not loading metadata yet
            }

            foundNFTs.push(nft)
            setNfts((prev) => [...prev, nft])

            // If we found all expected NFTs, stop early
            if (foundNFTs.length >= userBalance) {
              console.log(`Found all ${userBalance} expected NFTs, stopping scan early`)
              break
            }
          }

          // Check if we're approaching the timeout
          if (timeElapsed > 28000) {
            // 28 seconds
            console.log("Approaching timeout, stopping scan")
            break
          }

          // Small delay every 10 tokens to prevent overwhelming
          if (tokenId % 10 === 0) {
            await new Promise((resolve) => setTimeout(resolve, 100))
          }
        }

        // If we found all expected NFTs, stop early
        if (foundNFTs.length >= userBalance) break

        // Check timeout between ranges
        if (Date.now() - startTime > 28000) break
      }

      const finalTimeElapsed = Date.now() - startTime
      console.log(`Discovery complete in ${finalTimeElapsed}ms. Found ${foundNFTs.length} NFTs`)
      setDiscoveryMethod(
        `Enhanced scan completed in ${(finalTimeElapsed / 1000).toFixed(1)}s - found ${foundNFTs.length} NFTs`,
      )
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error during NFT discovery:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch NFTs")
      }
    } finally {
      clearTimeout(timeoutId)
      setAbortController(null)
      setIsLoading(false)
      setProgress(null)
    }
  }

  const fetchNFTs = useCallback(async () => {
    if (!address) {
      setNfts([])
      return
    }

    // Cancel any ongoing operation
    if (abortController) {
      abortController.abort()
    }

    console.log("Starting NFT fetch for address:", address)
    console.log("Contract address:", CONTRACT_CONFIG.address)

    setIsLoading(true)
    setError(null)
    setProgress(null)
    setNfts([]) // Clear existing NFTs
    setDiscoveryMethod("")

    try {
      await discoverNFTs()
    } catch (error) {
      console.error("Error fetching NFTs:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch NFTs")
      setDiscoveryMethod("Error occurred during discovery")
    } finally {
      setIsLoading(false)
    }
  }, [address, balance, abortController])

  // Clean up abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort()
      }
    }
  }, [abortController])

  const refetch = useCallback(() => {
    console.log("Manual refetch triggered")
    refetchBalance()
    fetchNFTs()
  }, [fetchNFTs, refetchBalance])

  return {
    nfts,
    isLoading,
    error,
    progress,
    discoveryMethod,
    refetch,
    contractAddress: CONTRACT_CONFIG.address,
    balance: balance ? Number(balance) : 0,
  }
}

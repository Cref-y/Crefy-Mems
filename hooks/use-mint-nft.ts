/**
 * Custom hook for minting NFTs
 * Handles the minting transaction and state management
 */
"use client"

import { useState, useEffect } from "react"
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { CONTRACT_CONFIG } from "@/config/contract"

export function useMintNFT() {
  const [error, setError] = useState<Error | null>(null)

  const { writeContract, data: hash, isPending: isWritePending, error: writeError, reset } = useWriteContract()

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  })

  const isPending = isWritePending || isConfirming
  const isSuccess = isConfirmed && !!hash

  const mintNFT = async () => {
    try {
      setError(null)

      await writeContract({
        address: CONTRACT_CONFIG.address as `0x${string}`,
        abi: CONTRACT_CONFIG.abi,
        functionName: "mintFromContract",
      })

      // Don't set success here - wait for transaction confirmation
    } catch (err) {
      const error = err as Error
      setError(error)
      throw error
    }
  }

  // Handle confirmation errors
  useEffect(() => {
    if (confirmError) {
      setError(confirmError)
    }
  }, [confirmError])

  // Reset error when write error occurs
  useEffect(() => {
    if (writeError) {
      setError(writeError)
    }
  }, [writeError])

  return {
    mintNFT,
    isPending,
    isSuccess,
    error: error || writeError || confirmError,
    hash,
    reset,
  }
}

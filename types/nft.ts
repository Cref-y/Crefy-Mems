/**
 * TypeScript type definitions for NFT-related data structures
 */

export interface NFTInfo {
  currentBalance: number
  totalMinted: number
  remainingMints: number
}

export interface MintResult {
  success: boolean
  transactionHash?: string
  error?: string
}

export interface ContractConfig {
  address: string
  abi: readonly unknown[]
}

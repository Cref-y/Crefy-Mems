/**
 * Campaign System Type Definitions
 * Defines the core types for the multi-tenant campaign-based NFT platform
 */

import { Address } from "viem"

/**
 * Company - Represents an organization that can create and manage campaigns
 */
export interface Company {
  id: string
  name: string
  slug: string // Used for subdomain routing (e.g., "projectmocha" for projectmocha.crefy.com)
  description?: string
  logo?: string
  website?: string
  
  // Branding and customization
  branding: CompanyBranding
  
  // Admin/contact information
  adminAddress: Address // Wallet address of company admin
  contactEmail?: string
  
  // Settings and configuration
  settings: CompanySettings
  
  // For campaign card display on homepage
  campaignCount?: number
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

/**
 * Company branding options
 */
export interface CompanyBranding {
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  fontFamily?: string
  bannerImage?: string
  logoImage?: string
  customCSS?: string
}

/**
 * Company settings and configuration
 */
export interface CompanySettings {
  allowPublicCampaigns: boolean // Whether campaigns are publicly discoverable
  requireEmailVerification: boolean // Whether users need verified email to mint
  maxCampaignsAllowed: number // Maximum number of campaigns the company can create
  customDomain?: string // Optional custom domain (instead of subdomain)
  analyticsEnabled: boolean
  defaultMintLimit: number // Default mint limit per wallet for new campaigns
}

/**
 * Campaign Type - Enum of different campaign categories
 */
export enum CampaignType {
  UNIVERSITY_TOUR = "UNIVERSITY_TOUR",
  CRYPTO_CONFERENCE = "CRYPTO_CONFERENCE",
  ANNIVERSARY = "ANNIVERSARY",
  PRODUCT_LAUNCH = "PRODUCT_LAUNCH",
  COMMUNITY_REWARD = "COMMUNITY_REWARD",
  LOYALTY_PROGRAM = "LOYALTY_PROGRAM",
  LIMITED_EDITION = "LIMITED_EDITION",
  CUSTOM = "CUSTOM"
}

/**
 * Campaign Status - Current state of a campaign
 */
export enum CampaignStatus {
  DRAFT = "DRAFT", // Being created, not yet published
  SCHEDULED = "SCHEDULED", // Published but not yet active
  ACTIVE = "ACTIVE", // Currently running
  PAUSED = "PAUSED", // Temporarily paused
  COMPLETED = "COMPLETED", // Finished successfully
  CANCELLED = "CANCELLED" // Terminated before completion
}

/**
 * Campaign - Main entity representing an NFT campaign
 */
export interface Campaign {
  id: string
  companyId: string // Reference to the company that created this campaign
  companyName?: string // Added for display purposes on campaign cards
  
  // Basic information
  name: string
  slug: string // URL-friendly identifier
  description: string
  type: CampaignType
  status: CampaignStatus
  
  // Dates
  startDate: Date
  endDate?: Date // Optional, for open-ended campaigns
  
  // Contract details
  contractAddress: Address
  contractNetwork: string // e.g., "ethereum", "sepolia", etc.
  contractAbi: any // Contract ABI
  
  // NFT configuration
  nftConfig: NFTConfiguration
  
  // Access control
  accessControl: CampaignAccessControl
  
  // Metadata
  featuredImage?: string
  bannerImage?: string
  galleryImages?: string[]
  
  // Analytics and limits
  totalMinted: number
  mintLimit: number // Maximum NFTs that can be minted in this campaign
  mintLimitPerWallet: number // Maximum NFTs per wallet
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

/**
 * NFT Configuration - Defines the properties of NFTs in a campaign
 */
export interface NFTConfiguration {
  name: string
  symbol: string
  description: string
  
  // Base URI for token metadata
  baseUri?: string
  
  // Metadata configuration
  metadataFormat: "ERC721" | "ERC1155" | "CUSTOM"
  attributes: NFTAttribute[]
  
  // Media configuration
  image?: string
  animation?: string
  externalUrl?: string
  
  // Minting options
  revealType: "INSTANT" | "DELAYED"
  revealDate?: Date // For delayed reveals
  transferable: boolean // Whether the NFT can be transferred
  redeemable: boolean // Whether the NFT can be redeemed for something
}

/**
 * NFT Attribute - Defines a trait/property of an NFT
 */
export interface NFTAttribute {
  traitType: string
  value: string | number
  displayType?: "string" | "number" | "boost_percentage" | "boost_number" | "date"
}

/**
 * Campaign Access Control - Defines who can access/mint from a campaign
 */
export interface CampaignAccessControl {
  accessType: "PUBLIC" | "PRIVATE" | "ALLOWLIST"
  allowlist?: string[] // List of wallet addresses that can mint
  requiresEmail: boolean
  requiresCode: boolean // Whether a code is required to mint
  codes?: CampaignCode[] // List of valid codes
  maxUsesPerCode?: number // Maximum times a code can be used
}

/**
 * Campaign Code - Used for restricted access campaigns
 */
export interface CampaignCode {
  code: string
  uses: number // How many times it's been used
  maxUses: number // Maximum allowed uses
  isActive: boolean
}

/**
 * User Participation - Tracks a user's interaction with a campaign
 */
export interface UserParticipation {
  userId: string
  walletAddress: Address
  campaignId: string
  
  // Minting details
  mintedTokenIds: number[]
  mintedCount: number
  lastMintedAt?: Date
  
  // Verification
  email?: string
  emailVerified: boolean
  codeUsed?: string
  
  // Timestamps
  joinedAt: Date
  updatedAt: Date
}

/**
 * Campaign Analytics - Tracks performance metrics for a campaign
 */
export interface CampaignAnalytics {
  campaignId: string
  
  // Minting stats
  totalVisits: number
  uniqueVisitors: number
  totalMinted: number
  uniqueMinters: number
  
  // Time-based metrics
  dailyStats: DailyAnalytics[]
  
  // Referral tracking
  referralSources: ReferralSource[]
}

/**
 * Daily Analytics - Analytics for a specific day
 */
export interface DailyAnalytics {
  date: Date
  visits: number
  mints: number
  uniqueVisitors: number
  uniqueMinters: number
}

/**
 * Referral Source - Tracks where visitors came from
 */
export interface ReferralSource {
  source: string
  visits: number
  mints: number
  conversionRate: number
}

/**
 * Campaign Template - Predefined campaign configuration
 */
export interface CampaignTemplate {
  id: string
  name: string
  description: string
  type: CampaignType
  nftConfig: Partial<NFTConfiguration>
  accessControl: Partial<CampaignAccessControl>
  defaultDuration: number // In days
}

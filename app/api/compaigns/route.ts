/**
 * API Routes for Campaign Management
 * Handles CRUD operations for campaigns in the multi-tenant platform
 */
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { 
  Campaign, 
  CampaignType, 
  CampaignStatus, 
  NFTConfiguration,
  CampaignAccessControl,
  NFTAttribute,
  CampaignTemplate,
  Company // Added Company for checking limits
} from "@/types/campaign"
import { createId } from "@paralleldrive/cuid2"
import { getServerSession } from "next-auth/next"
// import { authOptions } from "@/lib/auth" // Assuming authOptions is set up
import { Session } from "next-auth"
import { isAddress } from "viem"

// Mock database for demonstration (replace with actual DB implementation)
let campaigns: Campaign[] = []
let companies: Company[] = [] // Ensure this is typed and can be populated for demo


// Placeholder for authOptions if not defined elsewhere
const authOptions = {} as any;

// Campaign template presets
const campaignTemplates: CampaignTemplate[] = [
  {
    id: "template-university-tour",
    name: "University Tour",
    description: "Commemorative NFTs for university tour events",
    type: CampaignType.UNIVERSITY_TOUR,
    nftConfig: {
      name: "University Tour NFT", // Default NFT name
      symbol: "UTOUR",
      description: "Commemorative NFT for attending our university tour",
      metadataFormat: "ERC721",
      attributes: [
        { traitType: "Event", value: "University Tour" },
        { traitType: "Year", value: new Date().getFullYear() }
      ],
      revealType: "INSTANT",
      transferable: true,
      redeemable: false
    },
    accessControl: {
      accessType: "PUBLIC",
      requiresEmail: true,
      requiresCode: false
    },
    defaultDuration: 30 // 30 days
  },
  {
    id: "template-crypto-conference",
    name: "Crypto Conference",
    description: "Attendance proof NFTs for crypto conferences",
    type: CampaignType.CRYPTO_CONFERENCE,
    nftConfig: {
      name: "Crypto Conference NFT", // Default NFT name
      symbol: "CONF",
      description: "Proof of attendance for our crypto conference",
      metadataFormat: "ERC721",
      attributes: [
        { traitType: "Event", value: "Crypto Conference" },
        { traitType: "Edition", value: "2025" } // Example, could be dynamic
      ],
      revealType: "INSTANT",
      transferable: true,
      redeemable: true
    },
    accessControl: {
      accessType: "ALLOWLIST",
      requiresEmail: true,
      requiresCode: true
    },
    defaultDuration: 7 // 7 days
  },
  {
    id: "template-anniversary",
    name: "Anniversary Celebration",
    description: "Commemorative NFTs for company anniversaries",
    type: CampaignType.ANNIVERSARY,
    nftConfig: {
      name: "Anniversary Collection NFT", // Default NFT name
      symbol: "ANNIV",
      description: "Commemorative NFT for our company anniversary",
      metadataFormat: "ERC721",
      attributes: [
        { traitType: "Event", value: "Anniversary" },
        { traitType: "Year", value: new Date().getFullYear() }
      ],
      revealType: "DELAYED", // Example of a different reveal type
      revealDate: new Date(new Date().setDate(new Date().getDate() + 7)), // Example reveal date
      transferable: true,
      redeemable: false
    },
    accessControl: {
      accessType: "PUBLIC",
      requiresEmail: false,
      requiresCode: false
    },
    defaultDuration: 14 // 14 days
  },
  {
    id: "template-product-launch",
    name: "Product Launch",
    description: "NFTs for product launch events",
    type: CampaignType.PRODUCT_LAUNCH,
    nftConfig: {
      name: "Product Launch NFT", // Default NFT name
      symbol: "LAUNCH",
      description: "Early adopter NFT for our product launch",
      metadataFormat: "ERC721",
      attributes: [
        { traitType: "Product", value: "New Product" }, // Placeholder
        { traitType: "Launch Date", value: new Date().toISOString().split('T')[0] }
      ],
      revealType: "INSTANT",
      transferable: true,
      redeemable: true
    },
    accessControl: {
      accessType: "PRIVATE", // Example of private access
      requiresEmail: true,
      requiresCode: true
    },
    defaultDuration: 30 // 30 days
  }
]

// NFT Attribute validation schema
const nftAttributeSchema = z.object({
  traitType: z.string().min(1, "Trait type cannot be empty").max(50, "Trait type too long"),
  value: z.union([z.string().min(1, "Attribute value cannot be empty"), z.number()]),
  displayType: z.enum(["string", "number", "boost_percentage", "boost_number", "date"]).optional()
})

// NFT Configuration validation schema
const nftConfigurationSchema = z.object({
  name: z.string().min(1, "NFT name cannot be empty").max(100, "NFT name too long"),
  symbol: z.string().min(1, "NFT symbol cannot be empty").max(10, "NFT symbol too long"),
  description: z.string().min(1, "NFT description cannot be empty").max(1000, "NFT description too long"),
  baseUri: z.string().url("Invalid base URI").optional().or(z.literal('')),
  metadataFormat: z.enum(["ERC721", "ERC1155", "CUSTOM"]),
  attributes: z.array(nftAttributeSchema).optional().default([]),
  image: z.string().url("Invalid image URL").optional().or(z.literal('')),
  animation: z.string().url("Invalid animation URL").optional().or(z.literal('')),
  externalUrl: z.string().url("Invalid external URL").optional().or(z.literal('')),
  revealType: z.enum(["INSTANT", "DELAYED"]),
  revealDate: z.preprocess((arg) => {
    if (typeof arg === "string" || typeof arg === "number") return new Date(arg);
    return arg;
  }, z.date().optional()),
  transferable: z.boolean().default(true),
  redeemable: z.boolean().default(false)
}).refine(data => !(data.revealType === "DELAYED" && !data.revealDate), {
  message: "Reveal date is required for delayed reveal type",
  path: ["revealDate"],
})


// Campaign access control validation schema
const campaignCodeSchema = z.object({
  code: z.string().min(4, "Code must be at least 4 characters").max(20, "Code too long"),
  uses: z.number().int().default(0),
  maxUses: z.number().int().positive("Max uses must be a positive number"),
  isActive: z.boolean().default(true)
})

const campaignAccessControlSchema = z.object({
  accessType: z.enum(["PUBLIC", "PRIVATE", "ALLOWLIST"]),
  allowlist: z.array(z.string().refine(val => isAddress(val), { message: "Invalid Ethereum address in allowlist" })).optional(),
  requiresEmail: z.boolean().default(false),
  requiresCode: z.boolean().default(false),
  codes: z.array(campaignCodeSchema).optional(),
  maxUsesPerCode: z.number().int().positive("Max uses per code must be positive").optional()
})

// Campaign creation validation schema
const createCampaignSchema = z.object({
  companyId: z.string().min(1, "Company ID is required"),
  name: z.string().min(2, "Campaign name too short").max(100, "Campaign name too long"),
  slug: z.string().min(2, "Slug too short").max(50, "Slug too long").regex(/^[a-z0-9-]+$/, "Invalid slug format").optional(),
  description: z.string().min(1, "Description is required").max(1000, "Description too long"),
  type: z.nativeEnum(CampaignType, { errorMap: () => ({ message: "Invalid campaign type" }) }),
  status: z.nativeEnum(CampaignStatus, { errorMap: () => ({ message: "Invalid campaign status" }) }).default(CampaignStatus.DRAFT),
  startDate: z.preprocess((arg) => {
    if (typeof arg === "string" || typeof arg === "number") return new Date(arg);
    return arg;
  }, z.date({ errorMap: () => ({ message: "Invalid start date" }) })),
  endDate: z.preprocess((arg) => {
    if (typeof arg === "string" || typeof arg === "number") return new Date(arg);
    return arg;
  }, z.date({ errorMap: () => ({ message: "Invalid end date" }) }).optional()),
  contractAddress: z.string().refine(val => isAddress(val), {
    message: "Invalid Ethereum contract address"
  }),
  contractNetwork: z.string().min(1, "Contract network is required"),
  contractAbi: z.any(), // Consider more specific validation if ABI structure is known
  nftConfig: nftConfigurationSchema,
  accessControl: campaignAccessControlSchema,
  featuredImage: z.string().url("Invalid featured image URL").optional().or(z.literal('')),
  bannerImage: z.string().url("Invalid banner image URL").optional().or(z.literal('')),
  galleryImages: z.array(z.string().url("Invalid gallery image URL")).optional(),
  mintLimit: z.number().int().positive("Mint limit must be a positive integer"),
  mintLimitPerWallet: z.number().int().positive("Mint limit per wallet must be a positive integer"),
  templateId: z.string().optional() // Optional template ID to use as a base
}).refine(data => !data.endDate || data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
})


/**
 * Generate a URL-friendly slug from a campaign name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove non-alphanumeric characters except hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

/**
 * Check if a campaign slug is unique within a company
 */
async function isSlugUnique(companyId: string, slug: string): Promise<boolean> {
  // In a real implementation, this would query the database
  return !campaigns.some(campaign => 
    campaign.companyId === companyId && campaign.slug === slug
  )
}

/**
 * Find a company by ID
 */
async function findCompanyById(companyId: string): Promise<Company | undefined> {
  // In a real implementation, this would query the database
  return companies.find(company => company.id === companyId)
}

/**
 * Check if user has permission to manage campaigns for a company
 */
async function hasCompanyCampaignPermission(session: any, companyId: string): Promise<boolean> {
  if (!session || !session.user) return false
  
  // Admin has access to all companies
  if (session.user.role === 'admin') return true
  
  // Find the company
  const company = await findCompanyById(companyId)
  if (!company || !company.adminAddress) return false
  
  // Company admin has access to their company
  if (session.user.walletAddress && 
      session.user.walletAddress.toLowerCase() === company.adminAddress.toLowerCase()) {
    return true
  }
  
  return false
}

/**
 * Apply template to campaign data
 */
function applyTemplate(templateId: string, campaignData: any): any {
  const template = campaignTemplates.find(t => t.id === templateId)
  if (!template) return campaignData
  
  const mergedNftConfig = {
    ...template.nftConfig,
    ...campaignData.nftConfig, // User's overrides take precedence
    attributes: [ // Merge attributes, user's can override template's by traitType
      ...(template.nftConfig.attributes || []).filter(
        attr => !(campaignData.nftConfig.attributes || []).find((userAttr: NFTAttribute) => userAttr.traitType === attr.traitType)
      ),
      ...(campaignData.nftConfig.attributes || [])
    ]
  } as NFTConfiguration; // Assert type after merging

  const mergedAccessControl = {
    ...template.accessControl,
    ...campaignData.accessControl // User's overrides take precedence
  } as CampaignAccessControl; // Assert type after merging

  return {
    ...campaignData, // Start with user data
    type: template.type, // Template dictates type
    nftConfig: mergedNftConfig,
    accessControl: mergedAccessControl,
    // If template has default duration and user doesn't specify endDate
    ...(template.defaultDuration && !campaignData.endDate && campaignData.startDate && {
        endDate: new Date(new Date(campaignData.startDate).setDate(new Date(campaignData.startDate).getDate() + template.defaultDuration))
    })
  }
}

/**
 * GET handler - List campaigns with filtering and pagination
 * Also handles GET /api/campaigns/templates
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  if (url.pathname.endsWith('/templates')) {
    return GET_templates(request)
  }

  try {
    // Get query parameters for pagination and filtering
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const companyId = searchParams.get('companyId')
    const type = searchParams.get('type') as CampaignType | null // Cast to allow enum comparison
    const status = searchParams.get('status') as CampaignStatus | null // Cast
    const search = searchParams.get('search') || ''
    // Get session for authentication check
    const session = await getServerSession(authOptions) as Session | null
    
    // Filter campaigns based on query parameters
    let filteredCampaigns = campaigns
    
    // Filter by company ID if provided
    if (companyId) {
      const company = await findCompanyById(companyId); // Fetch company details
      const hasPermission = await hasCompanyCampaignPermission(session, companyId)
      
      if (!hasPermission && company && !company.settings.allowPublicCampaigns) {
         // If no permission and company doesn't allow public campaigns, return empty or error
         filteredCampaigns = []
      } else if (!hasPermission) {
        // For unauthorized users, only show public, active campaigns of this company
        filteredCampaigns = campaigns.filter(campaign => 
          campaign.companyId === companyId && 
          campaign.status === CampaignStatus.ACTIVE &&
          campaign.accessControl.accessType === 'PUBLIC'
        )
      } else {
        // For authorized users, show all campaigns for the company
        filteredCampaigns = campaigns.filter(campaign => 
          campaign.companyId === companyId
        )
      }
    } else {
      // If no company ID provided, check if admin
      // if (!session || !session.user || session.user.role !== 'admin') { // Placeholder for real auth
      if (!session || !session.user) { // Mock: if no session, assume public
        // Non-admins can only see public, active campaigns from all companies
        filteredCampaigns = campaigns.filter(campaign => {
            const campCompany = companies.find(c => c.id === campaign.companyId);
            return campCompany && campCompany.settings.allowPublicCampaigns &&
                   campaign.status === CampaignStatus.ACTIVE &&
                   campaign.accessControl.accessType === 'PUBLIC';
        });
      }
      // Admins can see all campaigns (no additional filtering here if admin)
    }
    
    // Filter by campaign type if provided
    if (type && Object.values(CampaignType).includes(type)) {
      filteredCampaigns = filteredCampaigns.filter(campaign => 
        campaign.type === type
      )
    }
    
    // Filter by campaign status if provided
    if (status && Object.values(CampaignStatus).includes(status)) {
      filteredCampaigns = filteredCampaigns.filter(campaign => 
        campaign.status === status
      )
    }
    
    // Filter by search term if provided
    if (search) {
      const lowerSearch = search.toLowerCase()
      filteredCampaigns = filteredCampaigns.filter(campaign => 
        campaign.name.toLowerCase().includes(lowerSearch) ||
        campaign.description.toLowerCase().includes(lowerSearch)
      )
    }
    
    // Calculate pagination
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex)
    
    // Prepare response with pagination metadata
    const response = {
      campaigns: paginatedCampaigns.map(c => {
          const campCompany = companies.find(co => co.id === c.companyId);
          return {...c, companyName: campCompany?.name || "Unknown Company"};
      }),
      pagination: {
        total: filteredCampaigns.length,
        page,
        limit,
        totalPages: Math.ceil(filteredCampaigns.length / limit)
      }
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error listing campaigns:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error while listing campaigns' },
      { status: 500 }
    )
  }
}

/**
 * POST handler - Create a new campaign
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Check authentication - Placeholder
    const session = await getServerSession(authOptions)
    // if (!session || !session.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }
    
    // Apply template if provided
    let campaignData = body
    if (body.templateId) {
      campaignData = applyTemplate(body.templateId, body)
    }
    
    // Validate input data
    const validationResult = createCampaignSchema.safeParse(campaignData)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid campaign data', details: validationResult.error.format() },
        { status: 400 }
      )
    }
    
    const validatedData = validationResult.data
    
    // Check if user has permission to create campaigns for this company - Placeholder
    // const hasPermission = await hasCompanyCampaignPermission(session, validatedData.companyId)
    // if (!hasPermission) {
    //   return NextResponse.json({ error: 'Unauthorized to create campaigns for this company' }, { status: 403 })
    // }
    
    // Check if company exists
    const company = await findCompanyById(validatedData.companyId)
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }
    
    // Generate slug if not provided
    let slugToUse = validatedData.slug
    if (!slugToUse) {
      slugToUse = generateSlug(validatedData.name)
    }
    
    // Check slug uniqueness within the company
    const isUnique = await isSlugUnique(validatedData.companyId, slugToUse)
    if (!isUnique) {
      return NextResponse.json(
        { error: 'Campaign slug already exists for this company' },
        { status: 409 }
      )
    }
    
    // Check campaign limits for the company
    const companyCampaigns = campaigns.filter(c => c.companyId === validatedData.companyId)
    if (companyCampaigns.length >= company.settings.maxCampaignsAllowed) {
      return NextResponse.json(
        { error: `Maximum number of campaigns (${company.settings.maxCampaignsAllowed}) reached for this company` },
        { status: 403 }
      )
    }
    
    // Create new campaign
    const newCampaign: Campaign = {
      id: createId(),
      companyId: validatedData.companyId,
      name: validatedData.name,
      slug: slugToUse, // Use the determined slug
      description: validatedData.description,
      type: validatedData.type,
      status: validatedData.status,
      startDate: validatedData.startDate,
      endDate: validatedData.endDate,
      contractAddress: validatedData.contractAddress as `0x${string}`,
      contractNetwork: validatedData.contractNetwork,
      contractAbi: validatedData.contractAbi,
      nftConfig: validatedData.nftConfig as NFTConfiguration,
      accessControl: validatedData.accessControl as CampaignAccessControl,
      featuredImage: validatedData.featuredImage,
      bannerImage: validatedData.bannerImage,
      galleryImages: validatedData.galleryImages,
      totalMinted: 0,
      mintLimit: validatedData.mintLimit,
      mintLimitPerWallet: validatedData.mintLimitPerWallet,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // Save to database (mock implementation)
    campaigns.push(newCampaign)
    
    // Return the created campaign
    return NextResponse.json(newCampaign, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error while creating campaign' },
      { status: 500 }
    )
  }
}

/**
 * GET_templates handler - List available campaign templates
 * This is called internally by the main GET handler if path ends with /templates
 */
async function GET_templates(request: NextRequest) {
  try {
    // Basic auth check - Placeholder
    // const session = await getServerSession(authOptions)
    // if (!session || !session.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }
    
    // Return all available templates
    return NextResponse.json({
      templates: campaignTemplates
    })
  } catch (error) {
    console.error('Error listing campaign templates:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error while listing templates' },
      { status: 500 }
    )
  }
}

// Handler for individual campaign operations (GET by ID, PUT, DELETE)
// These would typically be in /api/campaigns/[campaignId]/route.ts

export async function GET_campaignById(request: NextRequest, { params }: { params: { campaignId: string }}) {
    // Mock: find campaign by ID
    const campaign = campaigns.find(c => c.id === params.campaignId);
    if (!campaign) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    const company = companies.find(co => co.id === campaign.companyId);
    return NextResponse.json({...campaign, companyName: company?.name || "Unknown Company"});
}

export async function PUT_campaignById(request: NextRequest, { params }: { params: { campaignId: string }}) {
    // Mock: update campaign by ID
    // Add validation and permission checks similar to POST
    const index = campaigns.findIndex(c => c.id === params.campaignId);
    if (index === -1) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    // const body = await request.json();
    // campaigns[index] = { ...campaigns[index], ...body, updatedAt: new Date() }; // Simplified update
    return NextResponse.json(campaigns[index]);
}

export async function DELETE_campaignById(request: NextRequest, { params }: { params: { campaignId: string }}) {
    // Mock: delete campaign by ID
    // Add permission checks
    const initialLength = campaigns.length;
    campaigns = campaigns.filter(c => c.id !== params.campaignId);
    if (campaigns.length === initialLength) {
        return NextResponse.json({ error: "Campaign not found or could not be deleted" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Campaign deleted" });
}

// Note: For a real Next.js app router setup, you'd have separate files for dynamic routes.
// e.g. app/api/campaigns/[campaignId]/route.ts would handle GET, PUT, DELETE for a specific campaign.
// The GET_campaignById, PUT_campaignById, DELETE_campaignById are illustrative here for a single-file context.

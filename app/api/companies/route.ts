/**
 * API Routes for Company Management
 * Handles CRUD operations for companies in the multi-tenant platform
 */
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { Company, CompanyBranding, CompanySettings } from "@/types/campaign"
import { createId } from "@paralleldrive/cuid2"
import { getServerSession } from "next-auth/next"
// import { authOptions } from "@/lib/auth" // Assuming authOptions is set up

// Mock database for demonstration (replace with actual DB implementation)
let companies: Company[] = []

// Placeholder for authOptions if not defined elsewhere
const authOptions = {} as any;


// Company validation schema
const companyBrandingSchema = z.object({
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  fontFamily: z.string().optional(),
  bannerImage: z.string().url().optional(),
  logoImage: z.string().url().optional(),
  customCSS: z.string().optional(),
})

const companySettingsSchema = z.object({
  allowPublicCampaigns: z.boolean().default(true),
  requireEmailVerification: z.boolean().default(false),
  maxCampaignsAllowed: z.number().int().positive().default(10),
  customDomain: z.string().optional(),
  analyticsEnabled: z.boolean().default(true),
  defaultMintLimit: z.number().int().positive().default(5),
})

const createCompanySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional(),
  logo: z.string().url().optional(),
  website: z.string().url().optional(),
  branding: companyBrandingSchema.optional().default({}),
  adminAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  contactEmail: z.string().email().optional(),
  settings: companySettingsSchema.optional().default({}),
})

/**
 * Generate a URL-friendly slug from a company name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Check if a slug is unique
 */
async function isSlugUnique(slug: string): Promise<boolean> {
  // In a real implementation, this would query the database
  return !companies.some(company => company.slug === slug)
}

/**
 * GET handler - List companies with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters for pagination and filtering
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    
    // Check authentication (admin only) - Placeholder
    const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }
    
    // Filter companies by search term
    let filteredCompanies = companies
    if (search) {
      filteredCompanies = companies.filter(company => 
        company.name.toLowerCase().includes(search.toLowerCase()) ||
        (company.description && company.description.toLowerCase().includes(search.toLowerCase()))
      )
    }
    
    // Calculate pagination
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex)
    
    // Prepare response with pagination metadata
    const response = {
      companies: paginatedCompanies,
      pagination: {
        total: filteredCompanies.length,
        page,
        limit,
        totalPages: Math.ceil(filteredCompanies.length / limit)
      }
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error listing companies:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * POST handler - Create a new company
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Check authentication (admin only) - Placeholder
    const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }
    
    // Validate input data
    const validationResult = createCompanySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid company data', details: validationResult.error.format() },
        { status: 400 }
      )
    }
    
    const companyData = validationResult.data
    
    // Generate slug if not provided
    let slugToUse = companyData.slug
    if (!slugToUse) {
      slugToUse = generateSlug(companyData.name)
    }
    
    // Check slug uniqueness
    const isUnique = await isSlugUnique(slugToUse)
    if (!isUnique) {
      return NextResponse.json(
        { error: 'Company slug already exists' },
        { status: 409 }
      )
    }
    
    // Create new company with defaults
    const newCompany: Company = {
      id: createId(),
      name: companyData.name,
      slug: slugToUse,
      description: companyData.description || '',
      logo: companyData.logo,
      website: companyData.website,
      branding: companyData.branding as CompanyBranding, // Already defaulted by Zod
      adminAddress: companyData.adminAddress as `0x${string}`,
      contactEmail: companyData.contactEmail,
      settings: companyData.settings as CompanySettings, // Already defaulted by Zod
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // Save to database (mock implementation)
    companies.push(newCompany)
    
    // Return the created company
    return NextResponse.json(newCompany, { status: 201 })
  } catch (error) {
    console.error('Error creating company:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

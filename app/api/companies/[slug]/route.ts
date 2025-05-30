/**
 * API Routes for Individual Company Management
 * Handles operations for a specific company identified by slug
 */
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { Company, CompanyBranding, CompanySettings, Campaign, CampaignStatus } from "@/types/campaign" // Added CampaignStatus
import { getServerSession } from "next-auth/next"
// import { authOptions } from "@/lib/auth" // Assuming authOptions is set up

// Mock database for demonstration (replace with actual DB implementation)
// This would be imported from a database service in a real implementation
let companies: Company[] = [] // This should be populated or connected to a DB
let campaigns: Campaign[] = [] // This should be populated or connected to a DB


// Placeholder for authOptions if not defined elsewhere
const authOptions = {} as any;

// Company update validation schema
const updateCompanyBrandingSchema = z.object({
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: "Invalid primary color hex code" }).optional(),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: "Invalid secondary color hex code" }).optional(),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: "Invalid accent color hex code" }).optional(),
  fontFamily: z.string().optional(),
  bannerImage: z.string().url({ message: "Invalid banner image URL" }).optional(),
  logoImage: z.string().url({ message: "Invalid logo image URL" }).optional(),
  customCSS: z.string().optional(),
})

const updateCompanySettingsSchema = z.object({
  allowPublicCampaigns: z.boolean().optional(),
  requireEmailVerification: z.boolean().optional(),
  maxCampaignsAllowed: z.number().int().positive({ message: "Max campaigns must be a positive integer" }).optional(),
  customDomain: z.string().optional(), // Add validation if specific format is needed
  analyticsEnabled: z.boolean().optional(),
  defaultMintLimit: z.number().int().positive({ message: "Default mint limit must be a positive integer" }).optional(),
})

const updateCompanySchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).max(100, { message: "Name cannot exceed 100 characters" }).optional(),
  description: z.string().max(500, { message: "Description cannot exceed 500 characters" }).optional(),
  logo: z.string().url({ message: "Invalid logo URL" }).optional(),
  website: z.string().url({ message: "Invalid website URL" }).optional(),
  branding: updateCompanyBrandingSchema.optional(),
  contactEmail: z.string().email({ message: "Invalid contact email address" }).optional(),
  settings: updateCompanySettingsSchema.optional(),
})

/**
 * Find a company by slug
 */
async function findCompanyBySlug(slug: string): Promise<Company | undefined> {
  // In a real implementation, this would query the database
  return companies.find(company => company.slug === slug)
}

/**
 * Get campaigns for a company
 */
async function getCompanyCampaigns(companyId: string): Promise<Campaign[]> {
  // In a real implementation, this would query the database
  return campaigns.filter(campaign => campaign.companyId === companyId)
}

/**
 * Check if user has permission to manage a company
 */
async function hasCompanyPermission(session: any, company: Company): Promise<boolean> {
  if (!session || !session.user) return false // Ensure session.user exists
  
  // Admin has access to all companies
  if (session.user.role === 'admin') return true
  
  // Company admin has access to their company
  if (session.user.walletAddress && 
      company.adminAddress && // Ensure company.adminAddress exists
      session.user.walletAddress.toLowerCase() === company.adminAddress.toLowerCase()) {
    return true
  }
  
  return false
}

/**
 * GET handler - Retrieve company by slug with basic campaign information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    
    // Find company by slug
    const company = await findCompanyBySlug(slug)
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }
    
    // Get session for authentication check
    const session = await getServerSession(authOptions) as any
    
    // Check if this is a public request or from an authorized user
    const isAuthorized = await hasCompanyPermission(session, company)
    
    // For public requests, only return public information
    if (!isAuthorized) {
      // Check if company allows public access
      if (!company.settings.allowPublicCampaigns) {
        return NextResponse.json({ error: 'Company not publicly accessible' }, { status: 403 })
      }
      
      // Return limited public information
      const publicCompany = {
        id: company.id,
        name: company.name,
        slug: company.slug,
        description: company.description,
        logo: company.logo,
        website: company.website,
        branding: { // Only return safe branding elements
          primaryColor: company.branding.primaryColor,
          secondaryColor: company.branding.secondaryColor,
          bannerImage: company.branding.bannerImage,
          logoImage: company.branding.logoImage,
        }
      }
      
      // Get active public campaigns
      const allCampaigns = await getCompanyCampaigns(company.id)
      const publicCampaigns = allCampaigns
        .filter(campaign => campaign.status === CampaignStatus.ACTIVE && 
                           campaign.accessControl.accessType === 'PUBLIC')
        .map(campaign => ({ // Map to a public campaign view
          id: campaign.id,
          name: campaign.name,
          slug: campaign.slug,
          description: campaign.description,
          type: campaign.type,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          featuredImage: campaign.featuredImage,
          totalMinted: campaign.totalMinted,
          mintLimit: campaign.mintLimit,
          companyId: campaign.companyId, // Keep companyId for linking
          companyName: company.name // Add company name for display
        }))
      
      return NextResponse.json({
        company: publicCompany,
        campaigns: publicCampaigns
      })
    }
    
    // For authorized users, return full company details with all campaigns
    const allCompanyCampaigns = await getCompanyCampaigns(company.id)
    
    return NextResponse.json({
      company,
      campaigns: allCompanyCampaigns.map(c => ({...c, companyName: company.name})) // Add companyName
    })
  } catch (error) {
    console.error('Error retrieving company:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * PUT handler - Update company details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    
    // Find company by slug
    const company = await findCompanyBySlug(slug)
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }
    
    // Check authentication and authorization
    const session = await getServerSession(authOptions)
    const isAuthorized = await hasCompanyPermission(session, company)
    
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateCompanySchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid company data', details: validationResult.error.format() },
        { status: 400 }
      )
    }
    
    const updateData = validationResult.data
    
    // Update company (in a real implementation, this would update the database)
    const updatedCompany: Company = {
      ...company,
      name: updateData.name ?? company.name,
      description: updateData.description ?? company.description,
      logo: updateData.logo ?? company.logo,
      website: updateData.website ?? company.website,
      branding: {
        ...company.branding,
        ...(updateData.branding as CompanyBranding) // Cast to ensure type compatibility
      },
      contactEmail: updateData.contactEmail ?? company.contactEmail,
      settings: {
        ...company.settings,
        ...(updateData.settings as CompanySettings) // Cast to ensure type compatibility
      },
      updatedAt: new Date()
    }
    
    // Save updated company (mock implementation)
    const companyIndex = companies.findIndex(c => c.id === company.id)
    if (companyIndex !== -1) {
      companies[companyIndex] = updatedCompany
    } else {
      // This case should ideally not happen if findCompanyBySlug worked
      return NextResponse.json({ error: 'Failed to update company in mock DB' }, { status: 500 })
    }
    
    return NextResponse.json(updatedCompany)
  } catch (error) {
    console.error('Error updating company:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE handler - Delete a company
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    
    // Find company by slug
    const company = await findCompanyBySlug(slug)
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }
    
    // Check authentication (admin only) - Placeholder for real auth
    const session = await getServerSession(authOptions) as any
    // if (!session || !session.user || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    // }
    // For mock, allow deletion if a session exists (simulating admin)
    if (!session || !session.user) {
         return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    
    // Delete company (in a real implementation, this would update the database)
    const initialLength = companies.length
    companies = companies.filter(c => c.id !== company.id)
    
    if (companies.length === initialLength) {
        // This case should ideally not happen if findCompanyBySlug worked
        return NextResponse.json({ error: 'Failed to delete company from mock DB' }, { status: 500 })
    }
    
    // Also delete all associated campaigns
    campaigns = campaigns.filter(c => c.companyId !== company.id)
    
    return NextResponse.json({ success: true, message: 'Company deleted successfully' })
  } catch (error) {
    console.error('Error deleting company:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

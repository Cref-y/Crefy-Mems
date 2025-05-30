/**
 * Dynamic Company Page
 * Displays company information and campaigns with minting capabilities
 */
"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { useAccount } from "wagmi"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { AppNavigation } from "@/components/app-navigation" // Assuming this is in components/app-navigation.tsx
import { WalletConnection } from "@/components/wallet-connection" // Assuming this is in components/wallet-connection.tsx
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { 
  Sparkles, 
  Search, 
  Calendar, 
  Users, 
  Filter, 
  Tag, 
  ArrowRight, 
  Wallet,
  Info,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  Clock,
  Building2,
  Globe
} from "lucide-react"
import { CampaignType, CampaignStatus, Campaign, Company } from "@/types/campaign" // Assuming this is in types/campaign.ts
import { cn } from "@/lib/utils" // Assuming this is in lib/utils.ts
import Link from "next/link" // For navigation

// Campaign type options with icons and colors
const campaignTypeOptions = [
  { 
    value: CampaignType.UNIVERSITY_TOUR, 
    label: "University Tour", 
    icon: <Users className="h-4 w-4" />,
    color: "bg-blue-500"
  },
  { 
    value: CampaignType.CRYPTO_CONFERENCE, 
    label: "Crypto Conference", 
    icon: <Sparkles className="h-4 w-4" />,
    color: "bg-purple-500"
  },
  { 
    value: CampaignType.ANNIVERSARY, 
    label: "Anniversary", 
    icon: <Calendar className="h-4 w-4" />,
    color: "bg-green-500"
  },
  { 
    value: CampaignType.PRODUCT_LAUNCH, 
    label: "Product Launch", 
    icon: <Tag className="h-4 w-4" />,
    color: "bg-orange-500"
  },
  { 
    value: CampaignType.COMMUNITY_REWARD, 
    label: "Community Reward", 
    icon: <Users className="h-4 w-4" />,
    color: "bg-teal-500"
  },
  { 
    value: CampaignType.LOYALTY_PROGRAM, 
    label: "Loyalty Program", 
    icon: <Users className="h-4 w-4" />,
    color: "bg-indigo-500"
  },
  { 
    value: CampaignType.LIMITED_EDITION, 
    label: "Limited Edition", 
    icon: <Sparkles className="h-4 w-4" />,
    color: "bg-pink-500"
  },
  { 
    value: CampaignType.CUSTOM, 
    label: "Custom", 
    icon: <Tag className="h-4 w-4" />,
    color: "bg-gray-500"
  }
]

// Format date for display
function formatDate(date: Date | string | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Calculate days remaining for a campaign
function getDaysRemaining(endDate: Date | string | undefined): number | null {
  if (!endDate) return null
  
  const end = new Date(endDate)
  const now = new Date()
  const diffTime = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays > 0 ? diffDays : 0
}

// Campaign card component (redefined here for completeness of this file)
function CampaignCard({ campaign, companySlug }: { campaign: Campaign, companySlug: string | string[] | undefined }) {
  const { isConnected } = useAccount()
  const [isHovered, setIsHovered] = useState(false)
  const daysRemaining = getDaysRemaining(campaign.endDate)
  
  const typeDetails = campaignTypeOptions.find(type => type.value === campaign.type) || campaignTypeOptions.find(t => t.value === CampaignType.CUSTOM)!;
  
  const mintingProgress = campaign.mintLimit > 0 
    ? Math.min(Math.round((campaign.totalMinted / campaign.mintLimit) * 100), 100)
    : 0;
  
  return (
    <Card 
      className={cn(
        "overflow-hidden border-0 card-shadow hover-lift transition-all duration-300 h-full flex flex-col",
        isHovered ? "transform scale-[1.02]" : ""
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 overflow-hidden">
        {campaign.featuredImage ? (
          <img 
            src={campaign.featuredImage} 
            alt={campaign.name}
            className="w-full h-full object-cover transition-transform duration-500"
            style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
            <Sparkles className="h-12 w-12 text-primary/50" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge 
            className={cn(
              "py-1.5 px-2.5 flex items-center gap-1.5",
              "bg-background/80 backdrop-blur-sm border-0"
            )}
          >
            <span className={cn("w-2 h-2 rounded-full", typeDetails.color)} />
            {typeDetails.label}
          </Badge>
        </div>
        {daysRemaining !== null && campaign.status === CampaignStatus.ACTIVE && (
          <div className="absolute top-3 right-3">
            <Badge 
              variant="outline" 
              className="py-1 px-2 bg-background/80 backdrop-blur-sm border-0 flex items-center gap-1.5"
            >
              <Clock className="h-3 w-3" />
              {daysRemaining} days left
            </Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{campaign.name}</CardTitle>
        <CardDescription className="line-clamp-2 h-[3em]"> {/* Fixed height for description */}
          {campaign.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Minting Progress</span>
              <span className="font-medium">{campaign.totalMinted} / {campaign.mintLimit}</span>
            </div>
            <Progress value={mintingProgress} className="h-1.5" />
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1.5" />
            <span>
              {formatDate(campaign.startDate)}
              {campaign.endDate && ` - ${formatDate(campaign.endDate)}`}
            </span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Wallet className="h-4 w-4 mr-1.5" />
            <span>Limit: {campaign.mintLimitPerWallet} per wallet</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-4"> {/* Added pt-4 for spacing */}
        <Button 
          className={cn(
            "w-full bg-gradient-primary hover:opacity-90 transition-opacity"
          )}
          asChild
        >
          <Link href={`/company/${companySlug}/campaign/${campaign.slug}`}>
            {campaign.status === CampaignStatus.COMPLETED || campaign.totalMinted >= campaign.mintLimit 
              ? "View Details" 
              : "Mint NFT"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

// Main company page component
export default function CompanyPage() {
  const params = useParams(); // Use useParams hook
  const slug = params?.slug; // Extract slug
  const searchParamsHook = useSearchParams(); // Use useSearchParams hook
  const { isConnected } = useAccount()
  
  const [company, setCompany] = useState<Company | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = useState(searchParamsHook.get('q') || "")
  const [selectedType, setSelectedType] = useState<string>(searchParamsHook.get('type') || "all")
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParamsHook.get('status') || "active")
  
  useEffect(() => {
    async function fetchCompanyData() {
      if (!slug) {
        setIsLoading(false);
        setError("Company slug not found in URL.");
        return;
      }
      
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/companies/${slug}`)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch company data: ${response.statusText}`)
        }
        
        const data = await response.json()
        setCompany(data.company)
        setCampaigns(data.campaigns || []) // Ensure campaigns is always an array
        setFilteredCampaigns(data.campaigns || []) // Initialize filtered campaigns
      } catch (err) {
        console.error("Error fetching company data:", err)
        setError(err instanceof Error ? err.message : "Failed to load company data")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCompanyData()
  }, [slug])
  
  useEffect(() => {
    if (!campaigns) return;

    let tempFiltered = [...campaigns]
    
    if (selectedStatus !== "all") {
      tempFiltered = tempFiltered.filter(campaign => campaign.status === selectedStatus)
    }
    
    if (selectedType !== "all") {
      tempFiltered = tempFiltered.filter(campaign => campaign.type === selectedType)
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      tempFiltered = tempFiltered.filter(campaign => 
        campaign.name.toLowerCase().includes(query) ||
        campaign.description.toLowerCase().includes(query)
      )
    }
    
    setFilteredCampaigns(tempFiltered)
  }, [campaigns, selectedType, selectedStatus, searchQuery])
  
  const companyStyles = company?.branding ? {
    "--primary-company": company.branding.primaryColor || "hsl(var(--primary))",
    "--secondary-company": company.branding.secondaryColor || "hsl(var(--secondary))",
    "--accent-company": company.branding.accentColor || "hsl(var(--accent))",
    // Potentially add font family if a mechanism to load/apply it exists
  } as React.CSSProperties : {}
  
  const noCampaignsFound = filteredCampaigns.length === 0 && !isLoading && campaigns.length > 0;
  const noInitialCampaigns = campaigns.length === 0 && !isLoading;

  return (
    <div className="relative min-h-screen" style={companyStyles}>
      <style jsx global>{`
        :root {
          ${company?.branding?.primaryColor ? `--primary: ${company.branding.primaryColor};` : ''}
          ${company?.branding?.secondaryColor ? `--secondary: ${company.branding.secondaryColor};` : ''}
          ${company?.branding?.accentColor ? `--accent: ${company.branding.accentColor};` : ''}
        }
      `}</style>
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-[var(--primary-company,var(--primary))]/20 blur-[120px] animate-pulse-subtle" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-[var(--accent-company,var(--accent))]/20 blur-[120px] animate-pulse-subtle" />
      </div>
      
      <AppNavigation />
      
      <div className="pt-28 pb-20">
        {isLoading ? (
          <CompanyPageSkeleton />
        ) : error ? (
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-lg mx-auto text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Error Loading Company</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button asChild>
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </div>
        ) : company ? (
          <div className="container mx-auto px-4">
            <div className="mb-12">
              <div className="relative">
                <div className="h-48 md:h-64 w-full rounded-xl overflow-hidden mb-[-3rem] md:mb-[-4rem] shadow-lg"> {/* Negative margin to pull logo up */}
                  {company.branding?.bannerImage ? (
                    <img 
                      src={company.branding.bannerImage} 
                      alt={`${company.name} banner`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[var(--primary-company,var(--primary))]/50 to-[var(--accent-company,var(--accent))]/50 flex items-center justify-center">
                      {/* Fallback content can be company name if no image */}
                       <Building2 className="h-16 w-16 text-background/50" />
                    </div>
                  )}
                </div>
                
                <div className="relative px-4 md:px-8"> {/* Padding for content over banner */}
                    <div className="flex flex-col md:flex-row gap-6 items-center md:items-end">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border-4 border-background shadow-lg bg-background flex-shrink-0 mt-[-2rem] md:mt-0">
                        {company.logo ? (
                            <img 
                            src={company.logo} 
                            alt={`${company.name} logo`}
                            className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[var(--primary-company,var(--primary))] to-[var(--accent-company,var(--accent))] flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary-foreground">
                                {company.name.substring(0, 2).toUpperCase()}
                            </span>
                            </div>
                        )}
                        </div>
                        
                        <div className="text-center md:text-left pt-4 md:pt-0 md:pb-2"> {/* Adjust padding */}
                            <h1 className="text-3xl md:text-4xl font-bold mb-1" style={{ color: company.branding?.primaryColor || 'hsl(var(--foreground))' }}>{company.name}</h1>
                            {company.description && (
                                <p className="text-muted-foreground max-w-2xl mb-2">{company.description}</p>
                            )}
                            
                            <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center md:justify-start">
                                {company.website && (
                                <a 
                                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-sm text-muted-foreground hover:text-[var(--primary-company,var(--primary))] transition-colors"
                                >
                                    <Globe className="h-4 w-4 mr-1.5" />
                                    {company.website.replace(/^https?:\/\/(www\.)?/, '')}
                                </a>
                                )}
                                {/* You can add more company info here like social links if available in Company type */}
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Campaigns</h2>
                  <p className="text-muted-foreground">
                    Explore and mint NFTs from {company.name}'s available campaigns
                  </p>
                </div>
                <div className="w-full md:w-auto md:hidden">
                  {!isConnected && <WalletConnection />}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8 p-4 bg-card rounded-xl shadow">
                <div className="md:col-span-12 lg:col-span-5 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search campaigns..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="md:col-span-6 lg:col-span-3">
                  <Select
                    value={selectedType}
                    onValueChange={setSelectedType}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {campaignTypeOptions.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center">
                            <span className={cn("w-2 h-2 rounded-full mr-2", type.color)} />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-6 lg:col-span-3">
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value={CampaignStatus.ACTIVE}>Active</SelectItem>
                      <SelectItem value={CampaignStatus.SCHEDULED}>Scheduled</SelectItem>
                      <SelectItem value={CampaignStatus.COMPLETED}>Completed</SelectItem>
                      <SelectItem value={CampaignStatus.DRAFT}>Draft</SelectItem>
                       <SelectItem value={CampaignStatus.PAUSED}>Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-12 lg:col-span-1 hidden lg:block">
                  {!isConnected && (
                    <WalletConnection /> // Display full component or a compact button
                  )}
                </div>
              </div>
              
              {noInitialCampaigns ? (
                 <div className="text-center py-12">
                    <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-medium mb-2">No Campaigns Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      {company.name} hasn't launched any campaigns yet. Check back later!
                    </p>
                  </div>
              ) : noCampaignsFound ? (
                <div className="text-center py-12">
                  <Info className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-medium mb-2">No Campaigns Found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters to see more campaigns from {company.name}.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedType("all")
                      setSelectedStatus("active")
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCampaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} companySlug={slug} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-lg mx-auto text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Company Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The company you're looking for with slug "{slug}" doesn't exist or may have been removed.
              </p>
              <Button asChild>
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Loading skeleton
function CompanyPageSkeleton() {
  return (
    <div className="container mx-auto px-4">
      <div className="mb-12">
        <Skeleton className="h-48 md:h-64 w-full rounded-xl mb-[-3rem] md:mb-[-4rem]" />
        <div className="relative px-4 md:px-8">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-end">
                <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-xl flex-shrink-0 mt-[-2rem] md:mt-0" />
                <div className="w-full md:w-2/3 pt-4 md:pt-0 md:pb-2">
                    <Skeleton className="h-10 w-3/5 mb-2" />
                    <Skeleton className="h-4 w-full max-w-2xl mb-1" />
                    <Skeleton className="h-4 w-4/5 max-w-xl mb-3" />
                    <Skeleton className="h-6 w-1/4" />
                </div>
            </div>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8 p-4 bg-card rounded-xl shadow">
          <Skeleton className="h-10 md:col-span-12 lg:col-span-5" />
          <Skeleton className="h-10 md:col-span-6 lg:col-span-3" />
          <Skeleton className="h-10 md:col-span-6 lg:col-span-3" />
          <Skeleton className="h-10 md:col-span-12 lg:col-span-1 hidden lg:block" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col bg-card rounded-lg shadow-md overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-10 w-full mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


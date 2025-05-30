/**
 * Main Homepage
 * Showcases campaign discovery, featured companies, and NFT minting capabilities
 */
"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { WalletConnection } from "@/components/wallet-connection"
import { NFTMinter } from "@/components/nft-minter"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ContractStats } from "@/components/contract-stats"
import { NFTGallery } from "@/components/nft-gallery"
import { AppNavigation } from "@/components/app-navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Sparkles, 
  Wallet, 
  ChevronDown, 
  Search, 
  ArrowRight, 
  TrendingUp,
  Building2,
  Calendar,
  Clock,
  Filter,
  Tag,
  Users,
  RefreshCw,
  ChevronRight,
  BarChart3,
  Globe
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CampaignType, Campaign, Company, CampaignStatus } from "@/types/campaign" // Added CampaignStatus

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
function formatDate(date: Date | string): string {
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

// Campaign card component
function CampaignCard({ campaign }: { campaign: Campaign }) {
  const { isConnected } = useAccount()
  const [isHovered, setIsHovered] = useState(false)
  const daysRemaining = getDaysRemaining(campaign.endDate)
  
  // Get campaign type details
  const typeDetails = campaignTypeOptions.find(type => type.value === campaign.type) || campaignTypeOptions[7]
  
  // Calculate minting progress
  const mintingProgress = Math.min(
    Math.round((campaign.totalMinted / campaign.mintLimit) * 100),
    100
  )
  
  return (
    <Card 
      className={cn(
        "overflow-hidden border-0 card-shadow hover-lift transition-all duration-300 h-full flex flex-col",
        isHovered ? "transform scale-[1.02]" : ""
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Campaign image */}
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
        
        {/* Campaign type badge */}
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
        
        {/* Days remaining badge (if applicable) */}
        {daysRemaining !== null && (
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{campaign.name}</CardTitle>
        </div>
        <CardDescription className="line-clamp-2">
          {campaign.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="space-y-4">
          {/* Minting progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Minting Progress</span>
              <span className="font-medium">{campaign.totalMinted} / {campaign.mintLimit}</span>
            </div>
            <Progress value={mintingProgress} className="h-1.5" />
          </div>
          
          {/* Campaign dates */}
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1.5" />
            <span>
              {formatDate(campaign.startDate)}
              {campaign.endDate && ` - ${formatDate(campaign.endDate)}`}
            </span>
          </div>
          
          {/* Company name */}
          <div className="flex items-center text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 mr-1.5" />
            <span>By {campaign.companyName || "Company"}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          className={cn(
            "w-full bg-gradient-primary hover:opacity-90 transition-opacity",
            !isConnected && "opacity-70"
          )}
          asChild
        >
          <a href={`/company/${campaign.companyId}/campaign/${campaign.slug}`}>
            {isConnected ? "Mint NFT" : "View Campaign"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}

// Company card component
function CompanyCard({ company }: { company: Company }) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <Card 
      className={cn(
        "overflow-hidden border-0 card-shadow hover-lift transition-all duration-300 h-full flex flex-col",
        isHovered ? "transform scale-[1.02]" : ""
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Company banner */}
      <div className="relative h-32 overflow-hidden">
        {company.branding?.bannerImage ? (
          <img 
            src={company.branding.bannerImage} 
            alt={company.name}
            className="w-full h-full object-cover transition-transform duration-500"
            style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
            <Building2 className="h-12 w-12 text-primary/50" />
          </div>
        )}
        
        {/* Company logo */}
        <div className="absolute -bottom-8 left-4">
          <div className="w-16 h-16 rounded-lg overflow-hidden border-4 border-background shadow-md bg-background">
            {company.logo ? (
              <img 
                src={company.logo} 
                alt={company.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  {company.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <CardHeader className="pt-10 pb-2">
        <CardTitle className="text-xl">{company.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {company.description || "NFT campaigns and collectibles"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="space-y-4">
          {/* Campaign count */}
          <div className="flex items-center text-sm text-muted-foreground">
            <Tag className="h-4 w-4 mr-1.5" />
            <span>{company.campaignCount || 0} active campaigns</span>
          </div>
          
          {/* Website if available */}
          {company.website && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Globe className="h-4 w-4 mr-1.5" />
              <a 
                href={company.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                {company.website.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          className="w-full bg-gradient-to-br from-background to-muted hover:bg-muted/80 transition-colors"
          variant="outline"
          asChild
        >
          <a href={`/company/${company.slug}`}>
            View Campaigns
            <ArrowRight className="h-4 w-4 ml-2" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}

// Stats card component
function StatsCard({ title, value, icon, change }: { 
  title: string, 
  value: string | number, 
  icon: React.ReactNode,
  change?: { value: number, positive: boolean } 
}) {
  return (
    <Card className="overflow-hidden border-0 card-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            
            {change && (
              <div className="flex items-center mt-1">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "py-0.5 px-1.5 text-xs flex items-center gap-1",
                    change.positive ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                  )}
                >
                  <TrendingUp className={cn(
                    "h-3 w-3",
                    !change.positive && "rotate-180"
                  )} />
                  {change.value}%
                </Badge>
                <span className="text-xs text-muted-foreground ml-1.5">vs. last month</span>
              </div>
            )}
          </div>
          
          <div className="p-2 rounded-full bg-primary/10">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Main homepage component
export default function HomePage() {
  const { isConnected, address } = useAccount()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  
  // State for campaigns and companies
  const [featuredCampaigns, setFeaturedCampaigns] = useState<Campaign[]>([])
  const [trendingCampaigns, setTrendingCampaigns] = useState<Campaign[]>([])
  const [spotlightCompanies, setSpotlightCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  
  // Stats
  const [platformStats, setPlatformStats] = useState({
    totalCampaigns: 0,
    totalCompanies: 0,
    totalMinted: 0,
    activeUsers: 0
  })
  
  // Handle scroll effect for floating header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  
  // Fetch data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      
      try {
        // In a real implementation, these would be API calls
        // For demo purposes, we'll create mock data
        
        // Mock featured campaigns
        const mockFeaturedCampaigns: Campaign[] = [
          {
            id: "campaign-1",
            companyId: "projectmocha", // Use slug for linking
            companyName: "ProjectMocha",
            name: "University Tour 2025",
            slug: "university-tour-2025",
            description: "Commemorative NFTs for the 2025 University Tour series across major campuses",
            type: CampaignType.UNIVERSITY_TOUR,
            status: CampaignStatus.ACTIVE,
            startDate: new Date("2025-01-15"),
            endDate: new Date("2025-05-30"),
            contractAddress: "0x1234567890123456789012345678901234567890" as `0x${string}`,
            contractNetwork: "1",
            contractAbi: {},
            nftConfig: {
              name: "University Tour 2025",
              symbol: "UTOUR25",
              description: "Official commemorative NFT for the 2025 University Tour",
              metadataFormat: "ERC721",
              attributes: [],
              revealType: "INSTANT",
              transferable: true,
              redeemable: true,
              image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dW5pdmVyc2l0eXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60"
            },
            accessControl: {
              accessType: "PUBLIC",
              requiresEmail: true,
              requiresCode: false
            },
            featuredImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dW5pdmVyc2l0eXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=80",
            totalMinted: 156,
            mintLimit: 500,
            mintLimitPerWallet: 2,
            createdAt: new Date("2024-12-01"),
            updatedAt: new Date("2024-12-15")
          },
          {
            id: "campaign-2",
            companyId: "cryptoconf", // Use slug
            companyName: "CryptoConf",
            name: "Crypto Conference 2025",
            slug: "crypto-conference-2025",
            description: "Exclusive NFTs for attendees of the annual Crypto Conference",
            type: CampaignType.CRYPTO_CONFERENCE,
            status: CampaignStatus.ACTIVE,
            startDate: new Date("2025-02-10"),
            endDate: new Date("2025-03-15"),
            contractAddress: "0x2345678901234567890123456789012345678901" as `0x${string}`,
            contractNetwork: "1",
            contractAbi: {},
            nftConfig: {
              name: "CryptoConf 2025",
              symbol: "CCONF",
              description: "Proof of attendance for CryptoConf 2025",
              metadataFormat: "ERC721",
              attributes: [],
              revealType: "INSTANT",
              transferable: true,
              redeemable: false,
              image: "https://images.unsplash.com/photo-1591115765373-5207764f72e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y3J5cHRvJTIwY29uZmVyZW5jZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60"
            },
            accessControl: {
              accessType: "ALLOWLIST",
              requiresEmail: true,
              requiresCode: true
            },
            featuredImage: "https://images.unsplash.com/photo-1591115765373-5207764f72e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y3J5cHRvJTIwY29uZmVyZW5jZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=80",
            totalMinted: 278,
            mintLimit: 1000,
            mintLimitPerWallet: 1,
            createdAt: new Date("2024-11-20"),
            updatedAt: new Date("2024-12-05")
          },
          {
            id: "campaign-3",
            companyId: "techgiants", // Use slug
            companyName: "TechGiants",
            name: "10th Anniversary Collection",
            slug: "10th-anniversary",
            description: "Limited edition NFTs celebrating our 10th company anniversary",
            type: CampaignType.ANNIVERSARY,
            status: CampaignStatus.ACTIVE,
            startDate: new Date("2025-01-01"),
            endDate: new Date("2025-02-28"),
            contractAddress: "0x3456789012345678901234567890123456789012" as `0x${string}`,
            contractNetwork: "1",
            contractAbi: {},
            nftConfig: {
              name: "10th Anniversary",
              symbol: "TECH10",
              description: "Commemorative NFT for TechGiants' 10th Anniversary",
              metadataFormat: "ERC721",
              attributes: [],
              revealType: "DELAYED",
              transferable: true,
              redeemable: false,
              image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dGVjaHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60"
            },
            accessControl: {
              accessType: "PUBLIC",
              requiresEmail: false,
              requiresCode: false
            },
            featuredImage: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dGVjaHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=80",
            totalMinted: 512,
            mintLimit: 1000,
            mintLimitPerWallet: 3,
            createdAt: new Date("2024-12-10"),
            updatedAt: new Date("2024-12-20")
          }
        ]
        
        // Mock trending campaigns
        const mockTrendingCampaigns: Campaign[] = [
          {
            id: "campaign-4",
            companyId: "gamestudio", // Use slug
            companyName: "GameStudio",
            name: "Game Launch Collectibles",
            slug: "game-launch-collectibles",
            description: "Exclusive NFTs for early adopters of our new game release",
            type: CampaignType.PRODUCT_LAUNCH,
            status: CampaignStatus.ACTIVE,
            startDate: new Date("2025-01-05"),
            endDate: new Date("2025-03-05"),
            contractAddress: "0x4567890123456789012345678901234567890123" as `0x${string}`,
            contractNetwork: "1",
            contractAbi: {},
            nftConfig: {
              name: "Game Launch",
              symbol: "GAME",
              description: "Early adopter NFT for our new game release",
              metadataFormat: "ERC721",
              attributes: [],
              revealType: "INSTANT",
              transferable: true,
              redeemable: true,
              image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z2FtZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60"
            },
            accessControl: {
              accessType: "PUBLIC",
              requiresEmail: true,
              requiresCode: false
            },
            featuredImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z2FtZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=80",
            totalMinted: 879,
            mintLimit: 1000,
            mintLimitPerWallet: 2,
            createdAt: new Date("2024-12-15"),
            updatedAt: new Date("2024-12-25")
          },
          {
            id: "campaign-5",
            companyId: "artcollective", // Use slug
            companyName: "ArtCollective",
            name: "Limited Edition Art Series",
            slug: "limited-edition-art",
            description: "Exclusive digital art NFTs from renowned artists",
            type: CampaignType.LIMITED_EDITION,
            status: CampaignStatus.ACTIVE,
            startDate: new Date("2025-01-10"),
            endDate: new Date("2025-02-10"),
            contractAddress: "0x5678901234567890123456789012345678901234" as `0x${string}`,
            contractNetwork: "1",
            contractAbi: {},
            nftConfig: {
              name: "Art Series",
              symbol: "ART",
              description: "Limited edition digital art NFT",
              metadataFormat: "ERC721",
              attributes: [],
              revealType: "INSTANT",
              transferable: true,
              redeemable: false,
              image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXJ0JTIwZ2FsbGVyeXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60"
            },
            accessControl: {
              accessType: "PUBLIC",
              requiresEmail: false,
              requiresCode: false
            },
            featuredImage: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXJ0JTIwZ2FsbGVyeXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=80",
            totalMinted: 92,
            mintLimit: 100,
            mintLimitPerWallet: 1,
            createdAt: new Date("2024-12-05"),
            updatedAt: new Date("2024-12-10")
          },
          {
            id: "campaign-6",
            companyId: "projectmocha", // Use slug
            companyName: "ProjectMocha",
            name: "Community Rewards Program",
            slug: "community-rewards",
            description: "Reward NFTs for our most active community members",
            type: CampaignType.COMMUNITY_REWARD,
            status: CampaignStatus.ACTIVE,
            startDate: new Date("2025-01-01"),
            endDate: undefined, // Open-ended
            contractAddress: "0x6789012345678901234567890123456789012345" as `0x${string}`,
            contractNetwork: "1",
            contractAbi: {},
            nftConfig: {
              name: "Community Reward",
              symbol: "REWARD",
              description: "Reward NFT for active community members",
              metadataFormat: "ERC721",
              attributes: [],
              revealType: "INSTANT",
              transferable: true,
              redeemable: true,
              image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y29tbXVuaXR5fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
            },
            accessControl: {
              accessType: "ALLOWLIST",
              requiresEmail: false,
              requiresCode: true
            },
            featuredImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y29tbXVuaXR5fGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=80",
            totalMinted: 45,
            mintLimit: 200,
            mintLimitPerWallet: 1,
            createdAt: new Date("2024-12-20"),
            updatedAt: new Date("2024-12-28")
          }
        ]
        
        // Mock spotlight companies
        const mockSpotlightCompanies: Company[] = [
          {
            id: "company-1",
            name: "ProjectMocha",
            slug: "projectmocha",
            description: "Leading provider of Web3 engagement solutions for universities and educational institutions",
            logo: "https://images.unsplash.com/photo-1563694983011-6f4d90358083?w=250&h=250&fit=crop&q=80",
            website: "https://projectmocha.crefy.com",
            branding: {
              primaryColor: "#8B5CF6",
              secondaryColor: "#EC4899",
              bannerImage: "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRlY2hub2xvZ3l8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=80"
            },
            adminAddress: "0x1234567890123456789012345678901234567890" as `0x${string}`,
            settings: {
              allowPublicCampaigns: true,
              requireEmailVerification: false,
              maxCampaignsAllowed: 10,
              analyticsEnabled: true,
              defaultMintLimit: 5
            },
            campaignCount: 2,
            createdAt: new Date("2024-10-01"),
            updatedAt: new Date("2024-12-15")
          },
          {
            id: "company-2",
            name: "CryptoConf",
            slug: "cryptoconf",
            description: "The premier crypto conference organizer with events worldwide",
            logo: "https://images.unsplash.com/photo-1622473590773-f588134b6ce7?w=250&h=250&fit=crop&q=80",
            website: "https://cryptoconf.crefy.com",
            branding: {
              primaryColor: "#3B82F6",
              secondaryColor: "#10B981",
              bannerImage: "https://images.unsplash.com/photo-1605792657660-596af9009e82?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y3J5cHRvfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=80"
            },
            adminAddress: "0x2345678901234567890123456789012345678901" as `0x${string}`,
            settings: {
              allowPublicCampaigns: true,
              requireEmailVerification: true,
              maxCampaignsAllowed: 5,
              analyticsEnabled: true,
              defaultMintLimit: 1
            },
            campaignCount: 1,
            createdAt: new Date("2024-09-15"),
            updatedAt: new Date("2024-12-05")
          },
          {
            id: "company-3",
            name: "TechGiants",
            slug: "techgiants",
            description: "Enterprise technology solutions with a focus on Web3 integration",
            logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=250&h=250&fit=crop&q=80",
            website: "https://techgiants.crefy.com",
            branding: {
              primaryColor: "#6366F1",
              secondaryColor: "#F59E0B",
              bannerImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHRlY2hub2xvZ3l8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=80"
            },
            adminAddress: "0x3456789012345678901234567890123456789012" as `0x${string}`,
            settings: {
              allowPublicCampaigns: true,
              requireEmailVerification: false,
              maxCampaignsAllowed: 20,
              analyticsEnabled: true,
              defaultMintLimit: 3
            },
            campaignCount: 1,
            createdAt: new Date("2024-08-20"),
            updatedAt: new Date("2024-12-10")
          }
        ]
        
        // Mock platform stats
        const mockPlatformStats = {
          totalCampaigns: 24,
          totalCompanies: 8,
          totalMinted: 12547,
          activeUsers: 3842
        }
        
        // Set data
        setFeaturedCampaigns(mockFeaturedCampaigns)
        setTrendingCampaigns(mockTrendingCampaigns)
        setSpotlightCompanies(mockSpotlightCompanies)
        setPlatformStats(mockPlatformStats)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Filter campaigns by type
  const handleTypeChange = (value: string) => {
    setSelectedType(value)
    
    // Update URL params
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("type")
    } else {
      params.set("type", value)
    }
    
    router.push(`/?${params.toString()}`, { scroll: false })
  }
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Update URL params
    const params = new URLSearchParams(searchParams.toString())
    if (searchQuery) {
      params.set("q", searchQuery)
    } else {
      params.delete("q")
    }
    
    router.push(`/?${params.toString()}`, { scroll: false })
  }
  
  // Scroll to campaigns section
  const scrollToCampaigns = () => {
    document.getElementById("campaigns-section")?.scrollIntoView({ 
      behavior: "smooth" 
    })
  }
  
  return (
    <div className="relative min-h-screen">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse-subtle" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-accent/20 blur-[120px] animate-pulse-subtle" />
        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px] animate-pulse-subtle" />
      </div>

      {/* App Navigation */}
      <AppNavigation />

      {/* Hero section with gradient text */}
      <section className="pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight animate-fade-in">
            <span className="text-gradient">NFT Campaigns</span>
            <span className="block text-foreground mt-1">Made Simple</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up">
            Discover and mint unique NFTs from various campaigns. 
            Create your own campaigns or join existing ones.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "200ms" }}>
            {!isConnected ? (
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity">
                <Wallet className="h-5 w-5 mr-2" />
                Connect to Start
              </Button>
            ) : (
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
                asChild
              >
                <a href="/dashboard"> {/* Link to a future dashboard page */}
                  <Sparkles className="h-5 w-5 mr-2" />
                  My Dashboard
                </a>
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-background/50 backdrop-blur-sm"
              onClick={scrollToCampaigns}
            >
              Explore Campaigns
              <ChevronDown className="h-5 w-5 ml-2" />
            </Button>
          </div>
          
          {/* Platform stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: "300ms" }}>
            <StatsCard 
              title="Total Campaigns" 
              value={platformStats.totalCampaigns} 
              icon={<Tag className="h-5 w-5 text-primary" />}
              change={{ value: 12, positive: true }}
            />
            <StatsCard 
              title="Companies" 
              value={platformStats.totalCompanies} 
              icon={<Building2 className="h-5 w-5 text-primary" />}
              change={{ value: 8, positive: true }}
            />
            <StatsCard 
              title="NFTs Minted" 
              value={platformStats.totalMinted.toLocaleString()} 
              icon={<Sparkles className="h-5 w-5 text-primary" />}
              change={{ value: 24, positive: true }}
            />
            <StatsCard 
              title="Active Users" 
              value={platformStats.activeUsers.toLocaleString()} 
              icon={<Users className="h-5 w-5 text-primary" />}
              change={{ value: 18, positive: true }}
            />
          </div>
        </div>
      </section>

      {/* Campaign discovery section */}
      <section id="campaigns-section" className="py-16 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Discover Campaigns</h2>
              <p className="text-muted-foreground">
                Explore and mint NFTs from various campaigns
              </p>
            </div>
            
            {/* Search and filter */}
            <form 
              className="flex flex-col md:flex-row gap-3 w-full md:w-auto"
              onSubmit={handleSearch}
            >
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  className="pl-10 w-full md:w-[220px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select
                value={selectedType}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger className="w-full md:w-[180px]">
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
              
              <Button type="submit" className="md:hidden">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </div>
          
          {/* Featured campaigns */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Featured Campaigns</h3>
              <Button variant="ghost" size="sm" asChild>
                <a href="/campaigns"> {/* Link to a future all campaigns page */}
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </Button>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex flex-col">
                    <Skeleton className="h-48 w-full rounded-t-lg" />
                    <Skeleton className="h-40 w-full rounded-b-lg" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            )}
          </div>
          
          {/* Company spotlight */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Company Spotlight</h3>
              <Button variant="ghost" size="sm" asChild>
                <a href="/companies"> {/* Link to a future all companies page */}
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </Button>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex flex-col">
                    <Skeleton className="h-32 w-full rounded-t-lg" />
                    <Skeleton className="h-40 w-full rounded-b-lg" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {spotlightCompanies.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            )}
          </div>
          
          {/* Trending campaigns */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                Trending Now
              </h3>
              <Button variant="ghost" size="sm" asChild>
                <a href="/campaigns?sort=trending"> {/* Link to a future trending campaigns page */}
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </Button>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex flex-col">
                    <Skeleton className="h-48 w-full rounded-t-lg" />
                    <Skeleton className="h-40 w-full rounded-b-lg" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Original NFT minting section - integrated with campaign system */}
      {isConnected && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Your NFT Dashboard</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Manage your NFTs and create your own campaigns
              </p>
            </div>
            
            {/* Contract Stats Card */}
            <div className="mb-8 animate-slide-up" style={{ animationDelay: "100ms" }}>
              <ContractStats />
            </div>

            {/* Main Card */}
            <Card className="mb-10 overflow-hidden border-0 card-shadow hover-lift animate-slide-up" style={{ animationDelay: "200ms" }}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary" />
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl text-center">
                  {isConnected ? "Ready to Mint" : "Connect Wallet"}
                </CardTitle>
                <CardDescription className="text-center">
                  {isConnected 
                    ? "Click the button below to mint your NFT" 
                    : "Please connect your wallet to continue"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <WalletConnection />
                {isConnected && <NFTMinter />}
              </CardContent>
            </Card>

            {/* NFT Gallery Section */}
            {isConnected && (
              <div className="mt-16 animate-slide-up" style={{ animationDelay: "300ms" }}>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">Your NFT Collection</h2>
                  <p className="text-muted-foreground">View and manage your minted NFTs</p>
                </div>
                <NFTGallery />
              </div>
            )}
          </div>
        </section>
      )}
      
      {/* CTA section */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Create Your Own Campaign</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Launch your own NFT campaign for your brand, event, or community. 
            It's easy to get started and reach your audience with unique digital collectibles.
          </p>
          
          <Button 
            size="lg" 
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
            asChild
          >
            <a href="/create-campaign"> {/* Link to a future create campaign page */}
              <Sparkles className="h-5 w-5 mr-2" />
              Create Campaign
            </a>
          </Button>
        </div>
      </section>
    </div>
  )
}

/**
 * Campaign Minting Page
 * Displays detailed campaign information and provides minting interface
 */
"use client"

import { useState, useEffect, useMemo, useCallback } from "react" // Added useMemo and useCallback
import { useParams, useRouter } from "next/navigation"
import { useAccount, useBalance, useChainId, useSwitchChain } from "wagmi"
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
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { AppNavigation } from "@/components/app-navigation"
import { WalletConnection } from "@/components/wallet-connection"
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  Wallet,
  Info,
  AlertTriangle,
  ExternalLink,
  ChevronLeft,
  CheckCircle,
  Loader2,
  Copy,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Tag,
  Gift,
  Image as ImageIcon, // Renamed to avoid conflict with Next/Image
  RefreshCw,
  Share2,
  Users // Added Users for campaign type
} from "lucide-react"
import { CampaignType, CampaignStatus, Campaign, Company, NFTAttribute } from "@/types/campaign"
import { cn } from "@/lib/utils"
import { createPublicClient, http, createWalletClient, custom, Address } from "viem" // Added Address
import { mainnet, sepolia } from "viem/chains"
import { toast } from "sonner"
import Link from "next/link" // Added Link for navigation

// Campaign type options with icons and colors (consistent with other pages)
const campaignTypeOptions = [
  { value: CampaignType.UNIVERSITY_TOUR, label: "University Tour", icon: <Users className="h-4 w-4" />, color: "bg-blue-500" },
  { value: CampaignType.CRYPTO_CONFERENCE, label: "Crypto Conference", icon: <Sparkles className="h-4 w-4" />, color: "bg-purple-500" },
  { value: CampaignType.ANNIVERSARY, label: "Anniversary", icon: <Calendar className="h-4 w-4" />, color: "bg-green-500" },
  { value: CampaignType.PRODUCT_LAUNCH, label: "Product Launch", icon: <Tag className="h-4 w-4" />, color: "bg-orange-500" },
  { value: CampaignType.COMMUNITY_REWARD, label: "Community Reward", icon: <Gift className="h-4 w-4" />, color: "bg-teal-500" },
  { value: CampaignType.LOYALTY_PROGRAM, label: "Loyalty Program", icon: <Users className="h-4 w-4" />, color: "bg-indigo-500" },
  { value: CampaignType.LIMITED_EDITION, label: "Limited Edition", icon: <Sparkles className="h-4 w-4" />, color: "bg-pink-500" },
  { value: CampaignType.CUSTOM, label: "Custom", icon: <Tag className="h-4 w-4" />, color: "bg-gray-500" }
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
  if (now > end) return 0; // If end date is in the past, 0 days remaining
  const diffTime = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

// Format wallet address for display
function formatAddress(address: string | undefined): string {
  if (!address) return "N/A";
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// NFT Attribute display component
function AttributeTag({ attribute }: { attribute: NFTAttribute }) {
  return (
    <div className="flex flex-col bg-muted/30 rounded-lg p-3 border border-border/50 text-left">
      <span className="text-xs text-muted-foreground mb-1">{attribute.traitType}</span>
      <span className="font-medium truncate">
        {typeof attribute.value === 'number' && attribute.displayType === 'date' 
          ? new Date(attribute.value * 1000).toLocaleDateString() 
          : attribute.value.toString()}
      </span>
    </div>
  )
}

// Email verification component
function EmailVerification({ 
  onVerify, 
  isVerifying,
  campaignName
}: { 
  onVerify: (email: string) => Promise<boolean>,
  isVerifying: boolean,
  campaignName: string
}) {
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleSendCode = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.")
      return
    }
    setError(null)
    // Simulate API call to send code
    toast.info("Sending verification code...");
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    setCodeSent(true);
    toast.success(`Verification code sent to ${email}.`);
  }
  
  const handleVerify = async () => {
    if (!code || code.length !== 6 || !/^\d+$/.test(code)) { // Assuming 6-digit code
      setError("Please enter a valid 6-digit verification code.")
      return
    }
    setError(null)
    const success = await onVerify(email); // Pass email to onVerify
    if (!success) {
      setError("Verification failed. Please check the code or try again.");
    }
  }
  
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div>
        <h3 className="text-lg font-medium mb-1">Email Verification Required</h3>
        <p className="text-muted-foreground text-sm">
          To mint an NFT for "{campaignName}", please verify your email address.
        </p>
      </div>
      
      {!codeSent ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="your@email.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleSendCode} disabled={isVerifying || !email} className="w-full">
            {isVerifying ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
            Send Code
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="code" className="text-sm font-medium">Verification Code</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="code" type="text" placeholder="Enter 6-digit code" className="pl-10" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} />
            </div>
            <p className="text-xs text-muted-foreground">Enter the 6-digit code sent to {email}.</p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setCodeSent(false); setError(null); }} disabled={isVerifying} className="flex-1">Change Email</Button>
            <Button onClick={handleVerify} disabled={isVerifying || code.length < 6} className="flex-1">
              {isVerifying ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Verify Code
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Access code verification component
function AccessCodeVerification({ 
  onVerify, 
  isVerifying,
  campaignName
}: { 
  onVerify: (code: string) => Promise<boolean>,
  isVerifying: boolean,
  campaignName: string
}) {
  const [accessCode, setAccessCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  
  const handleVerify = async () => {
    if (!accessCode.trim()) {
      setError("Please enter an access code.")
      return
    }
    setError(null)
    const success = await onVerify(accessCode);
    if (!success) {
      setError("Invalid or expired access code. Please try again.");
    }
  }
  
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div>
        <h3 className="text-lg font-medium mb-1">Access Code Required</h3>
        <p className="text-muted-foreground text-sm">
          An access code is needed to mint an NFT for "{campaignName}".
        </p>
      </div>
      <div className="space-y-1">
        <label htmlFor="accessCode" className="text-sm font-medium">Access Code</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="accessCode" type="text" placeholder="Enter access code" className="pl-10" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button onClick={handleVerify} disabled={isVerifying || !accessCode} className="w-full">
        {isVerifying ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
        Verify Code
      </Button>
    </div>
  )
}

// Main campaign minting page component
export default function CampaignMintingPage() {
  const params = useParams();
  const slug = params?.slug as string; // Company slug
  const campaignSlug = params?.campaignSlug as string; // Campaign slug
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { chains, error: switchNetworkError, isPending: isSwitchingNetwork, variables:pendingChainId, switchChain } = useSwitchChain();
  
  const [company, setCompany] = useState<Company | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  
  const [mintingStatus, setMintingStatus] = useState<'idle' | 'preparing' | 'minting' | 'success' | 'error'>('idle');
  const [mintingProgress, setMintingProgress] = useState(0);
  const [mintedTokenId, setMintedTokenId] = useState<number | string | null>(null); // Can be string for some contracts
  const [mintingError, setMintingError] = useState<string | null>(null);
  const [mintQuantity, setMintQuantity] = useState(1);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  
  const [userMintCount, setUserMintCount] = useState(0);
  
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [isVerifyingAccess, setIsVerifyingAccess] = useState(false);
  const [isAllowlisted, setIsAllowlisted] = useState(true); // Assume true unless checked otherwise

  const [showNFTDetailsDialog, setShowNFTDetailsDialog] = useState(false);
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);
  const [redemptionInfo, setRedemptionInfo] = useState("");

  const fetchCampaignData = useCallback(async () => {
    if (!slug || !campaignSlug) return;
    setIsLoadingPage(true);
    setPageError(null);
    try {
      // Mock API call - replace with actual fetch
      // const response = await fetch(`/api/companies/${slug}/campaigns/${campaignSlug}`);
      // if (!response.ok) {
      //   const errorData = await response.json().catch(() => ({}));
      //   throw new Error(errorData.error || `Failed to fetch campaign data: ${response.statusText}`);
      // }
      // const data = await response.json();

      // MOCK DATA FOR DEMO
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      const mockCompany: Company = {
        id: "comp_projectmocha", name: "ProjectMocha", slug: "projectmocha",
        adminAddress: "0xAdminAddress" as Address, createdAt: new Date(), updatedAt: new Date(),
        branding: { primaryColor: "#8B5CF6", bannerImage: "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRlY2hub2xvZ3l8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=80", logoImage: "https://images.unsplash.com/photo-1563694983011-6f4d90358083?w=100&h=100&fit=crop&q=80" },
        settings: { allowPublicCampaigns: true, requireEmailVerification: false, maxCampaignsAllowed: 10, analyticsEnabled: true, defaultMintLimit: 5 },
        description: "Leading provider of Web3 engagement solutions."
      };
      const mockCampaign: Campaign = {
        id: "camp_uni_tour_25", companyId: "comp_projectmocha", companyName: "ProjectMocha",
        name: "University Tour Fall 2025", slug: "uni-tour-fall-25",
        description: "Exclusive NFTs for Fall 2025 university tour attendees. Collect this unique digital memorabilia to commemorate your visit and unlock special perks throughout the academic year. This NFT also grants access to an exclusive online community.",
        type: CampaignType.UNIVERSITY_TOUR, status: CampaignStatus.ACTIVE,
        startDate: new Date("2025-08-01T00:00:00.000Z"), endDate: new Date("2025-12-15T23:59:59.000Z"),
        contractAddress: "0xMockContractAddress12345" as Address, contractNetwork: sepolia.id.toString(), // Use Sepolia for demo
        contractAbi: [/* ... Your ABI ... */],
        nftConfig: {
          name: "Fall Tour NFT 2025", symbol: "FALL25",
          description: "A unique collectible from the Fall 2025 university tour. This special edition NFT celebrates your participation.",
          metadataFormat: "ERC721",
          attributes: [{ traitType: "Event", value: "Fall Tour" }, { traitType: "Year", value: "2025" }, { traitType: "Location", value: "Main Campus" }],
          image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dW5pdmVyc2l0eXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
          revealType: "INSTANT", transferable: true, redeemable: true,
        },
        accessControl: { accessType: "PUBLIC", requiresEmail: true, requiresCode: false, allowlist: [] },
        featuredImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dW5pdmVyc2l0eXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=80",
        bannerImage: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dW5pdmVyc2l0eSUyMGNhbXB1c3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        galleryImages: [
            "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=300&fit=crop",
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300&h=300&fit=crop",
            "https://images.unsplash.com/photo-1627556704290-2b0158950375?w=300&h=300&fit=crop",
        ],
        totalMinted: 123, mintLimit: 1000, mintLimitPerWallet: 2,
        createdAt: new Date("2025-07-01T00:00:00.000Z"), updatedAt: new Date()
      };
      
      setCompany(mockCompany);
      setCampaign(mockCampaign);

      if (address && mockCampaign) {
        // Mock user participation check
        // const userParticipationResponse = await fetch(`/api/campaigns/${mockCampaign.id}/participation?address=${address}`);
        // if (userParticipationResponse.ok) {
        //   const participationData = await userParticipationResponse.json();
        //   setUserMintCount(participationData.mintedCount || 0);
        //   setIsEmailVerified(participationData.emailVerified || false);
        //   setIsCodeVerified(!!participationData.codeUsed);
        //   // Check allowlist status if applicable
        //   if (mockCampaign.accessControl.accessType === 'ALLOWLIST') {
        //     setIsAllowlisted(mockCampaign.accessControl.allowlist?.includes(address) || false);
        //   }
        // }
        setUserMintCount(0); // Reset for demo
        setIsEmailVerified(false); // Reset for demo
        setIsCodeVerified(false); // Reset for demo
        if (mockCampaign.accessControl.accessType === 'ALLOWLIST') {
            setIsAllowlisted(mockCampaign.accessControl.allowlist?.includes(address as string) || false);
        }
      }
    } catch (err) {
      console.error("Error fetching campaign data:", err);
      setPageError(err instanceof Error ? err.message : "Failed to load campaign data");
    } finally {
      setIsLoadingPage(false);
    }
  }, [slug, campaignSlug, address]);

  useEffect(() => {
    fetchCampaignData();
  }, [fetchCampaignData]);

  const userRemainingMints = useMemo(() => {
    if (!campaign) return 0;
    return Math.max(0, campaign.mintLimitPerWallet - userMintCount);
  }, [campaign, userMintCount]);

  const handleEmailVerify = useCallback(async (email: string): Promise<boolean> => {
    if (!campaign || !address) return false;
    setIsVerifyingAccess(true);
    toast.info("Verifying email...");
    // Mock API call for email verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    // const response = await fetch(`/api/campaigns/${campaign.id}/participation/verify-email`, { /* ... */ });
    // if (!response.ok) { setIsVerifyingAccess(false); toast.error("Email verification failed."); return false; }
    setIsEmailVerified(true);
    setIsVerifyingAccess(false);
    toast.success("Email successfully verified!");
    return true;
  }, [campaign, address]);

  const handleCodeVerify = useCallback(async (code: string): Promise<boolean> => {
    if (!campaign || !address) return false;
    setIsVerifyingAccess(true);
    toast.info("Verifying access code...");
    // Mock API call for code verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    // const response = await fetch(`/api/campaigns/${campaign.id}/verify-code`, { /* ... */ });
    // if (!response.ok) { setIsVerifyingAccess(false); toast.error("Invalid access code."); return false; }
    setIsCodeVerified(true);
    setIsVerifyingAccess(false);
    toast.success("Access code successfully verified!");
    return true;
  }, [campaign, address]);

  const canMint = useMemo(() => {
    if (!campaign || !isConnected || !address) return false;
    if (campaign.status !== CampaignStatus.ACTIVE) return false;
    if (userRemainingMints <= 0) return false;
    if (campaign.totalMinted >= campaign.mintLimit) return false;
    if (chainId?.toString() !== campaign.contractNetwork) return false;
    if (campaign.accessControl.accessType === 'ALLOWLIST' && !isAllowlisted) return false;
    if (campaign.accessControl.requiresEmail && !isEmailVerified) return false;
    if (campaign.accessControl.requiresCode && !isCodeVerified) return false;
    return true;
  }, [campaign, isConnected, address, userRemainingMints, chains, isAllowlisted, isEmailVerified, isCodeVerified]);

  const handleMint = async () => {
    if (!campaign || !address || !canMint || !switchChain) return;
    
    // Ensure correct network
    if (chainId?.toString() !== campaign.contractNetwork) {
      toast.error(`Please switch to the correct network: ${campaign.contractNetwork === sepolia.id.toString() ? "Sepolia" : "Target Network"}.`);
      switchChain({chainId: parseInt(campaign.contractNetwork) });
      return;
    }

    setMintingStatus('preparing');
    setMintingProgress(10);
    setMintingError(null);
    setTransactionHash(null);
    setMintedTokenId(null);
    toast.info("Preparing your NFT mint...");

    try {
      // Simulate wallet client and public client setup
      // const walletClient = createWalletClient({ chain: chain, transport: custom((window as any).ethereum) });
      // const publicClient = createPublicClient({ chain: chain, transport: http() });

      setMintingProgress(30);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate contract call prep

      setMintingStatus('minting');
      toast.info("Minting in progress... Please confirm in your wallet.");
      setMintingProgress(50);

      // Mock contract interaction
      // const { request } = await publicClient.simulateContract({
      //   address: campaign.contractAddress,
      //   abi: campaign.contractAbi,
      //   functionName: 'mint', // or your contract's mint function
      //   args: [address, mintQuantity], // example arguments
      //   account: address,
      // });
      // const hash = await walletClient.writeContract(request);
      
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate transaction sending
      const mockHash = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}` as Address;
      setTransactionHash(mockHash);
      setMintingProgress(75);
      toast.info("Transaction submitted. Waiting for confirmation...");

      await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate confirmation
      
      const mockTokenId = campaign.totalMinted + 1; // Simulate a token ID
      setMintedTokenId(mockTokenId);
      
      // Update local state (in real app, re-fetch or use optimistic updates)
      setUserMintCount(prev => prev + mintQuantity);
      setCampaign(prev => prev ? ({ ...prev, totalMinted: prev.totalMinted + mintQuantity }) : null);

      setMintingProgress(100);
      setMintingStatus('success');
      toast.success(`Successfully minted ${mintQuantity} NFT(s)! Token ID: ${mockTokenId}`);
      
      if (campaign.nftConfig.redeemable) {
        setTimeout(() => setShowRedeemDialog(true), 1500);
      } else {
        setTimeout(() => setShowNFTDetailsDialog(true), 1500);
      }

    } catch (err: any) {
      console.error("Minting error:", err);
      const errorMessage = err.shortMessage || err.message || "An unknown error occurred during minting.";
      setMintingError(errorMessage);
      setMintingStatus('error');
      toast.error(`Minting failed: ${errorMessage}`);
    }
  };

  const handleSwitchNetwork = () => {
    if (!campaign || !switchChain) return;
    const targetNetworkId = parseInt(campaign.contractNetwork);
    if (isNaN(targetNetworkId)) {
        toast.error("Campaign has an invalid network configuration.");
        return;
    }
    switchChain({ chainId: targetNetworkId });
  };
  
  const typeDetails = campaign ? campaignTypeOptions.find(type => type.value === campaign.type) || campaignTypeOptions.find(t => t.value === CampaignType.CUSTOM)! : campaignTypeOptions.find(t => t.value === CampaignType.CUSTOM)!;
  const campaignMintingProgress = campaign ? (campaign.mintLimit > 0 ? Math.min(Math.round((campaign.totalMinted / campaign.mintLimit) * 100), 100) : 0) : 0;
  const daysRemaining = campaign?.endDate ? getDaysRemaining(campaign.endDate) : null;

  const copyValue = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied to clipboard!`);
  };

  const shareCampaign = () => {
    if (navigator.share && campaign) {
      navigator.share({
        title: campaign.name,
        text: `Check out the "${campaign.name}" NFT campaign by ${company?.name || 'Crefy-Mems'}!`,
        url: window.location.href
      }).catch(error => console.log('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Campaign link copied to clipboard!");
    }
  };

  const handleRedeemSubmit = async () => {
    if (!campaign || !mintedTokenId) return;
    toast.info("Submitting redemption request...");
    // Mock API call for redemption
    await new Promise(resolve => setTimeout(resolve, 1500));
    // const response = await fetch(`/api/campaigns/${campaign.id}/redeem`, { method: 'POST', body: JSON.stringify({ tokenId: mintedTokenId, redemptionInfo }) });
    // if (!response.ok) { toast.error("Redemption failed."); return; }
    toast.success(`Redemption request for NFT #${mintedTokenId} submitted!`);
    setShowRedeemDialog(false);
    setRedemptionInfo("");
  };

  const companyStyles = company?.branding ? {
    "--primary-company": company.branding.primaryColor || "hsl(var(--primary))",
    "--secondary-company": company.branding.secondaryColor || "hsl(var(--secondary))",
    "--accent-company": company.branding.accentColor || "hsl(var(--accent))",
  } as React.CSSProperties : {};

  if (isLoadingPage) return <CampaignPageSkeleton />;
  if (pageError) return (
    <div className="container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center">
      <AppNavigation />
      <div className="max-w-lg mx-auto text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error Loading Campaign</h2>
        <p className="text-muted-foreground mb-6">{pageError}</p>
        <Button asChild><Link href="/">Return to Home</Link></Button>
      </div>
    </div>
  );
  if (!campaign || !company) return (
    <div className="container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center">
       <AppNavigation />
      <div className="max-w-lg mx-auto text-center">
        <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Campaign Not Found</h2>
        <p className="text-muted-foreground mb-6">The campaign you're looking for doesn't exist or may have been removed.</p>
        <Button asChild><Link href="/">Return to Home</Link></Button>
      </div>
    </div>
  );

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
      
      <div className="pt-24 md:pt-28 pb-20">
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <Button 
                variant="ghost" 
                className="group text-muted-foreground hover:text-foreground"
                onClick={() => router.push(`/company/${slug}`)}
              >
                <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
                Back to {company.name}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge className={cn("py-1 px-2.5 flex items-center gap-1.5", typeDetails.color, "text-white")}>
                      {typeDetails.icon} {typeDetails.label}
                    </Badge>
                    <Badge variant={campaign.status === CampaignStatus.ACTIVE ? "default" : "secondary"} className={cn("py-1 px-2.5", campaign.status === CampaignStatus.ACTIVE && "bg-green-500 text-white")}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: company.branding?.primaryColor || 'hsl(var(--foreground))' }}>{campaign.name}</h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center"><Calendar className="h-4 w-4 mr-1.5" /><span>{formatDate(campaign.startDate)}{campaign.endDate && ` - ${formatDate(campaign.endDate)}`}</span></div>
                    {daysRemaining !== null && campaign.status === CampaignStatus.ACTIVE && (<div className="flex items-center"><Clock className="h-4 w-4 mr-1.5" /><span>{daysRemaining} days remaining</span></div>)}
                    <div className="flex items-center"><Wallet className="h-4 w-4 mr-1.5" /><span>Limit: {campaign.mintLimitPerWallet} per wallet</span></div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{campaign.description}</p>
                </div>
                
                <div className="relative overflow-hidden rounded-xl aspect-video bg-muted shadow-lg">
                  {campaign.bannerImage ? <img src={campaign.bannerImage} alt={campaign.name} className="w-full h-full object-cover" />
                    : campaign.featuredImage ? <img src={campaign.featuredImage} alt={campaign.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gradient-to-br from-[var(--primary-company,var(--primary))]/30 to-[var(--accent-company,var(--accent))]/30 flex items-center justify-center"><ImageIcon className="h-16 w-16 text-muted-foreground/50" /></div>}
                </div>
                
                {campaign.galleryImages && campaign.galleryImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {campaign.galleryImages.slice(0, 3).map((image, index) => (
                      <div key={index} className="relative overflow-hidden rounded-lg aspect-square bg-muted shadow">
                        <img src={image} alt={`${campaign.name} gallery ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="nft">NFT Info</TabsTrigger>
                    <TabsTrigger value="contract">Contract</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details" className="space-y-4 text-sm">
                    <div className="space-y-2 p-4 bg-card rounded-lg border">
                      <div className="flex items-center justify-between"><span className="font-medium">Minting Progress</span><span>{campaign.totalMinted} / {campaign.mintLimit}</span></div>
                      <Progress value={campaignMintingProgress} className="h-2" />
                      {campaign.totalMinted >= campaign.mintLimit && <p className="text-amber-600 dark:text-amber-500 flex items-center"><AlertTriangle className="h-4 w-4 mr-1.5" />This campaign is fully minted.</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoItem label="Campaign Type" value={typeDetails.label} />
                      <InfoItem label="Status" value={campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1).toLowerCase()} />
                      <InfoItem label="Start Date" value={formatDate(campaign.startDate)} />
                      <InfoItem label="End Date" value={campaign.endDate ? formatDate(campaign.endDate) : "Ongoing"} />
                      <InfoItem label="Total Supply" value={`${campaign.mintLimit} NFTs`} />
                      <InfoItem label="Limit Per Wallet" value={`${campaign.mintLimitPerWallet} NFTs`} />
                    </div>
                    {campaign.nftConfig.redeemable && <Alert className="bg-accent/10 border-accent/20"><Gift className="h-4 w-4 text-accent" /><AlertTitle>Redeemable NFT</AlertTitle><AlertDescription>This NFT can be redeemed for exclusive benefits or rewards.</AlertDescription></Alert>}
                  </TabsContent>
                  <TabsContent value="nft" className="space-y-4 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoItem label="NFT Name" value={campaign.nftConfig.name} />
                      <InfoItem label="Symbol" value={campaign.nftConfig.symbol} />
                    </div>
                    <InfoItem label="NFT Description" value={campaign.nftConfig.description} paragraph />
                    {campaign.nftConfig.attributes && campaign.nftConfig.attributes.length > 0 && (
                      <div className="space-y-2"><p className="font-medium">Attributes</p><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{campaign.nftConfig.attributes.map((attr, i) => <AttributeTag key={i} attribute={attr} />)}</div></div>
                    )}
                    {campaign.nftConfig.image && <div className="space-y-2"><p className="font-medium">Preview</p><div className="relative overflow-hidden rounded-lg aspect-square bg-muted max-w-[250px] shadow"><img src={campaign.nftConfig.image} alt={campaign.nftConfig.name} className="w-full h-full object-cover" /></div></div>}
                    <Alert className={cn(campaign.nftConfig.transferable ? "bg-green-500/10 border-green-500/20" : "bg-amber-500/10 border-amber-500/20")}><Info className={cn("h-4 w-4", campaign.nftConfig.transferable ? "text-green-500" : "text-amber-500")} /><AlertTitle>{campaign.nftConfig.transferable ? "Transferable" : "Non-Transferable"}</AlertTitle><AlertDescription>{campaign.nftConfig.transferable ? "This NFT can be transferred or sold." : "This NFT is soul-bound and cannot be transferred."}</AlertDescription></Alert>
                  </TabsContent>
                  <TabsContent value="contract" className="space-y-4 text-sm">
                    <div className="space-y-2"><div className="flex items-center justify-between"><p className="font-medium">Contract Address</p><Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => copyValue(campaign.contractAddress, "Contract address")}><Copy className="h-3 w-3 mr-1" />Copy</Button></div><code className="block bg-muted p-3 rounded-lg text-xs overflow-x-auto">{campaign.contractAddress}</code></div>
                    <InfoItem label="Network" value={campaign.contractNetwork === mainnet.id.toString() ? "Ethereum Mainnet" : campaign.contractNetwork === sepolia.id.toString() ? "Sepolia Testnet" : `Chain ID: ${campaign.contractNetwork}`} />
                    <Button variant="outline" size="sm" asChild><a href={`https://${campaign.contractNetwork === sepolia.id.toString() ? "sepolia." : ""}etherscan.io/address/${campaign.contractAddress}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-1.5" />View on Etherscan</a></Button>
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="lg:col-span-5 space-y-6">
                <Card className="overflow-hidden border-0 card-shadow sticky top-24"> {/* Sticky mint card */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary-company,var(--primary))] to-[var(--accent-company,var(--accent))]" />
                  <CardHeader><CardTitle className="flex items-center"><Sparkles className="h-5 w-5 mr-2 text-[var(--primary-company,var(--primary))]" />Mint Your NFT</CardTitle><CardDescription>{campaign.nftConfig.redeemable ? "Mint your redeemable NFT from this campaign" : "Mint your NFT from this campaign"}</CardDescription></CardHeader>
                  <CardContent className="space-y-6">
                    {!isConnected ? (
                      <div className="space-y-3"><Alert className="bg-muted"><Wallet className="h-4 w-4" /><AlertTitle>Wallet Required</AlertTitle><AlertDescription>Connect your wallet to mint.</AlertDescription></Alert><WalletConnection /></div>
                    ) : campaign.status !== CampaignStatus.ACTIVE ? (
                      <Alert className="bg-amber-500/10 border-amber-500/20"><AlertTriangle className="h-4 w-4 text-amber-500" /><AlertTitle>Campaign {campaign.status.toLowerCase()}</AlertTitle><AlertDescription>{campaign.status === CampaignStatus.SCHEDULED ? `Starts on ${formatDate(campaign.startDate)}.` : "Not currently active."}</AlertDescription></Alert>
                    ) : campaign.totalMinted >= campaign.mintLimit ? (
                      <Alert className="bg-amber-500/10 border-amber-500/20"><AlertTriangle className="h-4 w-4 text-amber-500" /><AlertTitle>Fully Minted</AlertTitle><AlertDescription>All NFTs from this campaign have been minted.</AlertDescription></Alert>
                    ) : userRemainingMints <= 0 ? (
                      <Alert className="bg-amber-500/10 border-amber-500/20"><AlertTriangle className="h-4 w-4 text-amber-500" /><AlertTitle>Mint Limit Reached</AlertTitle><AlertDescription>You've reached your minting limit for this campaign ({campaign.mintLimitPerWallet} NFTs).</AlertDescription></Alert>
                    ) : chainId?.toString() !== campaign.contractNetwork ? (
                      <div className="space-y-3"><Alert className="bg-amber-500/10 border-amber-500/20"><AlertTriangle className="h-4 w-4 text-amber-500" /><AlertTitle>Wrong Network</AlertTitle><AlertDescription>Switch to {campaign.contractNetwork === sepolia.id.toString() ? "Sepolia Testnet" : `Network ${campaign.contractNetwork}`} to mint.</AlertDescription></Alert><Button onClick={handleSwitchNetwork} disabled={isSwitchingNetwork || !switchChain} className="w-full bg-gradient-primary hover:opacity-90">{isSwitchingNetwork ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}Switch Network</Button>{switchNetworkError && <p className="text-sm text-destructive">{switchNetworkError.message}</p>}</div>
                    ) : campaign.accessControl.accessType === 'ALLOWLIST' && !isAllowlisted ? (
                      <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Not Allowlisted</AlertTitle><AlertDescription>Your wallet is not on the allowlist for this campaign.</AlertDescription></Alert>
                    ) : campaign.accessControl.requiresEmail && !isEmailVerified ? (
                      <EmailVerification onVerify={handleEmailVerify} isVerifying={isVerifyingAccess} campaignName={campaign.name} />
                    ) : campaign.accessControl.requiresCode && !isCodeVerified ? (
                      <AccessCodeVerification onVerify={handleCodeVerify} isVerifying={isVerifyingAccess} campaignName={campaign.name} />
                    ) : (
                      <div className="space-y-6">
                        {campaign.mintLimitPerWallet > 1 && (
                            <div className="space-y-2">
                                <label htmlFor="quantity" className="text-sm font-medium flex justify-between">
                                    <span>Quantity</span>
                                    <span className="text-muted-foreground">{mintQuantity} NFT{mintQuantity > 1 ? 's' : ''}</span>
                                </label>
                                <Input id="quantity" type="range" min="1" max={Math.min(userRemainingMints, 10)} value={mintQuantity} onChange={(e) => setMintQuantity(parseInt(e.target.value))} className="w-full accent-[var(--primary-company,var(--primary))]" />
                                <div className="flex justify-between text-xs text-muted-foreground"><span>1</span><span>Max: {Math.min(userRemainingMints, 10)}</span></div>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <InfoBox label="You've Minted" value={userMintCount} />
                          <InfoBox label="Remaining for You" value={userRemainingMints} />
                        </div>
                        {mintingStatus === 'idle' ? (
                          <Button onClick={handleMint} className="w-full h-12 text-lg bg-gradient-to-r from-[var(--primary-company,var(--primary))] to-[var(--accent-company,var(--accent))] hover:opacity-90 text-primary-foreground" disabled={!canMint}><Sparkles className="h-5 w-5 mr-2" />Mint {mintQuantity > 1 ? `${mintQuantity} NFTs` : "NFT"}</Button>
                        ) : (
                          <div className="space-y-4">
                            <div className="space-y-2"><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{mintingStatus === 'preparing' ? "Preparing..." : mintingStatus === 'minting' ? "Minting..." : mintingStatus === 'success' ? "Success!" : "Error"}</span><span className="font-medium">{Math.round(mintingProgress)}%</span></div><Progress value={mintingProgress} className="h-2" /></div>
                            {transactionHash && <div className="space-y-2"><div className="flex items-center justify-between"><p className="text-sm font-medium">Transaction Hash</p><Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => copyValue(transactionHash, "Transaction hash")}><Copy className="h-3 w-3 mr-1" />Copy</Button></div><code className="block bg-muted p-2 rounded-lg text-xs overflow-x-auto">{transactionHash}</code></div>}
                            {mintingStatus === 'success' && <Alert className="bg-green-500/10 border-green-500/20"><CheckCircle className="h-4 w-4 text-green-500" /><AlertTitle>Success!</AlertTitle><AlertDescription>{mintQuantity > 1 ? `${mintQuantity} NFTs minted!` : "NFT minted!"} Token ID: {mintedTokenId}</AlertDescription></Alert>}
                            {mintingStatus === 'error' && mintingError && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Minting Failed</AlertTitle><AlertDescription>{mintingError}</AlertDescription></Alert>}
                            <div className="flex gap-3">
                              {mintingStatus === 'success' ? (<><Button variant="outline" className="flex-1" onClick={() => { setMintingStatus('idle'); setMintingProgress(0); setTransactionHash(null); setMintedTokenId(null); fetchCampaignData(); }}>Mint Another</Button><Button className="flex-1 bg-gradient-primary hover:opacity-90" onClick={() => setShowNFTDetailsDialog(true)}>View NFT<ArrowRight className="h-4 w-4 ml-2" /></Button></>)
                                : mintingStatus === 'error' ? (<Button variant="outline" className="w-full" onClick={() => { setMintingStatus('idle'); setMintingProgress(0); setMintingError(null); }}>Try Again</Button>)
                                : (<Button disabled className="w-full"><Loader2 className="h-5 w-5 mr-2 animate-spin" />{mintingStatus === 'preparing' ? "Preparing..." : "Minting..."}</Button>)}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Button variant="outline" className="w-full" onClick={shareCampaign}><Share2 className="h-4 w-4 mr-2" />Share Campaign</Button>
                <Card className="overflow-hidden border-0 card-shadow">
                  <CardHeader className="pb-2"><CardTitle className="text-lg">About {company.name}</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shadow">
                        {company.branding?.logoImage ? <img src={company.branding.logoImage} alt={company.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-gradient-primary flex items-center justify-center"><span className="text-lg font-bold text-white">{company.name.substring(0, 2).toUpperCase()}</span></div>}
                      </div>
                      <div><h3 className="font-medium">{company.name}</h3>{company.website && <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground flex items-center"><ExternalLink className="h-3 w-3 mr-1" />Website</a>}</div>
                    </div>
                    {company.description && <p className="text-sm text-muted-foreground">{company.description}</p>}
                    <Button variant="outline" className="w-full text-sm" asChild><Link href={`/company/${company.slug}`}>View All Campaigns from {company.name}</Link></Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
      </div>
      
      <Dialog open={showNFTDetailsDialog} onOpenChange={setShowNFTDetailsDialog}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Your Minted NFT</DialogTitle><DialogDescription>NFT #{mintedTokenId} successfully minted to your wallet.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-lg aspect-square bg-muted shadow-inner"><img src={campaign.nftConfig.image || "https://via.placeholder.com/300"} alt={campaign.nftConfig.name} className="w-full h-full object-cover" /></div>
            <div className="space-y-1"><h3 className="font-bold text-lg">{campaign.nftConfig.name} #{mintedTokenId}</h3><p className="text-sm text-muted-foreground">{campaign.nftConfig.description}</p></div>
            {campaign.nftConfig.attributes && campaign.nftConfig.attributes.length > 0 && <div className="space-y-2"><p className="text-sm font-medium">Attributes</p><div className="grid grid-cols-2 gap-2">{campaign.nftConfig.attributes.map((attr, i) => <AttributeTag key={i} attribute={attr} />)}</div></div>}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowNFTDetailsDialog(false)}>Close</Button>
              {campaign.nftConfig.redeemable && <Button className="flex-1 bg-gradient-to-r from-[var(--primary-company,var(--primary))] to-[var(--accent-company,var(--accent))] hover:opacity-90 text-primary-foreground" onClick={() => { setShowNFTDetailsDialog(false); setShowRedeemDialog(true); }}><Gift className="h-4 w-4 mr-2" />Redeem</Button>}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showRedeemDialog} onOpenChange={setShowRedeemDialog}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Redeem Your NFT</DialogTitle><DialogDescription>Redeem NFT #{mintedTokenId} for "{campaign.nftConfig.name}" for exclusive benefits.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <Alert className="bg-accent/10 border-accent/20"><Gift className="h-4 w-4 text-accent" /><AlertTitle>Redeemable NFT #{mintedTokenId}</AlertTitle><AlertDescription>This NFT can be redeemed for exclusive benefits or rewards as described by {company.name}.</AlertDescription></Alert>
            <div className="space-y-1"><label htmlFor="redemption-info" className="text-sm font-medium">Additional Information (Optional)</label><Textarea id="redemption-info" placeholder="E.g., shipping address, preferences..." rows={3} value={redemptionInfo} onChange={(e) => setRedemptionInfo(e.target.value)} /><p className="text-xs text-muted-foreground">This information will be shared with {company.name}.</p></div>
            <DialogFooter className="gap-2 sm:gap-0"><Button variant="outline" onClick={() => setShowRedeemDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-[var(--primary-company,var(--primary))] to-[var(--accent-company,var(--accent))] hover:opacity-90 text-primary-foreground" onClick={handleRedeemSubmit}><Gift className="h-4 w-4 mr-2" />Submit Redemption</Button></DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const InfoItem = ({ label, value, paragraph = false }: { label: string, value: string | React.ReactNode, paragraph?: boolean }) => (
  <div className="space-y-0.5">
    <p className="text-xs text-muted-foreground">{label}</p>
    {paragraph ? <p className="font-medium leading-relaxed">{value}</p> : <p className="font-medium">{value}</p>}
  </div>
);

const InfoBox = ({ label, value }: { label: string, value: string | number }) => (
    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-xl font-bold">{value}</p>
    </div>
);

// Loading skeleton
function CampaignPageSkeleton() {
  return (
    <div className="container mx-auto px-4 animate-pulse">
      <div className="mb-6"><Skeleton className="h-10 w-32 rounded-md" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2"><Skeleton className="h-6 w-1/4 rounded" /><Skeleton className="h-10 w-3/4 rounded" /><Skeleton className="h-4 w-full rounded" /><Skeleton className="h-4 w-2/3 rounded" /></div>
          <Skeleton className="h-72 w-full rounded-xl" />
          <div className="grid grid-cols-3 gap-3">{[...Array(3)].map((_, i) => (<Skeleton key={i} className="h-32 w-full rounded-lg" />))}</div>
          <div className="space-y-4"><Skeleton className="h-10 w-full rounded-md" /><Skeleton className="h-4 w-full rounded" /><Skeleton className="h-4 w-3/4 rounded" /><div className="grid grid-cols-2 gap-4"><Skeleton className="h-16 w-full rounded-lg" /><Skeleton className="h-16 w-full rounded-lg" /></div></div>
        </div>
        <div className="lg:col-span-5 space-y-6">
          <Skeleton className="h-[500px] w-full rounded-xl" /> {/* Increased height for mint card */}
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

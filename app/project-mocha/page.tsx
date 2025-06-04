// pages/index.tsx
'use client';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { AnimatePresence, motion } from 'framer-motion';
import QRCode from 'qrcode';
import { createCoffeeConfetti } from '@/components/Confetti';
import { FloatingCoffeeParticles } from '@/components/CoffeeAnimation/FloatingParticles';
import { CoffeeAnimation } from '@/components/CoffeeAnimation';
import { MintingSection } from '@/components/MintingSection';
import { SuccessSection } from '@/components/SuccessSection';
import { TokenData } from '@/components/NFTCard/types';
import { ConnectButton } from 'thirdweb/react';
import { client } from '@/config/client';
import { useRouter } from 'next/navigation';
import { useContract } from '@/hooks/useContract';
import { useAddressInfo } from '@/hooks/use-address-info';
import { useContractInfo } from '@/hooks/use-contract-info';
import { useTheme } from '@/context/ThemeContext';
import { useProfiles } from "thirdweb/react";
import { useActiveAccount } from 'thirdweb/react';
import { authService } from '@/app/api/useAuth';
import { signLoginPayload } from 'thirdweb/auth';
import { generatePayload, verifyPayload } from '@/app/api/auth';
import customWallets from '@/config/connect-widget';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFingerprint, faTimes } from '@fortawesome/free-solid-svg-icons';

// Custom Modal Component (same as homepage)
const CustomModal = ({ isOpen, onClose, children, theme }: { isOpen: boolean, onClose: () => void, children: React.ReactNode, theme: any }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          style={{ backgroundColor: `${theme.colors.background}80` }}
        />

        {/* Modal Content */}
        <motion.div
          className="relative z-10 w-full max-w-md rounded-2xl p-8 shadow-2xl"
          style={{
            backgroundColor: theme.colors.background,
            color: theme.colors.text
          }}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-opacity-10 hover:bg-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{ color: theme.colors.text }}
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>

          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

function ProjectMochaPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const [isTokenMinted, setIsTokenMinted] = useState(false);
    const [isMinting, setIsMinting] = useState(false);
    const [tokenData, setTokenData] = useState<TokenData | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [mounted, setMounted] = useState(false);
    const [showCoffeeAnimation, setShowCoffeeAnimation] = useState(false);
    const [showFloatingParticles, setShowFloatingParticles] = useState(false);
    const [mintLimitReached, setMintLimitReached] = useState(false);

    // Authentication state (same as homepage)
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [authStatus, setAuthStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [authError, setAuthError] = useState('');
    const account = useActiveAccount();
    const address = account?.address;

    // Get account and profiles at the top level (same as homepage)
    const { data: profiles } = useProfiles({
        client
    });

    const {
        account: contractAccount,
        status,
        connectWallet,
        mintToken,
        isConnected,
        tokenMinted
    } = useContract();

    // Get user's address info to check remaining mints
    const { data: addressInfo, refetch: refetchAddressInfo } = useAddressInfo(contractAccount as `0x${string}`);

    // Get contract info to get mint limit
    const contractInfo = useContractInfo();

    useEffect(() => {
        setMounted(true);

        // Check authentication on mount (same as homepage logic)
        if (!authService.isAuthenticated()) {
            router.push('/');
            return;
        }
    }, []);

    // Authentication check when wallet connects (same as homepage)
    useEffect(() => {
        if (address) {
            if (!localStorage.getItem('walletAddress')) {
                localStorage.setItem('walletAddress', address);
            }
            // If not authenticated, redirect to homepage
            if (!authService.isAuthenticated()) {
                router.push('/');
            }
        }
    }, [address]);

    // Check if user has reached minting limit
    useEffect(() => {
        if (addressInfo) {
            setMintLimitReached(addressInfo.remainingMints === 0);
        }
    }, [addressInfo]);

    const handleMintToken = async () => {
        if (!isConnected) {
            await connectWallet();
            if (!isConnected) return;  // If still not connected, exit
        }

        // Check if user has reached minting limit
        if (mintLimitReached || (addressInfo && addressInfo.remainingMints === 0)) {
            alert("You have reached your maximum minting limit. Your minting tokens are complete!");
            return;
        }

        setIsMinting(true);
        setShowCoffeeAnimation(true);

        try {
            // Call the actual mintToken function from the hook
            const receipt = await mintToken();
            console.log("Minting token...", receipt);

            // Refetch address info to get updated remaining mints
            await refetchAddressInfo();

            // Generate token data after successful minting
            const tokenId = 'MOJA' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
            const now = new Date();
            const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            const rarity = 'Coffee Cup';

            // Calculate user's total redemptions (based on tokens minted)
            const totalUserTokens = addressInfo?.totalMinted || 1;
            const totalUserRedemptions = totalUserTokens; // Each token gives 1 redemption
            const usedUserRedemptions = 0; // This would come from backend tracking in real implementation

            const newTokenData: TokenData = {
                id: tokenId,
                type: 'Mocha Coffee Token',
                issuer: 'Project Mocha',
                timestamp: Date.now(),
                mintedDate: now.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                }),
                mintedTime: now.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                validUntil: validUntil.toISOString(),
                validUntilFormatted: validUntil.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }),
                redemptions: 0,
                maxRedemptions: 1,
                totalUserRedemptions: totalUserRedemptions,
                usedUserRedemptions: usedUserRedemptions,
                value: 'FREE',
                rarity: rarity
            };

            // Generate enhanced QR code with wallet address, token ID, and contract address
            const qrData = {
                walletAddress: contractAccount,
                tokenId: tokenId,
                contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
                timestamp: Date.now(),
                type: 'coffee-token'
            };

            // Generate proper QR code using QRCode library
            try {
                const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
                    errorCorrectionLevel: 'M',
                    margin: 2,
                    width: 300,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
                setQrCodeUrl(qrCodeDataURL);
            } catch (qrError) {
                console.error('QR Code generation error:', qrError);
                // Fallback to simple string if QR generation fails
                setQrCodeUrl(`${contractAccount}-${tokenId}-${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`);
            }
            setTokenData(newTokenData);
            setShowCoffeeAnimation(false);

            // Trigger confetti and success animations
            createCoffeeConfetti();
            setShowFloatingParticles(true);
            setIsTokenMinted(true);

            // Stop floating particles after 5 seconds
            setTimeout(() => {
                setShowFloatingParticles(false);
            }, 5000);

        } catch (error) {
            console.error('Error minting token:', error);
            setShowCoffeeAnimation(false);
        } finally {
            setIsMinting(false);
        }
    };

    const resetMinting = () => {
        setIsTokenMinted(false);
        setTokenData(null);
        setQrCodeUrl('');
        setShowFloatingParticles(false);
    };

    const handleLogout = () => {
        authService.logout();
        router.push('/');
    };

    const handleAuth = async () => {
        try {
            if (!profiles && !address) return;
            console.log(address);
            setAuthStatus('loading');

            const nonce = await authService.getNonce();
            console.log('Got nonce:', nonce);

            if (!nonce) {
                setAuthStatus('error');
                setAuthError('Failed to get nonce');
                return;
            }
            // For demo purposes, we'll simulate this step
            const message = `I am signing this message to authenticate with Crefy. Nonce: ${nonce}`;
            if (!account) {
                throw new Error('Account is undefined');
            }
            const payload = await generatePayload({
                address: account?.address,
                chainId: 17000,
            });

            const signatureResponse = await signLoginPayload({
                payload,
                account
            });
            console.log('signature', signatureResponse.signature);

            const finalResult = await verifyPayload(signatureResponse);

            console.log('finalResult', finalResult);

            // Send to server for verification
            const authResponse = await authService.login(message, signatureResponse, address as any);

            setAuthStatus('success');
            setModalIsOpen(false);

            // Continue with the page after authentication
        } catch (error) {
            console.error('Authentication error:', error);
            setAuthStatus('error');
            setAuthError(error instanceof Error ? error.message : 'Authentication failed');
        }
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setAuthStatus('idle');
        setAuthError('');
    };

    // Wallet connection function that returns the ConnectButton component (aligned with homepage)
    const getWalletConnection = () => {
        return (
            <div className="connect-button-wrapper">
                <ConnectButton
                    client={client}
                    wallets={customWallets}
                    connectModal={{ size: "compact" }}
                    signInButton={{
                        label: "Sign in with Crefy",
                        style: {
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            borderRadius: '12px',
                            padding: '8px 16px',
                            color: 'white',
                        }
                    }}
                    connectButton={{
                        label: "Connect Wallet",
                        style: {
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            borderRadius: '12px',
                            padding: '12px 24px',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '16px',
                            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s ease',
                            minWidth: '160px'
                        }
                    }}
                    theme='light'
                    appMetadata={{
                        name: "Crefy",
                        url: "https://crefy.xyz",
                    }}
                />
            </div>
        );
    };

    if (!mounted) return null;

    return (
        <>
            <Head>
                <title>Project Moja - Premium Coffee Tokens</title>
                <meta name="description" content="Mint your premium Mocha Coffee Token and redeem at participating locations" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900 to-orange-900 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=`60` height=`60` viewBox=`0 0 60 60` xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.03'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

                {/* Top Navigation Bar */}
                <motion.nav
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-30 flex justify-between items-center p-6"
                >
                    <div className="flex items-center space-x-3 w-[300px]">
                        <img
                            src='https://res.cloudinary.com/dswyz4vpp/image/upload/v1748690339/crefy/ejr2jnzdotpsziok2itq.png'
                            className='h-[60px]'
                            alt="Project Mocha Logo"
                        />
                    </div>

                    <div className="flex items-center space-x-4">
                        {getWalletConnection()}
                        <button
                            onClick={() => router.push('/')}
                            className="px-4 py-2 text-amber-200 hover:text-white transition-colors duration-300 text-sm font-medium"
                        >
                            Home
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600/20 text-red-200 hover:bg-red-600/30 hover:text-white transition-colors duration-300 text-sm font-medium rounded-lg border border-red-500/30"
                        >
                            Logout
                        </button>
                    </div>
                </motion.nav>

                {/* Floating Coffee Particles */}
                <FloatingCoffeeParticles isActive={showFloatingParticles} />

                {/* Floating Orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-32 h-32 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-full blur-xl"
                            animate={{
                                x: [0, 100, 0],
                                y: [0, -50, 0],
                                scale: [1, 1.2, 1],
                            }}
                            transition={{
                                duration: 8 + i * 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 1.5
                            }}
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                        />
                    ))}
                </div>

                <div className="relative container mx-auto px-4 py-6 max-w-md z-20">
                    {/* Header */}
                    <motion.header
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-center mb-8"
                    >
                        {!isTokenMinted ? (
                            <>
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    Mint Your Coffee Token
                                </h2>
                                <p className="text-amber-200 text-sm opacity-90">
                                    Redeem at participating locations worldwide
                                </p>
                                {tokenMinted !== undefined && (
                                    <p className="text-amber-100 mt-2">
                                        Coffee Minted: {tokenMinted.toString()}
                                    </p>
                                )}
                                {status && (
                                    <p className="text-amber-100 mt-1 text-sm">
                                        {status}
                                    </p>
                                )}
                            </>
                        ) : (
                            <h2 className="text-3xl font-bold text-white mb-2">
                                Success! Your Coffee Token is Minted
                            </h2>
                        )}
                    </motion.header>

                    {/* Main Card */}
                    <div className={`bg-white/10 backdrop-blur-2xl ${!isTokenMinted ? 'p-8' : ''} rounded-3xl shadow-2xl shadow-black/20 mb-8 border border-white/20 relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none"></div>

                        <motion.div
                            key="mint-section"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4 }}
                            className={showCoffeeAnimation ? 'opacity-20 transition-opacity duration-500' : 'opacity-100'}
                        >
                            {/* Coffee Animation Overlay */}
                            <CoffeeAnimation isPlaying={showCoffeeAnimation} size={180} />

                            <AnimatePresence mode="wait">
                                {!isTokenMinted ? (
                                    <MintingSection
                                        isMinting={isMinting}
                                        onMintClick={handleMintToken}
                                        mintLimitReached={mintLimitReached}
                                        remainingMints={addressInfo?.remainingMints}
                                        totalMinted={addressInfo?.totalMinted}
                                        mintLimit={contractInfo.mintLimit}
                                    />
                                ) : tokenData ? (
                                    <SuccessSection
                                        tokenData={tokenData}
                                        qrCodeUrl={qrCodeUrl}
                                        onResetClick={resetMinting}
                                    />
                                ) : null}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* Footer */}
                    <motion.footer
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="text-center text-sm text-gray-400"
                    >
                        <p className="mb-2">
                            &copy; 2025 Project Mocha |
                            <span className="text-amber-400 font-semibold"> Crafted with passion</span>
                        </p>
                        <p className="text-xs opacity-75">
                            For coffee enthusiasts worldwide
                        </p>
                        <p className="text-xs opacity-75">
                            Built with ❤️ by <a href="https://utopia.com" className="text-amber-400 font-semibold">Utopia</a>
                        </p>
                    </motion.footer>
                </div>

                {/* Custom CSS for Wallet Connect Button Hover Effects */}
                <style jsx>{`
                    .connect-button-wrapper {
                        position: relative;
                    }

                    .connect-button-wrapper::before {
                        content: '';
                        position: absolute;
                        inset: -2px;
                        background: linear-gradient(135deg, #f59e0b, #d97706, #b45309);
                        border-radius: 14px;
                        opacity: 0;
                        transition: opacity 0.3s ease;
                        z-index: -1;
                    }

                    .connect-button-wrapper:hover::before {
                        opacity: 0.7;
                    }

                    .connect-button-wrapper button:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4) !important;
                    }
                `}</style>

                {/* Custom Auth Modal (same as homepage) */}
                <CustomModal isOpen={modalIsOpen} onClose={closeModal} theme={theme}>
                    <div className="flex flex-col items-center">
                        <motion.div
                            animate={{
                                scale: authStatus === 'loading' ? [1, 1.1, 1] : 1,
                                transition: authStatus === 'loading' ? { repeat: Infinity, duration: 1.5 } : {}
                            }}
                        >
                            <FontAwesomeIcon
                                icon={faFingerprint}
                                size="3x"
                                style={{
                                    color:
                                        authStatus === 'success' ? '#4CAF50' :
                                            authStatus === 'error' ? '#F44336' :
                                                theme.colors.primary
                                }}
                                className="mb-6"
                            />
                        </motion.div>

                        <h2 className="text-2xl font-bold mb-4 text-center">
                            {authStatus === 'idle' && 'Authenticate with Wallet'}
                            {authStatus === 'loading' && 'Verifying...'}
                            {authStatus === 'success' && 'Authentication Successful!'}
                            {authStatus === 'error' && 'Authentication Failed'}
                        </h2>

                        {authStatus === 'idle' && (
                            <>
                                <p className="text-center mb-6" style={{ color: theme.colors.secondaryText }}>
                                    Connect your wallet to verify your identity securely using zero-knowledge proofs.
                                </p>
                                <ConnectButton
                                    client={client}
                                    wallets={customWallets}
                                    connectModal={{ size: "compact" }}
                                    connectButton={{
                                        label: "Connect Wallet",
                                        style: {
                                            background: theme.colors.primary,
                                            border: 'none',
                                            borderRadius: '12px',
                                            padding: '12px 24px',
                                            color: 'white',
                                            fontSize: '1rem',
                                            fontWeight: '600'
                                        }
                                    }}
                                    theme='light'
                                    appMetadata={{
                                        name: "Crefy",
                                        url: "https://crefy.xyz",
                                    }}
                                />
                            </>
                        )}

                        {authStatus === 'loading' && (
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                                <div
                                    className="h-2.5 rounded-full"
                                    style={{
                                        backgroundColor: theme.colors.primary,
                                        width: '70%',
                                        animation: 'pulse 2s infinite'
                                    }}
                                />
                            </div>
                        )}

                        {authStatus === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center"
                            >
                                <p className="mb-6" style={{ color: theme.colors.secondaryText }}>
                                    Authentication successful! You can now access Project Mocha.
                                </p>
                                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            </motion.div>
                        )}

                        {authStatus === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center"
                            >
                                <p className="mb-4 text-red-500">{authError}</p>
                                <button
                                    onClick={() => setAuthStatus('idle')}
                                    className="px-4 py-2 rounded-md transition-colors duration-200 hover:opacity-90"
                                    style={{
                                        backgroundColor: theme.colors.primary,
                                        color: 'white'
                                    }}
                                >
                                    Try Again
                                </button>
                            </motion.div>
                        )}
                    </div>
                </CustomModal>
            </div>
        </>
    );
}

export default function Home() {
    return <ProjectMochaPage />;
}
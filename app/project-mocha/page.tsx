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

export default function Home() {
    const router = useRouter();
    const [isTokenMinted, setIsTokenMinted] = useState(false);
    const [isMinting, setIsMinting] = useState(false);
    const [tokenData, setTokenData] = useState<TokenData | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [mounted, setMounted] = useState(false);
    const [showCoffeeAnimation, setShowCoffeeAnimation] = useState(false);
    const [showFloatingParticles, setShowFloatingParticles] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const mintToken = async () => {
        setIsMinting(true);
        setShowCoffeeAnimation(true);

        // Simulate minting process
        setTimeout(async () => {
            const tokenId = 'MOJA' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
            const now = new Date();
            const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            const rarities = ['Common', 'Rare', 'Epic', 'Legendary'];
            const weights = [0.6, 0.25, 0.1, 0.05]; // Weighted probabilities
            let random = Math.random();
            let rarityIndex = 0;

            for (let i = 0; i < weights.length; i++) {
                random -= weights[i];
                if (random <= 0) {
                    rarityIndex = i;
                    break;
                }
            }

            const rarity = rarities[rarityIndex];

            const newTokenData: TokenData = {
                id: tokenId,
                type: 'Mocha Coffee Token',
                issuer: 'Project Moja',
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
                maxRedemptions: rarity === 'Legendary' ? 5 : rarity === 'Epic' ? 4 : rarity === 'Rare' ? 3 : 2,
                value: 'FREE',
                rarity: rarity
            };

            // Generate QR code
            try {
                const qrUrl = await QRCode.toDataURL(JSON.stringify(newTokenData), {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#1f2937',
                        light: '#ffffff'
                    },
                    errorCorrectionLevel: 'M'
                });

                setQrCodeUrl(qrUrl);
                setTokenData(newTokenData);
                setShowCoffeeAnimation(false);

                // Trigger confetti and success animations
                createCoffeeConfetti();
                setShowFloatingParticles(true);

                setTimeout(() => {
                    setIsTokenMinted(true);
                    setIsMinting(false);
                }, 500);

                // Stop floating particles after 5 seconds
                setTimeout(() => {
                    setShowFloatingParticles(false);
                }, 5000);

            } catch (err) {
                console.error('Error generating QR code:', err);
                setIsMinting(false);
                setShowCoffeeAnimation(false);
            }
        }, 2000);
    };

    const resetMinting = () => {
        setIsTokenMinted(false);
        setTokenData(null);
        setQrCodeUrl('');
        setShowFloatingParticles(false);
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

                {/* Top Navigation Bar with Connect Button */}
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
                            alt="Project Moja Logo"
                        />
                        {/* <div>
                            <h1 className="text-white font-bold text-lg">Project Mocha</h1>
                            <p className="text-amber-300 text-xs">Premium Coffee Experience</p>
                        </div> */}
                    </div>

                    <div className="connect-button-wrapper">
                        <ConnectButton
                            client={client}
                            appMetadata={{
                                name: "Crefy",
                                url: "https://crefy.xyz",
                            }}
                            onDisconnect={() => {
                                router.push('/');
                            }}
                            theme="light"
                            connectButton={{
                                label: "Sign In",
                                style: {
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    border: '1px solid rgba(245, 158, 11, 0.3)',
                                    borderRadius: '12px',
                                    padding: '8px 16px',
                                    color: 'white',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    maxWidth: '30px',
                                    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.3s ease',
                                }
                            }}
                            connectModal={{
                                size: 'compact',
                                titleIcon: 'https://res.cloudinary.com/dswyz4vpp/image/upload/v1748564362/crefy/lp7qfnz5unxegn9w1v9k.jpg'
                            }}
                        />
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
                    {/* Header - Simplified since logo moved to nav */}
                    <motion.header
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-center mb-8"
                    >
                        <h2 className="text-3xl font-bold text-white mb-2">
                            Mint Your Coffee Token
                        </h2>
                        <p className="text-amber-200 text-sm opacity-90">
                            Redeem at participating locations worldwide
                        </p>
                    </motion.header>

                    {/* Main Card */}
                    <div className={`bg-white/10 backdrop-blur-2xl ${!isTokenMinted ? 'p-8' : ''} rounded-3xl shadow-2xl shadow-black/20  mb-8 border border-white/20 relative overflow-hidden`}>
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
                                        onMintClick={mintToken}
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
                            &copy; 2025 Project Moja |
                            <span className="text-amber-400 font-semibold"> Crafted with passion</span>
                        </p>
                        <p className="text-xs opacity-75">
                            For coffee enthusiasts worldwide
                        </p>
                        {/* show that is product was build with utopia */}
                    </motion.footer>
                </div>

                {/* Custom CSS for Connect Button Hover Effects */}
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
            </div>
        </>
    );
}
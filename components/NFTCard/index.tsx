// components/NFTCard/index.tsx
'use client';
import { motion } from 'framer-motion';
import { TokenData } from './types';
import { QRCodeSection } from '@/components/NFTCard/QRCodeSection';
import { TokenStats } from '@/components/NFTCard/TokenStats';
import Lottie from 'lottie-react';
import coffee2Animation from '@/public/animations/coffee2-animation.json';

const getRarityColor = (rarity: string) => {
    switch (rarity) {
        case 'Legendary': return 'from-purple-600 to-pink-600';
        case 'Epic': return 'from-purple-500 to-blue-500';
        case 'Rare': return 'from-blue-500 to-cyan-500';
        default: return 'from-amber-500 to-orange-500';
    }
};

const getRarityBg = (rarity: string) => {
    switch (rarity) {
        case 'Legendary': return 'bg-purple-900/20 text-purple-200 border-purple-400/30';
        case 'Epic': return 'bg-blue-900/20 text-blue-200 border-blue-400/30';
        case 'Rare': return 'bg-cyan-900/20 text-cyan-200 border-cyan-400/30';
        default: return 'bg-amber-900/30 text-amber-200 border-amber-400/40';
    }
};

export const NFTCard = ({ tokenData, qrCodeUrl }: { tokenData: TokenData, qrCodeUrl: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, rotateY: -15 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="m-w-full"
        >
            <div className="rounded-3xl overflow-hidden relative backdrop-blur-sm bg-gradient-to-br from-amber-900/40 via-orange-900/50 to-amber-800/60 shadow-2xl border border-amber-400/20">

                {/* Success indicator
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-green-500 rounded-full p-2 shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div> */}

                {/* Header with success message */}
                <div className="relative p-6 pb-4 pt-12">
                    {/* <div className="text-center mb-6">
                        <Lottie animationData={coffee2Animation} loop={true} />
                    </div> */}

                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <img
                                src='https://res.cloudinary.com/dswyz4vpp/image/upload/v1748564362/crefy/lp7qfnz5unxegn9w1v9k.jpg'
                                className='w-12 h-12 rounded-full border-2 border-amber-300/60 shadow-lg'
                                alt="Project Moja Logo"
                            />
                            <div>
                                <h3 className="text-amber-100 font-bold text-lg">Project Moja</h3>
                                <p className="text-amber-300/80 text-xs">Coffee NFT</p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${getRarityBg(tokenData.rarity)}`}>
                            {tokenData.rarity}
                        </span>
                    </div>

                    {/* Token ID and Title */}
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-200 mb-3">
                            Mocha Coffee Token
                        </h2>
                        <div className="bg-amber-950/60 backdrop-blur-sm rounded-xl px-4 py-3 inline-block border border-amber-400/20">
                            <p className="text-amber-300/80 text-sm mb-1">Token ID</p>
                            <p className="text-amber-200 font-mono font-bold text-lg tracking-wider">{tokenData.id}</p>
                        </div>
                    </div>
                </div>

                <QRCodeSection qrCodeUrl={qrCodeUrl} />
                <TokenStats tokenData={tokenData} />

                {/* Footer */}
                <div className="bg-amber-950/40 backdrop-blur-sm px-6 py-4 border-t border-amber-400/10">
                    <div className="flex items-center justify-between text-xs text-amber-300/70">
                        <span>Valid Until</span>
                        <span className="text-amber-200 font-medium">{tokenData.validUntil || 'Fri, Jun 6, 2025'}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
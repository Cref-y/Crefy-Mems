// components/NFTCard/index.tsx
'use client';
import { motion } from 'framer-motion';
import { TokenData } from './types';
import { QRCodeSection } from '@/components/NFTCard/QRCodeSection';
import { TokenStats } from '@/components/NFTCard/TokenStats';
import { useState, useEffect } from 'react';

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

const getCardBg = (rarity: string) => {
    switch (rarity) {
        case 'Legendary': return 'bg-gradient-to-br from-purple-900/40 via-pink-900/50 to-purple-800/60 border-purple-400/20';
        case 'Epic': return 'bg-gradient-to-br from-blue-900/40 via-indigo-900/50 to-blue-800/60 border-blue-400/20';
        case 'Rare': return 'bg-gradient-to-br from-cyan-900/40 via-teal-900/50 to-cyan-800/60 border-cyan-400/20';
        default: return 'bg-gradient-to-br from-amber-900/40 via-orange-900/50 to-amber-800/60 border-amber-400/20';
    }
};

// Confetti Component
const Confetti = () => {
    const [confettiPieces, setConfettiPieces] = useState<Array<{
        id: number;
        x: number;
        y: number;
        rotation: number;
        color: string;
        size: number;
        delay: number;
    }>>([]);

    useEffect(() => {
        const colors = ['#FFD700', '#FF6B35', '#F7931E', '#FFB347', '#FFAA1D', '#FFA500'];
        const pieces = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: -10,
            rotation: Math.random() * 360,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 6 + 3,
            delay: Math.random() * 2
        }));
        setConfettiPieces(pieces);

        const timer = setTimeout(() => {
            setConfettiPieces([]);
        }, 180000); // 3 minutes in milliseconds

    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {confettiPieces.map((piece) => (
                <motion.div
                    key={piece.id}
                    className="absolute w-2 h-2 rounded-sm"
                    style={{
                        backgroundColor: piece.color,
                        width: piece.size,
                        height: piece.size,
                        left: `${piece.x}%`,
                    }}
                    initial={{
                        y: -20,
                        rotation: piece.rotation,
                        opacity: 1
                    }}
                    animate={{
                        y: window.innerHeight + 50,
                        rotation: piece.rotation + 360,
                        opacity: [1, 1, 0.8, 0]
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        delay: piece.delay,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
};

export const NFTCard = ({ tokenData, qrCodeUrl }: { tokenData: TokenData, qrCodeUrl: string }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className="relative max-w-full w-full">
            {/* Infinite Confetti */}
            <Confetti />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="max-w-full w-full"
            >
                <div
                    className="relative w-full cursor-pointer"
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    {/* Front Side */}
                    <motion.div
                        className={`rounded-3xl overflow-hidden min-h-[500px] relative backdrop-blur-sm shadow-2xl  ${getCardBg(tokenData.rarity)}`}
                        initial={false}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6 }}
                        style={{ backfaceVisibility: 'hidden', position: 'absolute', width: '100%' }}
                    >
                        <div className="relative p-6 pt-12 pb-4">
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

                            <TokenStats tokenData={tokenData} />

                            {/* Outstanding Tap to Reveal Text */}
                            <div className="absolute bottom-4 left-0 right-0 text-center">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        textShadow: [
                                            '0 0 10px rgba(255, 215, 0, 0.8)',
                                            '0 0 20px rgba(255, 215, 0, 1)',
                                            '0 0 10px rgba(255, 215, 0, 0.8)'
                                        ]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="inline-block"
                                >
                                    <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent font-bold text-sm px-4 py-2 rounded-full border-2 border-amber-400/50 bg-amber-900/30 backdrop-blur-sm shadow-lg">
                                        ✨ TAP TO REVEAL QR CODE ✨
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Back Side */}
                    <motion.div
                        className={`rounded-3xl overflow-hidden relative backdrop-blur-sm shadow-2xl ${getCardBg(tokenData.rarity)}`}
                        initial={{ rotateY: 180 }}
                        animate={{ rotateY: isFlipped ? 0 : 180 }}
                        transition={{ duration: 0.6 }}
                        style={{ backfaceVisibility: 'hidden', width: '100%' }}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <img
                                        src='https://res.cloudinary.com/dswyz4vpp/image/upload/v1748564362/crefy/lp7qfnz5unxegn9w1v9k.jpg'
                                        className='w-10 h-10 rounded-full border-2 border-amber-300/60 shadow-lg'
                                        alt="Project Moja Logo"
                                    />
                                    <div>
                                        <h3 className="text-amber-100 font-bold text-md">Project Moja</h3>
                                        <p className="text-amber-300/80 text-xs">Coffee NFT</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${getRarityBg(tokenData.rarity)}`}>
                                    {tokenData.rarity}
                                </span>
                            </div>

                            <QRCodeSection qrCodeUrl={qrCodeUrl} />

                            {/* <div className="mt-4 text-center">
                                <p className="text-xs text-amber-300/60 mb-2">Present this code at checkout</p>
                                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-3">
                                    <p className="text-amber-200 text-sm font-medium">{tokenData.name || 'Mocha Coffee Token'}</p>
                                    <p className="text-amber-300/80 text-xs mt-1">Redemptions: {tokenData.redemptions}/{tokenData.maxRedemptions}</p>
                                </div>
                            </div> */}

                            <div className="absolute bottom-4 left-0 right-0 text-center">
                                <p className="text-xs text-amber-300/60">Tap to return</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};
// components/MintingSection/index.tsx
'use client';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import animationData from '@/public/animations/coffee-animation.json';
import { MintButton } from '@/components/MintButton';

export const MintingSection = ({
    isMinting,
    onMintClick,
    mintLimitReached,
    remainingMints,
    totalMinted,
    mintLimit
}: {
    isMinting: boolean,
    onMintClick: () => void,
    mintLimitReached?: boolean,
    remainingMints?: number,
    totalMinted?: number,
    mintLimit?: number
}) => {
    return (
        <motion.div
            key="mint-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="text-center mb-8 flex flex-col items-center justify-center">
                <Lottie
                    animationData={animationData}
                    loop
                    style={{ height: 100, width: 100 }}
                />

                <motion.h2
                    className="text-3xl font-bold bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Ready for Premium Coffee?
                </motion.h2>
                <motion.p
                    className="text-white/80 leading-relaxed text-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    Mint your exclusive Mocha Coffee Token and present the QR code at any participating premium coffee location to redeem your complimentary artisan coffee.
                </motion.p>

                {/* Minting Status Display */}
                {(remainingMints !== undefined || (totalMinted !== undefined && mintLimit !== undefined)) && (
                    <motion.div
                        className="mt-4 p-3 rounded-lg bg-white/10 backdrop-blur-sm"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        {mintLimitReached ? (
                            <p className="text-red-300 font-medium text-center">
                                ⚠️ Minting limit reached! Your minting tokens are complete.
                            </p>
                        ) : (
                            <div className="text-center">
                                {totalMinted !== undefined && mintLimit !== undefined ? (
                                    <p className="text-amber-200 font-medium">
                                        ☕ {totalMinted} of {mintLimit} mints used
                                    </p>
                                ) : remainingMints !== undefined ? (
                                    <p className="text-amber-200 font-medium">
                                        ☕ Remaining mints: {remainingMints}
                                    </p>
                                ) : null}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {!mintLimitReached && (
                <MintButton
                    isMinting={isMinting}
                    onClick={onMintClick}
                    disabled={mintLimitReached}
                />
            )}
        </motion.div>
    );
};
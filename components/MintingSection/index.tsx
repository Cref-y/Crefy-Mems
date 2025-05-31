// components/MintingSection/index.tsx
'use client';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import animationData from '@/public/animations/coffee-animation.json';
import { MintButton } from '@/components/MintButton';

export const MintingSection = ({
    isMinting,
    onMintClick
}: {
    isMinting: boolean,
    onMintClick: () => void
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
            </div>

            <MintButton isMinting={isMinting} onClick={onMintClick} />
        </motion.div>
    );
};
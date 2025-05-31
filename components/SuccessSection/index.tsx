// components/SuccessSection/index.tsx
'use client';
import { motion } from 'framer-motion';
import { TokenData } from '../NFTCard/types';
import { NFTCard } from '../NFTCard';

export const SuccessSection = ({
    tokenData,
    qrCodeUrl,
    onResetClick
}: {
    tokenData: TokenData,
    qrCodeUrl: string,
    onResetClick: () => void
}) => {
    return (
        <motion.div
            key="token-section"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
        >
            {/* NFT Card */}
            <NFTCard tokenData={tokenData} qrCodeUrl={qrCodeUrl} />

            <motion.button
                onClick={onResetClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 border-2 border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300"
            >
                Mint Another Token
            </motion.button>
        </motion.div>
    );
};
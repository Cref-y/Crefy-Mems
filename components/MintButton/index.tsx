// components/MintButton/index.tsx
'use client';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';

export const MintButton = ({
    isMinting,
    onClick,
    disabled
}: {
    isMinting: boolean,
    onClick: () => void,
    disabled?: boolean
}) => {
    return (
        <motion.button
            onClick={onClick}
            disabled={isMinting || disabled}
            whileHover={!disabled && !isMinting ? { scale: 1.02 } : {}}
            whileTap={!disabled && !isMinting ? { scale: 0.98 } : {}}
            className={`w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg shadow-orange-500/25 ${
                isMinting || disabled ? 'opacity-50 cursor-not-allowed' : ''
            } ${disabled ? 'bg-gray-400 hover:bg-gray-400' : ''}`}
        >
            {isMinting ? (
                <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Brewing Your Token...
                </div>
            ) : disabled ? (
                <div className="flex items-center justify-center">
                    Minting Complete
                </div>
            ) : (
                <div className="flex items-center justify-center">
                    Claim Your Coffee Token
                </div>
            )}
        </motion.button>
    );
};
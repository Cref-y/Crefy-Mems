// components/CoffeeAnimation/index.tsx
'use client';
import { motion } from 'framer-motion';

export const CoffeeAnimation = ({ isPlaying, size = 200 }: { isPlaying: boolean, size?: number }) => {
    if (!isPlaying) return null;

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="relative"
                style={{ width: size, height: size }}
            >
                {/* Coffee Cup with Steam Animation */}
                <div className="relative w-full h-full">
                    {/* Steam lines */}
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 bg-gray-400 rounded-full opacity-60"
                            style={{
                                left: `${45 + i * 5}%`,
                                top: '10%',
                                height: '20%'
                            }}
                            animate={{
                                opacity: [0.6, 0.2, 0.6],
                                scaleY: [1, 1.5, 1],
                                y: [0, -10, 0]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.3
                            }}
                        />
                    ))}

                    {/* Coffee cup body */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-32 bg-gradient-to-br from-amber-100 to-amber-200 rounded-b-3xl border-4 border-amber-600">
                        {/* Coffee liquid */}
                        <motion.div
                            className="absolute bottom-2 left-2 right-2 bg-gradient-to-br from-amber-800 to-orange-900 rounded-b-2xl"
                            initial={{ height: 0 }}
                            animate={{ height: '85%' }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                        />

                        {/* Cup handle */}
                        <div className="absolute right-0 top-4 w-6 h-12 border-4 border-amber-600 rounded-r-full transform translate-x-3" />
                    </div>

                    {/* Floating coffee beans */}
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-3 h-4 bg-amber-800 rounded-full opacity-80"
                            style={{
                                left: `${20 + Math.random() * 60}%`,
                                top: `${30 + Math.random() * 40}%`
                            }}
                            animate={{
                                y: [0, -20, 0],
                                rotate: [0, 360],
                                scale: [1, 1.2, 1]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: i * 0.5
                            }}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
};
// components/CoffeeAnimation/FloatingParticles.tsx
'use client';
import { useState, useEffect } from 'react';

export const FloatingCoffeeParticles = ({ isActive }: { isActive: boolean }) => {
    const [particles, setParticles] = useState<Array<{ id: string, left: string, animationDelay: string }>>([]);

    useEffect(() => {
        if (!isActive) return;

        const createParticle = () => {
            const id = Math.random().toString(36).substr(2, 9);
            const left = Math.random() * 100;
            const delay = Math.random() * 2;

            return {
                id,
                left: `${left}%`,
                animationDelay: `${delay}s`
            };
        };

        const newParticles = Array.from({ length: 8 }, createParticle);
        setParticles(newParticles);

        const interval = setInterval(() => {
            setParticles(prev => [...prev.slice(1), createParticle()]);
        }, 500);

        return () => clearInterval(interval);
    }, [isActive]);

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-10">
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className="absolute w-2 h-2 bg-amber-600 rounded-full animate-pulse"
                    style={{
                        left: particle.left,
                        bottom: 0,
                        animationDelay: particle.animationDelay,
                        animation: `coffeeFloat 4s linear infinite ${particle.animationDelay}`
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes coffeeFloat {
                    0% {
                        transform: translateY(100vh) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100px) rotate(360deg);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};
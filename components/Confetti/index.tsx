// components/Confetti/index.tsx
'use client';
import confetti from 'canvas-confetti';

export const createCoffeeConfetti = () => {
    const colors = ['#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F4A460'];

    // Coffee bean shape confetti
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: colors,
        shapes: ['circle'],
        scalar: 0.8,
        drift: 1,
        gravity: 0.8,
    });

    // Additional burst with coffee cup colors
    setTimeout(() => {
        confetti({
            particleCount: 50,
            spread: 100,
            origin: { y: 0.4 },
            colors: ['#f59e0b', '#ea580c', '#d97706'],
            shapes: ['square'],
            scalar: 1.2,
        });
    }, 200);
};
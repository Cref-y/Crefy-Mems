'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faLock, faUserCheck, faFingerprint, faKey, faEye, faArrowUp, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { ConnectButton } from 'thirdweb/react';
import { client } from '@/config/client';
import { getNonce, login } from './api/useAuth';
import { useProfiles } from "thirdweb/react";

// Custom Modal Component
const CustomModal = ({ isOpen, onClose, children, theme }: { isOpen: boolean, onClose: () => void, children: React.ReactNode, theme: any }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black bg-opacity-75"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
          className="relative z-10 w-full max-w-md rounded-2xl p-8 shadow-2xl"
          style={{
            backgroundColor: theme.colors.background,
            color: theme.colors.text
          }}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-opacity-10 hover:bg-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{ color: theme.colors.text, focusRingColor: theme.colors.primary }}
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>

          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default function CrefyHeroComponent() {
  const { theme } = useTheme();
  const router = useRouter();
  const [isPressed, setIsPressed] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [authError, setAuthError] = useState('');
  const [address, setAddress] = useState<string | null>(null);

  // Get account and profiles at the top level
  const { data: profiles } = useProfiles({
    client
  });

  // Animation controls
  const orbitalRing1 = useAnimation();
  const orbitalRing2 = useAnimation();
  const orbitalRing3 = useAnimation();
  const pulseAnim = useAnimation();
  const centerIconScale = useAnimation();
  const floatingNodes = Array(6).fill(0).map(() => useAnimation());
  const fadeIn = useAnimation();
  const slideUp = useAnimation();
  const shimmerAnim = useAnimation();

  useEffect(() => {
    // Initial fade in animation
    const initAnimations = async () => {
      await Promise.all([
        fadeIn.start({ opacity: 1, transition: { duration: 1 } }),
        slideUp.start({ y: 0, transition: { duration: 0.8, ease: [0.17, 0.67, 0.83, 0.67] } })
      ]);

      // Orbital rings rotation
      orbitalRing1.start({
        rotate: 360,
        transition: { duration: 8, ease: "linear", repeat: Infinity }
      });

      orbitalRing2.start({
        rotate: 360,
        transition: { duration: 12, ease: "linear", repeat: Infinity, delay: 0.5 }
      });

      orbitalRing3.start({
        rotate: 360,
        transition: { duration: 15, ease: "linear", repeat: Infinity, delay: 1 }
      });

      // Pulse animation
      pulseAnim.start({
        scale: [1, 1.1, 1],
        transition: { duration: 4, ease: "easeInOut", repeat: Infinity }
      });

      // Floating nodes animation
      floatingNodes.forEach((node, index) => {
        node.start({
          y: [0, -20 - (index * 5), 0],
          opacity: [0.3, 1, 0.3],
          transition: {
            duration: 6 + (index * 1),
            ease: "easeInOut",
            repeat: Infinity,
            delay: index * 0.2
          }
        });
      });

      // Shimmer effect
      shimmerAnim.start({
        x: [-100, 100],
        transition: { duration: 3, ease: "linear", repeat: Infinity }
      });
    };

    initAnimations();
  }, []);

  // Use useEffect to react to profile changes
  useEffect(() => {
    if (profiles && profiles.length > 0) {
      console.log('Profiles loaded:', profiles);
    }
  }, [profiles]);

  const handlePress = async () => {
    setIsPressed(true);

    // Press animation
    await centerIconScale.start({
      scale: 0.85,
      transition: { duration: 0.1 }
    });

    await centerIconScale.start({
      scale: 1.2,
      transition: { type: "spring", stiffness: 100, damping: 4 }
    });

    await centerIconScale.start({
      scale: 1,
      transition: { duration: 0.2 }
    });

    setModalIsOpen(true);
    handleAuth();
  };

  const handleAuth = async () => {
    try {
      if (!profiles) return;
      console.log(profiles);
      const address: any = profiles[0].details.address;
      console.log(address);
      setAuthStatus('loading');

      // Get nonce from server
      const nonce = await getNonce(address);
      console.log(nonce);

      // Here you would typically prompt the user to sign the nonce with their wallet
      // For demo purposes, we'll simulate this step
      const message = `I am signing this message to authenticate with Crefy. Nonce: ${nonce}`;
      const signature = `simulated-signature-for-${address}`;

      // Send to server for verification
      const authResponse = await login(address, message, signature);

      setAuthStatus('success');

      // Redirect after short delay to show success state
      setTimeout(() => {
        router.push('/crefy');
      }, 1500);

    } catch (error) {
      console.error('Authentication error:', error);
      setAuthStatus('error');
      setAuthError(error instanceof Error ? error.message : 'Authentication failed');
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setAuthStatus('idle');
    setAuthError('');
  };

  const nodePositions = [
    { top: '15%', left: '20%' },
    { top: '25%', right: '15%' },
    { top: '45%', left: '10%' },
    { top: '55%', right: '20%' },
    { top: '75%', left: '25%' },
    { top: '80%', right: '30%' }
  ];

  const nodeIcons = [faShieldAlt, faLock, faUserCheck, faFingerprint, faKey, faEye];

  return (
    <motion.div
      className="flex flex-col items-center justify-center p-5 h-full w-full"
      style={{ backgroundColor: theme.colors.background }}
      initial={{ opacity: 0, y: 50 }}
      animate={fadeIn}
    >
      {/* Floating Background Nodes */}
      {floatingNodes.map((node, index) => (
        <motion.div
          key={index}
          className="absolute w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            ...nodePositions[index],
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }}
          animate={node}
        >
          <FontAwesomeIcon
            icon={nodeIcons[index]}
            size="sm"
            style={{ color: `${theme.colors.primary}40` }}
          />
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-1">
        {/* Orbital System */}
        <div className="relative w-[300px] h-[300px] flex items-center justify-center mb-10">
          {/* Outer Ring */}
          <motion.div
            className="absolute border border-dashed rounded-full"
            style={{
              width: 240,
              height: 240,
              borderColor: `${theme.colors.primary}20`
            }}
            animate={orbitalRing3}
          >
            <div
              className="absolute w-2 h-2 rounded-full top-[-4px] left-1/2 ml-[-4px]"
              style={{ backgroundColor: `${theme.colors.primary}60` }}
            />
            <div
              className="absolute w-2 h-2 rounded-full top-1/2 left-[-4px] mt-[-4px]"
              style={{ backgroundColor: `${theme.colors.secondary}60` }}
            />
          </motion.div>

          {/* Middle Ring */}
          <motion.div
            className="absolute border border-dashed rounded-full"
            style={{
              width: 180,
              height: 180,
              borderColor: `${theme.colors.primary}30`
            }}
            animate={orbitalRing2}
          >
            <div
              className="absolute w-2 h-2 rounded-full top-[-4px] left-1/2 ml-[-4px]"
              style={{ backgroundColor: `${theme.colors.primary}80` }}
            />
            <div
              className="absolute w-2 h-2 rounded-full bottom-[-4px] left-1/2 ml-[-4px]"
              style={{ backgroundColor: `${theme.colors.secondary}80` }}
            />
          </motion.div>

          {/* Inner Ring */}
          <motion.div
            className="absolute border border-dashed rounded-full"
            style={{
              width: 120,
              height: 120,
              borderColor: `${theme.colors.primary}40`
            }}
            animate={orbitalRing1}
          >
            <div
              className="absolute w-2 h-2 rounded-full top-[-4px] left-1/2 ml-[-4px]"
              style={{ backgroundColor: theme.colors.primary }}
            />
          </motion.div>

          {/* Center Button */}
          <motion.button
            className="absolute z-10 focus:outline-none"
            onClick={handlePress}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-[100px] h-[100px] rounded-full flex items-center justify-center relative overflow-hidden shadow-lg"
              style={{ backgroundColor: theme.colors.primary }}
              animate={centerIconScale}
            >
              {/* Shimmer Effect */}
              <motion.div
                className="absolute top-0 left-0 right-0 bottom-0 w-[30px] bg-white bg-opacity-20"
                style={{ transform: 'skewX(-20deg)' }}
                animate={shimmerAnim}
              />

              <FontAwesomeIcon
                icon={faFingerprint}
                size="3x"
                className="text-white"
              />

              {/* Ripple Effect */}
              <AnimatePresence>
                {isPressed && (
                  <motion.div
                    className="absolute w-[120px] h-[120px] rounded-full border-2"
                    style={{ borderColor: `${theme.colors.primary}50` }}
                    initial={{ scale: 0.8, opacity: 1 }}
                    animate={{ scale: 1.2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </motion.button>
        </div>

        {/* Text Content */}
        <div className="flex flex-col items-center mb-14">
          <h1
            className="text-3xl font-bold tracking-wider mb-2"
            style={{ color: theme.colors.text }}
          >
            Utopia
          </h1>
          <h2
            className="text-lg font-semibold mb-3"
            style={{ color: theme.colors.text }}
          >
            The Future of Identity
          </h2>
          <p
            className="text-base tracking-wider mb-6"
            style={{ color: theme.colors.secondaryText }}
          >
            Secure • Decentralized • Private
          </p>
        </div>

        {/* Action Hint */}
        <div className="flex flex-col items-center gap-2">
          <ConnectButton
            client={client}
            signInButton={{
              label: "Sign in with Crefy",
              style: {
                background: 'linear-gradient(135deg,rgb(9, 27, 118) 0%, rgb(10, 30, 120) 100%)',
                border: '1px solid rgba(4, 29, 98, 0.3)',
                borderRadius: '12px',
                padding: '8px 16px',
                color: 'white',
              }
            }}
            connectButton={{
              label: "Sign In",
              style: {
                background: 'linear-gradient(135deg,rgb(9, 27, 118) 0%, rgb(10, 30, 120) 100%)',
                border: '1px solid rgba(4, 29, 98, 0.3)',
                borderRadius: '12px',
                padding: '8px 16px',
                color: 'white',
              }
            }}
            theme='light'
            appMetadata={{
              name: "Crefy",
              url: "https://crefy.xyz",
            }}
            onConnect={(wallet: any) => {
              console.log(wallet);
            }}
          />
          <p
            className="text-sm italic"
            style={{ color: theme.colors.secondaryText }}
          >
            Tap to begin your secure journey
          </p>
          <FontAwesomeIcon
            icon={faArrowUp}
            size="sm"
            style={{ color: theme.colors.primary }}
          />
        </div>
      </div>

      {/* Custom Auth Modal */}
      <CustomModal isOpen={modalIsOpen} onClose={closeModal} theme={theme}>
        <div className="flex flex-col items-center">
          <motion.div
            animate={{
              scale: authStatus === 'loading' ? [1, 1.1, 1] : 1,
              transition: authStatus === 'loading' ? { repeat: Infinity, duration: 1.5 } : {}
            }}
          >
            <FontAwesomeIcon
              icon={faFingerprint}
              size="3x"
              style={{
                color:
                  authStatus === 'success' ? '#4CAF50' :
                    authStatus === 'error' ? '#F44336' :
                      theme.colors.primary
              }}
              className="mb-6"
            />
          </motion.div>

          <h2 className="text-2xl font-bold mb-4 text-center">
            {authStatus === 'idle' && 'Authenticate with Wallet'}
            {authStatus === 'loading' && 'Verifying...'}
            {authStatus === 'success' && 'Authentication Successful!'}
            {authStatus === 'error' && 'Authentication Failed'}
          </h2>

          {authStatus === 'idle' && (
            <>
              <p className="text-center mb-6" style={{ color: theme.colors.secondaryText }}>
                Connect your wallet to verify your identity securely using zero-knowledge proofs.
              </p>
              <ConnectButton
                client={client}
                connectButton={{
                  label: "Connect Wallet",
                  style: {
                    background: theme.colors.primary,
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }
                }}
                theme='light'
                appMetadata={{
                  name: "Crefy",
                  url: "https://crefy.xyz",
                }}
              />
            </>
          )}

          {authStatus === 'loading' && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
              <div
                className="h-2.5 rounded-full"
                style={{
                  backgroundColor: theme.colors.primary,
                  width: '70%',
                  animation: 'pulse 2s infinite'
                }}
              />
            </div>
          )}

          {authStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <p className="mb-6" style={{ color: theme.colors.secondaryText }}>
                You'll be redirected to your secure dashboard shortly.
              </p>
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </motion.div>
          )}

          {authStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <p className="mb-4 text-red-500">{authError}</p>
              <button
                onClick={() => setAuthStatus('idle')}
                className="px-4 py-2 rounded-md transition-colors duration-200 hover:opacity-90"
                style={{
                  backgroundColor: theme.colors.primary,
                  color: 'white'
                }}
              >
                Try Again
              </button>
            </motion.div>
          )}
        </div>
      </CustomModal>
    </motion.div>
  );
}
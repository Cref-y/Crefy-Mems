// app/layout.tsx
import type { Metadata } from 'next'
import ClientLayout from './client-layout'

export const metadata: Metadata = {
  title: "Crefy-Mems | NFT Minting Platform",
  description: "Mint unique NFTs on Ethereum Mainnet and Sepolia testnet with ease.",
  keywords: ["NFT", "Ethereum", "Web3", "Blockchain", "Minting", "Digital Art"],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>
}
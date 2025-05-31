"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { wagmiConfig } from "@/lib/wagmi-config"
import "./globals.css"
import { ThirdwebProvider } from "thirdweb/react";
import { ThemeProvider } from "@/context/ThemeContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <html lang="en">
      <body>
        <ThirdwebProvider>
          <WagmiProvider config={wagmiConfig}>
            <ThemeProvider>
              <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            </ThemeProvider>
          </WagmiProvider>
        </ThirdwebProvider>
      </body>
    </html>
  )
}
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
        <WagmiProvider config={wagmiConfig}>
          <ThirdwebProvider>
            <ThemeProvider>
              <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            </ThemeProvider>
          </ThirdwebProvider>
        </WagmiProvider>
      </body>
    </html>
  )
}
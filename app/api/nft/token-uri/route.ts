/**
 * Enhanced API route to get token URI with better error handling
 */
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { tokenId, contractAddress } = await request.json()

    if (!tokenId || !contractAddress) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    console.log(`Getting token URI for token ${tokenId}`)

    // Use the configured RPC URL
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL

    if (!rpcUrl) {
      console.error("NEXT_PUBLIC_RPC_URL not configured")
      return NextResponse.json({ tokenURI: "", error: "RPC URL not configured" })
    }

    // Prepare the contract call data for tokenURI(uint256)
    const functionSelector = "0xc87b56dd" // tokenURI function selector
    const paddedTokenId = tokenId.toString(16).padStart(64, "0")
    const callData = functionSelector + paddedTokenId

    const rpcPayload = {
      jsonrpc: "2.0",
      method: "eth_call",
      params: [
        {
          to: contractAddress,
          data: callData,
        },
        "latest",
      ],
      id: 1,
    }

    console.log(`Making RPC call to ${rpcUrl} for token URI ${tokenId}`)

    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rpcPayload),
    })

    if (!response.ok) {
      console.error(`RPC call failed: ${response.status} ${response.statusText}`)
      return NextResponse.json({ tokenURI: "", error: "RPC call failed" })
    }

    const rpcResult = await response.json()

    if (rpcResult.error) {
      console.error(`RPC error for token ${tokenId}:`, rpcResult.error)
      return NextResponse.json({ tokenURI: "", error: rpcResult.error.message })
    }

    if (!rpcResult.result || rpcResult.result === "0x") {
      console.log(`No URI found for token ${tokenId}`)
      return NextResponse.json({ tokenURI: "" })
    }

    // Parse the result - it's a string encoded in hex
    const resultHex = rpcResult.result

    try {
      // Remove 0x prefix
      const hex = resultHex.slice(2)

      // Skip the first 64 characters (offset) and next 64 characters (length)
      const dataHex = hex.slice(128)

      // Convert hex to string
      let tokenURI = ""
      for (let i = 0; i < dataHex.length; i += 2) {
        const hexChar = dataHex.substr(i, 2)
        const charCode = Number.parseInt(hexChar, 16)
        if (charCode !== 0) {
          tokenURI += String.fromCharCode(charCode)
        }
      }

      console.log(`Token ${tokenId} URI: ${tokenURI}`)
      return NextResponse.json({ tokenURI })
    } catch (decodeError) {
      console.error("Error decoding token URI:", decodeError)
      return NextResponse.json({ tokenURI: "", error: "Failed to decode URI" })
    }
  } catch (error) {
    console.error("Error getting token URI:", error)
    return NextResponse.json({
      tokenURI: "",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

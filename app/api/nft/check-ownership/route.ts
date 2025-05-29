/**
 * Enhanced API route to check NFT ownership with better error handling
 */
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { tokenId, userAddress, contractAddress } = await request.json()

    if (!tokenId || !userAddress || !contractAddress) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    console.log(`Checking ownership for token ${tokenId}, user ${userAddress}`)

    // Use the configured RPC URL
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL

    if (!rpcUrl) {
      console.error("NEXT_PUBLIC_RPC_URL not configured")
      return NextResponse.json({ isOwner: false, error: "RPC URL not configured" })
    }

    // Prepare the contract call data for ownerOf(uint256)
    const functionSelector = "0x6352211e" // ownerOf function selector
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

    console.log(`Making RPC call to ${rpcUrl} for token ${tokenId}`)

    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rpcPayload),
    })

    if (!response.ok) {
      console.error(`RPC call failed: ${response.status} ${response.statusText}`)
      return NextResponse.json({ isOwner: false, error: "RPC call failed" })
    }

    const rpcResult = await response.json()

    if (rpcResult.error) {
      console.error(`RPC error for token ${tokenId}:`, rpcResult.error)
      return NextResponse.json({ isOwner: false, error: rpcResult.error.message })
    }

    if (!rpcResult.result || rpcResult.result === "0x") {
      // Token doesn't exist
      console.log(`Token ${tokenId} does not exist`)
      return NextResponse.json({ isOwner: false })
    }

    // Parse the result (remove 0x and leading zeros, then add 0x back)
    const ownerHex = rpcResult.result
    const owner = "0x" + ownerHex.slice(-40) // Get last 40 characters (20 bytes = address)

    const isOwner = owner.toLowerCase() === userAddress.toLowerCase()

    console.log(`Token ${tokenId} owner: ${owner}, user: ${userAddress}, isOwner: ${isOwner}`)

    return NextResponse.json({ isOwner, owner })
  } catch (error) {
    console.error("Error in ownership check:", error)
    return NextResponse.json({
      isOwner: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

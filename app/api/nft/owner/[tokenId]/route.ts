/**
 * API route to check NFT ownership and get token URI
 */
import { type NextRequest, NextResponse } from "next/server"
import { createPublicClient, http } from "viem"
import { mainnet, sepolia } from "viem/chains"

// Create clients for both networks
const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const sepoliaClient = createPublicClient({
  chain: sepolia,
  transport: http(),
})

export async function POST(request: NextRequest, { params }: { params: { tokenId: string } }) {
  try {
    const { contractAddress, userAddress } = await request.json()
    const tokenId = params.tokenId

    if (!contractAddress || !userAddress || !tokenId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    console.log(`Checking ownership for token ${tokenId}, user ${userAddress}`)

    // Contract ABI for the functions we need
    const contractABI = [
      {
        inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        name: "ownerOf",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
        name: "tokenURI",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
    ] as const

    // Try both networks (you can optimize this based on your deployment)
    const clients = [mainnetClient, sepoliaClient]

    for (const client of clients) {
      try {
        // Check if token exists and get owner
        const owner = await client.readContract({
          address: contractAddress as `0x${string}`,
          abi: contractABI,
          functionName: "ownerOf",
          args: [BigInt(tokenId)],
        })

        const isOwner = owner.toLowerCase() === userAddress.toLowerCase()

        if (isOwner) {
          // Get token URI
          const tokenURI = await client.readContract({
            address: contractAddress as `0x${string}`,
            abi: contractABI,
            functionName: "tokenURI",
            args: [BigInt(tokenId)],
          })

          console.log(`Token ${tokenId} owned by user, URI: ${tokenURI}`)

          return NextResponse.json({
            isOwner: true,
            tokenURI: tokenURI as string,
            owner: owner as string,
          })
        }
      } catch (error) {
        // Token might not exist on this network, continue to next
        continue
      }
    }

    // Token not owned by user or doesn't exist
    return NextResponse.json({ isOwner: false })
  } catch (error) {
    console.error("Error in ownership check:", error)
    return NextResponse.json(
      {
        error: "Failed to check ownership",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

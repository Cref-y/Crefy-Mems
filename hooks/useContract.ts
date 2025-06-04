// hooks/useContract.ts
"use client"
import { useState } from "react";
import {
    useSendTransaction,
    useConnect,
    useActiveAccount,
    useReadContract
} from "thirdweb/react";
import {
    prepareContractCall,
    getContract
} from "thirdweb";
import type { Account } from "thirdweb/wallets";
import { CONTRACT_CONFIG } from "@/config/contract";
import { sepolia } from "thirdweb/chains"; // Import your chain
import { client } from '@/config/client';

// Initialize the contract once
const contract = getContract({
    address: CONTRACT_CONFIG.address,
    chain: sepolia, // or your specific chain
    client,
});

type UseContractReturn = {
    account: string | undefined;
    status: string;
    connectWallet: () => Promise<void>;
    mintToken: () => Promise<any>;
    isConnected: boolean;
    // Add any read methods you need
    tokenMinted?: bigint;
};

export function useContract(): UseContractReturn {
    const [status, setStatus] = useState<string>("");
    const { connect } = useConnect();
    const account: Account | undefined = useActiveAccount();
    const address = account?.address;
    const isConnected = !!account;
    const { mutateAsync: sendTx } = useSendTransaction();

    // Example read method - adjust based on your contract
    const { data: tokenMinted } = useReadContract({
        contract,
        method: "function balanceOf(address) view returns (uint256)",
        params: [address || "0x"],
    });

    const connectWallet = async () => {
        try {
            await connect();
            setStatus("Wallet connected!");
        } catch (error) {
            console.error(error);
            setStatus("Failed to connect wallet.");
        }
    };

    const mintToken = async () => {
        if (!account) {
            setStatus("Wallet not connected");
            return;
        }

        try {
            setStatus("Preparing transaction...");

            // Using prepareContractCall for custom methods
            const transaction = prepareContractCall({
                contract,
                method: "function mintFromContract()",
                // Add any parameters if needed: params: [param1, param2]
            });
            console.log("transaction", transaction)

            setStatus("Sending transaction...");
            const receipt = await sendTx(transaction);
            console.log("reciept", receipt)
            setStatus("Token minted successfully!");
            return receipt;
        } catch (error) {
            console.error(error);
            setStatus("Minting failed.");
            throw error;
        }
    };

    return {
        account: address,
        status,
        connectWallet,
        mintToken,
        isConnected,
        tokenMinted,
    };
}
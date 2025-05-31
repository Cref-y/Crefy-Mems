// components/NFTCard/types.ts
export interface TokenData {
    id: string;
    type: string;
    issuer: string;
    timestamp: number;
    mintedDate: string;
    mintedTime: string;
    validUntil: string;
    validUntilFormatted: string;
    redemptions: number;
    maxRedemptions: number;
    value: string;
    rarity: string;
}
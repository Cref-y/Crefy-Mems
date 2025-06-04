// components/NFTCard/types.ts
export interface TokenData {
    id: string;
    name?: string;
    type: string;
    issuer: string;
    timestamp: number;
    mintedDate: string;
    mintedTime: string;
    validUntil: string;
    validUntilFormatted: string;
    redemptions: number;
    maxRedemptions: number;
    totalUserRedemptions?: number; // Total redemptions available to user across all tokens
    usedUserRedemptions?: number;  // Total redemptions used by user across all tokens
    value: string;
    rarity: string;
}
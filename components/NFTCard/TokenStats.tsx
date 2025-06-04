// components/NFTCard/TokenStats.tsx
'use client';
import { TokenData } from './types';

export const TokenStats = ({ tokenData }: { tokenData: TokenData }) => {
    // Calculate days remaining
    const daysRemaining = Math.ceil((new Date(tokenData.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    const getRarityTextColor = (rarity: string) => {
        switch (rarity) {
            case 'Legendary': return 'text-purple-300';
            case 'Epic': return 'text-blue-300';
            case 'Rare': return 'text-cyan-300';
            default: return 'text-amber-300';
        }
    };

    const getRarityBorderColor = (rarity: string) => {
        switch (rarity) {
            case 'Legendary': return 'border-purple-500/30';
            case 'Epic': return 'border-blue-500/30';
            case 'Rare': return 'border-cyan-500/30';
            default: return 'border-amber-500/30';
        }
    };

    const getRarityGradient = (rarity: string) => {
        switch (rarity) {
            case 'Legendary': return 'from-purple-500/10 to-pink-500/10';
            case 'Epic': return 'from-blue-500/10 to-indigo-500/10';
            case 'Rare': return 'from-cyan-500/10 to-teal-500/10';
            default: return 'from-amber-500/10 to-orange-500/10';
        }
    };

    return (
        <div className="px-2 pb-4">
            <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Token Redemptions */}
                <div className={`bg-gray-800/30 rounded-xl p-3 border ${getRarityBorderColor(tokenData.rarity)}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-xs">This Token</span>
                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <p className={`${getRarityTextColor(tokenData.rarity)} font-bold text-lg`}>
                        {tokenData.redemptions}/{tokenData.maxRedemptions}
                    </p>
                    <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                        <div
                            className="bg-gradient-to-r from-green-400 to-green-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${(tokenData.redemptions / tokenData.maxRedemptions) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Total User Redemptions */}
                <div className={`bg-gray-800/30 rounded-xl p-3 border ${getRarityBorderColor(tokenData.rarity)}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-xs">Total Available</span>
                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <p className={`${getRarityTextColor(tokenData.rarity)} font-bold text-lg`}>
                        {(tokenData.usedUserRedemptions || 0)}/{(tokenData.totalUserRedemptions || 1)}
                    </p>
                    <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                        <div
                            className="bg-gradient-to-r from-blue-400 to-blue-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${((tokenData.usedUserRedemptions || 0) / (tokenData.totalUserRedemptions || 1)) * 100}%` }}
                        />
                    </div>
                    <p className="text-gray-500 text-xs mt-1">Across all tokens</p>
                </div>
            </div>

            {/* Expiry */}
            <div className={`bg-gradient-to-r ${getRarityGradient(tokenData.rarity)} border ${getRarityBorderColor(tokenData.rarity)} rounded-xl p-3 mb-3`}>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-200 text-xs">Valid Until</span>
                    <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                </div>
                <p className="text-white font-semibold text-sm">{tokenData.validUntilFormatted}</p>
                <p className={`text-xs mt-1 ${daysRemaining <= 3 ? 'text-red-400' : 'text-gray-200'}`}>
                    {Math.floor(daysRemaining)} {Math.floor(daysRemaining) === 1 ? 'day' : 'days'} remaining
                </p>
            </div>

            {/* Instructions */}
            <div className={`bg-gradient-to-r ${getRarityGradient(tokenData.rarity)} border ${getRarityBorderColor(tokenData.rarity)} rounded-xl p-3`}>
                <div className="flex items-start space-x-2">
                    <svg className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                        <p className="text-amber-400 font-semibold text-xs mb-1">How to Redeem</p>
                        <p className="text-gray-300 text-xs leading-relaxed">
                            Present this NFT at any participating Project Moja location to redeem your coffee. Each scan consumes one redemption.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
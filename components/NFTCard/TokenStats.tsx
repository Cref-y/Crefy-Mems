// components/NFTCard/TokenStats.tsx
'use client';
import { TokenData } from './types';

export const TokenStats = ({ tokenData }: { tokenData: TokenData }) => {
    // Calculate days remaining
    const daysRemaining = Math.ceil((new Date(tokenData.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return (
        <div className="px-6 pb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Redemptions */}
                <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/50">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Redemptions</span>
                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <p className="text-white font-bold text-lg">
                        {tokenData.redemptions}/{tokenData.maxRedemptions}
                    </p>
                    <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                        <div
                            className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(tokenData.redemptions / tokenData.maxRedemptions) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Value */}
                <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/50">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Value</span>
                        <div className="flex items-center">
                            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                            </svg>
                            <svg className="w-4 h-4 ml-1 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-amber-400 font-bold text-lg flex items-center justify-center">
                        {tokenData.value}
                        <span className="ml-2 text-xs bg-amber-500/20 px-2 py-0.5 rounded-full">
                            {tokenData.rarity === 'Legendary' ? '5★' :
                                tokenData.rarity === 'Epic' ? '4★' :
                                    tokenData.rarity === 'Rare' ? '3★' : '2★'}
                        </span>
                    </p>
                </div>
            </div>

            {/* Expiry */}
            <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/50 mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Valid Until</span>
                    <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                </div>
                <p className="text-white font-semibold">{tokenData.validUntilFormatted}</p>
                <p className={`text-xs mt-1 ${daysRemaining <= 3 ? 'text-red-400' : 'text-gray-400'}`}>
                    {Math.floor(daysRemaining)} {Math.floor(daysRemaining) === 1 ? 'day' : 'days'} remaining
                </p>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                        <p className="text-amber-400 font-semibold text-sm mb-1">How to Redeem</p>
                        <p className="text-gray-300 text-xs leading-relaxed">
                            Present this QR code at any participating Project Moja location to redeem your complimentary premium coffee. Each scan consumes one redemption. Legendary tokens offer more redemptions!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
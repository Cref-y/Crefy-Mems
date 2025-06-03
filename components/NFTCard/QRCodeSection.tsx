// components/NFTCard/QRCodeSection.tsx
'use client';

export const QRCodeSection = ({ qrCodeUrl }: { qrCodeUrl: string }) => {
    return (
        <div className="px-2 pb-2 relative">
            <div className="bg-white p-3 rounded-xl mx-auto w-fit shadow-inner relative group">
                <img
                    src={qrCodeUrl}
                    alt="Coffee Token QR Code"
                    className="w-full h-78 rounded-lg transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-full h-full text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>
            <p className="text-center text-amber-300/70 text-xs mt-2">
                Scan to redeem at participating locations
            </p>
        </div>
    );
};
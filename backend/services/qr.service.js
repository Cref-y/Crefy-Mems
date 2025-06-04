const QRCode = require('qrcode');
const crypto = require('crypto');

exports.generateQR = async (memoryId) => {
    try {
        // Simplified format: "memory:<memoryId>"
        const qrContent = `memory:${memoryId}`;

        // Generate QR code with optimal settings for scanning
        const qrCode = await QRCode.toDataURL(qrContent, {
            errorCorrectionLevel: 'M',  // Medium error correction
            margin: 2,                  // White border
            width: 300,                 // Size
            color: {
                dark: '#000000',        // Black dots
                light: '#FFFFFF'        // White background
            }
        });

        return {
            content: qrContent,
            image: qrCode
        };
    } catch (err) {
        console.error('QR generation error:', err);
        throw new Error('Failed to generate QR code');
    }
};
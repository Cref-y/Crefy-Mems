import axios from 'axios';

const API_BASE_URL = 'https://4583-2c0f-fe38-2195-6806-81d1-9870-7623-b234.ngrok-free.app';

// For storing auth token and wallet address
const AUTH_TOKEN_KEY = 'authToken';
const WALLET_ADDRESS_KEY = 'walletAddress';

export const authService = {
    // Get nonce for signing
    getNonce: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/auth/nonce`, {
                headers: {
                    'Accept': 'application/json',
                    'ngrok-skip-browser-warning': 'true' // This bypasses the warning
                }
            });
            return response.data.nonce;
        } catch (error) {
            console.error("Error getting nonce:", error);
            throw error;
        }
    },

    // Login with signed message
    login: async (message: string, signature: any, address: string) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                address,
                message,
                signature,
            });

            // Store in localStorage (or sessionStorage for more security)
            localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
            localStorage.setItem(WALLET_ADDRESS_KEY, address);

            return response.data;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    },

    // Get stored token
    getAccessToken: () => localStorage.getItem(AUTH_TOKEN_KEY),

    // Get stored wallet address
    getWalletAddress: () => localStorage.getItem(WALLET_ADDRESS_KEY),

    // Logout
    logout: () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(WALLET_ADDRESS_KEY);
    },

    // Check authentication status
    isAuthenticated: () => !!localStorage.getItem(AUTH_TOKEN_KEY)
};
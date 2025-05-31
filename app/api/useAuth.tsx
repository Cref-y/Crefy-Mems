import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://fc19-105-161-233-121.ngrok-free.app';
// Auth token management
const AUTH_TOKEN_KEY = 'authToken';
const WALLET_ADDRESS_KEY = 'walletAddress';

// Get nonce for signing
export const getNonce = async (address: string): Promise<string> => {
    const response = await axios.get(`${API_BASE_URL}/auth/nonce`, {
        params: { address },
    });
    return response.data.nonce;
};

// Login with signed message
export const login = async (address: string, message: string, signature: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        address,
        message,
        signature,
    });

    // Store the token and wallet address securely
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
    await AsyncStorage.setItem(WALLET_ADDRESS_KEY, address);

    return response.data;
};

// Get stored access 

export const getAccessToken = async (): Promise<string | null> => {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
};

// Get stored wallet address
export const getWalletAddress = async (): Promise<string | null> => {
    return await AsyncStorage.getItem(WALLET_ADDRESS_KEY);
};

// Logout by clearing stored credentials
export const logout = async (): Promise<void> => {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(WALLET_ADDRESS_KEY);
};

// Verify if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
    const token = await getAccessToken();
    return !!token;
};
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = {
    colors: {
        primary: string;
        primaryLight: string;
        secondary: string;
        success: string;
        successLight: string;
        background: string;
        card: string;
        cardBackground: string;
        text: string;
        secondaryText: string;
        border: string;
        warning: string;
    };
};

const lightTheme: Theme = {
    colors: {
        primary: '#5D5CDE',
        primaryLight: 'rgba(93, 92, 222, 0.1)',
        secondary: '#6B7280',
        success: '#10B981',
        successLight: 'rgba(16, 185, 129, 0.1)',
        background: '#FFFFFF',
        card: '#FFFFFF',
        cardBackground: '#FFFFFF',
        text: '#1F2937',
        secondaryText: '#6B7280',
        border: '#E5E7EB',
        warning: '#F59E0B',
    },
};

const darkTheme: Theme = {
    colors: {
        primary: '#8583FF',
        primaryLight: 'rgba(133, 131, 255, 0.1)',
        secondary: '#9CA3AF',
        success: '#10B981',
        successLight: 'rgba(16, 185, 129, 0.2)',
        background: '#181818',
        card: '#222222',
        cardBackground: '#222222',
        text: '#FFFFFF',
        secondaryText: '#D1D5DB',
        border: '#374151',
        warning: '#F59E0B',
    },
};

const ThemeContext = createContext({
    theme: lightTheme,
    toggleTheme: () => { },
    isDark: false,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [isDark, setIsDark] = useState(false);



    const toggleTheme = () => setIsDark(!isDark);

    const theme = isDark ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
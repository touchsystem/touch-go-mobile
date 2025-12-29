import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAvailableLanguages, initI18n, setLanguage } from '../i18n/i18n';

export interface LanguageContextType {
    language: string;
    availableLanguages: { code: string; name: string }[];
    changeLanguage: (language: string) => Promise<boolean>;
    t: (key: string, options?: Record<string, unknown>) => string;
    isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentLanguage, setCurrentLanguage] = useState('pt');
    const [isReady, setIsReady] = useState(false);
    const { t: i18nT, i18n } = useTranslation();

    // Initialize language and i18n
    useEffect(() => {
        const initialize = async () => {
            try {
                // Initialize i18n if not already initialized
                await initI18n();

                // Set the current language from i18n
                const lang = i18n.language || 'pt';
                setCurrentLanguage(lang);
            } catch (error) {
                console.error('Error initializing language:', error);
            } finally {
                setIsReady(true);
            }
        };

        initialize();
    }, [i18n]);

    const changeLanguage = async (language: string): Promise<boolean> => {
        try {
            const success = await setLanguage(language);
            if (success) {
                setCurrentLanguage(language);
            }
            return success;
        } catch (error) {
            console.error('Error changing language:', error);
            return false;
        }
    };

    const t = (key: string, options?: Record<string, unknown>): string => {
        return i18nT(key, options) as string;
    };

    if (!isReady) {
        return null; // Or a loading indicator
    }

    return (
        <LanguageContext.Provider
            value={{
                language: currentLanguage,
                availableLanguages: getAvailableLanguages(),
                changeLanguage,
                t,
                isRTL: false, // Set to true for RTL languages if needed
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export default LanguageContext;

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n, { i18n as I18nType, TFunction } from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import en from './locales/en';
import es from './locales/es';
import pt from './locales/pt';

// Define the type for our translation resources
type TranslationResources = {
    [key: string]: {
        translation: typeof pt;
    };
};

const LANGUAGES: TranslationResources = {
    en: {
        translation: en,
    },
    es: {
        translation: es,
    },
    pt: {
        translation: pt,
    },
};

type LanguageCode = keyof typeof LANGUAGES;

const LANG_CODES = Object.keys(LANGUAGES) as LanguageCode[];

// Create a custom type for our i18n instance
export type I18n = I18nType & {
    t: TFunction;
};

let i18nInstance: I18n | null = null;

export const getLanguage = async (): Promise<LanguageCode> => {
    try {
        const savedLanguage = await AsyncStorage.getItem('user-language') as LanguageCode | null;
        if (savedLanguage && LANG_CODES.includes(savedLanguage)) {
            return savedLanguage;
        }

        // Get device language without region code
        const deviceLanguage = Localization.locale.split('-')[0] as LanguageCode;
        return LANG_CODES.includes(deviceLanguage) ? deviceLanguage : 'pt';
    } catch (error) {
        console.error('Error getting language:', error);
        return 'pt'; // Default to Portuguese
    }
};

export const setLanguage = async (language: string): Promise<boolean> => {
    try {
        if (!LANG_CODES.includes(language as LanguageCode)) {
            return false;
        }

        await AsyncStorage.setItem('user-language', language);

        if (i18nInstance) {
            await i18nInstance.changeLanguage(language);
        }

        return true;
    } catch (error) {
        console.error('Error setting language:', error);
        return false;
    }
};

// Initialize i18n
export const initI18n = async (): Promise<I18n> => {
    if (i18nInstance) {
        return i18nInstance;
    }

    const language = await getLanguage();

    // Create a new i18n instance with proper typing
    const instance = i18n.createInstance({
        resources: LANGUAGES,
        lng: language as string, // Explicitly cast to string
        fallbackLng: 'pt',
        interpolation: {
            escapeValue: false, // React already escapes values
        },
        // @ts-ignore - compatibilityJSON is a valid option for react-native-i18next
        compatibilityJSON: 'v3', // For Android compatibility
    });

    await instance.use(initReactI18next).init();

    i18nInstance = instance as I18n;
    i18nInstance.t = instance.t.bind(instance);

    return i18nInstance;
};

export const getAvailableLanguages = (): Array<{ code: string; name: string }> => {
    return [
        { code: 'pt', name: 'Português' },
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' },
    ];
};

// Initialize i18n when this module is imported
const i18nPromise = initI18n();

// Export the i18n instance
export { i18n };
export default i18n;

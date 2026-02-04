import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n, { i18n as I18nType, TFunction } from 'i18next';
import { initReactI18next, setI18n } from 'react-i18next';

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

/** True when running in Node/SSR (expo-router web) where AsyncStorage/localStorage is not available. */
const isServerOrSSR = typeof window === 'undefined';

export const getLanguage = async (): Promise<LanguageCode> => {
    if (isServerOrSSR) {
        return 'pt'; // Default during SSR; client will re-run and load saved language
    }
    try {
        const savedLanguage = await AsyncStorage.getItem('user-language') as LanguageCode | null;
        if (savedLanguage && LANG_CODES.includes(savedLanguage)) {
            return savedLanguage;
        }

        // Get device language without region code
        // Safely get locale - it might be undefined in some environments (e.g., POS devices)
        let locale: string | undefined;
        try {
            locale = Localization.locale;
        } catch (e) {
            // locale might not be available in some environments
        }

        // If locale is not available, try getLocales() as fallback
        if (!locale || typeof locale !== 'string') {
            try {
                const locales = Localization.getLocales();
                if (locales && locales.length > 0 && locales[0].languageCode) {
                    locale = locales[0].languageCode;
                }
            } catch (e) {
                // getLocales might also fail
            }
        }

        // Extract language code from locale (e.g., 'pt-BR' -> 'pt')
        if (locale && typeof locale === 'string' && locale.length > 0) {
            const deviceLanguage = locale.split('-')[0].toLowerCase() as LanguageCode;
            if (LANG_CODES.includes(deviceLanguage)) {
                return deviceLanguage;
            }
        }

        // Fallback to default if locale is not available or not supported
        return 'pt';
    } catch (error) {
        console.error('Error getting language:', error);
        return 'pt'; // Default to Portuguese
    }
};

export const setLanguage = async (language: string): Promise<boolean> => {
    if (!LANG_CODES.includes(language as LanguageCode)) {
        return false;
    }
    if (isServerOrSSR) {
        if (i18n.isInitialized) {
            await i18n.changeLanguage(language);
        }
        return true;
    }
    try {
        await AsyncStorage.setItem('user-language', language);

        if (i18n.isInitialized) {
            await i18n.changeLanguage(language);
        }

        return true;
    } catch (error) {
        console.error('Error setting language:', error);
        return false;
    }
};

const I18N_BASE_OPTIONS = {
    resources: LANGUAGES,
    fallbackLng: 'pt',
    interpolation: { escapeValue: false },
    // @ts-ignore - compatibilityJSON is a valid option for react-native-i18next
    compatibilityJSON: 'v3',
} as const;

// Initialize i18n (use the default/global instance so useTranslation() finds it)
export const initI18n = async (): Promise<I18n> => {
    if (i18n.isInitialized) {
        const language = await getLanguage();
        if (i18n.language !== language) {
            await i18n.changeLanguage(language);
        }
        return i18n as I18n;
    }

    const language = await getLanguage();

    await i18n.use(initReactI18next).init({
        ...I18N_BASE_OPTIONS,
        lng: language as string,
    });

    return i18n as I18n;
};

export const getAvailableLanguages = (): Array<{ code: string; name: string }> => {
    return [
        { code: 'pt', name: 'Português' },
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' },
    ];
};

// Register the global instance immediately so useTranslation() / getI18n() find it
// on first render (SSR). init() is async; setI18n() avoids NO_I18NEXT_INSTANCE warning.
setI18n(i18n);

// Init with default 'pt'; async initI18n() will then update language from storage/device.
i18n.use(initReactI18next).init({
    ...I18N_BASE_OPTIONS,
    lng: 'pt',
});

const i18nPromise = initI18n();

export { i18n };
export default i18n;

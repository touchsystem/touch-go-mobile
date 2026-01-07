import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { scale, scaleFont } from '../utils/responsive';

// Mapeamento de códigos de idioma para siglas
const LANGUAGE_LABELS: Record<string, string> = {
    'pt': 'PT',
    'en': 'EN',
    'es': 'ES',
};

const LanguageSelector: React.FC = () => {
    const { language, availableLanguages, changeLanguage } = useLanguage();
    const { colors } = useTheme();

    const styles = useMemo(
        () =>
            StyleSheet.create({
                container: {
                    flexDirection: 'row',
                    justifyContent: 'center',
                    padding: scale(10),
                    backgroundColor: colors.surface,
                    borderRadius: scale(8),
                    marginVertical: scale(10),
                },
                languageButton: {
                    paddingHorizontal: scale(15),
                    paddingVertical: scale(8),
                    marginHorizontal: scale(5),
                    borderRadius: scale(4),
                    backgroundColor: colors.border,
                },
                selectedLanguage: {
                    backgroundColor: '#007AFF',
                },
                languageText: {
                    color: colors.textSecondary,
                    fontSize: scaleFont(14),
                },
                selectedLanguageText: {
                    color: '#fff',
                    fontWeight: 'bold',
                },
            }),
        [colors]
    );

    return (
        <View style={styles.container}>
            {availableLanguages.map((lang) => (
                <TouchableOpacity
                    key={lang.code}
                    style={[
                        styles.languageButton,
                        language === lang.code && styles.selectedLanguage,
                    ]}
                    onPress={() => changeLanguage(lang.code)}
                >
                    <Text
                        style={[
                            styles.languageText,
                            language === lang.code && styles.selectedLanguageText,
                        ]}
                    >
                        {LANGUAGE_LABELS[lang.code] || lang.code.toUpperCase()}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default LanguageSelector;

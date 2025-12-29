import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSelector: React.FC = () => {
    const { language, availableLanguages, changeLanguage } = useLanguage();

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
                        {lang.name}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        marginVertical: 10,
    },
    languageButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginHorizontal: 5,
        borderRadius: 4,
        backgroundColor: '#e0e0e0',
    },
    selectedLanguage: {
        backgroundColor: '#007AFF',
    },
    languageText: {
        color: '#333',
        fontSize: 14,
    },
    selectedLanguageText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default LanguageSelector;

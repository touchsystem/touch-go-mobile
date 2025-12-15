import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Modal as RNModal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { scale, scaleFont } from '../../utils/responsive';

interface AlertOptions {
    title?: string;
    message: string;
    buttons?: Array<{
        text: string;
        onPress?: () => void;
        style?: 'default' | 'cancel' | 'destructive';
    }>;
}

interface AlertState {
    visible: boolean;
    title: string;
    message: string;
    buttons: AlertOptions['buttons'];
}

let alertState: AlertState = {
    visible: false,
    title: '',
    message: '',
    buttons: [],
};

let alertListeners: Array<(state: AlertState) => void> = [];

const notifyListeners = () => {
    alertListeners.forEach((listener) => listener(alertState));
};

export const showAlert = (title: string, message: string, buttons?: AlertOptions['buttons']) => {
    alertState = {
        visible: true,
        title,
        message,
        buttons: buttons || [{ text: 'OK', onPress: () => { } }],
    };
    notifyListeners();
};

export const CustomAlert: React.FC = () => {
    const { colors, isDark } = useTheme();
    const [state, setState] = useState<AlertState>(alertState);

    useEffect(() => {
        const listener = (newState: AlertState) => {
            setState(newState);
        };
        alertListeners.push(listener);
        return () => {
            alertListeners = alertListeners.filter((l) => l !== listener);
        };
    }, []);

    const handleClose = () => {
        setState(prev => ({ ...prev, visible: false }));
        alertState.visible = false;
    };

    // Auto-fechar alertas de sucesso após 1 segundo
    useEffect(() => {
        if (state.visible && state.title.toLowerCase().includes('sucesso')) {
            const timer = setTimeout(() => {
                handleClose();
            }, 1000); // 1 segundo

            return () => clearTimeout(timer);
        }
    }, [state.visible, state.title]);

    const handleButtonPress = (button?: { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }) => {
        // Fecha o modal imediatamente atualizando o estado local
        setState(prev => ({ ...prev, visible: false }));
        alertState.visible = false;

        // Executa o callback do botão após um pequeno delay
        if (button?.onPress) {
            setTimeout(() => {
                button.onPress?.();
            }, 100);
        }
    };

    const styles = useMemo(
        () =>
            StyleSheet.create({
                overlay: {
                    flex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                contentWrapper: {
                    width: '85%',
                    maxWidth: 400,
                },
                content: {
                    backgroundColor: colors.surface,
                    borderRadius: scale(16),
                    padding: scale(20),
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 5,
                },
                titleContainer: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: scale(12),
                },
                iconContainer: {
                    width: scale(40),
                    height: scale(40),
                    borderRadius: scale(20),
                    backgroundColor: colors.primary + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: scale(12),
                },
                title: {
                    fontSize: scaleFont(20),
                    fontWeight: 'bold',
                    color: colors.text,
                    flex: 1,
                },
                message: {
                    fontSize: scaleFont(16),
                    color: colors.textSecondary,
                    marginBottom: scale(20),
                    lineHeight: scaleFont(22),
                },
                buttonsContainer: {
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    gap: scale(12),
                },
                button: {
                    paddingVertical: scale(10),
                    paddingHorizontal: scale(20),
                    borderRadius: scale(8),
                    minWidth: scale(80),
                    alignItems: 'center',
                },
                buttonPrimary: {
                    backgroundColor: colors.primary,
                },
                buttonCancel: {
                    backgroundColor: colors.border,
                },
                buttonDestructive: {
                    backgroundColor: colors.error,
                },
                buttonText: {
                    fontSize: scaleFont(16),
                    fontWeight: '600',
                    color: '#FFFFFF',
                },
                buttonCancelText: {
                    color: colors.text,
                },
            }),
        [colors]
    );

    const getIcon = () => {
        const titleLower = state.title.toLowerCase();
        if (titleLower.includes('erro')) {
            return 'close-circle';
        }
        if (titleLower.includes('sucesso')) {
            return 'checkmark-circle';
        }
        if (titleLower.includes('aviso')) {
            return 'warning';
        }
        return 'information-circle';
    };

    const getIconColor = () => {
        const titleLower = state.title.toLowerCase();
        if (titleLower.includes('erro')) {
            return colors.error;
        }
        if (titleLower.includes('sucesso')) {
            return '#10B981';
        }
        if (titleLower.includes('aviso')) {
            return '#F59E0B';
        }
        return colors.primary;
    };

    if (!state.visible) return null;

    return (
        <RNModal
            visible={state.visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <Pressable style={styles.overlay} onPress={handleClose}>
                <Pressable
                    style={styles.contentWrapper}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View style={styles.content}>
                        <View style={styles.titleContainer}>
                            <View style={[styles.iconContainer, { backgroundColor: getIconColor() + '20' }]}>
                                <Ionicons name={getIcon() as any} size={scale(24)} color={getIconColor()} />
                            </View>
                            <Text style={styles.title}>{state.title}</Text>
                        </View>
                        <Text style={styles.message}>{state.message}</Text>
                        {!state.title.toLowerCase().includes('sucesso') && (
                            <View style={styles.buttonsContainer}>
                                {state.buttons?.map((button, index) => {
                                    const isCancel = button.style === 'cancel';
                                    const isDestructive = button.style === 'destructive';
                                    const isPrimary = !isCancel && !isDestructive;

                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.button,
                                                isPrimary && styles.buttonPrimary,
                                                isCancel && styles.buttonCancel,
                                                isDestructive && styles.buttonDestructive,
                                            ]}
                                            onPress={() => handleButtonPress(button)}
                                        >
                                            <Text
                                                style={[
                                                    styles.buttonText,
                                                    isCancel && styles.buttonCancelText,
                                                ]}
                                            >
                                                {button.text}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                </Pressable>
            </Pressable>
        </RNModal>
    );
};


import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from './Button';
import { storage, storageKeys } from '../../services/storage';
import api from '../../services/api';

interface ChangeWaiterModalProps {
  visible: boolean;
  currentNick: string;
  onClose: () => void;
  onConfirm: (newNick: string) => void;
}

export const ChangeWaiterModal: React.FC<ChangeWaiterModalProps> = ({
  visible,
  currentNick,
  onClose,
  onConfirm,
}) => {
  const { colors, isDark } = useTheme();
  const [nick, setNick] = useState(currentNick);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      // Carrega o último nick usado do storage
      loadLastUsedNick();
      setValidationError(null);
    }
  }, [visible]);

  useEffect(() => {
    // Limpa erro de validação quando o nick muda
    if (validationError) {
      setValidationError(null);
    }
  }, [nick]);

  const loadLastUsedNick = async () => {
    try {
      const lastNick = await storage.getItem<string>(storageKeys.LAST_USED_NICK);
      if (lastNick) {
        setNick(lastNick);
      } else {
        setNick(currentNick);
      }
    } catch (error) {
      setNick(currentNick);
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        modalOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        },
        modalContent: {
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          width: Math.min(Dimensions.get('window').width * 0.9, 500),
          borderWidth: 1,
          borderColor: colors.border,
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        },
        title: {
          fontSize: 20,
          fontWeight: '600',
          color: colors.text,
        },
        closeButton: {
          padding: 4,
        },
        formGroup: {
          marginBottom: 20,
        },
        label: {
          fontSize: 14,
          fontWeight: '500',
          color: colors.text,
          marginBottom: 8,
        },
        input: {
          backgroundColor: isDark ? '#1A1F2B' : '#FFFFFF',
          borderWidth: 1,
          borderColor: validationError ? colors.error : colors.border,
          borderRadius: 8,
          padding: 12,
          fontSize: 16,
          color: colors.text,
        },
        errorText: {
          fontSize: 12,
          color: colors.error,
          marginTop: 4,
        },
        validationContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 4,
        },
        buttonsContainer: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: 12,
          marginTop: 20,
        },
      }),
    [colors, isDark, validationError]
  );

  const validateNick = async (nickToValidate: string): Promise<boolean> => {
    try {
      setValidating(true);
      setValidationError(null);

      // Busca usuário por nick na API usando o mesmo endpoint do projeto web
      const response = await api.get('/usuarios', {
        params: { usuario: nickToValidate.trim() },
      });
      
      // Verifica se retornou um array com pelo menos um usuário
      const users = response.data;
      if (Array.isArray(users) && users.length > 0) {
        // Verifica se algum usuário tem o nick exato (case-insensitive)
        const foundUser = users.find(
          (user: any) => user.nick?.toLowerCase() === nickToValidate.trim().toLowerCase()
        );
        
        if (foundUser && foundUser.id) {
          // Usuário encontrado
          return true;
        }
      }
      
      // Usuário não encontrado
      setValidationError('Usuário não encontrado');
      return false;
    } catch (error: any) {
      // Se for 404, usuário não existe
      if (error.response?.status === 404) {
        setValidationError('Usuário não encontrado');
        return false;
      }
      
      // Se retornar array vazio, usuário não existe
      if (error.response?.status === 200 && Array.isArray(error.response?.data) && error.response.data.length === 0) {
        setValidationError('Usuário não encontrado');
        return false;
      }
      
      // Outros erros (rede, servidor, etc)
      const errorMessage = error.response?.data?.erro || error.message || 'Erro ao validar usuário';
      setValidationError(errorMessage);
      return false;
    } finally {
      setValidating(false);
    }
  };

  const handleConfirm = async () => {
    if (!nick.trim()) {
      Alert.alert('Erro', 'O usuário é obrigatório!');
      return;
    }

    // Valida se o nick existe
    const isValid = await validateNick(nick.trim());
    
    if (!isValid) {
      // Erro já foi definido em validationError
      return;
    }

    // Salva o nick no storage
    try {
      await storage.setItem(storageKeys.LAST_USED_NICK, nick.trim());
    } catch (error) {
      console.error('Error saving nick:', error);
    }

    onConfirm(nick.trim());
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={styles.modalOverlay}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Trocar Usuário</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Usuário</Text>
              <TextInput
                style={styles.input}
                value={nick}
                onChangeText={setNick}
                placeholder="Digite o usuário"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!validating}
              />
              {validating && (
                <View style={styles.validationContainer}>
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
                  <Text style={[styles.errorText, { color: colors.textSecondary }]}>
                    Validando usuário...
                  </Text>
                </View>
              )}
              {validationError && !validating && (
                <View style={styles.validationContainer}>
                  <Ionicons name="alert-circle" size={16} color={colors.error} style={{ marginRight: 4 }} />
                  <Text style={styles.errorText}>{validationError}</Text>
                </View>
              )}
            </View>

            <View style={styles.buttonsContainer}>
              <Button
                title="Cancelar"
                onPress={onClose}
                variant="outline"
                style={{ minWidth: 100 }}
              />
              <Button
                title="Confirmar"
                onPress={handleConfirm}
                style={{ minWidth: 100 }}
                disabled={validating || !!validationError}
              />
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};


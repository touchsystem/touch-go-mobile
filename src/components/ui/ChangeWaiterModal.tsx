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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from './Button';
import { storage, storageKeys } from '../../services/storage';

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

  useEffect(() => {
    if (visible) {
      // Carrega o último nick usado do storage
      loadLastUsedNick();
    }
  }, [visible]);

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
          borderColor: colors.border,
          borderRadius: 8,
          padding: 12,
          fontSize: 16,
          color: colors.text,
        },
        buttonsContainer: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: 12,
          marginTop: 20,
        },
      }),
    [colors, isDark]
  );

  const handleConfirm = async () => {
    if (!nick.trim()) {
      Alert.alert('Erro', 'O nick do garçom é obrigatório!');
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
              <Text style={styles.title}>Trocar Garçom</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nick do Garçom</Text>
              <TextInput
                style={styles.input}
                value={nick}
                onChangeText={setNick}
                placeholder="Digite o nick do garçom"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
              />
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
              />
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};


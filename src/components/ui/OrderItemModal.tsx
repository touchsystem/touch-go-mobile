import React, { useState, useMemo } from 'react';
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
import { scale, scaleFont, scaleWidth, widthPercentage } from '../../utils/responsive';

interface OrderItemModalProps {
  visible: boolean;
  itemName: string;
  currentObservation: string;
  currentQuantity: number;
  onClose: () => void;
  onSave: (newQuantity: number, newObservation: string) => void;
}

export const OrderItemModal: React.FC<OrderItemModalProps> = ({
  visible,
  itemName,
  currentObservation,
  currentQuantity,
  onClose,
  onSave,
}) => {
  const { colors, isDark } = useTheme();
  const [observation, setObservation] = useState(currentObservation);
  const [quantity, setQuantity] = useState(currentQuantity.toString());

  // Atualiza os estados quando o modal é aberto com novos valores
  React.useEffect(() => {
    if (visible) {
      setObservation(currentObservation);
      setQuantity(currentQuantity.toString());
    }
  }, [visible, currentObservation, currentQuantity]);

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
          borderRadius: scale(16),
          padding: scale(20),
          width: Math.min(widthPercentage(90), scaleWidth(500)),
          borderWidth: 1,
          borderColor: colors.border,
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: scale(20),
        },
        title: {
          fontSize: scaleFont(20),
          fontWeight: '600',
          color: colors.text,
        },
        closeButton: {
          padding: scale(4),
        },
        formGroup: {
          marginBottom: scale(20),
        },
        label: {
          fontSize: scaleFont(14),
          fontWeight: '500',
          color: colors.text,
          marginBottom: scale(8),
        },
        quantityInput: {
          backgroundColor: isDark ? '#1A1F2B' : '#FFFFFF',
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: scale(8),
          padding: scale(12),
          fontSize: scaleFont(16),
          color: colors.text,
        },
        observationInput: {
          backgroundColor: isDark ? '#1A1F2B' : '#FFFFFF',
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: scale(8),
          padding: scale(12),
          fontSize: scaleFont(16),
          color: colors.text,
          minHeight: scaleHeight(100),
          textAlignVertical: 'top',
        },
        buttonsContainer: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: scale(12),
          marginTop: scale(20),
        },
      }),
    [colors, isDark]
  );

  const handleSave = () => {
    // Converte vírgula para ponto e transforma em número
    const parsedQuantity = parseFloat(quantity.replace(',', '.'));

    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      Alert.alert('Erro', 'A quantidade deve ser maior que zero!');
      return;
    }

    onSave(parsedQuantity, observation);
    onClose();
  };

  const handleQuantityChange = (value: string) => {
    // Converte vírgula para ponto
    let normalizedValue = value.replace(',', '.');
    // Permite apenas números e um único ponto decimal
    if (/^\d*\.?\d*$/.test(normalizedValue)) {
      setQuantity(normalizedValue);
    }
  };

  const handleQuantityBlur = () => {
    // Garante formatação correta ao sair do campo
    const parsedQuantity = parseFloat(quantity.replace(',', '.'));
    if (!isNaN(parsedQuantity) && parsedQuantity > 0) {
      setQuantity(parsedQuantity.toString());
    } else {
      setQuantity('1');
    }
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
              <Text style={styles.title}>Editar Item</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={scale(24)} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Produto</Text>
              <Text style={{ color: colors.textSecondary, fontSize: scaleFont(14) }}>{itemName}</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Quantidade</Text>
              <TextInput
                style={styles.quantityInput}
                value={quantity}
                onChangeText={handleQuantityChange}
                onBlur={handleQuantityBlur}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Observação</Text>
              <TextInput
                style={styles.observationInput}
                value={observation}
                onChangeText={setObservation}
                placeholder="Adicione uma observação..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
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
                title="Salvar"
                onPress={handleSave}
                style={{ minWidth: 100 }}
              />
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};





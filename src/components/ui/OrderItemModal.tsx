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
        quantityInput: {
          backgroundColor: isDark ? '#1A1F2B' : '#FFFFFF',
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          padding: 12,
          fontSize: 16,
          color: colors.text,
        },
        observationInput: {
          backgroundColor: isDark ? '#1A1F2B' : '#FFFFFF',
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          padding: 12,
          fontSize: 16,
          color: colors.text,
          minHeight: 100,
          textAlignVertical: 'top',
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
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Produto</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{itemName}</Text>
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





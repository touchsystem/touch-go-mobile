import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal as RNModal, Pressable } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { scale } from '../../utils/responsive';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ visible, onClose, children }) => {
  const { colors } = useTheme();

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
          width: '90%',
          maxWidth: 500,
          maxHeight: '90%',
        },
        content: {
          width: '100%',
          backgroundColor: colors.surface,
          borderRadius: scale(16),
          padding: scale(20),
        },
      }),
    [colors]
  );

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
      >
        <Pressable
          style={styles.contentWrapper}
          onPress={(e) => e.stopPropagation()}
        >
          <View 
            style={styles.content}
            onStartShouldSetResponder={() => false}
            onMoveShouldSetResponder={() => false}
          >
            {children}
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
};




import React from 'react';
import { View, TouchableOpacity, StyleSheet, Modal as RNModal, Pressable } from 'react-native';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ visible, onClose, children }) => {
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

const styles = StyleSheet.create({
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
  },
});




import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Alert } from '../../utils/alert';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useServerConfig } from '../../hooks/useServerConfig';
import { scale, scaleFont } from '../../utils/responsive';

interface ServerConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ServerConfigModal: React.FC<ServerConfigModalProps> = ({
  visible,
  onClose,
}) => {
  const { config, updateConfig } = useServerConfig();
  const [apiUrl, setApiUrl] = useState(config.apiUrl);
  const [apiUrlLocal, setApiUrlLocal] = useState(config.apiUrlLocal || '');

  const handleSave = async () => {
    const success = await updateConfig({
      ...config,
      apiUrl,
      apiUrlLocal,
    });

    if (success) {
      Alert.alert('Sucesso', 'Configuração salva');
      onClose();
    } else {
      Alert.alert('Erro', 'Erro ao salvar configuração');
    }
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <Text style={styles.title}>Configuração do Servidor</Text>
      <Input
        label="URL da API"
        value={apiUrl}
        onChangeText={setApiUrl}
        placeholder="http://192.168.0.234:5001"
      />
      <Input
        label="URL Local (opcional)"
        value={apiUrlLocal}
        onChangeText={setApiUrlLocal}
        placeholder="http://localhost:5001"
      />
      <View style={styles.buttons}>
        <Button
          title="Cancelar"
          variant="outline"
          onPress={onClose}
          style={styles.button}
        />
        <Button
          title="Salvar"
          onPress={handleSave}
          style={styles.button}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    marginBottom: scale(20),
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: scale(10),
    marginTop: scale(10),
  },
  button: {
    flex: 1,
  },
});







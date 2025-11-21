import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { NumericKeypad } from '../ui/NumericKeypad';
import { useServerConfig } from '../../hooks/useServerConfig';

export const ServerConfigButton: React.FC = () => {
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [code, setCode] = useState('');
  const { config, updateConfig } = useServerConfig();
  const [apiUrlLocal, setApiUrlLocal] = useState(config.apiUrlLocal || config.apiUrl || 'http://192.168.0.234:5000');

  const handleConfigClick = () => {
    setCode('');
    setShowCodeModal(true);
  };

  const handleNumberPress = (number: string) => {
    if (code.length < 6) {
      setCode(code + number);
    }
  };

  const handleDelete = () => {
    setCode(code.slice(0, -1));
  };

  const handleCodeConfirm = () => {
    // Código padrão: 282010 (pode ser configurável)
    if (code === '282010' || code === '1234') {
      setShowCodeModal(false);
      // Atualiza o valor do campo quando abre o modal
      setApiUrlLocal(config.apiUrlLocal || config.apiUrl || 'http://192.168.0.234:5000');
      setShowConfigModal(true);
      setCode('');
    } else {
      Alert.alert('Erro', 'Código incorreto!');
      setCode('');
    }
  };

  const handleSaveConfig = async () => {
    const success = await updateConfig({
      ...config,
      apiUrl: apiUrlLocal, // No mobile, usa a URL local como principal
      apiUrlLocal: apiUrlLocal,
    });

    if (success) {
      Alert.alert('Sucesso', 'Configuração salva com sucesso!');
      setShowConfigModal(false);
    } else {
      Alert.alert('Erro', 'Erro ao salvar configuração');
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.configButton}
        onPress={handleConfigClick}
      >
        <Ionicons name="settings-outline" size={16} color="#666" />
        <Text style={styles.configButtonText}>Configurações do Servidor</Text>
      </TouchableOpacity>

      {/* Modal de Código */}
      <Modal visible={showCodeModal} onClose={() => setShowCodeModal(false)}>
        <Text style={styles.modalTitle}>Digite o código de acesso</Text>
        <View style={styles.codeInputContainer}>
          <Text style={[styles.codeInput, !code && styles.codeInputPlaceholder]}>
            {code || 'Digite o código'}
          </Text>
        </View>
        <View style={styles.keypadContainer}>
          <NumericKeypad
            onNumberPress={handleNumberPress}
            onDelete={handleDelete}
            onConfirm={handleCodeConfirm}
          />
        </View>
        <View style={styles.modalButtons}>
          <Button
            title="Cancelar"
            variant="outline"
            onPress={() => {
              setShowCodeModal(false);
              setCode('');
            }}
            style={styles.modalButton}
          />
          <Button
            title="Confirmar"
            onPress={handleCodeConfirm}
            disabled={code.length < 3}
            style={styles.modalButton}
          />
        </View>
      </Modal>

      {/* Modal de Configuração */}
      <Modal visible={showConfigModal} onClose={() => setShowConfigModal(false)}>
        <Text style={styles.modalTitle}>Configuração do Servidor Local</Text>
        <Input
          label="URL da API Local"
          value={apiUrlLocal}
          onChangeText={setApiUrlLocal}
          placeholder="http://192.168.0.234:5000"
        />
        <Text style={styles.helpText}>
          Digite o endereço IP e porta do servidor local
        </Text>
        <View style={styles.modalButtons}>
          <Button
            title="Cancelar"
            variant="outline"
            onPress={() => setShowConfigModal(false)}
            style={styles.modalButton}
          />
          <Button
            title="Salvar"
            onPress={handleSaveConfig}
            style={styles.modalButton}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  configButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 5,
  },
  configButtonText: {
    fontSize: 12,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  codeInputContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    minHeight: 50,
    justifyContent: 'center',
  },
  codeInput: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    letterSpacing: 4,
  },
  codeInputPlaceholder: {
    color: '#999',
    letterSpacing: 0,
  },
  keypadContainer: {
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: -10,
    marginBottom: 10,
  },
});


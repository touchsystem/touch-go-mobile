import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { NumericKeypad } from '../components/ui/NumericKeypad';
import { Button } from '../components/ui/Button';

export default function CodeAccessScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithCode } = useAuth();
  const router = useRouter();

  const handleNumberPress = (number: string) => {
    if (code.length < 6) {
      setCode(code + number);
    }
  };

  const handleDelete = () => {
    setCode(code.slice(0, -1));
  };

  const handleConfirm = async () => {
    if (code.length < 3) {
      Alert.alert('Erro', 'Código deve ter pelo menos 3 dígitos');
      return;
    }

    setLoading(true);
    try {
      await loginWithCode(code);
      router.replace('/(tabs)/orders');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Código inválido');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Acesso ao Sistema</Text>

        <View style={styles.iconContainer}>
          <View style={styles.lockIcon}>
            <Ionicons name="lock-closed" size={48} color="#fff" />
          </View>
        </View>

        <Text style={styles.subtitle}>Código de Acesso</Text>
        <Text style={styles.instruction}>Digite seu código para acessar</Text>

        <View style={styles.codeInputContainer}>
          <Text style={[styles.codeInput, !code && styles.codeInputPlaceholder]}>
            {code || 'Digite o código de acesso'}
          </Text>
        </View>

        <Button
          title="Acessar Sistema"
          onPress={handleConfirm}
          loading={loading}
          disabled={code.length < 3}
          style={styles.accessButton}
        />

        <View style={styles.keypadContainer}>
          <NumericKeypad
            onNumberPress={handleNumberPress}
            onDelete={handleDelete}
            onConfirm={handleConfirm}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 30,
  },
  iconContainer: {
    marginBottom: 30,
  },
  lockIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  codeInputContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 30,
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
  accessButton: {
    width: '100%',
    marginBottom: 40,
  },
  keypadContainer: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: 40,
  },
});

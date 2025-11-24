import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
        },
        optionsRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 30,
        },
        forgotPassword: {
          fontSize: 14,
          color: colors.textSecondary,
        },
        loginButton: {
          marginBottom: 20,
        },
      }),
    [colors]
  );

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha email e senha');
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      router.replace('/(tabs)/orders');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        label="Email"
        placeholder="seu@email.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        rightIcon={
          <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
        }
      />

      <Input
        label="Senha"
        placeholder="Digite sua senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        rightIcon={
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={colors.textSecondary}
          />
        }
        onRightIconPress={() => setShowPassword(!showPassword)}
      />

      <View style={styles.optionsRow}>
        <Checkbox
          label="Lembrar-me"
          checked={rememberMe}
          onToggle={() => setRememberMe(!rememberMe)}
        />
        <Text style={styles.forgotPassword}>Esqueci a senha</Text>
      </View>

      <Button
        title="Entrar"
        onPress={handleLogin}
        loading={loading}
        style={styles.loginButton}
      />
    </View>
  );
};


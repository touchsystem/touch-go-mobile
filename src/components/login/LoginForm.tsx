import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Alert } from '../../utils/alert';
import { useRouter } from 'expo-router';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { storage, storageKeys } from '../../services/storage';
import { useLanguage } from '../../contexts/LanguageContext';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();

  // Carregar email salvo quando o componente monta
  useEffect(() => {
    const loadRememberedEmail = async () => {
      try {
        const savedEmail = await storage.getItem<string>(storageKeys.REMEMBERED_EMAIL);
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (error) {
        console.error('Erro ao carregar email salvo:', error);
      }
    };
    loadRememberedEmail();
  }, []);

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
      Alert.alert(t('common.error'), t('errors.fillEmailPassword'));
      return;
    }

    setLoading(true);
    try {
      // Salvar ou remover email do storage baseado no "lembrar-me"
      if (rememberMe) {
        await storage.setItem(storageKeys.REMEMBERED_EMAIL, email);
      } else {
        await storage.removeItem(storageKeys.REMEMBERED_EMAIL);
      }

      await login({ email, password });
      router.replace('/(tabs)/menu');
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('errors.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        label={t('login.email')}
        placeholder={t('login.emailPlaceholder')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        rightIcon={
          <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
        }
      />

      <Input
        label={t('login.password')}
        placeholder={t('auth.password')}
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
          label={t('login.rememberMe')}
          checked={rememberMe}
          onToggle={() => setRememberMe(!rememberMe)}
        />
        <Text style={styles.forgotPassword}>{t('login.forgotPassword')}</Text>
      </View>

      <Button
        title={t('auth.login')}
        onPress={handleLogin}
        loading={loading}
        style={styles.loginButton}
      />
    </View>
  );
};


import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!loading) {
      const inAuthGroup = segments[0] === 'login' || segments.length === 0;
      const inTabs = segments[0] === '(tabs)';
      const isSettingsScreen = inTabs && (segments[1] === 'settings' || segments[1] === 'payment-methods');
      
      if (!user) {
        // Usuário não autenticado
        if (!inAuthGroup && !inTabs) {
          // Não está na tela de login, redireciona
          router.replace('/login');
        } else if (inTabs && !isSettingsScreen) {
          // Está tentando acessar tabs sem autenticação (exceto configurações), redireciona
          router.replace('/login');
        }
        // Se for tela de configurações, permite acesso sem autenticação
      } else {
        // Usuário autenticado
        if (inAuthGroup && segments[0] === 'login') {
          // Está na tela de login mas está autenticado, redireciona para menu
          router.replace('/(tabs)/menu');
        }
      }
    }
  }, [user, loading, segments, router]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});


import { AuthGuard } from '@/src/components/auth/AuthGuard';
import { useTheme } from '@/src/contexts/ThemeContext';
import { AppProviders } from '@/src/providers/AppProviders';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

function ThemedLayout() {
  const { isDark } = useTheme();

  useEffect(() => {
    // Ocultar barra de navegação do Android (modo imersivo)
    if (Platform.OS === 'android') {
      // Ocultar a barra de navegação completamente
      NavigationBar.setVisibilityAsync('hidden').catch((error) => {
        console.log('Error hiding navigation bar:', error);
      });
    }
  }, []);

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <AuthGuard>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="code-access" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </AuthGuard>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <ThemedLayout />
    </AppProviders>
  );
}

import { AuthGuard } from '@/src/components/auth/AuthGuard';
import { CustomAlert } from '@/src/components/ui/CustomAlert';
import { useTheme } from '@/src/contexts/ThemeContext';
import { AppProviders } from '@/src/providers/AppProviders';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { View, StyleSheet } from 'react-native';
import 'react-native-reanimated';

// Manter splash nativa visível até o app estar pronto (auth verificado)
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

function ThemedLayout() {
  const { isDark, colors } = useTheme();

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <AuthGuard>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
          <CustomAlert />
        </AuthGuard>
      </NavigationThemeProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default function RootLayout() {
  return (
    <AppProviders>
      <ThemedLayout />
    </AppProviders>
  );
}

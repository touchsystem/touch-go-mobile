import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LoginForm } from '../components/login/LoginForm';
import { ConfigButton } from '../components/login/ConfigButton';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import { scale, scaleFont } from '../utils/responsive';

export default function LoginScreen() {
  const { colors, isDark } = useTheme();

  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      padding: scale(20),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: scale(10),
      paddingHorizontal: scale(20),
    },
    title: {
      marginTop: scale(20),
      fontSize: scaleFont(24),
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: scale(30),
      color: colors.text,
    },
    iconContainer: {
      alignItems: 'center',
      marginBottom: scale(40),
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: scale(30),
    },
    logo: {
      width: scale(200),
      height: scale(120),
      resizeMode: 'contain',
      marginBottom: scale(20),
    },
    welcomeText: {
      fontSize: scaleFont(20),
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: scale(8),
    },
    subtitle: {
      fontSize: scaleFont(12),
      color: colors.textSecondary,
    },
    supportSection: {
      marginTop: 'auto',
      marginBottom: scale(20),
    },
    supportText: {
      fontSize: scaleFont(11),
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: scale(15),
    },
    supportButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: scale(20),
    },
    supportButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(5),
    },
    supportButtonText: {
      fontSize: scaleFont(12),
      color: colors.text,
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView 
        style={[themedStyles.container, { backgroundColor: colors.background }]} 
        edges={['top', 'bottom']}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, backgroundColor: colors.background }}
        >
          <View style={themedStyles.header}>
            <ConfigButton />
            <ThemeToggle />
          </View>
          <ScrollView 
            contentContainerStyle={themedStyles.scrollContent}
            showsVerticalScrollIndicator={false}
            style={{ backgroundColor: colors.background }}
          >
            <View style={themedStyles.content}>
              <View style={themedStyles.iconContainer}>
                <View style={themedStyles.logoContainer}>
                  <Image
                    source={isDark 
                      ? require('../../assets/images/logo_dark.png')
                      : require('../../assets/images/logo_light.png')
                    }
                    style={themedStyles.logo}
                  />
                </View>
                <Text style={themedStyles.welcomeText}>EatzGo Mobile</Text>
                <Text style={themedStyles.subtitle}>Faça login para acessar o sistema</Text>
              </View>

              <LoginForm />

              <View style={themedStyles.supportSection}>
                <Text style={themedStyles.supportText}>
                  Problemas para acessar? Entre em contato com o administrador
                </Text>
                <View style={themedStyles.supportButtons}>
                  <TouchableOpacity style={themedStyles.supportButton}>
                    <Ionicons name="call-outline" size={scale(18)} color={colors.icon} />
                    <Text style={themedStyles.supportButtonText}>Suporte</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={themedStyles.supportButton}>
                    <Ionicons name="help-circle-outline" size={scale(18)} color={colors.icon} />
                    <Text style={themedStyles.supportButtonText}>Ajuda</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

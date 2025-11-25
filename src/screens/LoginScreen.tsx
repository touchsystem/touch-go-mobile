import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoginForm } from '../components/login/LoginForm';
import { ServerConfigButton } from '../components/login/ServerConfigButton';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

export default function LoginScreen() {
  const { colors } = useTheme();

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
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingTop: 40,
      paddingHorizontal: 20,
    },
    title: {
      marginTop: 20,
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 30,
      color: colors.text,
    },
    iconContainer: {
      alignItems: 'center',
      marginBottom: 40,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    welcomeText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    supportSection: {
      marginTop: 'auto',
      marginBottom: 20,
    },
    supportText: {
      fontSize: 11,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 15,
    },
    supportButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 20,
    },
    supportButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    supportButtonText: {
      fontSize: 12,
      color: colors.text,
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={themedStyles.container}
    >
      <View style={themedStyles.header}>
        <ThemeToggle />
      </View>
      <ScrollView contentContainerStyle={themedStyles.scrollContent}>
        <View style={themedStyles.content}>
          <View style={themedStyles.iconContainer}>
            <View style={themedStyles.iconCircle}>
              <Ionicons name="restaurant" size={48} color={colors.text} />
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
                <Ionicons name="call-outline" size={18} color={colors.icon} />
                <Text style={themedStyles.supportButtonText}>Suporte</Text>
              </TouchableOpacity>
              <TouchableOpacity style={themedStyles.supportButton}>
                <Ionicons name="help-circle-outline" size={18} color={colors.icon} />
                <Text style={themedStyles.supportButtonText}>Ajuda</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ServerConfigButton />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

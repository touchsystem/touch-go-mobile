import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ChangeWaiterModal } from '../components/ui/ChangeWaiterModal';
import { ColorPicker } from '../components/ui/ColorPicker';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [isChangeWaiterModalVisible, setIsChangeWaiterModalVisible] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          paddingTop: 40,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitle: {
          fontSize: 18,
          fontWeight: '600',
          color: colors.text,
        },
        scrollContent: {
          padding: 16,
        },
        avatarContainer: {
          alignItems: 'center',
          marginBottom: 24,
        },
        avatar: {
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 16,
        },
        avatarText: {
          fontSize: 36,
          fontWeight: 'bold',
          color: '#fff',
        },
        userName: {
          fontSize: 24,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 4,
        },
        userEmail: {
          fontSize: 14,
          color: colors.textSecondary,
        },
        section: {
          marginBottom: 24,
        },
        sectionTitle: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 12,
        },
        infoRow: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        infoLabel: {
          fontSize: 14,
          color: colors.textSecondary,
          flex: 1,
        },
        infoValue: {
          fontSize: 14,
          fontWeight: '500',
          color: colors.text,
        },
        logoutButton: {
          marginTop: 12,
        },
        logoutButtonDanger: {
          marginTop: 12,
          borderColor: colors.error,
        },
        themeSection: {
          marginBottom: 24,
        },
        themeRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        themeLabel: {
          fontSize: 14,
          color: colors.textSecondary,
          flex: 1,
        },
        themeToggleContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        },
        themeModeText: {
          fontSize: 14,
          fontWeight: '500',
          color: colors.text,
        },
      }),
    [colors]
  );

  const handleChangeWaiter = () => {
    setIsChangeWaiterModalVisible(true);
  };

  const handleConfirmChangeWaiter = (newNick: string) => {
    // O nick já foi salvo no storage pelo modal
    Alert.alert('Sucesso', `Usuário alterado para: ${newNick}`);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair do Sistema',
      'Deseja realmente sair? Você precisará fazer login novamente.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getLevelName = (level: number): string => {
    const levelNames: Record<number, string> = {
      1: 'Usuário',
      2: 'Caixa',
      3: 'Supervisor',
      4: 'Gerente',
      5: 'Administrador',
    };
    return levelNames[level] || `Nível ${level}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(user?.nome || 'Usuário')}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.nome || 'Usuário'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
        </View>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nome</Text>
            <Text style={styles.infoValue}>{user?.nome || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Apelido</Text>
            <Text style={styles.infoValue}>{user?.nick || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Nível de Acesso</Text>
            <Text style={styles.infoValue}>{getLevelName(user?.nivel || 0)}</Text>
          </View>
        </Card>

        <Card style={styles.themeSection}>
          <Text style={styles.sectionTitle}>Aparência</Text>

          <View style={styles.themeRow}>
            <Text style={styles.themeLabel}>Modo</Text>
            <View style={styles.themeToggleContainer}>
              <Text style={styles.themeModeText}>
                {theme === 'system' ? 'Sistema' : theme === 'dark' ? 'Escuro' : 'Claro'}
              </Text>
              <ThemeToggle />
            </View>
          </View>
        </Card>

        <Card style={styles.themeSection}>
          <ColorPicker />
        </Card>

        <Button
          title="Trocar Usuário"
          variant="outline"
          onPress={handleChangeWaiter}
          icon={<Ionicons name="person-outline" size={20} color={colors.text} />}
          style={styles.logoutButton}
        />

        <Button
          title="Sair do Sistema"
          variant="outline"
          onPress={handleLogout}
          icon={<Ionicons name="log-out-outline" size={20} color={colors.error} />}
          style={[styles.logoutButton, styles.logoutButtonDanger]}
          textStyle={{ color: colors.error }}
        />
      </ScrollView>

      <ChangeWaiterModal
        visible={isChangeWaiterModalVisible}
        currentNick={user?.nick || ''}
        onClose={() => setIsChangeWaiterModalVisible(false)}
        onConfirm={handleConfirmChangeWaiter}
      />
    </View>
  );
}


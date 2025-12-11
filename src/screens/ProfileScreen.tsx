import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ChangeWaiterModal } from '../components/ui/ChangeWaiterModal';
import { ColorPicker } from '../components/ui/ColorPicker';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { scale, scaleFont } from '../utils/responsive';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { colors, theme } = useTheme();
  const insets = useSafeAreaInsets();
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
          justifyContent: 'space-between',
          paddingHorizontal: scale(20),
          paddingVertical: scale(20),
          paddingTop: Math.max(insets.top + scale(10), scale(20)),
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          minHeight: scale(70),
        },
        backButton: {
          width: scale(40),
          height: scale(40),
          justifyContent: 'center',
          alignItems: 'center',
        },
        headerTitle: {
          fontSize: scaleFont(18),
          fontWeight: '600',
          color: colors.text,
          textAlign: 'center',
          flex: 1,
        },
        scrollContent: {
          padding: scale(16),
        },
        avatarContainer: {
          alignItems: 'center',
          marginBottom: scale(24),
        },
        avatar: {
          width: scale(100),
          height: scale(100),
          borderRadius: scale(50),
          backgroundColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: scale(16),
        },
        avatarText: {
          fontSize: scaleFont(36),
          fontWeight: 'bold',
          color: '#fff',
        },
        userName: {
          fontSize: scaleFont(24),
          fontWeight: '600',
          color: colors.text,
          marginBottom: scale(4),
        },
        userEmail: {
          fontSize: scaleFont(14),
          color: colors.textSecondary,
        },
        section: {
          marginBottom: scale(24),
        },
        sectionTitle: {
          fontSize: scaleFont(16),
          fontWeight: '600',
          color: colors.text,
          marginBottom: scale(12),
        },
        infoRow: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: scale(12),
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        infoLabel: {
          fontSize: scaleFont(14),
          color: colors.textSecondary,
          flex: 1,
        },
        infoValue: {
          fontSize: scaleFont(14),
          fontWeight: '500',
          color: colors.text,
        },
        logoutButton: {
          marginTop: scale(12),
        },
        logoutButtonDanger: {
          marginTop: scale(12),
          borderColor: colors.error,
        },
        themeSection: {
          marginBottom: scale(24),
        },
        themeRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: scale(12),
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        themeLabel: {
          fontSize: scaleFont(14),
          color: colors.textSecondary,
          flex: 1,
        },
        themeToggleContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: scale(12),
        },
        themeModeText: {
          fontSize: scaleFont(14),
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

  const getLevelName = (user: User | null): string => {
    // Prioriza o nome do nível vindo da API
    if (user?.nivel_nome) {
      return user.nivel_nome;
    }
    if (user?.nivelNome) {
      return user.nivelNome;
    }
    // Se não tiver nome, usa mapeamento padrão
    const level = user?.nivel || 0;
    const levelNames: Record<number, string> = {
      1: 'Garçom',
      2: 'Caixa',
      3: 'Supervisor',
      4: 'Gerente',
      5: 'Administrador',
      6: 'Suporte',
    };
    return levelNames[level] || `Nível ${level}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={scale(24)} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={{ width: scale(40) }} />
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
            <Text style={styles.infoValue}>{getLevelName(user)}</Text>
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
          icon={<Ionicons name="person-outline" size={scale(20)} color={colors.text} />}
          style={styles.logoutButton}
        />

        <Button
          title="Sair do Sistema"
          variant="outline"
          onPress={handleLogout}
          icon={<Ionicons name="log-out-outline" size={scale(20)} color={colors.error} />}
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


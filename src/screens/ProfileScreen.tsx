import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Alert } from '../utils/alert';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ChangeWaiterModal } from '../components/ui/ChangeWaiterModal';
import { ColorPicker } from '../components/ui/ColorPicker';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { scale, scaleFont } from '../utils/responsive';
import { storage, storageKeys } from '../services/storage';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { colors, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [isChangeWaiterModalVisible, setIsChangeWaiterModalVisible] = useState(false);
  const [profileNick, setProfileNick] = useState<string | null>(null);

  const loadProfileNick = useCallback(async () => {
    // Primeiro tenta do storage
    const nick = await storage.getItem<string>(storageKeys.LAST_USED_NICK);
    setProfileNick(nick);
  }, []);

  // Carrega o nick quando o componente monta
  useEffect(() => {
    loadProfileNick();
  }, [loadProfileNick]);

  // Atualiza o nick quando o user do AuthContext muda (após login)
  useEffect(() => {
    if (user?.nick) {
      setProfileNick(user.nick);
    }
  }, [user?.nick]);

  // Recarrega o nick quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      loadProfileNick();
    }, [loadProfileNick])
  );

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
        headerNick: {
          fontSize: scaleFont(12),
          color: colors.textSecondary,
          textAlign: 'right',
          marginTop: scale(4),
        },
        headerRight: {
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'center',
          minWidth: scale(80),
        },
        scrollContent: {
          padding: scale(12),
        },
        avatarContainer: {
          alignItems: 'center',
          marginBottom: scale(16),
        },
        avatar: {
          width: scale(80),
          height: scale(80),
          borderRadius: scale(40),
          backgroundColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: scale(8),
        },
        avatarText: {
          fontSize: scaleFont(28),
          fontWeight: 'bold',
          color: '#fff',
        },
        userName: {
          fontSize: scaleFont(20),
          fontWeight: '600',
          color: colors.text,
          marginBottom: scale(2),
        },
        userEmail: {
          fontSize: scaleFont(12),
          color: colors.textSecondary,
        },
        section: {
          marginBottom: scale(16),
        },
        sectionTitle: {
          fontSize: scaleFont(16),
          fontWeight: '600',
          color: colors.text,
          marginBottom: scale(8),
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
          marginBottom: scale(16),
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
    // Atualiza o nick exibido imediatamente
    setProfileNick(newNick);
    Alert.alert(t('common.success'), t('success.userChanged', { nick: newNick }));
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout'),
      t('profile.logoutConfirm'),
      [
        {
          text: t('profile.logoutCancel'),
          style: 'cancel',
        },
        {
          text: t('auth.logout'),
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
      1: t('profile.levelNames.1'),
      2: t('profile.levelNames.2'),
      3: t('profile.levelNames.3'),
      4: t('profile.levelNames.4'),
      5: t('profile.levelNames.5'),
      6: t('profile.levelNames.6'),
    };
    return levelNames[level] || t('profile.level', { level });
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
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>
        <View style={styles.headerRight}>
          {profileNick && (
            <Text style={styles.headerNick}>{profileNick}</Text>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(user?.nome || t('profile.user'))}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.nome || t('profile.user')}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
        </View>

        <Card style={styles.themeSection}>
          <Text style={styles.sectionTitle}>{t('profile.appearance')}</Text>

          <View style={styles.themeRow}>
            <Text style={styles.themeLabel}>{t('profile.mode')}</Text>
            <View style={styles.themeToggleContainer}>
              <Text style={styles.themeModeText}>
                {theme === 'system' ? t('profile.system') : theme === 'dark' ? t('profile.dark') : t('profile.light')}
              </Text>
              <ThemeToggle />
            </View>
          </View>
        </Card>

        <Card style={styles.themeSection}>
          <ColorPicker />
        </Card>

        <Button
          title={t('profile.changeUser')}
          variant="outline"
          onPress={handleChangeWaiter}
          icon={<Ionicons name="person-outline" size={scale(20)} color={colors.text} />}
          style={styles.logoutButton}
        />

        <Button
          title={t('profile.logout')}
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


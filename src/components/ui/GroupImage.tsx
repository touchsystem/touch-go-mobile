import React, { useState, useEffect, useMemo } from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { storage, storageKeys } from '../../services/storage';
import { Empresa } from '../../types';

interface GroupImageProps {
  cod_gp: string;
  status?: string;
  className?: string;
  groupName?: string;
  showNameOnFallback?: boolean;
}

// Cache local para URLs de imagens de grupo que deram erro
const erroredGroupImages = new Set<string>();

export const GroupImage: React.FC<GroupImageProps> = ({
  cod_gp,
  status = 'C',
  className,
  groupName,
  showNameOnFallback = false,
}) => {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const [hasError, setHasError] = useState(false);
  const [cdEmp, setCdEmp] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadCdEmp = async () => {
      try {
        // Tenta obter da empresa armazenada primeiro
        const empresa = await storage.getItem<Empresa>(storageKeys.EMPRESA);
        if (empresa?.cdemp) {
          setCdEmp(empresa.cdemp);
        } else if (user?.CDEMP) {
          setCdEmp(user.CDEMP);
        }
      } catch (error) {
        console.error('Error loading cdEmp:', error);
      }
    };

    loadCdEmp();
  }, [user]);

  useEffect(() => {
    if (cdEmp) {
      const folder = (() => {
        switch (status?.toUpperCase()) {
          case 'P':
            return 'groups/products';
          case 'COMPOSICAO':
            return 'groups/compositions';
          case 'C':
          default:
            return 'groups/catalogs';
        }
      })();

      const url = `https://eatzgo-images.s3.us-east-1.amazonaws.com/${cdEmp}/${folder}/group_${cod_gp}.jpg?t=${Date.now()}`;
      
      // Verifica se já sabemos que essa imagem deu erro
      if (erroredGroupImages.has(url)) {
        setHasError(true);
      } else {
        setImageUrl(url);
      }
    }
  }, [cdEmp, cod_gp, status]);

  const handleImageError = () => {
    if (imageUrl) {
      erroredGroupImages.add(imageUrl);
    }
    setHasError(true);
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          width: '100%',
          height: '100%',
          borderRadius: 10,
          overflow: 'hidden',
          backgroundColor: isDark ? '#1C2230' : '#F4F4F5',
          justifyContent: 'center',
          alignItems: 'center',
        },
        image: {
          width: '100%',
          height: '100%',
        },
        fallback: {
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: isDark ? '#1C2230' : '#F4F4F5',
        },
        fallbackText: {
          fontSize: 12,
          color: colors.text,
          textAlign: 'center',
          fontWeight: '600',
          paddingHorizontal: 8,
        },
      }),
    [colors, isDark]
  );

  if (hasError || !imageUrl) {
    if (showNameOnFallback && groupName) {
      return (
        <View style={[styles.container, className]}>
          <View style={styles.fallback}>
            <Text style={styles.fallbackText} numberOfLines={2}>
              {groupName}
            </Text>
          </View>
        </View>
      );
    }
    return (
      <View style={[styles.container, className]}>
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>Sem imagem</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, className]}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        onError={handleImageError}
        resizeMode="cover"
      />
    </View>
  );
};


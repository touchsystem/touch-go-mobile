import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useServerConfig } from '../../hooks/useServerConfig';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { NumericKeypad } from '../ui/NumericKeypad';
import { scale, scaleFont } from '../../utils/responsive';

// Senhas de acesso
const DEFAULT_PASSWORD = '123456'; // Senha padrão - permite modificar apenas IP
const MASTER_PASSWORD = '282010'; // Senha master - permite modificar IP, porta e libera configurações importantes

type AccessLevel = 'none' | 'default' | 'master';

export const ConfigButton: React.FC = () => {
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [code, setCode] = useState('');
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('none');
  const { config, updateConfig } = useServerConfig();
  
  // Extrair IP e porta da URL atual
  const parseUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return {
        ip: urlObj.hostname,
        port: urlObj.port || '5000',
      };
    } catch {
      // Se não conseguir parsear, tenta extrair manualmente
      const match = url.match(/http:\/\/([^:]+):?(\d+)?/);
      if (match) {
        return {
          ip: match[1] || '192.168.0.234',
          port: match[2] || '5000',
        };
      }
      return {
        ip: '192.168.0.234',
        port: '5000',
      };
    }
  };

  const currentUrl = config.apiUrlLocal || config.apiUrl || 'http://192.168.0.234:5000';
  const { ip: currentIp, port: currentPort } = parseUrl(currentUrl);
  
  const [serverIp, setServerIp] = useState(currentIp);
  const [serverPort, setServerPort] = useState(currentPort);
  const [attendanceMethod, setAttendanceMethod] = useState('local'); // Exemplo: 'local' ou 'cloud'
  const [paymentMethod, setPaymentMethod] = useState('local'); // Exemplo: 'local' ou 'cloud'
  
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        configButton: {
          width: scale(40),
          height: scale(40),
          borderRadius: scale(20),
          backgroundColor: colors.border,
          justifyContent: 'center',
          alignItems: 'center',
        },
        configButtonText: {
          fontSize: scaleFont(12),
          color: colors.textSecondary,
        },
        modalTitle: {
          fontSize: scaleFont(18),
          fontWeight: 'bold',
          marginBottom: scale(20),
          textAlign: 'center',
          color: colors.text,
        },
        codeInputContainer: {
          width: '100%',
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: scale(10),
          padding: scale(16),
          marginBottom: scale(20),
          minHeight: scale(50),
          justifyContent: 'center',
          backgroundColor: colors.surface,
        },
        codeInput: {
          fontSize: scaleFont(18),
          color: colors.text,
          textAlign: 'center',
          letterSpacing: scale(4),
        },
        codeInputPlaceholder: {
          color: colors.textSecondary,
          letterSpacing: 0,
        },
        keypadContainer: {
          marginBottom: scale(15),
        },
        modalButtons: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: scale(10),
          marginTop: scale(10),
        },
        modalButton: {
          flex: 1,
        },
        helpText: {
          fontSize: scaleFont(12),
          color: colors.textSecondary,
          marginTop: scale(-10),
          marginBottom: scale(10),
        },
        methodContainer: {
          marginBottom: scale(15),
        },
        methodLabel: {
          fontSize: scaleFont(14),
          fontWeight: '600',
          marginBottom: scale(8),
        },
        methodButtons: {
          flexDirection: 'row',
          gap: scale(10),
        },
        methodButton: {
          flex: 1,
          borderWidth: 1,
          borderRadius: scale(8),
          padding: scale(12),
          alignItems: 'center',
          justifyContent: 'center',
        },
        methodButtonActive: {
          backgroundColor: '#007AFF',
        },
        methodButtonText: {
          fontSize: scaleFont(14),
          fontWeight: '600',
        },
      }),
    [colors]
  );

  const handleConfigClick = () => {
    setCode('');
    setShowCodeModal(true);
  };

  const handleNumberPress = (number: string) => {
    if (code.length < 6) {
      const newCode = code + number;
      setCode(newCode);
      
      // Se chegou a 6 dígitos, valida automaticamente
      if (newCode.length === 6) {
        setTimeout(() => {
          handleCodeConfirm();
        }, 200);
      }
    }
  };

  const handleDelete = () => {
    setCode(code.slice(0, -1));
  };

  const handleCodeConfirm = () => {
    if (code.length < 6) {
      return; // Não valida se não tiver 6 dígitos
    }

    let level: AccessLevel = 'none';
    
    if (code === DEFAULT_PASSWORD) {
      level = 'default';
    } else if (code === MASTER_PASSWORD) {
      level = 'master';
    } else {
      Alert.alert('Erro', 'Código incorreto!');
      setCode('');
      return;
    }

    // Fecha o modal de código primeiro
    setShowCodeModal(false);
    setCode('');
    
    // Define o nível de acesso
    setAccessLevel(level);
    
    // Atualiza os valores dos campos quando abre o modal
    const { ip, port } = parseUrl(currentUrl);
    setServerIp(ip);
    setServerPort(port);
    
    // Abre o modal de configuração após um pequeno delay para garantir que o estado foi atualizado
    setTimeout(() => {
      setShowConfigModal(true);
    }, 100);
  };

  const handleSaveConfig = async () => {
    // Constrói a URL com IP e porta
    const newUrl = `http://${serverIp}:${serverPort}`;
    
    const success = await updateConfig({
      ...config,
      apiUrl: newUrl, // No mobile, usa a URL local como principal
      apiUrlLocal: newUrl,
    });

    if (success) {
      Alert.alert('Sucesso', 'Configuração salva com sucesso!');
      setShowConfigModal(false);
      setAccessLevel('none');
    } else {
      Alert.alert('Erro', 'Erro ao salvar configuração');
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.configButton}
        onPress={handleConfigClick}
        activeOpacity={0.7}
      >
        <Ionicons name="settings-outline" size={scale(20)} color={colors.text} />
      </TouchableOpacity>

      {/* Modal de Código */}
      <Modal visible={showCodeModal} onClose={() => setShowCodeModal(false)}>
        <Text style={styles.modalTitle}>Digite o código de acesso</Text>
        <View style={styles.codeInputContainer}>
          <Text style={[styles.codeInput, !code && styles.codeInputPlaceholder]}>
            {code ? '*'.repeat(code.length) : 'Digite o código'}
          </Text>
        </View>
        <View style={styles.keypadContainer}>
          <NumericKeypad
            onNumberPress={handleNumberPress}
            onDelete={handleDelete}
            onConfirm={handleCodeConfirm}
          />
        </View>
        <View style={styles.modalButtons}>
          <Button
            title="Cancelar"
            variant="outline"
            onPress={() => {
              setShowCodeModal(false);
              setCode('');
              setAccessLevel('none');
            }}
            style={styles.modalButton}
          />
          <Button
            title="Confirmar"
            onPress={handleCodeConfirm}
            disabled={code.length < 6}
            style={styles.modalButton}
          />
        </View>
      </Modal>

      {/* Modal de Configuração */}
      <Modal visible={showConfigModal} onClose={() => {
        setShowConfigModal(false);
        setAccessLevel('none');
      }}>
        <Text style={styles.modalTitle}>Configuração do Servidor</Text>
        
        {/* Campo IP - sempre visível com senha padrão ou master */}
        <Input
          label="IP do Servidor"
          value={serverIp}
          onChangeText={setServerIp}
          placeholder="192.168.0.234"
          editable={accessLevel !== 'none'}
        />
        
        {/* Campo Porta - apenas com senha master */}
        {accessLevel === 'master' && (
          <Input
            label="Porta do Servidor"
            value={serverPort}
            onChangeText={setServerPort}
            placeholder="5000"
            keyboardType="numeric"
          />
        )}
        
        {/* Método de Atendimento - apenas com senha master */}
        {accessLevel === 'master' && (
          <View style={styles.methodContainer}>
            <Text style={[styles.methodLabel, { color: colors.text }]}>
              Método de Atendimento
            </Text>
            <View style={styles.methodButtons}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  attendanceMethod === 'local' && styles.methodButtonActive,
                  { borderColor: colors.border }
                ]}
                onPress={() => setAttendanceMethod('local')}
              >
                <Text style={[
                  styles.methodButtonText,
                  { color: attendanceMethod === 'local' ? '#fff' : colors.text }
                ]}>
                  Local
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  attendanceMethod === 'cloud' && styles.methodButtonActive,
                  { borderColor: colors.border }
                ]}
                onPress={() => setAttendanceMethod('cloud')}
              >
                <Text style={[
                  styles.methodButtonText,
                  { color: attendanceMethod === 'cloud' ? '#fff' : colors.text }
                ]}>
                  Cloud
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Método de Recebimento - apenas com senha master */}
        {accessLevel === 'master' && (
          <View style={styles.methodContainer}>
            <Text style={[styles.methodLabel, { color: colors.text }]}>
              Método de Recebimento
            </Text>
            <View style={styles.methodButtons}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  paymentMethod === 'local' && styles.methodButtonActive,
                  { borderColor: colors.border }
                ]}
                onPress={() => setPaymentMethod('local')}
              >
                <Text style={[
                  styles.methodButtonText,
                  { color: paymentMethod === 'local' ? '#fff' : colors.text }
                ]}>
                  Local
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  paymentMethod === 'cloud' && styles.methodButtonActive,
                  { borderColor: colors.border }
                ]}
                onPress={() => setPaymentMethod('cloud')}
              >
                <Text style={[
                  styles.methodButtonText,
                  { color: paymentMethod === 'cloud' ? '#fff' : colors.text }
                ]}>
                  Cloud
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        <Text style={styles.helpText}>
          {accessLevel === 'default' 
            ? 'Senha padrão: apenas IP pode ser modificado'
            : accessLevel === 'master'
            ? 'Senha master: IP, porta e métodos podem ser modificados'
            : ''}
        </Text>
        
        <View style={styles.modalButtons}>
          <Button
            title="Cancelar"
            variant="outline"
            onPress={() => {
              setShowConfigModal(false);
              setAccessLevel('none');
            }}
            style={styles.modalButton}
          />
          <Button
            title="Salvar"
            onPress={handleSaveConfig}
            style={styles.modalButton}
            disabled={accessLevel === 'none'}
          />
        </View>
      </Modal>
    </>
  );
};


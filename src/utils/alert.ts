import { showAlert } from '../components/ui/CustomAlert';

// Compatibilidade com Alert.alert do React Native
export const Alert = {
  alert: (
    title: string,
    message?: string,
    buttons?: Array<{
      text?: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>
  ) => {
    const alertButtons = buttons?.map((btn) => ({
      text: btn.text || 'OK',
      onPress: btn.onPress,
      style: btn.style || 'default',
    })) || [{ text: 'OK', onPress: () => {} }];

    showAlert(title, message || '', alertButtons);
  },
};



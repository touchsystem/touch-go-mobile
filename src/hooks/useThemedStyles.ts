import { useTheme } from '../contexts/ThemeContext';
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export const useThemedStyles = <T extends NamedStyles<T>>(
  createStyles: (colors: ReturnType<typeof useTheme>['colors']) => T
) => {
  const { colors } = useTheme();
  return StyleSheet.create(createStyles(colors));
};






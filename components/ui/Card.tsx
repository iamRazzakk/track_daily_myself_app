import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof Spacing;
  elevation?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Card({ children, style, padding = 'base', elevation = 'md' }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        { padding: Spacing[padding] },
        Shadows[elevation],
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});

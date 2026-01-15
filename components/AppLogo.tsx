import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface AppLogoProps {
  size?: number;
}

export function AppLogo({ size = 80 }: AppLogoProps) {
  const iconSize = size * 0.5;
  
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 4 }]}>
      <View style={styles.iconWrapper}>
        <MaterialIcons name="account-balance-wallet" size={iconSize} color={Colors.white} />
      </View>
      <View style={[styles.accentDot, { width: size * 0.2, height: size * 0.2, borderRadius: size * 0.1, right: size * 0.1, bottom: size * 0.1 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  accentDot: {
    position: 'absolute',
    backgroundColor: Colors.success,
    borderWidth: 3,
    borderColor: Colors.white,
  },
});

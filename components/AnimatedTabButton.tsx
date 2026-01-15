import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View, GestureResponderEvent, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';

interface AnimatedTabButtonProps {
  children?: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  accessibilityState?: { selected?: boolean };
  style?: StyleProp<ViewStyle>;
}

export function AnimatedTabButton({ 
  children, 
  onPress, 
  accessibilityState,
  style,
}: AnimatedTabButtonProps) {
  const focused = accessibilityState?.selected ?? false;
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    if (focused) {
      translateY.value = withSpring(-4, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [focused]);

  const handlePressIn = () => {
    scale.value = withSpring(0.85, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = (e: GestureResponderEvent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
    };
  });

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { 
          scaleX: interpolate(
            opacity.value,
            [0, 1],
            [0, 1],
            Extrapolation.CLAMP
          )
        },
      ],
    };
  });

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, style as ViewStyle]}
    >
      <Animated.View style={[styles.content, animatedStyle]}>
        {children}
      </Animated.View>
      <Animated.View style={[styles.indicator, indicatorStyle]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 4,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: 20,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.primary,
  },
});

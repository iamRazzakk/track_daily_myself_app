import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { AnimatedTabButton } from '@/components/AnimatedTabButton';
import { Colors } from '@/constants/theme';

// Animated icon wrapper component
function AnimatedIcon({ 
  name, 
  size, 
  color, 
  focused 
}: { 
  name: any; 
  size: number; 
  color: string; 
  focused: boolean;
}) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (focused) {
      // Bounce animation when focused
      scale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 300 }),
        withSpring(1, { damping: 10, stiffness: 300 })
      );
      // Slight wiggle
      rotation.value = withSequence(
        withTiming(-5, { duration: 50 }),
        withTiming(5, { duration: 100 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <IconSymbol size={size} name={name} color={color} />
    </Animated.View>
  );
}

// Special floating Add button component
function AddButtonIcon({ color, focused }: { color: string; focused: boolean }) {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (focused) {
      scale.value = withSequence(
        withSpring(1.15, { damping: 8, stiffness: 300 }),
        withSpring(1.05, { damping: 8, stiffness: 300 })
      );
      rotate.value = withSequence(
        withTiming(90, { duration: 200 }),
        withSpring(0, { damping: 10, stiffness: 200 })
      );
    } else {
      scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    }
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <View style={styles.addButtonContainer}>
      <Animated.View style={[styles.addButtonInner, animatedStyle]}>
        <IconSymbol size={32} name="plus.circle.fill" color={focused ? Colors.primary : color} />
      </Animated.View>
    </View>
  );
}

export default function AppTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        headerShown: false,
        tabBarButton: AnimatedTabButton,
        tabBarStyle: {
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
          borderTopWidth: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          backgroundColor: Colors.surface,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon name="house.fill" size={26} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-transaction"
        options={{
          title: 'Add',
          tabBarIcon: ({ color, focused }) => (
            <AddButtonIcon color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: 'Summary',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon name="chart.bar.fill" size={26} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon name="person.fill" size={26} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

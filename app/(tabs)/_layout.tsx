
import { Platform, Pressable, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import React from 'react';
import { colors } from '@/styles/commonStyles';
import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useRouter, usePathname } from 'expo-router';

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 35,
    minWidth: 280,
    height: 70,
    overflow: 'hidden',
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 35,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
});

function CustomTabBar() {
  const pathname = usePathname();
  const router = useRouter();

  // Shared values for animations
  const budgetScale = useSharedValue(1);
  const abosScale = useSharedValue(1);
  const profilScale = useSharedValue(1);
  const addScale = useSharedValue(1);

  // Animated styles
  const budgetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: budgetScale.value }],
  }));

  const abosAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: abosScale.value }],
  }));

  const profilAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: profilScale.value }],
  }));

  const addAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: addScale.value }],
  }));

  const isActive = (route: string) => {
    return pathname.includes(route);
  };

  const handleTabPress = (route: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(route as any);
  };

  const handleAddPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // Context-aware add functionality
    if (pathname.includes('budget')) {
      // Add expense logic
    } else if (pathname.includes('abos')) {
      // Add subscription logic
    }
  };

  const TabButton = ({ 
    androidIcon, 
    route, 
    label 
  }: { 
    androidIcon: string;
    route: string; 
    label: string;
  }) => {
    const scaleValue = 
      route === '/(tabs)/(home)' ? budgetScale :
      route === '/(tabs)/abos' ? abosScale :
      profilScale;

    const animatedStyle = 
      route === '/(tabs)/(home)' ? budgetAnimatedStyle :
      route === '/(tabs)/abos' ? abosAnimatedStyle :
      profilAnimatedStyle;

    const active = isActive(route);

    return (
      <Pressable
        onPress={() => handleTabPress(route)}
        onPressIn={() => {
          scaleValue.value = withSpring(0.85);
        }}
        onPressOut={() => {
          scaleValue.value = withSpring(1);
        }}
        style={styles.tabButton}
      >
        <Animated.View style={animatedStyle}>
          <MaterialIcons 
            name={androidIcon as any}
            size={28}
            color={active ? colors.neonGreen : '#FFFFFF'}
          />
        </Animated.View>
      </Pressable>
    );
  };

  const AddButton = () => (
    <Pressable
      onPress={handleAddPress}
      onPressIn={() => {
        addScale.value = withSpring(0.9);
      }}
      onPressOut={() => {
        addScale.value = withSpring(1);
      }}
    >
      <Animated.View style={[styles.addButton, addAnimatedStyle]}>
        <MaterialIcons 
          name="add"
          size={36}
          color={colors.black}
        />
      </Animated.View>
    </Pressable>
  );

  return (
    <View style={styles.tabBarContainer} pointerEvents="box-none">
      <View style={styles.tabBar}>
        <BlurView 
          intensity={20} 
          tint="dark"
          style={styles.blurView}
        />
        <TabButton 
          androidIcon="attach-money"
          route="/(tabs)/(home)"
          label="Budget"
        />
        <TabButton 
          androidIcon="sync"
          route="/(tabs)/abos"
          label="Abos"
        />
        <TabButton 
          androidIcon="person"
          route="/(tabs)/profil"
          label="Profil"
        />
        <AddButton />
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="(home)" />
        <Tabs.Screen name="abos" />
        <Tabs.Screen name="budget" />
        <Tabs.Screen name="profil" />
        <Tabs.Screen name="profile" />
      </Tabs>
      <CustomTabBar />
    </>
  );
}

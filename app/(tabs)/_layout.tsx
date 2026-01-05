
import { BlurView } from 'expo-blur';
import React from 'react';
import { Tabs } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Platform, Pressable, View, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useRouter, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';

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
    justifyContent: 'space-between',
    backgroundColor: 'rgba(35, 35, 35, 0.95)', // Darker background
    borderRadius: 30,
    paddingHorizontal: 28, // Increased padding
    paddingVertical: 14,
    width: '92%', // Wider container
    maxWidth: 420, // Increased max width
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16, // More spacing between items
    paddingVertical: 8,
  },
  addButton: {
    width: 56, // Slightly larger
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8, // Extra margin for plus button
    ...Platform.select({
      ios: {
        shadowColor: colors.neonGreen,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});

function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (route: string) => {
    if (route === '/budget') return pathname === '/budget';
    if (route === '/abos') return pathname === '/abos';
    if (route === '/profil') return pathname === '/profil';
    return false;
  };

  const handleTabPress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  const handleAddPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (pathname === '/budget') {
      // Add expense logic
    } else if (pathname === '/abos') {
      // Add subscription logic
    }
  };

  const TabButton = ({ icon, route, label }: { 
    icon: string; 
    route: string; 
    label: string;
  }) => {
    const scale = useSharedValue(1);
    const active = isActive(route);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <Pressable
        onPress={() => handleTabPress(route)}
        onPressIn={() => {
          scale.value = withSpring(0.85);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        style={styles.tabButton}
      >
        <Animated.View style={animatedStyle}>
          <IconSymbol
            name={icon}
            size={28} // Slightly larger icons
            color={active ? colors.neonGreen : colors.white}
          />
        </Animated.View>
      </Pressable>
    );
  };

  const AddButton = () => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <Pressable
        onPress={handleAddPress}
        onPressIn={() => {
          scale.value = withSpring(0.9);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
      >
        <Animated.View style={[styles.addButton, animatedStyle]}>
          <IconSymbol
            name="plus"
            size={32} // Larger plus icon
            color={colors.black}
          />
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        <TabButton icon="dollarsign" route="/budget" label="Budget" />
        <TabButton icon="repeat" route="/abos" label="Abos" />
        <TabButton icon="person" route="/profil" label="Profil" />
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
        <Tabs.Screen name="budget" />
        <Tabs.Screen name="abos" />
        <Tabs.Screen name="profil" />
      </Tabs>
      <CustomTabBar />
    </>
  );
}

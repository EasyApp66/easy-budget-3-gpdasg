
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Pressable, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { BlurView } from 'expo-blur';
import { useRouter, usePathname } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (route: string) => {
    return pathname.includes(route);
  };

  const handleTabPress = (route: string) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(route as any);
  };

  const handleAddPress = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Context-aware: add expense on budget, subscription on abos
    if (pathname.includes('budget')) {
      // Call global function exposed by Budget screen
      if ((global as any).addExpense) {
        (global as any).addExpense();
      } else {
        console.log('Add expense function not available');
      }
    } else if (pathname.includes('abos')) {
      // Call global function exposed by Abos screen
      if ((global as any).addSubscription) {
        (global as any).addSubscription();
      } else {
        console.log('Add subscription function not available');
      }
    }
  };

  const TabButton = ({ 
    icon, 
    route, 
    label 
  }: { 
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
      <AnimatedPressable
        style={[styles.tabButton, animatedStyle]}
        onPressIn={() => {
          scale.value = withSpring(0.9);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={() => handleTabPress(route)}
      >
        <IconSymbol
          ios_icon_name={icon}
          android_material_icon_name={icon}
          size={24}
          color={active ? colors.neonGreen : colors.white + '80'}
        />
      </AnimatedPressable>
    );
  };

  const AddButton = () => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <AnimatedPressable
        style={[styles.addButton, animatedStyle]}
        onPressIn={() => {
          scale.value = withSpring(0.9);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={handleAddPress}
      >
        <IconSymbol
          ios_icon_name="plus"
          android_material_icon_name="add"
          size={32}
          color={colors.black}
        />
      </AnimatedPressable>
    );
  };

  return (
    <View style={styles.tabBarContainer}>
      <BlurView intensity={80} tint="dark" style={styles.tabBarBlur}>
        <View style={styles.tabBar}>
          <TabButton icon="attach-money" route="/(tabs)/budget" label="Budget" />
          <TabButton icon="sync" route="/(tabs)/abos" label="Abos" />
          <TabButton icon="person" route="/(tabs)/profil" label="Profil" />
          <AddButton />
        </View>
      </BlurView>
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
        <Tabs.Screen
          name="budget"
          options={{
            title: 'Budget',
          }}
        />
        <Tabs.Screen
          name="abos"
          options={{
            title: 'Abos',
          }}
        />
        <Tabs.Screen
          name="profil"
          options={{
            title: 'Profil',
          }}
        />
        <Tabs.Screen
          name="(home)"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="profile.ios"
          options={{
            href: null,
          }}
        />
      </Tabs>
      <CustomTabBar />
    </>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
  },
  tabBarBlur: {
    flex: 1,
    borderRadius: 35,
    overflow: 'hidden',
  },
  tabBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(35, 35, 35, 0.8)',
  },
  tabButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.neonGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


import { useRouter, usePathname } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import React from 'react';
import { colors } from '@/styles/commonStyles';
import * as Haptics from 'expo-haptics';
import { Pressable, View, StyleSheet } from 'react-native';

const CustomTabBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (route: string) => {
    return pathname.includes(route);
  };

  const handleTabPress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  const handleAddPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const TabButton = ({ icon, route, label }: { 
    icon: string; 
    route: string; 
    label: string;
  }) => {
    const active = isActive(route);
    const scale = useSharedValue(1);
    const iconColor = useSharedValue(active ? 1 : 0);

    React.useEffect(() => {
      iconColor.value = withTiming(active ? 1 : 0, { duration: 200 });
    }, [active]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const iconAnimatedStyle = useAnimatedStyle(() => ({
      opacity: withTiming(iconColor.value === 1 ? 1 : 0.5, { duration: 200 }),
    }));

    const handlePress = () => {
      scale.value = withSpring(0.85, { damping: 10, stiffness: 400 }, () => {
        scale.value = withSpring(1, { damping: 10, stiffness: 400 });
      });
      handleTabPress(route);
    };

    return (
      <Pressable onPress={handlePress} style={styles.tabButton}>
        <Animated.View style={[animatedStyle, iconAnimatedStyle]}>
          <IconSymbol
            ios_icon_name={icon}
            android_material_icon_name={icon}
            size={24}
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

    const handlePress = () => {
      scale.value = withSpring(0.9, { damping: 10, stiffness: 400 }, () => {
        scale.value = withSpring(1, { damping: 10, stiffness: 400 });
      });
      handleAddPress();
    };

    return (
      <Pressable onPress={handlePress} style={styles.addButtonContainer}>
        <Animated.View style={[styles.addButton, animatedStyle]}>
          <IconSymbol
            ios_icon_name="plus"
            android_material_icon_name="add"
            size={28}
            color={colors.black}
          />
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <View style={styles.tabBarContainer}>
      <BlurView intensity={15} tint="dark" style={styles.blurView}>
        <View style={styles.tabBar}>
          <TabButton icon="attach-money" route="/budget" label="Budget" />
          <TabButton icon="sync" route="/abos" label="Abos" />
          <TabButton icon="person" route="/profil" label="Profil" />
          <AddButton />
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  blurView: {
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: 'rgba(35, 35, 35, 0.3)',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  addButtonContainer: {
    marginLeft: 10,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
        tabBar={() => <CustomTabBar />}
      >
        <Tabs.Screen name="budget" />
        <Tabs.Screen name="abos" />
        <Tabs.Screen name="profil" />
      </Tabs>
    </>
  );
}

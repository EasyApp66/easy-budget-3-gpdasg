
import { Platform, Pressable, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import React from 'react';
import { colors } from '@/styles/commonStyles';
import { Tabs } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
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
    left: 20,
    right: 20,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: 'rgba(35, 35, 35, 0.3)', // More transparent
  },
  blurView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  addButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function CustomTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1);
  const scale3 = useSharedValue(1);
  const scaleAdd = useSharedValue(1);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [{ scale: scale3.value }],
  }));

  const animatedStyleAdd = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAdd.value }],
  }));

  const isActive = (route: string) => {
    return pathname === route;
  };

  const handleTabPress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  const handleAddPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Context-aware add button
    if (pathname === '/(tabs)/budget') {
      // Add expense logic handled in budget screen
    } else if (pathname === '/(tabs)/abos') {
      // Add subscription logic handled in abos screen
    }
  };

  const TabButton = ({ 
    iosIcon, 
    androidIcon, 
    route, 
    label 
  }: { 
    iosIcon: string; 
    androidIcon: string;
    route: string; 
    label: string;
  }) => {
    const active = isActive(route);
    const scaleValue = route === '/(tabs)/budget' ? scale1 : route === '/(tabs)/abos' ? scale2 : scale3;
    const animatedStyle = route === '/(tabs)/budget' ? animatedStyle1 : route === '/(tabs)/abos' ? animatedStyle2 : animatedStyle3;

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
          <IconSymbol
            ios_icon_name={iosIcon}
            android_material_icon_name={androidIcon}
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
        scaleAdd.value = withSpring(0.9);
      }}
      onPressOut={() => {
        scaleAdd.value = withSpring(1);
      }}
    >
      <Animated.View style={[styles.addButton, animatedStyleAdd]}>
        <IconSymbol 
          ios_icon_name="plus" 
          android_material_icon_name="add" 
          size={32} 
          color="#000000" 
        />
      </Animated.View>
    </Pressable>
  );

  return (
    <View style={styles.tabBarContainer}>
      <BlurView intensity={30} tint="dark" style={styles.blurView}>
        <TabButton 
          iosIcon="dollarsign.circle.fill" 
          androidIcon="attach-money" 
          route="/(tabs)/budget" 
          label="Budget" 
        />
        <TabButton 
          iosIcon="arrow.triangle.2.circlepath" 
          androidIcon="sync" 
          route="/(tabs)/abos" 
          label="Abos" 
        />
        <TabButton 
          iosIcon="person.circle.fill" 
          androidIcon="person" 
          route="/(tabs)/profil" 
          label="Profil" 
        />
        <AddButton />
      </BlurView>
    </View>
  );
}

export default function TabLayout() {
  return (
    <>
      <Tabs
        tabBar={() => <CustomTabBar />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="budget" />
        <Tabs.Screen name="abos" />
        <Tabs.Screen name="profil" />
      </Tabs>
    </>
  );
}

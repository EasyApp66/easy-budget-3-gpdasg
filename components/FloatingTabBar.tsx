
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Href } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import { useRouter, usePathname } from 'expo-router';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

interface TabBarItem {
  route: Href;
  label: string;
  ios_icon_name: string;
  android_material_icon_name: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
  containerWidth?: number;
  borderRadius?: number;
  bottomMargin?: number;
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
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

export default function FloatingTabBar({
  tabs,
  containerWidth = 90,
  borderRadius = 24,
  bottomMargin = 16,
}: FloatingTabBarProps) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const handleTabPress = (route: Href) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(route);
  };

  const handleAddPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // TODO: Add functionality based on current screen
    console.log('Add button pressed');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <BlurView
        intensity={80}
        tint="dark"
        style={[
          styles.container,
          {
            borderRadius,
            marginBottom: bottomMargin,
          },
        ]}
      >
        {tabs.map((tab, index) => {
          const isActive = pathname.includes(tab.route as string);
          const scale = useSharedValue(1);

          return (
            <React.Fragment key={index}>
              <Pressable
                style={styles.tabButton}
                onPressIn={() => {
                  scale.value = withSpring(0.9);
                }}
                onPressOut={() => {
                  scale.value = withSpring(1);
                }}
                onPress={() => handleTabPress(tab.route)}
              >
                <IconSymbol
                  ios_icon_name={tab.ios_icon_name}
                  android_material_icon_name={tab.android_material_icon_name}
                  size={24}
                  color={isActive ? colors.neonGreen : colors.white}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isActive ? colors.neonGreen : colors.white },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
              {index === 1 && (
                <Pressable
                  style={styles.addButton}
                  onPress={handleAddPress}
                >
                  <IconSymbol
                    ios_icon_name="plus"
                    android_material_icon_name="add"
                    size={28}
                    color={colors.black}
                  />
                </Pressable>
              )}
            </React.Fragment>
          );
        })}
      </BlurView>
    </SafeAreaView>
  );
}

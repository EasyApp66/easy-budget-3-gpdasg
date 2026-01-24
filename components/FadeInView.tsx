
import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import { usePathname } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

// Cascading animation component for smooth fade-in effects
interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  animationType?: 'fadeIn' | 'fadeInDown';
  style?: ViewStyle;
}

export function FadeInView({
  children,
  delay = 0,
  duration = 800, // Increased from 600 to 800 for slower animation
  animationType = 'fadeIn',
  style,
}: FadeInViewProps) {
  const pathname = usePathname();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(animationType === 'fadeInDown' ? -15 : 0);

  useEffect(() => {
    // Reset animation on every page navigation
    opacity.value = 0;
    translateY.value = animationType === 'fadeInDown' ? -15 : 0;

    // Smoother cubic easing for opacity with slower duration
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Smoother cubic bezier
      })
    );

    if (animationType === 'fadeInDown') {
      // Smoother cubic easing for translateY with slower duration
      translateY.value = withDelay(
        delay,
        withTiming(0, {
          duration,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Smoother cubic bezier
        })
      );
    }
  }, [pathname]); // Re-run animation when pathname changes

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

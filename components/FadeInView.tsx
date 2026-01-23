
import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

// Cascading animation component for fade-in effects
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
  duration = 600,
  animationType = 'fadeIn',
  style,
}: FadeInViewProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(animationType === 'fadeInDown' ? -20 : 0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      })
    );

    if (animationType === 'fadeInDown') {
      translateY.value = withDelay(
        delay,
        withTiming(0, {
          duration,
          easing: Easing.out(Easing.cubic),
        })
      );
    }
  }, []);

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

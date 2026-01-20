
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export const LoadingScreen = () => {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    console.log('[LoadingScreen] Starting EASY BUDGET logo animation - 0.6 seconds');
    // Animate logo for exactly 0.6 seconds
    opacity.value = withTiming(0, { 
      duration: 600,
      easing: Easing.out(Easing.ease),
    });
    scale.value = withTiming(1.05, { 
      duration: 600,
      easing: Easing.out(Easing.ease),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array is correct - opacity and scale are shared values, not dependencies

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.text, animatedStyle]}>
        EASY BUDGET
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#BFFE84',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

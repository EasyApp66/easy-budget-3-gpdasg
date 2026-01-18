
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

export const LoadingScreen = () => {
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    console.log('[LoadingScreen] Starting fast animation (under 1 second)');
    
    // Fast opacity animation: 0.3 -> 1 -> 0.3 in 800ms total
    opacity.value = withRepeat(
      withTiming(1, { duration: 400 }),
      -1,
      true
    );

    // Fast scale animation: 0.9 -> 1.05 -> 0.9 in 800ms total
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 400 }),
        withTiming(0.9, { duration: 400 })
      ),
      -1,
      false
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array is correct - opacity and scale are shared values

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
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});

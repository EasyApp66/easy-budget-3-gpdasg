
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

export const LoadingScreen = () => {
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    // Fast, snappy animation - completes in under 1 second
    opacity.value = withRepeat(
      withTiming(1, { 
        duration: 400,  // Reduced from 1000ms to 400ms
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1, { 
          duration: 400,  // Fast scale up
          easing: Easing.out(Easing.ease),
        }),
        withTiming(0.95, { 
          duration: 400,  // Fast scale down
          easing: Easing.in(Easing.ease),
        })
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
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
  },
});

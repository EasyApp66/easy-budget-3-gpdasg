
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SNOWFLAKE_COUNT = 50;

interface Snowflake {
  id: number;
  startX: number;
  delay: number;
  duration: number;
  size: number;
}

const SnowAnimation = () => {
  const snowflakes: Snowflake[] = Array.from({ length: SNOWFLAKE_COUNT }, (_, i) => ({
    id: i,
    startX: Math.random() * SCREEN_WIDTH,
    delay: Math.random() * 5000,
    duration: 8000 + Math.random() * 4000,
    size: 3 + Math.random() * 4,
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {snowflakes.map((flake) => (
        <Snowflake key={flake.id} {...flake} />
      ))}
    </View>
  );
};

const Snowflake = ({ startX, delay, duration, size }: Omit<Snowflake, 'id'>) => {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0.7);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(SCREEN_HEIGHT + 20, {
          duration,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );

    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming(Math.random() * 40 - 20, {
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.snowflake,
        {
          left: startX,
          width: size,
          height: size,
        },
        animatedStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  snowflake: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
  },
});

export default SnowAnimation;

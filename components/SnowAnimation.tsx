
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

interface SnowflakeProps {
  delay: number;
  duration: number;
  startX: number;
  size: number;
}

const Snowflake: React.FC<SnowflakeProps> = ({ delay, duration, startX, size }) => {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Start from top and fall to bottom
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

    // Gentle horizontal sway
    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming(40, {
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      )
    );

    // Fade in and maintain visibility
    opacity.value = withDelay(
      delay,
      withTiming(0.9, {
        duration: 500,
        easing: Easing.inOut(Easing.ease),
      })
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

export const SnowAnimation: React.FC = () => {
  // Increase number of snowflakes and make them more visible
  const snowflakes = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 5000,
    duration: 10000 + Math.random() * 8000, // Slower falling
    startX: Math.random() * SCREEN_WIDTH,
    size: 4 + Math.random() * 6, // Larger snowflakes
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {snowflakes.map((flake) => (
        <Snowflake
          key={flake.id}
          delay={flake.delay}
          duration={flake.duration}
          startX={flake.startX}
          size={flake.size}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  snowflake: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    opacity: 0.9, // More visible
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
});

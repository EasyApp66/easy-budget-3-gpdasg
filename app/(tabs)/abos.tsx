
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors } from '@/styles/commonStyles';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Subscription {
  id: string;
  name: string;
  monthlyCost: number;
  isPinned: boolean;
}

export default function AbosScreen() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    { id: '1', name: 'NETFLIX', monthlyCost: 15, isPinned: false },
    { id: '2', name: 'APPLE CARE', monthlyCost: 14, isPinned: false },
  ]);
  const [selectedSubId, setSelectedSubId] = useState<string>('1');

  const totalCost = subscriptions.reduce((sum, sub) => sum + sub.monthlyCost, 0);

  const handleSubPress = (id: string) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedSubId(id);
  };

  const handleDeleteSub = (id: string) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      'Abo löschen',
      'Möchtest du dieses Abo wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => {
            setSubscriptions(subscriptions.filter(sub => sub.id !== id));
            if (selectedSubId === id) {
              setSelectedSubId('');
            }
          },
        },
      ]
    );
  };

  const handlePinSub = (id: string) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSubscriptions(
      subscriptions.map(sub =>
        sub.id === id ? { ...sub, isPinned: !sub.isPinned } : sub
      )
    );
  };

  const SubscriptionPill = ({ subscription }: { subscription: Subscription }) => {
    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const isSelected = selectedSubId === subscription.id;

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { scale: scale.value },
        { translateX: translateX.value },
      ],
    }));

    const panGesture = Gesture.Pan()
      .onUpdate((event) => {
        translateX.value = event.translationX;
      })
      .onEnd((event) => {
        if (event.translationX < -100) {
          // Swipe left to delete
          runOnJS(handleDeleteSub)(subscription.id);
        } else if (event.translationX > 100) {
          // Swipe right to pin
          runOnJS(handlePinSub)(subscription.id);
        }
        translateX.value = withSpring(0);
      });

    return (
      <GestureDetector gesture={panGesture}>
        <AnimatedPressable
          style={[
            styles.subPill,
            isSelected && styles.subPillSelected,
            animatedStyle,
          ]}
          onPressIn={() => {
            scale.value = withSpring(0.98);
          }}
          onPressOut={() => {
            scale.value = withSpring(1);
          }}
          onPress={() => handleSubPress(subscription.id)}
        >
          <Text style={styles.subName}>{subscription.name}</Text>
          <Text style={styles.subCost}>{subscription.monthlyCost}</Text>
          {subscription.isPinned && (
            <View style={styles.pinnedIndicator}>
              <Text style={styles.pinnedText}>📌</Text>
            </View>
          )}
        </AnimatedPressable>
      </GestureDetector>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Abo Kosten Card */}
          <View style={styles.costCard}>
            <Text style={styles.costLabel}>ABO KOSTEN</Text>
            <Text style={styles.costValue}>{totalCost}</Text>
          </View>

          {/* Total Card */}
          <View style={styles.totalCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>{subscriptions.length}</Text>
            </View>
          </View>

          {/* Subscription Pills */}
          <View style={styles.subList}>
            {subscriptions.map((sub) => (
              <SubscriptionPill key={sub.id} subscription={sub} />
            ))}
          </View>

          {/* Swipe Hint */}
          <Text style={styles.swipeHint}>
            ← Wischen zum Löschen • Wischen zum Fixieren →
          </Text>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 120,
  },
  costCard: {
    backgroundColor: colors.darkGray,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  costLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 8,
    letterSpacing: 1,
  },
  costValue: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 0.5,
  },
  totalCard: {
    backgroundColor: colors.darkGray,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 0.5,
  },
  subList: {
    gap: 16,
    marginBottom: 24,
  },
  subPill: {
    backgroundColor: colors.darkGray,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  subPillSelected: {
    borderWidth: 2,
    borderColor: colors.neonGreen,
  },
  subName: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 0.5,
  },
  subCost: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 0.5,
  },
  pinnedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  pinnedText: {
    fontSize: 16,
  },
  swipeHint: {
    fontSize: 12,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.5,
  },
});

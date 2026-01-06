
import { BlurView } from 'expo-blur';
import { colors } from '@/styles/commonStyles';
import { Text } from 'react-native';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { useRouter, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, Pressable, View, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    borderRadius: 35,
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
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.3,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.darkGray,
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.black,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.white,
    marginBottom: 16,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
});

function CustomTabBar() {
  const [showModal, setShowModal] = useState(false);
  const [shareText, setShareText] = useState('');
  const router = useRouter();
  const scaleValue1 = useSharedValue(1);
  const scaleValue2 = useSharedValue(1);
  const scaleValue3 = useSharedValue(1);
  const addButtonScale = useSharedValue(1);
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue1.value }],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue2.value }],
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue3.value }],
  }));

  const addButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: addButtonScale.value }],
  }));

  const isActive = (route: string) => {
    if (route === '/(tabs)/(home)/') {
      return pathname === '/(tabs)/(home)/' || pathname === '/(tabs)/(home)';
    }
    return pathname.includes(route);
  };

  const handleTabPress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  const handleAddPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addButtonScale.value = withSpring(0.9, {}, () => {
      addButtonScale.value = withSpring(1);
    });
    setShowModal(true);
  };

  const handleShare = async () => {
    if (!shareText.trim()) {
      Alert.alert('Error', 'Please enter some text to share');
      return;
    }

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        // Create a temporary text file to share
        const fileName = 'share.txt';
        const fileUri = `${Platform.OS === 'ios' ? 'file://' : ''}${fileName}`;
        
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: 'Share',
        });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share');
    }
    
    setShowModal(false);
    setShareText('');
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    handleShare();
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowModal(false);
    setShareText('');
  };

  const TabButton = ({ 
    androidIcon, 
    route, 
    label,
    scaleValue 
  }: { 
    androidIcon: string;
    route: string; 
    label: string;
    scaleValue: Animated.SharedValue<number>;
  }) => {
    const active = isActive(route);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scaleValue.value }],
    }));

    return (
      <Pressable
        onPress={() => handleTabPress(route)}
        onPressIn={() => {
          scaleValue.value = withSpring(0.9);
        }}
        onPressOut={() => {
          scaleValue.value = withSpring(1);
        }}
        style={styles.tabButton}
      >
        <Animated.View style={animatedStyle}>
          <MaterialIcons
            name={androidIcon as any}
            size={24}
            color={active ? colors.neonGreen : colors.white}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: active ? colors.neonGreen : colors.white },
            ]}
          >
            {label}
          </Text>
        </Animated.View>
      </Pressable>
    );
  };

  const AddButton = () => (
    <Pressable
      onPress={handleAddPress}
      onPressIn={() => {
        addButtonScale.value = withSpring(0.9);
      }}
      onPressOut={() => {
        addButtonScale.value = withSpring(1);
      }}
    >
      <Animated.View style={[styles.addButton, addButtonAnimatedStyle]}>
        <MaterialIcons name="add" size={32} color={colors.black} />
      </Animated.View>
    </Pressable>
  );

  return (
    <>
      <View
        style={[
          styles.tabBarContainer,
          {
            bottom: insets.bottom + 8, // Changed from +30 to +8 for minimal spacing
          },
        ]}
      >
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        <TabButton androidIcon="attach-money" route="/(tabs)/(home)/" label="Budget" scaleValue={scaleValue1} />
        <TabButton androidIcon="sync" route="/(tabs)/profile" label="Abos" scaleValue={scaleValue2} />
        <TabButton androidIcon="person" route="/(tabs)/profile" label="Profil" scaleValue={scaleValue3} />
        <AddButton />
      </View>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share Text</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter text to share..."
              placeholderTextColor="#666"
              value={shareText}
              onChangeText={setShareText}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <Pressable
                onPress={handleCancel}
                style={[styles.modalButton, { backgroundColor: colors.black }]}
              >
                <Text style={[styles.modalButtonText, { color: colors.white }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                style={[styles.modalButton, { backgroundColor: colors.neonGreen }]}
              >
                <Text style={[styles.modalButtonText, { color: colors.black }]}>
                  Share
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
        tabBar={() => <CustomTabBar />}
      >
        <Tabs.Screen name="(home)" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </>
  );
}

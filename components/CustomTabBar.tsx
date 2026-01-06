// Add this to your existing CustomTabBar component's AddButton function:

const AddButton = () => {
  const addScale = useSharedValue(1);
  
  const addAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: addScale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        addScale.value = withSpring(0.9);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }}
      onPressOut={() => {
        addScale.value = withSpring(1);
      }}
      onPress={handleAddPress}
      style={styles.addButton}
    >
      <Animated.View style={[styles.addButtonInner, addAnimatedStyle]}>
        {/* Centered plus icon with rounded corners */}
        <View style={styles.plusIcon}>
          {/* Vertical bar */}
          <View style={styles.plusVertical} />
          {/* Horizontal bar */}
          <View style={styles.plusHorizontal} />
        </View>
      </Animated.View>
    </Pressable>
  );
};

// Add these styles to your StyleSheet:
const styles = StyleSheet.create({
  // ... existing styles ...
  
  addButton: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#BFFE84', // Neon green
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#BFFE84',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  plusIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  plusVertical: {
    position: 'absolute',
    width: 4,
    height: 24,
    backgroundColor: '#000000',
    borderRadius: 2, // Rounded corners
  },
  plusHorizontal: {
    position: 'absolute',
    width: 24,
    height: 4,
    backgroundColor: '#000000',
    borderRadius: 2, // Rounded corners
  },
});

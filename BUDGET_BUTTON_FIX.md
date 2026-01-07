
# Budget Screen - Sticky Add Month Button Fix

Apply these changes to your `app/(tabs)/budget.tsx` file:

## 1. Update the "Add Month" button styling

Find the button that adds new months and update its style to match this:

```tsx
// Add Month Button - Make it match the main green button design
<Pressable
  onPress={() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleAddMonth();
  }}
  style={styles.addMonthButton}
>
  <Text style={styles.addMonthButtonText}>+</Text>
</Pressable>
```

## 2. Add these styles to your StyleSheet

```tsx
const styles = StyleSheet.create({
  // ... existing styles ...
  
  // Container for sticky button
  monthsScrollContainer: {
    flex: 1,
  },
  
  // Sticky add month button
  addMonthButton: {
    position: 'absolute',
    top: 16, // Adjust based on your layout
    right: 16,
    width: 48, // Same size as before
    height: 48,
    borderRadius: 24, // Makes it circular
    backgroundColor: colors.green, // #BFFE84
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 999, // Ensures it stays on top
  },
  
  addMonthButtonText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000', // Black text on green background
    lineHeight: 32,
  },
});
```

## 3. Update your ScrollView structure

Wrap your months list in a View and place the button outside the ScrollView:

```tsx
<View style={{ flex: 1 }}>
  <ScrollView style={styles.monthsScrollContainer}>
    {/* Your months list here */}
    {months.map((month) => (
      <MonthPill key={month.id} month={month} />
    ))}
  </ScrollView>
  
  {/* Sticky Add Month Button */}
  <Pressable
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      handleAddMonth();
    }}
    style={styles.addMonthButton}
  >
    <Text style={styles.addMonthButtonText}>+</Text>
  </Pressable>
</View>
```

## Key Changes:
- ✅ Circular button with #BFFE84 background (matches main green button)
- ✅ Black "+" text (matches design system)
- ✅ `position: 'absolute'` makes it sticky
- ✅ `zIndex: 999` keeps it on top while scrolling
- ✅ Same size (48x48) as before
- ✅ Haptic feedback on press
- ✅ Shadow for depth (matches premium design)

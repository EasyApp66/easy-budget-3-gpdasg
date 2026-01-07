
# Fix for "Neue Ausgabe" Modal

Apply these style changes to your modal in the budget screen:

```tsx
// Modal Button Container - Change to horizontal row
buttonContainer: {
  flexDirection: 'row',
  gap: 12,
  paddingHorizontal: 20,
  paddingBottom: 20, // Minimal bottom padding
  paddingTop: 16,
},

// Cancel Button (Abbrechen)
cancelButton: {
  flex: 1,
  backgroundColor: '#000000',
  paddingVertical: 16,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
},

cancelButtonText: {
  color: '#FFFFFF',
  fontSize: 17,
  fontWeight: '600',
},

// Add Button (Hinzufügen)
addButton: {
  flex: 1,
  backgroundColor: '#BFFE84',
  paddingVertical: 16,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
},

addButtonText: {
  color: '#000000',
  fontSize: 17,
  fontWeight: '600',
},

// Modal Content Container
modalContent: {
  backgroundColor: '#232323',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingTop: 24,
  paddingBottom: 0, // Remove bottom padding from content
},
```

## JSX Structure:
```tsx
<View style={styles.buttonContainer}>
  <Pressable style={styles.cancelButton} onPress={handleCancel}>
    <Text style={styles.cancelButtonText}>Abbrechen</Text>
  </Pressable>
  <Pressable style={styles.addButton} onPress={handleSave}>
    <Text style={styles.addButtonText}>Hinzufügen</Text>
  </Pressable>
</View>
```

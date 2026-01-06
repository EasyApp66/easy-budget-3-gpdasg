
# Modal Style Updates for Budget & Abos Screens

Apply these style changes to both the "Neue Ausgabe" modal (Budget screen) and "Neues Abo" modal (Abos screen):

## Modal Container Styles:
```typescript
modalContainer: {
  width: '92%',           // Increased from previous value
  maxWidth: 420,          // Wider max width
  backgroundColor: '#232323',
  borderRadius: 20,
  padding: 24,            // Consistent padding
  paddingBottom: 20,      // Reduced bottom padding
},
```

## Button Container Styles:
```typescript
modalButtons: {
  flexDirection: 'row',
  gap: 12,
  marginTop: 24,
  marginBottom: 0,        // Remove bottom margin
},
```

## Individual Button Styles:
```typescript
modalButton: {
  flex: 1,
  paddingVertical: 16,
  paddingHorizontal: 20,  // More horizontal padding
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 150,          // Ensure buttons are wide enough
},
```

## Button Text Styles:
```typescript
modalButtonText: {
  fontSize: 16,
  fontWeight: '700',
  letterSpacing: 0.5,
},
```

These changes will make your modals match the reference image with wider buttons for full text visibility and tighter vertical spacing.

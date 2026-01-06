
# Modal Width & Button Fix for iOS/Expo Go

Apply these style changes to both **budget.tsx** and **abos.tsx** modal sections:

## Modal Container
```typescript
modal: {
  width: '95%',  // Increased from 92%
  maxWidth: 500,
  backgroundColor: colors.darkGray,
  borderRadius: 24,
  padding: 28,  // Increased padding
  alignItems: 'stretch',
},
```

## Input Fields
```typescript
input: {
  backgroundColor: '#000000',
  borderRadius: 16,
  padding: 18,  // Increased from 16
  color: colors.white,
  fontSize: 16,
  fontWeight: '600',
  marginBottom: 16,
  minHeight: 56,  // Ensure consistent height
},
```

## Button Container
```typescript
buttonRow: {
  flexDirection: 'row',
  gap: 12,
  marginTop: 8,
  width: '100%',
},
```

## Individual Buttons
```typescript
cancelButton: {
  flex: 1,
  minWidth: 120,  // Added minimum width
  backgroundColor: '#000000',
  borderRadius: 16,
  paddingVertical: 16,
  paddingHorizontal: 20,  // Increased horizontal padding
  alignItems: 'center',
  justifyContent: 'center',
},

saveButton: {
  flex: 1,
  minWidth: 120,  // Added minimum width
  backgroundColor: colors.neonGreen,
  borderRadius: 16,
  paddingVertical: 16,
  paddingHorizontal: 20,  // Increased horizontal padding
  alignItems: 'center',
  justifyContent: 'center',
},
```

## Button Text
```typescript
cancelButtonText: {
  color: colors.white,
  fontSize: 16,
  fontWeight: '700',
  letterSpacing: 0.5,
},

saveButtonText: {
  color: '#000000',
  fontSize: 16,
  fontWeight: '700',
  letterSpacing: 0.5,
},
```

These changes will:
- Make modal 95% width (more breathing room)
- Increase button horizontal padding to 20px
- Add minimum button width of 120px
- Increase input padding for better touch targets
- Ensure text is fully visible on all iOS devices

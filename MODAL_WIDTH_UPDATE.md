
# Modal Width Update Instructions

To widen the "Neue Ausgabe" and "Neues Abo" modal popups, update the modal container styles:

## Current Style (narrow):
```typescript
modalContainer: {
  width: '70%', // or fixed width like 280
  backgroundColor: '#232323',
  borderRadius: 16,
  padding: 24,
}
```

## Updated Style (wider):
```typescript
modalContainer: {
  width: '88%', // Wider to match reference image
  maxWidth: 340, // Optional: cap maximum width
  backgroundColor: '#232323',
  borderRadius: 16,
  padding: 24,
}
```

## Key Changes:
- Increase width from ~70% to ~88% of screen width
- Add optional maxWidth constraint for larger devices
- Keep all other properties (padding, borderRadius, backgroundColor) unchanged
- Text sizes, input field styles, and button styles remain identical

Apply this change to both:
1. "Neue Ausgabe" modal (in budget screen)
2. "Neues Abo" modal (in abos screen)

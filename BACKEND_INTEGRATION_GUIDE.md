
# Backend Integration Guide

## Overview
This document describes the backend API endpoints that the Easy Budget 2.0 app expects to integrate with. The frontend is already configured to call these endpoints, but they need to be implemented on the backend.

## Backend URL Configuration
- **Current Backend URL**: `https://wu7kwypubgksy89mk4h6tatrg56ateqy.app.specular.dev`
- **Configuration Location**: `app.json` → `expo.extra.backendUrl`
- **Frontend Access**: Imported from `utils/api.ts` as `BACKEND_URL`

## Authentication
Authentication is handled by **Better Auth** and is already fully configured and working.

### Existing Auth Endpoints (Already Working)
- `POST /api/auth/sign-in/email` - Email/password sign in
- `POST /api/auth/sign-up/email` - Email/password sign up  
- `GET /api/auth/session` - Get current session
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/social/{provider}` - OAuth sign in (google, apple, github)

All authenticated requests include an `Authorization: Bearer <token>` header automatically.

## Required Backend Endpoints

### 1. Premium Status Check
**Endpoint**: `GET /api/premium/status`

**Authentication**: Required (Bearer token)

**Description**: Check if the current user has premium access

**Request Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "isPremium": boolean,
  "expiresAt": "2024-12-31T23:59:59Z" // optional, ISO 8601 format
}
```

**Frontend Integration**: 
- File: `hooks/usePremium.ts`
- Function: `checkPremiumStatus()`
- Called automatically when user logs in or app starts

**Error Handling**:
- 404: App defaults to non-premium (allows app to work before endpoint exists)
- 401: User not authenticated
- 500: Server error

---

### 2. Stripe Payment Processing
**Endpoint**: `POST /api/payments/stripe`

**Authentication**: Required (Bearer token)

**Description**: Process premium purchase via Stripe (for web and Android)

**Request Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "type": "onetime" | "monthly",
  "platform": "web" | "android"
}
```

**Response**:
```json
{
  "success": boolean,
  "paymentUrl": "https://checkout.stripe.com/...", // optional, for redirect
  "transactionId": "txn_123456", // optional
  "message": "Payment successful" // optional error message
}
```

**Frontend Integration**:
- Files: `app/(tabs)/budget.tsx`, `app/(tabs)/profil.tsx`
- Function: `handlePremiumPurchase()`, `handlePurchasePremium()`
- Triggered when user clicks premium purchase button

**Error Handling**:
- 404: Shows "In Development" message
- 400: Invalid request (missing fields, invalid type)
- 401: User not authenticated
- 500: Payment processing error

---

### 3. Apple Pay Payment Processing
**Endpoint**: `POST /api/payments/apple-pay`

**Authentication**: Required (Bearer token)

**Description**: Process premium purchase via Apple Pay (for iOS)

**Request Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "type": "onetime" | "monthly",
  "platform": "ios"
}
```

**Response**:
```json
{
  "success": boolean,
  "paymentUrl": "https://...", // optional
  "transactionId": "txn_123456", // optional
  "message": "Payment successful" // optional error message
}
```

**Frontend Integration**:
- Files: `app/(tabs)/budget.tsx`, `app/(tabs)/profil.tsx`
- Function: `handlePremiumPurchase()`, `handlePurchasePremium()`
- Triggered when user clicks premium purchase button on iOS

**Error Handling**:
- Same as Stripe endpoint

---

### 4. Donation Payment Processing
**Endpoint**: `POST /api/payments/donation`

**Authentication**: Required (Bearer token)

**Description**: Process donation payment

**Request Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "amount": 5.00,
  "currency": "CHF",
  "platform": "ios" | "android" | "web"
}
```

**Response**:
```json
{
  "success": boolean,
  "paymentUrl": "https://...", // optional
  "transactionId": "txn_123456", // optional
  "message": "Thank you for your donation!" // optional
}
```

**Frontend Integration**:
- File: `app/(tabs)/profil.tsx`
- Function: `processDonation()`
- Triggered when user submits donation form

**Error Handling**:
- 404: Shows "In Development" message
- 400: Invalid amount or currency
- 401: User not authenticated
- 500: Payment processing error

---

## Premium Pricing
Based on the frontend UI:
- **One-time Payment**: CHF 9.90
- **Monthly Subscription**: CHF 0.90/month

## Premium Features
When `isPremium: true`, users get:
- Unlimited expenses (free: max 8)
- Unlimited months (free: max 2)
- Unlimited subscriptions (free: max 5)

## Testing the Integration

### 1. Check Backend URL
The app logs the backend URL on startup:
```
[API] ✅ Backend URL configured: https://...
[API] 📡 Ready to make API calls
```

### 2. Test Premium Status
When user logs in, check console for:
```
[Premium] Checking premium status for: user@example.com
[Premium] Status received: { isPremium: false }
```

### 3. Test Payment Flow
When user clicks premium purchase:
```
[Budget] Initiating premium purchase: onetime
[Budget] Calling payment endpoint: /api/payments/stripe
[Budget] Payment response: { success: true, ... }
```

### 4. Test Error Handling
If endpoint doesn't exist (404):
```
[Budget] Premium purchase error: API error: 404 - ...
```
App shows: "In Development - Premium payments will be available soon"

## Implementation Priority

1. **Premium Status Check** (High Priority)
   - Required for app to properly show/hide premium features
   - Currently defaults to non-premium if endpoint doesn't exist

2. **Payment Processing** (Medium Priority)
   - App works without it (shows "In Development" message)
   - Requires Stripe/Apple Pay integration
   - Should store premium status in database after successful payment

3. **Donation Processing** (Low Priority)
   - Optional feature
   - Can use same payment infrastructure as premium

## Database Schema Suggestions

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(50), -- 'premium_onetime', 'premium_monthly', 'donation'
  amount DECIMAL(10, 2),
  currency VARCHAR(3),
  platform VARCHAR(20),
  status VARCHAR(50), -- 'pending', 'completed', 'failed'
  transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Security Considerations

1. **Authentication**: All endpoints require valid Bearer token
2. **User Validation**: Extract user ID from token, don't trust client
3. **Payment Validation**: Verify payment with Stripe/Apple before granting premium
4. **Rate Limiting**: Implement rate limiting on payment endpoints
5. **Idempotency**: Use transaction IDs to prevent duplicate charges

## Frontend Error Handling

The frontend gracefully handles missing endpoints:
- **404 errors**: Shows "In Development" message
- **Network errors**: Shows generic error message
- **Auth errors**: Redirects to login
- **All errors**: Logged to console with `[API]` prefix

## Next Steps

1. Implement premium status endpoint first
2. Set up Stripe/Apple Pay integration
3. Implement payment processing endpoints
4. Test with frontend using console logs
5. Update this document with any changes

## Support

For questions about the frontend integration:
- Check `utils/api.ts` for API utilities
- Check console logs with `[API]`, `[Premium]`, `[Budget]`, `[Profile]` prefixes
- All API calls include detailed logging

For backend implementation:
- Backend code is in `/backend` directory
- Uses Better Auth for authentication
- Database schema in `/backend/src/db/schema.ts`

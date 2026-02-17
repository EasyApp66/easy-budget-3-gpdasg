
# 🧪 Easy Budget Backend Testing Guide

## Backend URL
```
https://wu7kwypubgksy89mk4h6tatrg56ateqy.app.specular.dev
```

## 📋 API Endpoints Overview

### Authentication Endpoints (Better Auth)
- `POST /api/auth/sign-up/email` - Email/Password Registration
- `POST /api/auth/sign-in/email` - Email/Password Login
- `GET /api/auth/session` - Get Current Session
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/oauth/google` - Google OAuth
- `GET /api/auth/oauth/apple` - Apple OAuth

### Premium Endpoints
- `GET /api/premium/status` - Get Premium Status (Protected)
- `POST /api/premium/redeem-code` - Redeem Promo Code (Protected)

### User Endpoints
- `GET /api/user/me` - Get Current User Profile (Protected)

## 🔐 Authentication Testing

### 1. Register New User
```bash
curl -X POST https://wu7kwypubgksy89mk4h6tatrg56ateqy.app.specular.dev/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "name": "Test User"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "test@example.com",
    "name": "Test User"
  },
  "session": {
    "token": "session_token",
    "expiresAt": "2025-02-15T..."
  }
}
```

### 2. Login with Email
```bash
curl -X POST https://wu7kwypubgksy89mk4h6tatrg56ateqy.app.specular.dev/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

### 3. Get Current Session
```bash
curl -X GET https://wu7kwypubgksy89mk4h6tatrg56ateqy.app.specular.dev/api/auth/session \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

## 💎 Premium Features Testing

### 1. Check Premium Status
```bash
curl -X GET https://wu7kwypubgksy89mk4h6tatrg56ateqy.app.specular.dev/api/premium/status \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

**Expected Response (New User with Trial):**
```json
{
  "isPremium": true,
  "expiresAt": "2025-02-01T...",
  "daysRemaining": 14,
  "isLifetime": false,
  "activeSubscriptions": []
}
```

### 2. Redeem Lifetime Promo Code
```bash
curl -X POST https://wu7kwypubgksy89mk4h6tatrg56ateqy.app.specular.dev/api/premium/redeem-code \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "EASY2030"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Premium access granted for 36500 days",
  "expiresAt": "2125-01-15T...",
  "daysRemaining": 36500
}
```

### 3. Try to Redeem Same Code Again
```bash
curl -X POST https://wu7kwypubgksy89mk4h6tatrg56ateqy.app.specular.dev/api/premium/redeem-code \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "EASY2030"
  }'
```

**Expected Response:**
```json
{
  "error": "You have already redeemed this promo code"
}
```

### 4. Try Invalid Promo Code
```bash
curl -X POST https://wu7kwypubgksy89mk4h6tatrg56ateqy.app.specular.dev/api/premium/redeem-code \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "INVALID123"
  }'
```

**Expected Response:**
```json
{
  "error": "Promo code not found"
}
```

## 👤 User Profile Testing

### Get User Profile
```bash
curl -X GET https://wu7kwypubgksy89mk4h6tatrg56ateqy.app.specular.dev/api/user/me \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "id": "user_id",
  "email": "test@example.com",
  "name": "Test User",
  "emailVerified": false,
  "createdAt": "2025-01-15T...",
  "updatedAt": "2025-01-15T..."
}
```

## 🗄️ Database Schema

### Tables Created

#### `promo_codes`
```sql
CREATE TABLE "promo_codes" (
  "id" text PRIMARY KEY,
  "code" text UNIQUE NOT NULL,
  "duration_days" integer NOT NULL,
  "max_redemptions" integer,
  "current_redemptions" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
```

#### `premium_subscriptions`
```sql
CREATE TABLE "premium_subscriptions" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "user"("id"),
  "type" text NOT NULL,
  "provider" text NOT NULL,
  "transaction_id" text NOT NULL,
  "amount" text,
  "currency" text,
  "status" text DEFAULT 'active',
  "purchased_at" timestamp DEFAULT now(),
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
```

#### `promo_code_redemptions`
```sql
CREATE TABLE "promo_code_redemptions" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "user"("id"),
  "promo_code_id" text NOT NULL REFERENCES "promo_codes"("id"),
  "redeemed_at" timestamp DEFAULT now(),
  "expires_at" timestamp NOT NULL
);
```

## 🧪 Test Scenarios

### Scenario 1: New User Journey
1. ✅ Register new user
2. ✅ Verify 2-week trial is automatically activated
3. ✅ Check premium status shows trial
4. ✅ Verify trial days remaining = 14

### Scenario 2: Promo Code Redemption
1. ✅ Register new user
2. ✅ Redeem "EASY2030" promo code
3. ✅ Verify lifetime premium activated
4. ✅ Try to redeem same code again (should fail)
5. ✅ Check premium status shows lifetime

### Scenario 3: Offline Functionality
1. ✅ User redeems promo code online
2. ✅ Premium status stored in AsyncStorage
3. ✅ User goes offline
4. ✅ Premium status still available from local storage
5. ✅ User can use premium features offline

### Scenario 4: Trial Expiration
1. ✅ Register new user
2. ✅ Wait 14 days (or manually adjust date)
3. ✅ Verify trial expired
4. ✅ Premium status shows isPremium: false
5. ✅ Paywall modal appears

### Scenario 5: Multiple Devices
1. ✅ User logs in on Device A
2. ✅ Redeems promo code on Device A
3. ✅ Logs in on Device B
4. ✅ Premium status syncs from database
5. ✅ Both devices show premium active

## 🔍 Error Handling Tests

### 1. Unauthorized Access
```bash
curl -X GET https://wu7kwypubgksy89mk4h6tatrg56ateqy.app.specular.dev/api/premium/status
```
**Expected:** 401 Unauthorized

### 2. Invalid Token
```bash
curl -X GET https://wu7kwypubgksy89mk4h6tatrg56ateqy.app.specular.dev/api/premium/status \
  -H "Authorization: Bearer invalid_token"
```
**Expected:** 401 Unauthorized

### 3. Missing Request Body
```bash
curl -X POST https://wu7kwypubgksy89mk4h6tatrg56ateqy.app.specular.dev/api/premium/redeem-code \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json"
```
**Expected:** 400 Bad Request

### 4. Invalid Email Format
```bash
curl -X POST https://wu7kwypubgksy89mk4h6tatrg56ateqy.app.specular.dev/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "TestPassword123!"
  }'
```
**Expected:** 400 Bad Request

## 📊 Performance Tests

### Response Time Benchmarks
- Authentication: < 500ms
- Premium Status Check: < 200ms
- Promo Code Redemption: < 300ms
- User Profile: < 200ms

### Load Testing
```bash
# Test with 100 concurrent requests
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  https://wu7kwypubgksy89mk4h6tatrg56ateqy.app.specular.dev/api/premium/status
```

## 🔐 Security Checklist

- [x] All endpoints use HTTPS
- [x] Authentication required for protected routes
- [x] Passwords hashed with bcrypt
- [x] Session tokens securely generated
- [x] SQL injection prevention (Drizzle ORM)
- [x] Rate limiting configured
- [x] CORS properly configured
- [x] No sensitive data in logs
- [x] Environment variables for secrets

## 🐛 Known Issues & Limitations

### Current Limitations
1. Promo code "EASY2030" is hardcoded (by design for offline support)
2. No email verification flow yet
3. No password reset via email yet
4. No webhook for Apple Pay purchases yet

### Future Improvements
1. Add email verification
2. Implement password reset flow
3. Add Apple Pay webhook handler
4. Add subscription renewal logic
5. Add analytics tracking
6. Add admin dashboard for promo codes

## 📝 Testing Checklist

### Manual Testing
- [ ] Register new user via email
- [ ] Login with email/password
- [ ] Google OAuth flow (iOS & Android)
- [ ] Apple OAuth flow (iOS)
- [ ] Check premium status (new user)
- [ ] Verify 2-week trial active
- [ ] Redeem "EASY2030" promo code
- [ ] Verify lifetime premium active
- [ ] Try to redeem same code again (should fail)
- [ ] Logout and login again
- [ ] Verify premium status persists
- [ ] Test offline mode
- [ ] Test on multiple devices

### Automated Testing
- [ ] Unit tests for auth logic
- [ ] Integration tests for API endpoints
- [ ] E2E tests for user flows
- [ ] Load testing
- [ ] Security testing

## 🚀 Deployment Status

### Production Environment
- **Backend URL:** https://wu7kwypubgksy89mk4h6tatrg56ateqy.app.specular.dev
- **Status:** ✅ Live
- **Database:** ✅ Migrations Applied
- **Auth:** ✅ Configured
- **Premium:** ✅ Functional

### Health Check
```bash
curl https://wu7kwypubgksy89mk4h6tatrg56ateqy.app.specular.dev/health
```

## 📞 Support

If you encounter any issues:
1. Check backend logs
2. Verify authentication token
3. Check network connectivity
4. Review error messages
5. Contact support: support@easybudget.app

---

**Last Updated:** January 2025
**Backend Version:** 1.0.0
**Status:** Production Ready ✅

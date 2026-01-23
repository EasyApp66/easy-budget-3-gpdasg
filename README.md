# Easy Budget 3.0

A minimalist dark-mode budget and subscription tracker app built with React Native and Expo.

This app was built using [Natively.dev](https://natively.dev) - a platform for creating mobile apps.

## 🛒 In-App Purchases Setup (Superwall)

This app uses **Superwall** for iOS in-app purchases and subscriptions. To complete the setup:

### 1. Get Your Superwall API Key
1. Go to [Superwall Dashboard](https://superwall.com/dashboard)
2. Create an account or sign in
3. Create a new project for "Easy Budget"
4. Copy your iOS API key

### 2. Update the API Key
Replace the placeholder API key in `app/_layout.tsx` (line ~30):

```typescript
<SuperwallProvider
  apiKeys={{
    ios: "pk_YOUR_ACTUAL_SUPERWALL_API_KEY_HERE", // Replace this placeholder!
  }}
  onConfigurationError={(error) => {
    console.error('[Superwall] Configuration error:', error);
  }}
>
```

**Current placeholder key**: `pk_d1efb1f8a9d3f6e7c5b4a3d2e1f0c9b8a7d6e5f4c3b2a1d0e9f8c7b6a5d4e3f2`
**⚠️ This is NOT a real key - you MUST replace it with your actual Superwall API key!**

### 3. Configure Products in Superwall Dashboard
1. Go to your Superwall dashboard
2. Navigate to **Products** section
3. Create two products:
   - **One-time purchase**: `premium_onetime` - CHF 10.00
   - **Monthly subscription**: `premium_monthly` - CHF 1.00/month
4. Create two placements:
   - `premium_onetime` - triggers one-time purchase paywall
   - `premium_monthly` - triggers monthly subscription paywall

### 4. Configure App Store Connect
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to your app
3. Go to **Features** → **In-App Purchases**
4. Create two in-app purchases matching your Superwall products:
   - **Non-Consumable**: Product ID `premium_onetime`, Price CHF 10.00
   - **Auto-Renewable Subscription**: Product ID `premium_monthly`, Price CHF 1.00/month
5. Link these products to your Superwall dashboard

### 5. Test In-App Purchases
1. Create a sandbox test account in App Store Connect
2. Build the app for TestFlight: `eas build --platform ios`
3. Install on a test device via TestFlight
4. Sign in with your sandbox account
5. Test both purchase flows

### Current Status
✅ Superwall SDK integrated
✅ Payment UI implemented
✅ Subscription status checking
✅ User identification with Superwall on login
✅ Error handling and logging
⚠️ **ACTION REQUIRED**: Replace placeholder API key with your actual Superwall API key
⚠️ **ACTION REQUIRED**: Configure products in Superwall dashboard
⚠️ **ACTION REQUIRED**: Set up in-app purchases in App Store Connect

## 🐛 Troubleshooting In-App Purchases

### Common Issues and Solutions

#### 1. "Configuration Error" or "Invalid API Key"
**Problem**: The Superwall API key is invalid or not set correctly.

**Solution**:
- Check that you've replaced the placeholder API key in `app/_layout.tsx`
- Verify your API key is correct in the Superwall dashboard
- Make sure you're using the iOS API key (starts with `pk_`)

#### 2. "Product Not Found" or "No Paywall Shown"
**Problem**: Products or placements are not configured in Superwall.

**Solution**:
- Log into your Superwall dashboard
- Go to **Products** and verify both products exist:
  - `premium_onetime` (CHF 10.00)
  - `premium_monthly` (CHF 1.00/month)
- Go to **Placements** and verify both placements exist:
  - `premium_onetime`
  - `premium_monthly`
- Make sure placements are linked to the correct products

#### 3. "Purchase Failed" in TestFlight
**Problem**: In-app purchases are not configured in App Store Connect.

**Solution**:
- Go to App Store Connect → Your App → Features → In-App Purchases
- Create the products with exact IDs:
  - `premium_onetime` (Non-Consumable, CHF 10.00)
  - `premium_monthly` (Auto-Renewable Subscription, CHF 1.00/month)
- Wait 24 hours for products to propagate
- Make sure you're signed in with a sandbox test account

#### 4. "Cannot Connect to iTunes Store"
**Problem**: Not using a sandbox test account or network issues.

**Solution**:
- Create a sandbox test account in App Store Connect
- Sign out of your regular Apple ID on the test device
- When prompted during purchase, sign in with sandbox account
- Make sure device has internet connection

#### 5. Checking Logs
Enable detailed logging to debug issues:

```bash
# View Superwall logs in Xcode console
# Look for lines starting with [Superwall]
```

Key log messages to look for:
- `[Superwall] Configuration error:` - API key or setup issue
- `[Superwall] Initiating purchase:` - Purchase flow started
- `[Superwall] ✅ Feature unlocked!` - Purchase successful
- `[Superwall] ❌ Purchase error:` - Purchase failed

### Testing Checklist
- [ ] Superwall API key is set in `app/_layout.tsx`
- [ ] Products created in Superwall dashboard
- [ ] Placements created in Superwall dashboard
- [ ] In-app purchases created in App Store Connect
- [ ] Sandbox test account created
- [ ] App built and uploaded to TestFlight
- [ ] Signed in with sandbox account on test device
- [ ] Tested both one-time and monthly purchases

---

Made with 💙 for creativity.

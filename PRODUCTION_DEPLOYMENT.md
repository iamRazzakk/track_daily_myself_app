# Production Deployment Guide - DailyTrack App

## Issues Fixed

### 1. **Missing Route Declarations** ✅
- **Problem**: Auth layout was missing screen declarations for forgot-password, reset-password, verify-email, and verify-reset-otp routes
- **Impact**: Routes worked locally but failed in production builds
- **Fix**: Added all missing `<Stack.Screen>` declarations in `app/(auth)/_layout.tsx`

### 2. **Incorrect Route Paths** ✅
- **Problem**: Edit profile navigation used `/edit-profile` instead of `/(app)/edit-profile`
- **Impact**: Route mismatch between local and production
- **Fix**: Updated route path in `app/(app)/profile.tsx`

### 3. **API Client Configuration** ✅
- **Problem**: Timeout too short (10s), no proper error status handling
- **Impact**: Network timeouts and response processing issues
- **Fix**: 
  - Increased timeout to 15s
  - Added proper HTTP status validation
  - Improved error response handling
  - Added refresh token cleanup on 401

### 4. **Auth Context State Management** ✅
- **Problem**: TypeScript type incompatibility with setTimeout ref
- **Impact**: Type errors during build
- **Fix**: Changed `NodeJS.Timeout` to `ReturnType<typeof setTimeout>`

## Pre-Production Checklist

### Environment Configuration
```bash
# Ensure you have a .env file with production API URL
cp .env.example .env
# Edit .env and set your production API endpoint
EXPO_PUBLIC_API_URL=https://your-production-api.com/api
```

### Build Configuration

#### For Android (APK/AAB):
```bash
# Make sure eas.json is configured
eas build --platform android --profile production
```

#### For iOS:
```bash
eas build --platform ios --profile production
```

### Key Files to Review Before Deploying

1. **`app.json`** - App metadata and configuration
   - ✅ Has proper Android package name
   - ✅ Has iOS bundleIdentifier  
   - ✅ Web output configured

2. **`app/_layout.tsx`** - Root layout with auth routing
   - ✅ Proper auth state checking
   - ✅ Correct redirect logic

3. **`app/(auth)/_layout.tsx`** - Auth routes
   - ✅ All 6 routes declared:
     - login, register
     - forgot-password, reset-password
     - verify-email, verify-reset-otp

4. **`app/(app)/_layout.tsx`** - App routes with tabs
   - ✅ All tab screens properly configured
   - ✅ Hidden screens marked with `href: null`

5. **`services/api-client.ts`** - API configuration
   - ✅ Proper error handling
   - ✅ Token management
   - ✅ Environment variable support

6. **`contexts/auth-context.tsx`** - Auth state
   - ✅ Token refresh scheduling
   - ✅ Session persistence
   - ✅ Error recovery

## Deployment Steps

### Step 1: Version Bump
```bash
npm version patch|minor|major
```

### Step 2: Build for Production
```bash
# Clean previous builds
rm -rf .expo/
rm -rf dist/

# Build APK (Android testing)
eas build --platform android --profile preview

# Build AAB (Google Play)
eas build --platform android --profile production
```

### Step 3: Test Production Build
- Test on actual device
- Verify all routes work
- Check authentication flow:
  - Login → Home
  - Register → Email Verification → Home
  - Logout → Login
  - Forgot Password → Reset → Login

### Step 4: Deploy to Play Store/App Store
```bash
eas submit --platform android
# or
eas submit --platform ios
```

## Common Production Issues & Solutions

### Issue: "Unmatched route" Error
**Solution**: Ensure all route files have corresponding `<Stack.Screen>` or `<Tabs.Screen>` declarations in layout files.

### Issue: API Connection Failures
**Solution**: Verify `EXPO_PUBLIC_API_URL` environment variable is set correctly for production.

### Issue: Authentication Token Loss
**Solution**: Check AsyncStorage is properly cleaning up tokens. Verify refresh token flow.

### Issue: Deep Linking Not Working
**Solution**: Ensure `scheme` in app.json matches your deep linking URLs.

## Environment Variables

Create a `.env` file in the project root:

```env
# Development
EXPO_PUBLIC_API_URL=http://147.93.94.210:5000/api

# Production (update with your production API)
# EXPO_PUBLIC_API_URL=https://api.dailytrack.com/api
```

## Important Notes

1. **Always test production builds locally first** using `eas build --profile preview`
2. **Never commit `.env` files** with sensitive data
3. **Use TypedRoutes** - the project has `typedRoutes: true` enabled for type safety
4. **Monitor AsyncStorage** - token persistence is critical for UX
5. **Error Handling** - All API calls have proper error boundaries

## Build Profiles

The project uses two EAS build profiles:

```json
{
  "preview": {
    "android": {
      "buildType": "apk"  // For testing
    }
  },
  "production": {
    "android": {
      "buildType": "app-bundle"  // For Play Store
    }
  }
}
```

---

**Last Updated**: January 16, 2026
**Status**: ✅ All Critical Issues Resolved

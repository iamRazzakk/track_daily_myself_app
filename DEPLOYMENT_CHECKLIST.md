# ✅ Production Deployment Checklist

## Pre-Deployment ✓

- [ ] Read [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Overview of all fixes
- [ ] Review [FIXES_APPLIED.md](FIXES_APPLIED.md) - Detailed technical explanation
- [ ] Check [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) - Full deployment guide

## Code Changes ✓

- [x] Fixed missing auth route declarations in `app/(auth)/_layout.tsx`
- [x] Fixed edit profile navigation path in `app/(app)/profile.tsx`
- [x] Improved API client in `services/api-client.ts`
- [x] Fixed TypeScript types in `contexts/auth-context.tsx`
- [x] Added production configuration in `app.json`
- [x] Updated `.env.example` for production setup
- [x] All TypeScript errors resolved ✓

## Local Testing

- [ ] Clone/pull latest code
- [ ] Install dependencies: `npm install`
- [ ] Test on Android: `npm run android`
  - [ ] Login screen loads
  - [ ] Can enter credentials
  - [ ] Login successful → redirects to home
  - [ ] All tabs visible and clickable
  - [ ] Can navigate to all screens
  - [ ] Profile → Edit Profile button works
  - [ ] Logout works → redirects to login
- [ ] Test auth flows:
  - [ ] Register → Email verification → Home
  - [ ] Forgot password → OTP → Reset password → Login
  - [ ] Verify all routes are accessible

## Environment Setup

- [ ] Create `.env` file from `.env.example`
- [ ] Set production API URL in `.env`:
  ```
  EXPO_PUBLIC_API_URL=https://your-api.com/api
  ```
- [ ] Verify `.env` is in `.gitignore` (don't commit!)

## Build Testing

- [ ] Clean previous builds:
  ```bash
  rm -rf .expo dist
  ```
- [ ] Build preview APK:
  ```bash
  eas build --platform android --profile preview
  ```
- [ ] Download and install preview APK on test device
- [ ] Test all functionality on preview APK:
  - [ ] Complete auth flow
  - [ ] All navigation works
  - [ ] All routes accessible
  - [ ] No crashes or errors

## Production Build

- [ ] Build production AAB:
  ```bash
  eas build --platform android --profile production
  ```
- [ ] Verify build completes successfully
- [ ] Download build artifact

## Play Store Submission

- [ ] Update version in `app.json` and `package.json`
- [ ] Update `eas.json` version if needed
- [ ] Submit to Play Store:
  ```bash
  eas submit --platform android
  ```
- [ ] Configure release notes
- [ ] Set release type (Production/Beta/etc)
- [ ] Verify submission successful

## Post-Deployment

- [ ] Monitor app logs for errors
- [ ] Test app on actual Play Store
- [ ] Monitor user feedback
- [ ] Check crash reports in Play Console
- [ ] Verify analytics are working

## Monitoring

- [ ] Set up error monitoring (Sentry/Bugsnag - optional)
- [ ] Monitor API response times
- [ ] Check authentication success rates
- [ ] Monitor network errors

---

## Critical Checklist (Do Not Skip)

- [ ] **ENVIRONMENT**: Production API URL is set in `.env`
- [ ] **TESTING**: Preview APK tested on device
- [ ] **ROUTES**: All auth routes verified working
- [ ] **TYPES**: No TypeScript compilation errors
- [ ] **BUILD**: Production build completes without errors
- [ ] **VERSION**: Version bumped in app.json

---

## Quick Command Reference

```bash
# Setup
npm install
cp .env.example .env
# (edit .env with production API)

# Local test
npm run android

# Clean build
rm -rf .expo dist

# Preview build for testing
eas build --platform android --profile preview

# Production build for store
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

---

## Documentation Reference

| File | Purpose |
|------|---------|
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | 1-minute overview |
| [README_FIXES.md](README_FIXES.md) | Executive summary |
| [FIXES_APPLIED.md](FIXES_APPLIED.md) | Technical details |
| [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) | Complete guide |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | This file |

---

## Troubleshooting

**Build fails locally:**
- Clear cache: `rm -rf .expo dist`
- Reinstall: `npm install`
- Check Node version: `node --version`

**Routes not working:**
- Verify all routes declared in layout files
- Check route paths use format: `/(group)/route`
- Clear cache and rebuild

**API not connecting:**
- Verify `EXPO_PUBLIC_API_URL` in `.env`
- Check API is actually running
- Test API manually: `curl $EXPO_PUBLIC_API_URL/status`

**Auth fails:**
- Check backend auth endpoints working
- Verify token storage in AsyncStorage
- Monitor API responses for errors

---

## Success Indicators

When deployment is successful, you should see:

✅ App installs from Play Store  
✅ Splash screen shows  
✅ Login page loads  
✅ Login succeeds  
✅ Home screen displays  
✅ All tabs and navigation work  
✅ No crashes or error screens  
✅ App closes/reopens without re-login  

---

## Support

If issues occur:

1. Check logs: `eas logs --platform android`
2. Test with preview build first
3. Review [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)
4. Check all fixes in [FIXES_APPLIED.md](FIXES_APPLIED.md)

---

**Last Updated**: January 16, 2026  
**Status**: Ready for deployment ✅

# Android Release Build Configuration Guide

## 🚀 Quick Start

You've successfully configured your Android app for optimized release builds!

## ✅ What's Been Configured

### 1. **R8/ProGuard Optimization** ✓
- Minification enabled
- Resource shrinking enabled
- Build caching enabled
- Comprehensive ProGuard rules added

### 2. **ProGuard Rules Added** ✓
- React Native core
- Hermes engine
- Expo modules
- Firebase & Google Play Services
- Gesture Handler & Reanimated
- OkHttp networking

### 3. **Release Signing** ✓
- Build.gradle configured for release keystore
- Environment variable support added
- Fallback to debug keystore if not configured

## 🔐 Generate Release Keystore

### Step 1: Run the Generation Script

**On Windows (PowerShell):**
```powershell
.\generate-keystore.ps1
```

**On Mac/Linux:**
```bash
chmod +x generate-keystore.sh
./generate-keystore.sh
```

### Step 2: Fill in the Details

When prompted, provide:
- **Password**: Choose a strong password (save it securely!)
- **Name**: Your name or organization
- **Organization**: Your company/organization name
- **City**: Your city
- **State**: Your state/province
- **Country Code**: 2-letter country code (e.g., IN, US)

### Step 3: Move Keystore File

```bash
# Move the generated keystore to android/app/
mv nexsync-release.keystore android/app/
```

### Step 4: Configure Gradle Properties

Add these lines to `android/gradle.properties` (or create a separate `android/keystore.properties`):

```properties
NEXSYNC_RELEASE_STORE_FILE=nexsync-release.keystore
NEXSYNC_RELEASE_KEY_ALIAS=nexsync-key
NEXSYNC_RELEASE_STORE_PASSWORD=your_keystore_password
NEXSYNC_RELEASE_KEY_PASSWORD=your_key_password
```

**⚠️ IMPORTANT:** 
- NEVER commit these passwords to Git
- Keep a backup of your keystore file
- Store passwords in a secure password manager

## 📦 Build Release APK

### Option 1: Using Expo/EAS (Recommended)
```bash
eas build --platform android --profile production
```

### Option 2: Local Build
```bash
cd android
./gradlew assembleRelease
```

The APK will be located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## 🎯 Optimization Benefits

Your release builds now have:
- ✅ **Smaller APK size** (30-50% reduction)
- ✅ **Better performance** (optimized code)
- ✅ **Code obfuscation** (security)
- ✅ **Unused resources removed**
- ✅ **Proper production signing**

## 🔒 Security Checklist

- [ ] Keystore file is NOT in git
- [ ] Passwords are in password manager
- [ ] Keystore backup exists
- [ ] `.gitignore` includes `*.keystore`
- [ ] `gradle.properties` with passwords is NOT committed

## 📝 Next Steps

1. Generate your keystore
2. Configure gradle.properties
3. Build release APK
4. Test the release build thoroughly
5. Submit to Google Play Store

## 🆘 Troubleshooting

**Build fails with "keystore not found":**
- Verify keystore path in `gradle.properties`
- Ensure keystore file is in `android/app/`

**"Invalid keystore format":**
- Make sure you're using PKCS12 format (default with keytool)

**App won't install:**
- Uninstall debug version first
- Check if signing is properly configured

## 📚 Resources

- [React Native Signing Documentation](https://reactnative.dev/docs/signed-apk-android)
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Android App Signing](https://developer.android.com/studio/publish/app-signing)

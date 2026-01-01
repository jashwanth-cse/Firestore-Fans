# NexSync Theme Migration Guide

## Color Palette Comparison

### Before (Old Theme)
```typescript
// Light theme with simple colors
background: '#FFFFFF'
primary: '#4B0082'  // Purple
text: '#000000'
surface: '#F9F9F9'
```

### After (New Dark Mode Theme)
```typescript
// Modern dark mode with slate & indigo
background: '#0f172a'     // Deep dark slate
surface: '#1e293b'        // Darker slate for cards
primary: '#6366f1'        // Vibrant Indigo
accent: '#ec4899'         // Hot Pink
textPrimary: '#f8fafc'    // Near white
textSecondary: '#94a3b8'  // Muted slate grey
border: '#334155'
glass: 'rgba(30, 41, 59, 0.7)'  // Semi-transparent
```

---

## Component Style Updates

### Input Component
**Before:**
```typescript
backgroundColor: THEME.colors.white
color: THEME.colors.gray900
borderColor: THEME.colors.gray300
```

**After:**
```typescript
backgroundColor: THEME.colors.glass          // Glassmorphic
color: THEME.colors.textPrimary             // High contrast
borderColor: THEME.colors.border            // Subtle slate
```

### Cards/Surfaces
**Before:**
```typescript
backgroundColor: THEME.colors.white
// No borders
```

**After:**
```typescript
backgroundColor: THEME.colors.surface       // Dark slate
borderWidth: 1
borderColor: THEME.colors.border           // Subtle border
borderRadius: THEME.borderRadius.lg        // 16px
```

### Error Messages
**Before:**
```typescript
Alert.alert('Login Failed', error.message)  // System alert
```

**After:**
```typescript
<View style={{
  backgroundColor: THEME.colors.glass,      // Glassmorphic
  borderColor: THEME.colors.error,         // Red border
  borderWidth: 1,
  borderRadius: THEME.borderRadius.md,     // 12px
}}>
  <Text>⚠️ {userFriendlyMessage}</Text>
</View>
```

---

## Design Principles Applied

### 1. Glassmorphism
- Semi-transparent backgrounds: `rgba(30, 41, 59, 0.7)`
- Thin white borders: `rgba(255, 255, 255, 0.1)`
- Creates depth and modern feel

### 2. High Contrast Text
- **Primary text:** #f8fafc (near white) on #0f172a (dark slate)
- **Secondary text:** #94a3b8 (muted) for less important info
- WCAG AAA compliant contrast ratios

### 3. Generous Rounding
- **Small cards:** 12px (`borderRadius.md`)
- **Medium cards:** 16px (`borderRadius.lg`)
- **Large containers:** 24px (`borderRadius.xl`)
- **Buttons:** 48px for circular (`borderRadius.full`)

### 4. 8px Grid System
```typescript
spacing: {
  xs: 4,   // 0.5 units
  sm: 8,   // 1 unit
  md: 16,  // 2 units
  lg: 24,  // 3 units
  xl: 32,  // 4 units
  '2xl': 48 // 6 units
}
```

---

## Error Handling Improvements

### Authentication (login.tsx)

#### Before:
```typescript
catch (error: any) {
  Alert.alert('Login Failed', error.message);
}
```

#### After:
```typescript
catch (error: any) {
  const errorCode = error.code || 'unknown';
  const errorMessage = getAuthErrorMessage(errorCode);
  
  setErrors({ 
    email: '', 
    password: '', 
    general: errorMessage 
  });
}

// Helper function with specific error codes
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    // ... more specific cases
  }
}
```

### Chat Interface (eventsync/index.tsx)

#### Before:
```typescript
if (!inputText.trim()) {
  alert('Please describe your event first');
  return;
}

catch (error: any) {
  alert(error.response?.data?.message || 'Failed to process your request.');
}
```

#### After:
```typescript
if (!inputText.trim()) {
  setErrorMessage('⚠️ Please describe your event first');
  setTimeout(() => setErrorMessage(''), 3000);
  return;
}

catch (error: any) {
  let userMessage = '';
  
  if (error.response?.status === 400) {
    userMessage = '⚠️ Unable to extract event details. Please be more specific...';
  } else if (error.response?.status === 500) {
    userMessage = '⚠️ Server error occurred. Please try again in a moment.';
  } else if (error.code === 'NETWORK_ERROR') {
    userMessage = '⚠️ Network error. Please check your internet connection.';
  }
  
  setErrorMessage(userMessage);
  setTimeout(() => setErrorMessage(''), 5000);
}
```

---

## Migration Checklist

✅ **Theme Constants** (`src/constants/theme.ts`)
- [x] Updated COLORS with dark mode palette
- [x] Added glassmorphism colors
- [x] Updated border radius values
- [x] Added text hierarchy colors

✅ **Screens Updated**
- [x] app/index.tsx (loading)
- [x] app/(onboarding)/welcome.tsx
- [x] app/(auth)/login.tsx
- [x] app/(eventsync)/index.tsx
- [x] app/(tabs)/travelsync.tsx

✅ **Components Updated**
- [x] src/components/common/Input.tsx
- [x] src/components/common/Button.tsx (already using theme)

✅ **Error Handling**
- [x] Authentication error mapping
- [x] Chat/prompt error handling
- [x] Visual error displays
- [x] Auto-dismissal timers

✅ **UI/UX Enhancements**
- [x] Glassmorphic cards
- [x] Proper text hierarchy
- [x] Consistent spacing
- [x] High contrast colors
- [x] Smooth visual feedback

---

## Testing Recommendations

### 1. **Theme Testing**
- [ ] Verify all screens have dark backgrounds
- [ ] Check text is readable on all backgrounds
- [ ] Verify glassmorphic effects render correctly
- [ ] Test on different devices (iOS/Android)

### 2. **Error Handling Testing**

#### Authentication
- [ ] Try logging in with wrong password
- [ ] Try non-existent email
- [ ] Try invalid email format
- [ ] Test network error (airplane mode)
- [ ] Test too many attempts

#### Chat Interface
- [ ] Submit empty prompt
- [ ] Submit very short prompt (< 10 chars)
- [ ] Test with invalid event description
- [ ] Test network error during submission
- [ ] Verify auto-dismissal works

### 3. **Visual Testing**
- [ ] Error messages display correctly
- [ ] No UI overlaps or clipping
- [ ] Proper spacing on all screens
- [ ] Borders and shadows visible
- [ ] Icons and emojis display properly

---

## Browser/Platform Specific Notes

### React Native (iOS/Android)
- Glassmorphism uses `backgroundColor` with rgba
- Shadows use platform-specific implementations
- Border radius works consistently

### Performance
- rgba colors don't impact performance
- Shadow elevations optimized for mobile
- Theme constants are lightweight

---

## Troubleshooting

### Issue: Text not visible
**Solution:** Ensure using `THEME.colors.textPrimary` or `THEME.colors.textSecondary`

### Issue: Cards look flat
**Solution:** Add borderWidth: 1, borderColor: THEME.colors.border

### Issue: Glassmorphism not showing
**Solution:** Verify parent has dark background, check rgba transparency value

### Issue: Errors not auto-dismissing
**Solution:** Check setTimeout is called correctly, verify state updates

---

## Future Enhancements

1. **Animated Transitions**
   - Fade in/out for error messages
   - Slide transitions between screens
   
2. **Theme Toggle**
   - Add light/dark mode switcher
   - Store preference in AsyncStorage

3. **Custom Error Icons**
   - Use react-native-vector-icons
   - Animated error states

4. **Haptic Feedback**
   - Vibrate on errors
   - Subtle feedback on success

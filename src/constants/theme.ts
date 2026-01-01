export const COLORS = {
  // Light Mode Palette
  // Background colors
  background: '#ffffff', // Pure white
  backgroundDark: '#f8fafc', // Very light gray (Slate 50)
  surface: '#ffffff', // White surface
  surfaceLight: '#f1f5f9', // Light gray (Slate 100)
  surfaceHighlight: '#e2e8f0', // Slate 200

  // Primary Brand Color - Vibrant Indigo
  primary: '#4f46e5', // Indigo 600 (slightly darker for white bg)
  primaryLight: '#6366f1', // Indigo 500
  primaryDark: '#4338ca', // Indigo 700
  primaryGlow: '#818cf8', // Indigo 400

  // Secondary Accent - Pink
  accent: '#db2777', // Pink 600
  accentLight: '#ec4899', // Pink 500
  accentDark: '#be185d', // Pink 700
  accentGlow: '#f472b6', // Pink 400

  // Text colors
  white: '#ffffff', // Keep actual white for text on dark buttons
  textPrimary: '#0f172a', // Slate 900 (Dark text)
  textSecondary: '#475569', // Slate 700
  textTertiary: '#64748b', // Slate 500
  textMuted: '#94a3b8', // Slate 400

  // Grayscale (Slate palette)
  black: '#000000',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
  gray300: '#cbd5e1',
  gray400: '#94a3b8',
  gray500: '#64748b',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1e293b',
  gray900: '#0f172a',

  // Borders
  border: '#e2e8f0', // Slate 200
  borderLight: '#f1f5f9', // Slate 100
  borderAccent: 'rgba(79, 70, 229, 0.3)', // Indigo border

  // Semantic colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Glassmorphism
  glass: 'rgba(255, 255, 255, 0.7)',
  glassLight: 'rgba(255, 255, 255, 0.5)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
  glassHighlight: 'rgba(79, 70, 229, 0.05)',
};

export const TYPOGRAPHY = {
  // Font families
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
    // Fallback to system fonts
    system: 'System',
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
};

import { Platform } from 'react-native';

// ... (previous constants remain the same, just updating SHADOWS)

export const SHADOWS = {
  sm: Platform.select({
    web: { boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
  }),
  md: Platform.select({
    web: { boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
  }),
  lg: Platform.select({
    web: { boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
  }),
};

export const ANIMATIONS = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeInOut: 'ease-in-out',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
  },
};

// Theme object combining all constants
export const THEME = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  animations: ANIMATIONS,
};

export default THEME;

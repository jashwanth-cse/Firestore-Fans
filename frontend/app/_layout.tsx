import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useProtectedRoute } from '../src/hooks/useProtectedRoute';
import { useAuthListener } from '../src/hooks/useAuthListener';
import { useScreenTracking } from '../src/hooks/useScreenTracking';
import { AppToast } from '../src/components/common/AppToast';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    // 1. Sync Auth State
    useAuthListener();

    // 2. Protected route check - redirects unauthenticated users
    useProtectedRoute();

    // 3. Screen tracking for analytics
    useScreenTracking();

    // Fonts are now available
    const [fontsLoaded] = useFonts({
        'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
        'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
        'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
        'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen name="(onboarding)" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
            </Stack>
            <AppToast />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
});

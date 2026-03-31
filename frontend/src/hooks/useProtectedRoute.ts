import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';

/**
 * Protected route wrapper - Redirects to appropriate screen based on auth and onboarding status
 */
export function useProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuthStore();
    const { isOnboardingComplete } = useAppStore();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        // Don't redirect while checking auth status
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inOnboardingGroup = segments[0] === '(onboarding)';

        if (!isAuthenticated && !inAuthGroup && !inOnboardingGroup) {
            // User is NOT authenticated and trying to access protected routes
            console.log('🛡️ Protected route: User not authenticated');

            if (!isOnboardingComplete) {
                // First time user - show onboarding
                console.log('🛡️ → Redirecting to WELCOME (onboarding not complete)');
                router.replace('/(onboarding)/welcome');
            } else {
                // Returning user - go to login
                console.log('🛡️ → Redirecting to LOGIN (onboarding complete)');
                router.replace('/(auth)/login');
            }
        } else if (isAuthenticated && (inAuthGroup || inOnboardingGroup)) {
            // User IS authenticated but in auth/onboarding screens - redirect to main app
            console.log('🛡️ Protected route: User authenticated, redirecting to main app');
            router.replace('/(tabs)/eventsync');
        }
    }, [isAuthenticated, isLoading, segments, isOnboardingComplete]);
}

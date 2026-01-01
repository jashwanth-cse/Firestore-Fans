import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../store/authStore';

/**
 * Protected route wrapper - Redirects to login if not authenticated
 */
export function useProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        // Don't redirect while checking auth status
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inOnboardingGroup = segments[0] === '(onboarding)';

        if (!isAuthenticated && !inAuthGroup && !inOnboardingGroup) {
            // Redirect to login if trying to access protected routes
            router.replace('/login');
        } else if (isAuthenticated && (inAuthGroup || inOnboardingGroup)) {
            // Redirect to main app if already authenticated
            router.replace('/(tabs)/eventsync');
        }
    }, [isAuthenticated, isLoading, segments]);
}

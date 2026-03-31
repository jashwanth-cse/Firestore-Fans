import { useEffect } from 'react';
import { useSegments, usePathname } from 'expo-router';
import { logScreenView } from '../services/analytics';

/**
 * Custom hook for automatic screen tracking with Expo Router
 * Logs screen_view events whenever navigation occurs
 */
export const useScreenTracking = () => {
    const segments = useSegments();
    const pathname = usePathname();

    useEffect(() => {

        // Extract screen name from segments
        // e.g., ['(tabs)', 'eventsync'] -> 'eventsync'
        // e.g., ['(auth)', 'login'] -> 'login'
        const screenName = segments[segments.length - 1] || 'unknown';

        // Create a readable screen class from segments
        const screenClass = segments
            .filter(segment => !segment.startsWith('(')) // Remove route groups like (tabs), (auth)
            .join('_') || screenName;

        console.log('📱 Screen changed:', { screenName, screenClass, pathname });

        // Log screen view to analytics
        logScreenView(screenName, screenClass);
    }, [segments, pathname]);
};

import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../src/services/firebase';
import { getUserProfile } from '../src/services/auth.service';
import { useAuthStore } from '../src/store/authStore';
import { useAppStore } from '../src/store/appStore';
import { THEME } from '../src/constants/theme';

export default function Index() {
    const router = useRouter();
    const { setUser, setLoading, setRole, setHostelerStatus } = useAuthStore();
    const { isOnboardingComplete } = useAppStore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log('🔍 Auth state changed. User:', user ? 'logged in' : 'not logged in');
            console.log('🔍 isOnboardingComplete:', isOnboardingComplete);

            setLoading(false);

            if (user) {
                // User is signed in - navigate to main app
                console.log('✅ User authenticated, navigating to main app');
                setUser(user);

                // Get user profile from Firestore
                try {
                    const profile = await getUserProfile(user.uid);
                    if (profile) {
                        setRole(profile.role);
                        setHostelerStatus(profile.isHosteler);
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                }

                // Navigate to main app
                router.replace('/(tabs)/eventsync');
            } else {
                // User is NOT signed in
                console.log('❌ User NOT authenticated');
                setUser(null);

                // ALWAYS show welcome page first for non-logged-in users
                // Only after they complete onboarding, move to login
                if (!isOnboardingComplete) {
                    console.log('📱 Navigating to WELCOME page (onboarding not complete)');
                    router.replace('/(onboarding)/welcome');
                } else {
                    console.log('🔐 Navigating to LOGIN page (onboarding complete)');
                    router.replace('/(auth)/login');
                }
            }
        });

        return () => unsubscribe();
    }, [isOnboardingComplete]); // Added dependency to track onboarding completion

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={THEME.colors.primary} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: THEME.colors.background,
    },
});

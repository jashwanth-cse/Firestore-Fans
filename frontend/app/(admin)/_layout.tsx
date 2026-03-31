import { Stack } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { THEME } from '../../src/constants/theme';
import { MagicFabMenu } from '../../src/components/eventsync/MagicFabMenu';

export default function AdminLayout() {
    const { role, isLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && role !== 'admin') {
            router.replace('/(tabs)/eventsync/pending');
        }
    }, [role, isLoading]);

    // ⛔ Block rendering until auth resolved
    if (isLoading || role !== 'admin') {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={THEME.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* FAB Menu globally visible in admin dashboard */}
            {(Platform.OS as string) !== 'web' && (
                <View style={styles.fabWrapper}>
                    <MagicFabMenu />
                </View>
            )}

            <Stack
                screenOptions={{
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: THEME.colors.primary,
                    },
                    headerTintColor: THEME.colors.white,
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            >
                <Stack.Screen
                    name="dashboard"
                    options={{
                        title: 'Admin Dashboard',
                    }}
                />
            </Stack>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fabWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        pointerEvents: 'box-none',
    },
});

import { Stack } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { THEME } from '../../src/constants/theme';

export default function AdminLayout() {
    const { role, isLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && role !== 'admin') {
            router.replace('/eventsync/pending');
        }
    }, [role, isLoading]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={THEME.colors.primary} />
            </View>
        );
    }

    return (
        <Stack
            screenOptions={{
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
    );
}

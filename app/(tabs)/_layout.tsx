import { Tabs } from 'expo-router';
import { Icon } from '../../src/components/common/Icon';
import { useAuthStore } from '../../src/store/authStore';
import { THEME } from '../../src/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
    const { isHosteler } = useAuthStore();
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: THEME.colors.primaryLight,
                tabBarInactiveTintColor: THEME.colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: THEME.colors.surface,
                    borderTopColor: THEME.colors.border,
                    paddingBottom: Math.max(insets.bottom, 8),
                    paddingTop: 8,
                    height: 60 + Math.max(insets.bottom, 8),
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                headerShown: true,
                headerStyle: {
                    backgroundColor: THEME.colors.background,
                    elevation: 0, // Remove shadow on Android
                    shadowOpacity: 0, // Remove shadow on iOS
                    borderBottomWidth: 1,
                    borderBottomColor: THEME.colors.border,
                },
                headerTintColor: THEME.colors.white,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Tabs.Screen
                name="eventsync"
                options={{
                    title: 'EventSync',
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="calendar-check" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="travelsync"
                options={{
                    title: 'TravelSync',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="airplane" size={size} color={color} />
                    ),
                    // Hide tab if user is not a hosteler
                    href: isHosteler ? '/(tabs)/travelsync' : null,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="account" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

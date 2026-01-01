import { Stack } from 'expo-router';
import { THEME } from '../../src/constants/theme';

export default function EventSyncLayout() {
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
                name="index"
                options={{ title: 'EventSync – AI Venue Allocation' }}
            />
            <Stack.Screen
                name="details"
                options={{ title: 'Event Details' }}
            />
            <Stack.Screen
                name="venues"
                options={{ title: 'Available Venues' }}
            />
            <Stack.Screen
                name="alternatives"
                options={{ title: 'Alternative Venues' }}
            />
            <Stack.Screen
                name="available"
                options={{ title: 'Browse All Venues' }}
            />
            <Stack.Screen
                name="pending"
                options={{ title: 'Pending Approvals' }}
            />
            <Stack.Screen
                name="approved"
                options={{ title: 'Approved Events' }}
            />
        </Stack>
    );
}

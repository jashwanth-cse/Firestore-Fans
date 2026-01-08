import { Tabs } from 'expo-router';
import { Icon } from '../../../src/components/common/Icon';
import { THEME } from '../../../src/constants/theme';

export default function EventSyncTabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: THEME.colors.primary,
                tabBarInactiveTintColor: THEME.colors.gray600,
                tabBarStyle: {
                    backgroundColor: THEME.colors.white,
                    borderTopColor: THEME.colors.border,
                    paddingBottom: 4,
                    paddingTop: 4,
                    height: 50,
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                },
                tabBarLabelStyle: {
                    fontSize: 9,
                    fontWeight: '600',
                    marginTop: 2,
                },
                tabBarIconStyle: {
                    marginBottom: 0,
                },
                headerShown: true,
                headerStyle: {
                    backgroundColor: THEME.colors.primary,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                headerTintColor: THEME.colors.white,
                headerTitleStyle: {
                    fontWeight: 'bold',
                    fontSize: 18,
                },
            }}
        >
            {/* Home/AI Chat Tab */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Book Event',
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color }) => (
                        <Icon name="chat-processing" size={20} color={color} />
                    ),
                    headerTitle: 'EventSync AI',
                }}
            />

            {/* Browse Venues Tab */}
            <Tabs.Screen
                name="browse"
                options={{
                    title: 'Browse Venues',
                    tabBarLabel: 'Browse',
                    tabBarIcon: ({ color }) => (
                        <Icon name="map-marker-multiple" size={20} color={color} />
                    ),
                    headerTitle: 'Browse Venues',
                }}
            />

            {/* Pending Requests Tab */}
            <Tabs.Screen
                name="pending"
                options={{
                    title: 'Pending',
                    tabBarLabel: 'Pending',
                    tabBarIcon: ({ color }) => (
                        <Icon name="clock-outline" size={20} color={color} />
                    ),
                    headerTitle: 'Pending Approvals',
                }}
            />

            {/* Approved Events Tab */}
            <Tabs.Screen
                name="approved"
                options={{
                    title: 'Approved',
                    tabBarLabel: 'Approved',
                    tabBarIcon: ({ color }) => (
                        <Icon name="check-circle" size={20} color={color} />
                    ),
                    headerTitle: 'Approved Events',
                }}
            />

            {/* Hide other stack screens from tabs */}
            <Tabs.Screen
                name="venues"
                options={{
                    href: null, // Hide from tab bar
                }}
            />
            <Tabs.Screen
                name="alternatives"
                options={{
                    href: null, // Hide from tab bar
                }}
            />
            <Tabs.Screen
                name="details"
                options={{
                    href: null, // Hide from tab bar
                }}
            />
        </Tabs>
    );
}



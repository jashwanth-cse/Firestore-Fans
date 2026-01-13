import { Tabs, Stack } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Dimensions, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../../../src/constants/theme';
import { MagicFabMenu } from '../../../src/components/eventsync/MagicFabMenu';

export default function EventSyncLayout() {
    const { width } = useWindowDimensions();
    const isMobileWeb = Platform.OS === 'web' && width < 768;

    // Use bottom tabs for web, FAB menu for native platforms
    if (Platform.OS === 'web') {
        return (
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: THEME.colors.primary,
                    tabBarInactiveTintColor: THEME.colors.gray600,
                    tabBarStyle: {
                        backgroundColor: THEME.colors.white,
                        borderTopColor: THEME.colors.border,
                        paddingBottom: isMobileWeb ? 4 : 8,
                        paddingTop: isMobileWeb ? 4 : 8,
                        height: isMobileWeb ? 50 : 60,
                        elevation: 8,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                    },
                    tabBarLabelStyle: {
                        fontSize: isMobileWeb ? 0 : 11, // Hide labels on mobile
                        fontWeight: '600',
                        display: isMobileWeb ? 'none' : 'flex',
                    },
                    tabBarIconStyle: {
                        marginTop: isMobileWeb ? 0 : undefined,
                    },
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: THEME.colors.primary,
                    },
                    headerTintColor: THEME.colors.white,
                    headerTitleStyle: {
                        fontWeight: 'bold',
                        fontSize: isMobileWeb ? 16 : 18,
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Book Event',
                        tabBarLabel: 'Home',
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons
                                name="chat-processing"
                                size={isMobileWeb ? 22 : size}
                                color={color}
                            />
                        ),
                        headerTitle: 'EventSync AI',
                    }}
                />
                <Tabs.Screen
                    name="browse"
                    options={{
                        title: 'Browse Venues',
                        tabBarLabel: 'Browse',
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons
                                name="map-marker-multiple"
                                size={isMobileWeb ? 22 : size}
                                color={color}
                            />
                        ),
                        headerTitle: 'Browse Venues',
                    }}
                />
                <Tabs.Screen
                    name="pending"
                    options={{
                        title: 'Pending',
                        tabBarLabel: 'Pending',
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons
                                name="clock-outline"
                                size={isMobileWeb ? 22 : size}
                                color={color}
                            />
                        ),
                        headerTitle: 'Pending Approvals',
                    }}
                />
                <Tabs.Screen
                    name="approved"
                    options={{
                        title: 'Approved',
                        tabBarLabel: 'Approved',
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons
                                name="check-circle"
                                size={isMobileWeb ? 22 : size}
                                color={color}
                            />
                        ),
                        headerTitle: 'Approved Events',
                    }}
                />
                {/* Hide other screens from tabs */}
                <Tabs.Screen name="venues" options={{ href: null }} />
                <Tabs.Screen name="alternatives" options={{ href: null }} />
                <Tabs.Screen name="details" options={{ href: null }} />
            </Tabs>
        );
    }

    // Native platforms (Android/iOS) - use FAB menu with Stack navigation
    return (
        <View style={styles.container}>
            {/* Floating FAB Menu for mobile */}
            <View style={styles.fabWrapper}>
                <MagicFabMenu />
            </View>

            <Stack
                screenOptions={{
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: THEME.colors.primary,
                    },
                    headerTintColor: THEME.colors.white,
                    headerTitleStyle: {
                        fontWeight: 'bold',
                        fontSize: 18,
                    },
                    headerTitleAlign: 'left',
                }}
            >
                <Stack.Screen name="index" options={{ title: 'EventSync AI' }} />
                <Stack.Screen name="browse" options={{ title: 'Browse Venues' }} />
                <Stack.Screen name="pending" options={{ title: 'Pending Approvals' }} />
                <Stack.Screen name="approved" options={{ title: 'Approved Events' }} />

                {/* Hidden screens */}
                <Stack.Screen name="venues" options={{ headerShown: false }} />
                <Stack.Screen name="alternatives" options={{ headerShown: false }} />
                <Stack.Screen name="details" options={{ headerShown: false }} />
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
        top: Platform.select({
            android: 120,
            ios: 140,
            default: 130,
        }),
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 1000,
        elevation: 12,
        pointerEvents: 'box-none',
    },
});

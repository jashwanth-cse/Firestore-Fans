import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EventCard } from '../../src/components/event/EventCard';
import { THEME } from '../../src/constants/theme';
import { Event } from '../../src/types/event.types';
import { eventSyncAPI } from '../../src/services/eventSync.service';
import { useAuthStore } from '../../src/store/authStore';

export default function ApprovedEventsScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [approvedEvents, setApprovedEvents] = React.useState<Event[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [syncing, setSyncing] = React.useState<string | null>(null);

    // Fetch approved events from backend
    const fetchApprovedEvents = React.useCallback(async () => {
        if (!user?.uid) return;

        try {
            const result = await eventSyncAPI.getApprovedEvents(user.uid);
            if (result.success && result.events) {
                setApprovedEvents(result.events);
            }
        } catch (error) {
            console.error('Error fetching approved events:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.uid]);

    // Load on mount
    React.useEffect(() => {
        fetchApprovedEvents();
    }, [fetchApprovedEvents]);

    const handleEventPress = (event: Event) => {
        Alert.alert(
            event.name,
            `Venue: ${event.venueName}\nDate: ${new Date(event.date).toLocaleDateString()}\nTime: ${event.startTime}`,
            [
                { text: 'Close' },
                {
                    text: 'Sync to Calendar',
                    onPress: () => handleSyncToCalendar(event),
                },
            ]
        );
    };

    const handleSyncToCalendar = (event: Event) => {
        // Placeholder for Google Calendar sync - will integrate later
        Alert.alert(
            'Sync to Calendar',
            `"${event.name}" will be added to your Google Calendar.\n\nThis feature will be connected to Google Calendar API in the next phase.`,
            [{ text: 'OK' }]
        );
    };

    if (approvedEvents.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                    name="calendar-check"
                    size={100}
                    color={THEME.colors.gray300}
                />
                <Text style={styles.emptyTitle}>No Approved Events Yet</Text>
                <Text style={styles.emptyText}>
                    Your approved events will appear here once admin reviews them
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Success Banner */}
                <View style={styles.successBanner}>
                    <MaterialCommunityIcons
                        name="check-circle"
                        size={24}
                        color={THEME.colors.success}
                    />
                    <View style={styles.bannerContent}>
                        <Text style={styles.bannerTitle}>Events Confirmed!</Text>
                        <Text style={styles.bannerText}>
                            These events have been approved by administrators
                        </Text>
                    </View>
                </View>

                {/* Stats Card */}
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons
                            name="calendar-check"
                            size={32}
                            color={THEME.colors.success}
                        />
                        <Text style={styles.statNumber}>{approvedEvents.length}</Text>
                        <Text style={styles.statLabel}>Approved Events</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => {
                            Alert.alert(
                                'Sync All to Calendar',
                                'All approved events will be synced to Google Calendar',
                                [{ text: 'Cancel', style: 'cancel' }, { text: 'Sync All' }]
                            );
                        }}
                    >
                        <MaterialCommunityIcons
                            name="google"
                            size={20}
                            color={THEME.colors.white}
                        />
                        <Text style={styles.quickActionText}>Sync All to Calendar</Text>
                    </TouchableOpacity>
                </View>

                {/* Approved Events List */}
                <Text style={styles.sectionTitle}>Your Approved Events</Text>
                {approvedEvents.map((event) => (
                    <View key={event.id} style={styles.eventWrapper}>
                        <EventCard event={event} onPress={() => handleEventPress(event)} />
                        <TouchableOpacity
                            style={styles.calendarButton}
                            onPress={() => handleSyncToCalendar(event)}
                        >
                            <MaterialCommunityIcons
                                name="calendar-plus"
                                size={18}
                                color={THEME.colors.primary}
                            />
                            <Text style={styles.calendarButtonText}>Add to Calendar</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: THEME.spacing.lg,
    },
    successBanner: {
        flexDirection: 'row',
        backgroundColor: THEME.colors.success + '15',
        padding: THEME.spacing.md,
        borderRadius: THEME.borderRadius.md,
        marginBottom: THEME.spacing.lg,
        borderLeftWidth: 4,
        borderLeftColor: THEME.colors.success,
    },
    bannerContent: {
        flex: 1,
        marginLeft: THEME.spacing.sm,
    },
    bannerTitle: {
        fontSize: THEME.typography.fontSize.base,
        fontWeight: '600',
        color: THEME.colors.gray900,
        marginBottom: THEME.spacing.xs / 2,
    },
    bannerText: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.gray700,
    },
    statsCard: {
        backgroundColor: THEME.colors.white,
        padding: THEME.spacing.xl,
        borderRadius: THEME.borderRadius.lg,
        marginBottom: THEME.spacing.lg,
        alignItems: 'center',
        ...THEME.shadows.md,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: THEME.typography.fontSize['3xl'],
        fontWeight: 'bold',
        color: THEME.colors.success,
        marginTop: THEME.spacing.xs,
        marginBottom: THEME.spacing.xs / 2,
    },
    statLabel: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.gray600,
        fontWeight: '500',
    },
    quickActions: {
        marginBottom: THEME.spacing.lg,
    },
    quickActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: THEME.colors.primary,
        padding: THEME.spacing.md,
        borderRadius: THEME.borderRadius.md,
        gap: THEME.spacing.xs,
    },
    quickActionText: {
        color: THEME.colors.white,
        fontSize: THEME.typography.fontSize.base,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: THEME.typography.fontSize.lg,
        fontWeight: '600',
        color: THEME.colors.gray900,
        marginBottom: THEME.spacing.md,
    },
    eventWrapper: {
        marginBottom: THEME.spacing.lg,
    },
    calendarButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: THEME.colors.white,
        borderWidth: 2,
        borderColor: THEME.colors.primary,
        padding: THEME.spacing.sm,
        borderRadius: THEME.borderRadius.md,
        marginTop: -THEME.spacing.sm,
        gap: THEME.spacing.xs,
    },
    calendarButtonText: {
        color: THEME.colors.primary,
        fontSize: THEME.typography.fontSize.sm,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: THEME.spacing.xl,
    },
    emptyTitle: {
        fontSize: THEME.typography.fontSize['2xl'],
        fontWeight: 'bold',
        color: THEME.colors.gray900,
        marginTop: THEME.spacing.lg,
        marginBottom: THEME.spacing.sm,
    },
    emptyText: {
        fontSize: THEME.typography.fontSize.base,
        color: THEME.colors.gray600,
        textAlign: 'center',
    },
});

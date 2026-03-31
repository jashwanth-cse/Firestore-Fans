import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Icon } from '../../../src/components/common/Icon';
import { MdCheckCircleOutline, MdInfo, MdSchedule } from 'react-icons/md';
import { EventCard } from '../../../src/components/event/EventCard';
import { THEME } from '../../../src/constants/theme';
import { Event } from '../../../src/types/event.types';
import { eventSyncAPI } from '../../../src/services/eventSync.service';
import { useAuthStore } from '../../../src/store/authStore';
import { auth } from '../../../src/services/firebase';
import { useToast } from '../../../src/hooks/useToast';

export default function PendingApprovalsScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { showError } = useToast();
    const [refreshing, setRefreshing] = React.useState(false);
    const [pendingEvents, setPendingEvents] = React.useState<Event[]>([]);
    const [loading, setLoading] = React.useState(true);

    // Fetch pending events from backend
    const fetchPendingEvents = React.useCallback(async () => {
        // Prefer auth.currentUser if store is not ready yet
        const currentUid = user?.uid || auth.currentUser?.uid;

        console.log('🔄 Fetching pending events for UID:', currentUid);

        if (!currentUid) {
            setLoading(false);
            return;
        }

        try {
            const result = await eventSyncAPI.getPendingEvents(currentUid);

            // Backend returns { success, requests, count }
            // Note: firestoreService.getPendingRequests returns array directly, 
            // but eventController wraps it in { success: true, count: N, events: [] }
            // Check both potential response structures for robustness
            const events = result.events || result.requests || [];

            // Format events to match Event interface
            // Backend sends: eventName, facilitiesRequired, seatsRequired, durationHours
            // Frontend expects: name, facilities, requiredSeats, duration (minutes)
            const formattedEvents: Event[] = (events as any[]).map(e => ({
                id: e.id,
                name: e.eventName || 'Untitled Event',
                description: e.description,
                date: e.date,
                startTime: e.startTime,
                // Convert hours to minutes if duration is missing, or use duration if present
                duration: e.duration || (e.durationHours ? e.durationHours * 60 : 60),
                requiredSeats: e.seatsRequired || e.requiredSeats || 0,
                facilities: e.facilitiesRequired || e.facilities || [],
                status: e.status || 'pending',
                venueId: e.venueId,
                venueName: e.venueName,
                createdAt: e.createdAt
            }));

            setPendingEvents(formattedEvents);
        } catch (error) {
            showError('Failed to load pending events');
        } finally {
            setLoading(false);
        }
    }, [user?.uid]);

    // Auto-refresh when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            fetchPendingEvents();
        }, [fetchPendingEvents])
    );

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchPendingEvents();
        setRefreshing(false);
    }, [fetchPendingEvents]);

    const handleEventPress = (event: Event) => {
        alert(`Event: ${event.name}\nStatus: ${event.status}\nVenue: ${event.venueName}`);
    };

    if (loading) {
        return (
            <View style={[styles.emptyContainer, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={THEME.colors.primary} />
                <Text style={styles.emptyText}>Loading pending events...</Text>
            </View>
        );
    }

    if (pendingEvents.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                {Platform.OS === 'web' ? (
                    <MdCheckCircleOutline size={100} color={THEME.colors.gray300} />
                ) : (
                    <Icon
                        name="checkbox-marked-circle-outline"
                        size={100}
                        color={THEME.colors.gray300}
                    />
                )}
                <Text style={styles.emptyTitle}>No Pending Approvals</Text>
                <Text style={styles.emptyText}>
                    You don't have any events waiting for approval
                </Text>
                <Text style={styles.emptyHint}>
                    Create a new event request to get started
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={THEME.colors.primary}
                    />
                }
            >
                {/* Info Banner */}
                <View style={styles.infoBanner}>
                    {Platform.OS === 'web' ? (
                        <MdInfo size={20} color={THEME.colors.warning} />
                    ) : (
                        <Icon
                            name="information-outline"
                            size={20}
                            color={THEME.colors.warning}
                        />
                    )}
                    <View style={styles.infoBannerContent}>
                        <Text style={styles.infoBannerTitle}>Awaiting Admin Review</Text>
                        <Text style={styles.infoBannerText}>
                            These events are pending approval from administrators
                        </Text>
                    </View>
                </View>

                {/* Stats Card */}
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{pendingEvents.length}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        {Platform.OS === 'web' ? (
                            <MdSchedule size={20} color={THEME.colors.gray600} />
                        ) : (
                            <Icon name="clock" size={20} color={THEME.colors.gray600} />
                        )}
                        <Text style={styles.statLabel}>In Review</Text>
                    </View>
                </View>

                {/* Pending Events List */}
                <Text style={styles.sectionTitle}>Your Pending Requests</Text>
                {pendingEvents.map((event) => (
                    <EventCard
                        key={event.id}
                        event={event}
                        onPress={() => handleEventPress(event)}
                    />
                ))}

                <Text style={styles.footerNote}>
                    Pull down to refresh status
                </Text>
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
    infoBanner: {
        flexDirection: 'row',
        backgroundColor: THEME.colors.warning + '15',
        padding: THEME.spacing.md,
        borderRadius: THEME.borderRadius.md,
        marginBottom: THEME.spacing.lg,
        borderLeftWidth: 4,
        borderLeftColor: THEME.colors.warning,
    },
    infoBannerContent: {
        flex: 1,
        marginLeft: THEME.spacing.sm,
    },
    infoBannerTitle: {
        fontSize: THEME.typography.fontSize.base,
        fontWeight: '600',
        color: THEME.colors.gray900,
        marginBottom: THEME.spacing.xs / 2,
    },
    infoBannerText: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.gray700,
    },
    statsCard: {
        flexDirection: 'row',
        backgroundColor: THEME.colors.white,
        padding: THEME.spacing.lg,
        borderRadius: THEME.borderRadius.lg,
        marginBottom: THEME.spacing.lg,
        ...THEME.shadows.md,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: THEME.typography.fontSize['3xl'],
        fontWeight: 'bold',
        color: THEME.colors.warning,
        marginBottom: THEME.spacing.xs / 2,
    },
    statLabel: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.gray600,
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        backgroundColor: THEME.colors.gray200,
        marginHorizontal: THEME.spacing.md,
    },
    sectionTitle: {
        fontSize: THEME.typography.fontSize.lg,
        fontWeight: '600',
        color: THEME.colors.gray900,
        marginBottom: THEME.spacing.md,
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
        marginBottom: THEME.spacing.xs,
    },
    emptyHint: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.gray500,
        textAlign: 'center',
    },
    footerNote: {
        fontSize: THEME.typography.fontSize.xs,
        color: THEME.colors.gray500,
        textAlign: 'center',
        marginTop: THEME.spacing.lg,
    },
});



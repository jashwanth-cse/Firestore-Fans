import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VenueCard } from '../../src/components/event/VenueCard';
import { THEME } from '../../src/constants/theme';
import { Venue, ExtractedEventData } from '../../src/types/event.types';
import { eventSyncAPI } from '../../src/services/eventSync.service';

export default function VenueSelectionScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // State
    const [isLoading, setIsLoading] = useState(true);
    const [availableVenues, setAvailableVenues] = useState<Venue[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [submittingVenueId, setSubmittingVenueId] = useState<string | null>(null);

    // Parse event data safely
    const eventData: ExtractedEventData | null = params.eventData
        ? JSON.parse(params.eventData as string)
        : null;

    useEffect(() => {
        loadAvailableVenues();
    }, []);

    const loadAvailableVenues = async () => {
        if (!eventData) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Format durationHours (convert minutes to hours)
            const durationHours = eventData.duration
                ? eventData.duration / 60
                : 2;

            console.log('Fetching venues for:', {
                date: eventData.date,
                seats: eventData.requiredSeats
            });

            // Call REAL backend API
            const venues = await eventSyncAPI.findAvailableVenues({
                date: eventData.date,
                startTime: eventData.startTime,
                durationHours: durationHours,
                seatsRequired: eventData.requiredSeats || 30,
                facilitiesRequired: eventData.facilities || [],
            });

            console.log('Venues found:', venues?.length);

            // Ensure venues is an array
            setAvailableVenues(Array.isArray(venues) ? venues : []);

        } catch (err) {
            console.error('Failed to load venues:', err);
            setError('Failed to load available venues. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectVenue = (venue: Venue) => {
        if (Platform.OS === 'web') {
            const confirmed = window.confirm(`Select ${venue.name} for this event?`);
            if (confirmed) {
                handleSubmitForApproval(venue);
            }
        } else {
            Alert.alert(
                'Confirm Venue Selection',
                `Select ${venue.name} for this event?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Confirm',
                        onPress: () => handleSubmitForApproval(venue),
                    },
                ]
            );
        }
    };

    const handleSubmitForApproval = async (venue: Venue) => {
        if (!eventData) return;

        try {
            setSubmittingVenueId(venue.id);

            const durationHours = eventData.duration ? eventData.duration / 60 : 2;

            // Call REAL backend API
            await eventSyncAPI.submitRequest({
                eventName: eventData.eventName,
                date: eventData.date,
                startTime: eventData.startTime,
                durationHours: durationHours,
                seatsRequired: eventData.requiredSeats,
                facilitiesRequired: eventData.facilities || [],
                venueId: venue.id,
                description: `Requested via EventSync for ${eventData.requiredSeats} people`,
            });

            // Success Message
            const successMsg = `Success! Your event has been submitted for approval with venue: ${venue.name}`;

            if (Platform.OS === 'web') {
                window.alert(successMsg);
                router.replace('/(eventsync)/pending');
            } else {
                Alert.alert(
                    'Success!',
                    successMsg,
                    [
                        {
                            text: 'View Pending',
                            onPress: () => router.replace('/(eventsync)/pending'),
                        },
                        {
                            text: 'OK',
                            onPress: () => router.replace('/(eventsync)'),
                        },
                    ]
                );
            }
        } catch (err) {
            console.error('Submission error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to submit request';

            if (Platform.OS === 'web') {
                window.alert(errorMessage);
            } else {
                Alert.alert('Error', errorMessage);
            }
        } finally {
            setSubmittingVenueId(null);
        }
    };

    const handleSuggestAlternatives = (venue: Venue) => {
        router.push({
            pathname: '/(eventsync)/alternatives',
            params: {
                eventData: JSON.stringify(eventData),
                occupiedVenue: JSON.stringify(venue),
            },
        });
    };

    // --- RENDER STATES ---

    // 1. Loading
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={THEME.colors.primary} />
                <Text style={styles.loadingText}>Finding suitable venues...</Text>
            </View>
        );
    }

    // 2. Error
    if (error) {
        return (
            <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="alert-circle" size={48} color={THEME.colors.error} />
                <Text style={styles.emptyTitle}>Error</Text>
                <Text style={styles.emptyText}>{error}</Text>
                <TouchableOpacity style={styles.backButton} onPress={loadAvailableVenues}>
                    <Text style={styles.backButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // 3. No Event Data (Shouldn't happen)
    if (!eventData) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No event data found.</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // 4. No Venues Found
    if (availableVenues.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="office-building" size={48} color={THEME.colors.gray500} />
                <Text style={styles.emptyTitle}>No Venues Found</Text>
                <Text style={styles.emptyText}>
                    No venues match your requirements for {eventData.requiredSeats} seats.
                    Try adjusting your requirements.
                </Text>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // 5. Success List
    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>
                        Showing venues for: {eventData.eventName}
                    </Text>
                    <Text style={styles.infoText}>
                        {eventData.requiredSeats} seats • {eventData.duration} min • {eventData.date}
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>
                    Available Venues ({availableVenues.length})
                </Text>

                {availableVenues.map((venue) => (
                    <View key={venue.id}>
                        <VenueCard
                            venue={venue}
                            onSelect={() => handleSelectVenue(venue)}
                            showSelectButton={venue.isAvailable && !submittingVenueId}
                            showAlternativeButton={!venue.isAvailable}
                            // Only suggest alternatives if we're not submitting
                            onSuggestAlternative={() => !submittingVenueId && handleSuggestAlternatives(venue)}
                        />
                        {submittingVenueId === venue.id && (
                            <View style={styles.submittingOverlay}>
                                <ActivityIndicator color={THEME.colors.white} />
                                <Text style={styles.submittingText}>Submitting...</Text>
                            </View>
                        )}
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
    infoCard: {
        backgroundColor: THEME.colors.primary,
        padding: THEME.spacing.md,
        borderRadius: THEME.borderRadius.lg,
        marginBottom: THEME.spacing.lg,
    },
    infoTitle: {
        fontSize: THEME.typography.fontSize.base,
        fontWeight: '600',
        color: THEME.colors.white,
        marginBottom: THEME.spacing.xs / 2,
    },
    infoText: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.white,
        opacity: 0.9,
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
        backgroundColor: THEME.colors.background,
    },
    emptyTitle: {
        fontSize: THEME.typography.fontSize.xl,
        fontWeight: 'bold',
        color: THEME.colors.gray900,
        marginBottom: THEME.spacing.sm,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: THEME.typography.fontSize.base,
        color: THEME.colors.gray600,
        textAlign: 'center',
        marginBottom: THEME.spacing.xl,
    },
    backButton: {
        backgroundColor: THEME.colors.primary,
        paddingHorizontal: THEME.spacing.xl,
        paddingVertical: THEME.spacing.md,
        borderRadius: THEME.borderRadius.md,
    },
    backButtonText: {
        color: THEME.colors.white,
        fontSize: THEME.typography.fontSize.base,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: THEME.colors.background,
    },
    loadingText: {
        marginTop: THEME.spacing.md,
        color: THEME.colors.gray600,
        fontSize: THEME.typography.fontSize.base,
    },
    submittingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: THEME.borderRadius.lg,
    },
    submittingText: {
        color: THEME.colors.white,
        marginTop: THEME.spacing.sm,
        fontWeight: '600',
    },
});

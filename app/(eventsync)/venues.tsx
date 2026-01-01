import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { VenueCard } from '../../src/components/event/VenueCard';
import { THEME } from '../../src/constants/theme';
import { MOCK_VENUES } from '../../src/constants/eventConstants';
import { Venue, ExtractedEventData } from '../../src/types/event.types';

export default function VenueSelectionScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const eventData: ExtractedEventData = params.eventData
        ? JSON.parse(params.eventData as string)
        : null;

    // Filter venues based on requirements (mock logic)
    const [availableVenues] = useState<Venue[]>(
        MOCK_VENUES.filter((venue) => {
            if (!eventData) return true;
            // Simple mock filtering - check capacity
            return venue.capacity >= eventData.requiredSeats;
        })
    );

    const handleSelectVenue = (venue: Venue) => {
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
    };

    const handleSubmitForApproval = (venue: Venue) => {
        // Mock submission - will integrate with backend later
        Alert.alert(
            'Success!',
            `Your event has been submitted for approval with venue: ${venue.name}`,
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

    if (availableVenues.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No Venues Match Your Requirements</Text>
                <Text style={styles.emptyText}>
                    Try adjusting your requirements or check alternative venues
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

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                {eventData && (
                    <View style={styles.infoCard}>
                        <Text style={styles.infoTitle}>
                            Showing venues for: {eventData.eventName}
                        </Text>
                        <Text style={styles.infoText}>
                            {eventData.requiredSeats} seats • {eventData.duration} min
                        </Text>
                    </View>
                )}

                <Text style={styles.sectionTitle}>
                    Available Venues ({availableVenues.length})
                </Text>

                {availableVenues.map((venue) => (
                    <VenueCard
                        key={venue.id}
                        venue={venue}
                        onSelect={() => handleSelectVenue(venue)}
                        showSelectButton={venue.isAvailable}
                        showAlternativeButton={!venue.isAvailable}
                        onSuggestAlternative={() => handleSuggestAlternatives(venue)}
                    />
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
});

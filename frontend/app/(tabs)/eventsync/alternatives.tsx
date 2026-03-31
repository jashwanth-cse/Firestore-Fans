import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Icon } from '../../../src/components/common/Icon';
import { VenueCard } from '../../../src/components/event/VenueCard';
import { THEME } from '../../../src/constants/theme';
import { MOCK_VENUES } from '../../../src/constants/eventConstants';
import { Venue, ExtractedEventData, AlternativeVenueSuggestion } from '../../../src/types/event.types';

export default function AlternativeVenueScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const eventData: ExtractedEventData = params.eventData
        ? JSON.parse(params.eventData as string)
        : null;

    // Mock AI-generated alternatives - will be replaced with Gemini API
    const generateAlternatives = (): AlternativeVenueSuggestion[] => {
        const alternatives = MOCK_VENUES
            .filter(v => v.isAvailable && (!eventData || v.capacity >= eventData.requiredSeats))
            .slice(0, 4)
            .map((venue, index) => ({
                venue,
                reason: getReasonForSuggestion(venue, index),
                matchScore: 95 - (index * 8),
            }));

        return alternatives.sort((a, b) => b.matchScore - a.matchScore);
    };

    const getReasonForSuggestion = (venue: Venue, index: number): string => {
        const reasons = [
            `Perfect match with ${venue.capacity} seat capacity and all required facilities`,
            `Excellent alternative with modern facilities in ${venue.building}`,
            `Highly recommended - spacious venue with great amenities`,
            `Good backup option with flexible scheduling`,
        ];
        return reasons[index] || 'Suitable alternative venue';
    };

    const [alternatives] = useState<AlternativeVenueSuggestion[]>(generateAlternatives());

    const handleSelectAlternative = (suggestion: AlternativeVenueSuggestion) => {
        Alert.alert(
            'Confirm Selection',
            `Select ${suggestion.venue.name} as alternative venue?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: () => {
                        Alert.alert(
                            'Success!',
                            'Event submitted for approval with alternative venue',
                            [
                                {
                                    text: 'View Pending',
                                    onPress: () => router.replace('/eventsync/pending'),
                                },
                                { text: 'OK', onPress: () => router.replace('/eventsync/pending') },
                            ]
                        );
                    },
                },
            ]
        );
    };

    if (alternatives.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Icon name="information" size={60} color={THEME.colors.gray400} />
                <Text style={styles.emptyTitle}>No Alternatives Found</Text>
                <Text style={styles.emptyText}>
                    No suitable alternative venues available at this time
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
                {/* AI Suggestion Header */}
                <View style={styles.aiHeader}>
                    <View style={styles.aiIconContainer}>
                        <Icon
                            name="robot"
                            size={40}
                            color={THEME.colors.primary}
                        />
                    </View>
                    <Text style={styles.aiTitle}>AI-Recommended Alternatives</Text>
                    <Text style={styles.aiSubtitle}>
                        Based on your requirements, we suggest these venues
                    </Text>
                </View>

                {eventData && (
                    <View style={styles.requirementsCard}>
                        <Text style={styles.requirementsTitle}>Your Requirements:</Text>
                        <Text style={styles.requirementsText}>
                            {eventData.requiredSeats} seats • {eventData.facilities.join(', ')}
                        </Text>
                    </View>
                )}

                {alternatives.map((suggestion, index) => (
                    <View key={suggestion.venue.id} style={styles.suggestionContainer}>
                        <View style={styles.matchHeader}>
                            <View style={styles.rankBadge}>
                                <Text style={styles.rankText}>#{index + 1}</Text>
                            </View>
                            <View style={styles.matchScoreContainer}>
                                <Icon
                                    name="star"
                                    size={16}
                                    color={THEME.colors.warning}
                                />
                                <Text style={styles.matchScore}>
                                    {suggestion.matchScore}% match
                                </Text>
                            </View>
                        </View>

                        {suggestion.reason && (
                            <View style={styles.reasonCard}>
                                <Icon
                                    name="lightbulb-on"
                                    size={16}
                                    color={THEME.colors.primary}
                                />
                                <Text style={styles.reasonText}>{suggestion.reason}</Text>
                            </View>
                        )}

                        <VenueCard
                            venue={suggestion.venue}
                            onSelect={() => handleSelectAlternative(suggestion)}
                            showSelectButton={true}
                        />
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
    aiHeader: {
        alignItems: 'center',
        marginBottom: THEME.spacing.xl,
    },
    aiIconContainer: {
        backgroundColor: THEME.colors.gray100,
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: THEME.spacing.md,
    },
    aiTitle: {
        fontSize: THEME.typography.fontSize.xl,
        fontWeight: 'bold',
        color: THEME.colors.gray900,
        marginBottom: THEME.spacing.xs,
    },
    aiSubtitle: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.gray600,
        textAlign: 'center',
    },
    requirementsCard: {
        backgroundColor: THEME.colors.gray100,
        padding: THEME.spacing.md,
        borderRadius: THEME.borderRadius.md,
        marginBottom: THEME.spacing.lg,
    },
    requirementsTitle: {
        fontSize: THEME.typography.fontSize.sm,
        fontWeight: '600',
        color: THEME.colors.gray700,
        marginBottom: THEME.spacing.xs / 2,
    },
    requirementsText: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.gray600,
    },
    suggestionContainer: {
        marginBottom: THEME.spacing.xl,
    },
    matchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: THEME.spacing.sm,
    },
    rankBadge: {
        backgroundColor: THEME.colors.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankText: {
        color: THEME.colors.white,
        fontSize: THEME.typography.fontSize.sm,
        fontWeight: 'bold',
    },
    matchScoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.colors.gray100,
        paddingHorizontal: THEME.spacing.sm,
        paddingVertical: THEME.spacing.xs / 2,
        borderRadius: THEME.borderRadius.full,
        gap: THEME.spacing.xs / 2,
    },
    matchScore: {
        fontSize: THEME.typography.fontSize.sm,
        fontWeight: '600',
        color: THEME.colors.gray700,
    },
    reasonCard: {
        flexDirection: 'row',
        backgroundColor: THEME.colors.white,
        padding: THEME.spacing.sm,
        borderRadius: THEME.borderRadius.md,
        marginBottom: THEME.spacing.sm,
        borderLeftWidth: 3,
        borderLeftColor: THEME.colors.primary,
    },
    reasonText: {
        flex: 1,
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.gray700,
        marginLeft: THEME.spacing.xs,
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
        marginTop: THEME.spacing.md,
        marginBottom: THEME.spacing.sm,
    },
    emptyText: {
        fontSize: THEME.typography.fontSize.base,
        color: THEME.colors.gray600,
        textAlign: 'center',
    },
});



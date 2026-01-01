import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VenueCard } from '../../src/components/event/VenueCard';
import { THEME } from '../../src/constants/theme';
import { MOCK_VENUES } from '../../src/constants/eventConstants';
import { Venue } from '../../src/types/event.types';

export default function AvailableVenuesListScreen() {
    const [selectedDate, setSelectedDate] = useState<string>('2026-01-08');
    const [venues] = useState<Venue[]>(MOCK_VENUES);

    // Filter venues by selected date (mock logic)
    const availableVenues = venues.filter((venue) => {
        // Check if venue has no conflicts on selected date
        const hasConflict = venue.occupiedTimes.some(
            (slot) => slot.date === selectedDate
        );
        return !hasConflict;
    });

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const handleDateChange = () => {
        // In real implementation, this would open a date picker
        // For now, we'll just show an alert
        alert('Date picker will be implemented with expo-date-picker');
    };

    return (
        <View style={styles.container}>
            {/* Date Selector */}
            <View style={styles.dateSelector}>
                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={handleDateChange}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons
                        name="calendar"
                        size={20}
                        color={THEME.colors.primary}
                    />
                    <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
                    <MaterialCommunityIcons
                        name="chevron-down"
                        size={20}
                        color={THEME.colors.gray600}
                    />
                </TouchableOpacity>

                <View style={styles.resultCount}>
                    <Text style={styles.resultCountText}>
                        {availableVenues.length} venue{availableVenues.length !== 1 ? 's' : ''} available
                    </Text>
                </View>
            </View>

            {/* Venues List */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                {availableVenues.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons
                            name="calendar-remove"
                            size={60}
                            color={THEME.colors.gray400}
                        />
                        <Text style={styles.emptyTitle}>No Venues Available</Text>
                        <Text style={styles.emptyText}>
                            All venues are occupied on this date. Try selecting a different date.
                        </Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.infoCard}>
                            <MaterialCommunityIcons
                                name="information"
                                size={18}
                                color={THEME.colors.info}
                            />
                            <Text style={styles.infoText}>
                                Tap on any venue to see more details and schedule a booking
                            </Text>
                        </View>

                        {availableVenues.map((venue) => (
                            <VenueCard
                                key={venue.id}
                                venue={venue}
                                showSelectButton={false}
                            />
                        ))}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    dateSelector: {
        backgroundColor: THEME.colors.white,
        padding: THEME.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: THEME.colors.gray200,
        ...THEME.shadows.sm,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.colors.gray100,
        padding: THEME.spacing.md,
        borderRadius: THEME.borderRadius.md,
        marginBottom: THEME.spacing.sm,
        gap: THEME.spacing.xs,
    },
    dateText: {
        flex: 1,
        fontSize: THEME.typography.fontSize.base,
        fontWeight: '600',
        color: THEME.colors.gray900,
    },
    resultCount: {
        alignItems: 'center',
    },
    resultCountText: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.gray600,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: THEME.spacing.lg,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: THEME.colors.gray100,
        padding: THEME.spacing.md,
        borderRadius: THEME.borderRadius.md,
        marginBottom: THEME.spacing.lg,
        gap: THEME.spacing.sm,
    },
    infoText: {
        flex: 1,
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.gray700,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: THEME.spacing['3xl'],
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
        paddingHorizontal: THEME.spacing.xl,
    },
});

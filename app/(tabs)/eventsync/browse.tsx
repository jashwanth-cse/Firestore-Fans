import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MdError, MdEventBusy, MdInfo, MdCalendarToday, MdExpandMore, MdAccessTime } from 'react-icons/md';
import { VenueCard } from '../../../src/components/event/VenueCard';
import { THEME } from '../../../src/constants/theme';
import { Venue } from '../../../src/types/event.types';
import { eventSyncAPI } from '../../../src/services/eventSync.service';
import { useToast } from '../../../src/hooks/useToast';
import { Calendar } from 'react-native-calendars';

export default function AvailableVenuesListScreen() {
    const { showError } = useToast();
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Auto-refresh when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            loadVenues();
        }, [])
    );

    const loadVenues = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await eventSyncAPI.getAllVenues();
            if (result.success && result.venues) {
                setVenues(result.venues);
            }
        } catch (err: any) {
            const errorMsg = 'Failed to load venues. Please try again.';
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const availableVenues = venues.filter((venue) => {
        if (!venue.occupiedTimes || venue.occupiedTimes.length === 0) {
            return true;
        }
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

    const getOccupiedSlots = (venue: Venue): string[] => {
        if (!venue.occupancy || !venue.occupancy[selectedDate]) {
            return [];
        }
        return Object.keys(venue.occupancy[selectedDate]).filter(
            timeRange => venue.occupancy?.[selectedDate][timeRange] === true
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={THEME.colors.primary} />
                <Text style={styles.loadingText}>Loading venues...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.emptyContainer}>
                {Platform.OS === 'web' ? (
                    <MdError size={60} color={THEME.colors.error} />
                ) : (
                    <MaterialCommunityIcons
                        name="alert-circle"
                        size={60}
                        color={THEME.colors.error}
                    />
                )}
                <Text style={styles.emptyTitle}>Error</Text>
                <Text style={styles.emptyText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadVenues}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.dateSelector}>
                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.7}
                >
                    {Platform.OS === 'web' ? (
                        <MdCalendarToday size={20} color={THEME.colors.primary} />
                    ) : (
                        <MaterialCommunityIcons
                            name="calendar"
                            size={20}
                            color={THEME.colors.primary}
                        />
                    )}
                    <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
                    {Platform.OS === 'web' ? (
                        <MdExpandMore size={20} color={THEME.colors.gray600} />
                    ) : (
                        <MaterialCommunityIcons
                            name="chevron-down"
                            size={20}
                            color={THEME.colors.gray600}
                        />
                    )}
                </TouchableOpacity>

                <View style={styles.resultCount}>
                    <Text style={styles.resultCountText}>
                        {availableVenues.length} venue{availableVenues.length !== 1 ? 's' : ''} available
                    </Text>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                {availableVenues.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        {Platform.OS === 'web' ? (
                            <MdEventBusy size={60} color={THEME.colors.gray400} />
                        ) : (
                            <MaterialCommunityIcons
                                name="calendar-remove"
                                size={60}
                                color={THEME.colors.gray400}
                            />
                        )}
                        <Text style={styles.emptyTitle}>No Venues Available</Text>
                        <Text style={styles.emptyText}>
                            All venues are occupied on this date. Try selecting a different date.
                        </Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.infoCard}>
                            {Platform.OS === 'web' ? (
                                <MdInfo size={18} color={THEME.colors.info} />
                            ) : (
                                <MaterialCommunityIcons
                                    name="information"
                                    size={18}
                                    color={THEME.colors.info}
                                />
                            )}
                            <Text style={styles.infoText}>
                                Showing all venues from Firestore. Tap to see details.
                            </Text>
                        </View>

                        {availableVenues.map((venue) => {
                            const occupiedSlots = getOccupiedSlots(venue);
                            return (
                                <View key={venue.id} style={styles.venueWrapper}>
                                    <VenueCard venue={venue} showSelectButton={false} />
                                    {occupiedSlots.length > 0 && (
                                        <View style={styles.occupiedSlotsContainer}>
                                            {Platform.OS === 'web' ? (
                                                <MdAccessTime size={14} color={THEME.colors.warning} />
                                            ) : (
                                                <MaterialCommunityIcons
                                                    name="clock-alert-outline"
                                                    size={14}
                                                    color={THEME.colors.warning}
                                                />
                                            )}
                                            <Text style={styles.occupiedSlotsText}>
                                                Occupied: {occupiedSlots.join(', ')}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </>
                )}
            </ScrollView>

            {showDatePicker && (
                <View style={styles.calendarModal}>
                    <View style={styles.calendarContainer}>
                        <Text style={styles.calendarTitle}>Select Date</Text>
                        <Calendar
                            current={selectedDate}
                            onDayPress={(day) => {
                                setSelectedDate(day.dateString);
                                setShowDatePicker(false);
                            }}
                            markedDates={{
                                [selectedDate]: { selected: true, selectedColor: THEME.colors.primary }
                            }}
                            theme={{
                                backgroundColor: THEME.colors.background,
                                calendarBackground: THEME.colors.white,
                                textSectionTitleColor: THEME.colors.gray700,
                                selectedDayBackgroundColor: THEME.colors.primary,
                                selectedDayTextColor: THEME.colors.white,
                                todayTextColor: THEME.colors.primary,
                                dayTextColor: THEME.colors.gray900,
                                textDisabledColor: THEME.colors.gray400,
                                monthTextColor: THEME.colors.gray900,
                                arrowColor: THEME.colors.primary,
                            }}
                            minDate={new Date().toISOString().split('T')[0]}
                        />
                        <TouchableOpacity
                            style={styles.calendarCloseButton}
                            onPress={() => setShowDatePicker(false)}
                        >
                            <Text style={styles.calendarCloseText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: THEME.colors.background,
    },
    loadingText: {
        marginTop: THEME.spacing.md,
        fontSize: THEME.typography.fontSize.base,
        color: THEME.colors.gray600,
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
    },
    venueWrapper: {
        marginBottom: THEME.spacing.md,
    },
    occupiedSlotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${THEME.colors.warning}15`,
        padding: THEME.spacing.sm,
        borderRadius: THEME.borderRadius.sm,
        marginTop: -THEME.spacing.sm,
        gap: THEME.spacing.xs,
    },
    occupiedSlotsText: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.warning,
        flex: 1,
    },
    calendarModal: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarContainer: {
        backgroundColor: THEME.colors.white,
        borderRadius: THEME.borderRadius.lg,
        padding: THEME.spacing.lg,
        width: '90%',
        maxWidth: 400,
    },
    calendarTitle: {
        fontSize: THEME.typography.fontSize.xl,
        fontWeight: 'bold',
        color: THEME.colors.gray900,
        marginBottom: THEME.spacing.md,
        textAlign: 'center',
    },
    calendarCloseButton: {
        backgroundColor: THEME.colors.primary,
        padding: THEME.spacing.md,
        borderRadius: THEME.borderRadius.md,
        marginTop: THEME.spacing.md,
        alignItems: 'center',
    },
    calendarCloseText: {
        color: THEME.colors.white,
        fontSize: THEME.typography.fontSize.base,
        fontWeight: '600',
    },
    retryButton: {
        backgroundColor: THEME.colors.primary,
        paddingVertical: THEME.spacing.sm,
        paddingHorizontal: THEME.spacing.lg,
        borderRadius: THEME.borderRadius.md,
        marginTop: THEME.spacing.md,
    },
    retryButtonText: {
        color: THEME.colors.white,
        fontSize: THEME.typography.fontSize.base,
        fontWeight: '600',
    },
});



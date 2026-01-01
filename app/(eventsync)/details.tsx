import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../../src/constants/theme';
import { ExtractedEventData } from '../../src/types/event.types';

export default function EventDetailsExtractedScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Parse extracted event data from params with safety checks
    const rawData = params.eventData ? JSON.parse(params.eventData as string) : {};

    // Ensure all required fields exist with defaults
    const eventData: ExtractedEventData = {
        eventName: rawData.eventName || 'Unnamed Event',
        date: rawData.date || new Date().toISOString().split('T')[0],
        startTime: rawData.startTime || '10:00',
        duration: rawData.duration || rawData.durationHours * 60 || 120, // Handle both 'duration' (minutes) and 'durationHours'
        requiredSeats: rawData.requiredSeats || rawData.seatsRequired || 30, // Handle various naming conventions
        facilities: Array.isArray(rawData.facilities)
            ? rawData.facilities
            : Array.isArray(rawData.facilitiesRequired)
                ? rawData.facilitiesRequired
                : [], // Handle 'facilities' vs 'facilitiesRequired'
    };

    const handleFindVenues = () => {
        // Navigate to venues screen with event requirements
        router.push({
            pathname: '/(eventsync)/venues',
            params: {
                eventData: JSON.stringify(eventData),
            },
        });
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Success Header */}
                <View style={styles.successHeader}>
                    <View style={styles.checkIconContainer}>
                        <MaterialCommunityIcons name="check-circle" size={60} color={THEME.colors.success} />
                    </View>
                    <Text style={styles.successTitle}>Event Details Extracted!</Text>
                    <Text style={styles.successSubtitle}>
                        AI has analyzed your request. Please review the details below.
                    </Text>
                </View>

                {/* Event Name */}
                <View style={styles.detailCard}>
                    <View style={styles.detailHeader}>
                        <MaterialCommunityIcons name="clipboard-text" size={20} color={THEME.colors.primary} />
                        <Text style={styles.detailLabel}>Event Name</Text>
                    </View>
                    <Text style={styles.detailValue}>{eventData.eventName}</Text>
                </View>

                {/* Date & Time */}
                <View style={styles.detailCard}>
                    <View style={styles.detailHeader}>
                        <MaterialCommunityIcons name="calendar" size={20} color={THEME.colors.primary} />
                        <Text style={styles.detailLabel}>Date & Time</Text>
                    </View>
                    <Text style={styles.detailValue}>{formatDate(eventData.date)}</Text>
                    <Text style={styles.detailSubValue}>
                        Starts at {eventData.startTime} • {eventData.duration} minutes
                    </Text>
                </View>

                {/* Capacity */}
                <View style={styles.detailCard}>
                    <View style={styles.detailHeader}>
                        <MaterialCommunityIcons name="account-group" size={20} color={THEME.colors.primary} />
                        <Text style={styles.detailLabel}>Required Capacity</Text>
                    </View>
                    <Text style={styles.detailValue}>{eventData.requiredSeats} seats</Text>
                </View>

                {/* Facilities */}
                <View style={styles.detailCard}>
                    <View style={styles.detailHeader}>
                        <MaterialCommunityIcons name="wrench" size={20} color={THEME.colors.primary} />
                        <Text style={styles.detailLabel}>Required Facilities</Text>
                    </View>
                    <View style={styles.facilitiesList}>
                        {eventData.facilities.map((facility, index) => (
                            <View key={index} style={styles.facilityChip}>
                                <MaterialCommunityIcons name="check" size={14} color={THEME.colors.success} />
                                <Text style={styles.facilityText}>{facility}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                    <MaterialCommunityIcons name="information" size={20} color={THEME.colors.info} />
                    <Text style={styles.infoText}>
                        Click "Find Venues" to see available venues matching your requirements
                    </Text>
                </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="pencil" size={20} color={THEME.colors.primary} />
                    <Text style={styles.secondaryButtonText}>Edit Details</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleFindVenues}
                    activeOpacity={0.7}
                >
                    <Text style={styles.primaryButtonText}>Find Venues</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color={THEME.colors.white} />
                </TouchableOpacity>
            </View>
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
        paddingBottom: 100,
    },
    successHeader: {
        alignItems: 'center',
        marginBottom: THEME.spacing.xl,
    },
    checkIconContainer: {
        marginBottom: THEME.spacing.md,
    },
    successTitle: {
        fontSize: THEME.typography.fontSize['2xl'],
        fontWeight: 'bold',
        color: THEME.colors.gray900,
        marginBottom: THEME.spacing.xs,
    },
    successSubtitle: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.gray600,
        textAlign: 'center',
    },
    detailCard: {
        backgroundColor: THEME.colors.white,
        borderRadius: THEME.borderRadius.lg,
        padding: THEME.spacing.md,
        marginBottom: THEME.spacing.md,
        ...THEME.shadows.sm,
    },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: THEME.spacing.sm,
    },
    detailLabel: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.gray600,
        fontWeight: '600',
        marginLeft: THEME.spacing.xs,
        textTransform: 'uppercase',
    },
    detailValue: {
        fontSize: THEME.typography.fontSize.lg,
        color: THEME.colors.gray900,
        fontWeight: '600',
    },
    detailSubValue: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.gray600,
        marginTop: THEME.spacing.xs / 2,
    },
    facilitiesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: THEME.spacing.xs,
    },
    facilityChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.colors.gray100,
        paddingHorizontal: THEME.spacing.sm,
        paddingVertical: THEME.spacing.xs,
        borderRadius: THEME.borderRadius.full,
        gap: THEME.spacing.xs / 2,
    },
    facilityText: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.gray700,
        fontWeight: '500',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: THEME.colors.gray100,
        padding: THEME.spacing.md,
        borderRadius: THEME.borderRadius.md,
        borderLeftWidth: 4,
        borderLeftColor: THEME.colors.info,
    },
    infoText: {
        flex: 1,
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.gray700,
        marginLeft: THEME.spacing.sm,
    },
    bottomActions: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: THEME.spacing.md,
        backgroundColor: THEME.colors.white,
        borderTopWidth: 1,
        borderTopColor: THEME.colors.gray200,
        gap: THEME.spacing.sm,
        ...THEME.shadows.lg,
    },
    secondaryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: THEME.colors.white,
        borderWidth: 2,
        borderColor: THEME.colors.primary,
        paddingVertical: THEME.spacing.md,
        borderRadius: THEME.borderRadius.md,
        gap: THEME.spacing.xs,
    },
    secondaryButtonText: {
        fontSize: THEME.typography.fontSize.base,
        fontWeight: '600',
        color: THEME.colors.primary,
    },
    primaryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: THEME.colors.primary,
        paddingVertical: THEME.spacing.md,
        borderRadius: THEME.borderRadius.md,
        gap: THEME.spacing.xs,
    },
    primaryButtonText: {
        fontSize: THEME.typography.fontSize.base,
        fontWeight: '600',
        color: THEME.colors.white,
    },
});

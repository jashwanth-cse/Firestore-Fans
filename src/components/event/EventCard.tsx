import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Event } from '../../types/event.types';
import { StatusBadge } from '../common/StatusBadge';
import { THEME } from '../../constants/theme';

interface EventCardProps {
    event: Event;
    onPress?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (timeStr: string) => {
        return timeStr;
    };

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={!onPress}
        >
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <MaterialCommunityIcons
                        name="calendar-check"
                        size={20}
                        color={THEME.colors.primary}
                    />
                    <Text style={styles.eventName}>{event.name}</Text>
                </View>
                <StatusBadge status={event.status} />
            </View>

            {event.description && (
                <Text style={styles.description} numberOfLines={2}>
                    {event.description}
                </Text>
            )}

            <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                    <MaterialCommunityIcons
                        name="calendar"
                        size={16}
                        color={THEME.colors.gray600}
                    />
                    <Text style={styles.detailText}>{formatDate(event.date)}</Text>
                </View>

                <View style={styles.detailRow}>
                    <MaterialCommunityIcons
                        name="clock-outline"
                        size={16}
                        color={THEME.colors.gray600}
                    />
                    <Text style={styles.detailText}>
                        {formatTime(event.startTime)} • {event.duration} min
                    </Text>
                </View>
            </View>

            {event.venueName && (
                <View style={styles.venueContainer}>
                    <MaterialCommunityIcons
                        name="map-marker"
                        size={16}
                        color={THEME.colors.primary}
                    />
                    <Text style={styles.venueText}>{event.venueName}</Text>
                </View>
            )}

            <View style={styles.footer}>
                <View style={styles.seatsContainer}>
                    <MaterialCommunityIcons
                        name="account-group"
                        size={16}
                        color={THEME.colors.gray600}
                    />
                    <Text style={styles.footerText}>{event.requiredSeats} seats</Text>
                </View>
                {event.facilities.length > 0 && (
                    <Text style={styles.facilitiesText}>
                        {event.facilities.slice(0, 2).join(', ')}
                        {event.facilities.length > 2 && ` +${event.facilities.length - 2}`}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: THEME.colors.white,
        borderRadius: THEME.borderRadius.lg,
        padding: THEME.spacing.md,
        marginBottom: THEME.spacing.md,
        ...THEME.shadows.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: THEME.spacing.sm,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: THEME.spacing.sm,
    },
    eventName: {
        fontSize: THEME.typography.fontSize.lg,
        fontWeight: '600',
        color: THEME.colors.gray900,
        marginLeft: THEME.spacing.xs,
        flex: 1,
    },
    description: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.gray600,
        marginBottom: THEME.spacing.sm,
        lineHeight: THEME.typography.fontSize.sm * THEME.typography.lineHeight.relaxed,
    },
    detailsContainer: {
        marginBottom: THEME.spacing.sm,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: THEME.spacing.xs,
    },
    detailText: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.gray700,
        marginLeft: THEME.spacing.xs,
    },
    venueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.colors.gray100,
        padding: THEME.spacing.xs,
        borderRadius: THEME.borderRadius.md,
        marginBottom: THEME.spacing.sm,
    },
    venueText: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.primary,
        fontWeight: '600',
        marginLeft: THEME.spacing.xs,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: THEME.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: THEME.colors.gray200,
    },
    seatsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerText: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.gray600,
        marginLeft: THEME.spacing.xs,
    },
    facilitiesText: {
        fontSize: THEME.typography.fontSize.xs,
        color: THEME.colors.gray500,
    },
});

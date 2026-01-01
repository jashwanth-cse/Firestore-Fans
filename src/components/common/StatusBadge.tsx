import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EventStatus, VenueStatus } from '../../types/event.types';
import { STATUS_COLORS } from '../../constants/eventConstants';
import { THEME } from '../../constants/theme';

type Status = EventStatus | VenueStatus;

interface StatusBadgeProps {
    status: Status;
    style?: any;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, style }) => {
    const getStatusText = (): string => {
        switch (status) {
            case 'available':
                return 'Available';
            case 'occupied':
                return 'Occupied';
            case 'pending':
                return 'Pending Approval';
            case 'approved':
                return 'Approved';
            case 'rejected':
                return 'Rejected';
            default:
                return status;
        }
    };

    return (
        <View
            style={[
                styles.badge,
                { backgroundColor: STATUS_COLORS[status] },
                style,
            ]}
        >
            <Text style={styles.badgeText}>{getStatusText()}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: THEME.spacing.sm + THEME.spacing.xs,
        paddingVertical: THEME.spacing.xs,
        borderRadius: THEME.borderRadius.full,
        alignSelf: 'flex-start',
    },
    badgeText: {
        color: THEME.colors.white,
        fontSize: THEME.typography.fontSize.xs,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
});

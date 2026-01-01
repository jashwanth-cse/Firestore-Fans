import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Venue } from '../../types/event.types';
import { StatusBadge } from '../common/StatusBadge';
import { THEME } from '../../constants/theme';

interface VenueCardProps {
    venue: Venue;
    onSelect?: () => void;
    showSelectButton?: boolean;
    showAlternativeButton?: boolean;
    onSuggestAlternative?: () => void;
}

export const VenueCard: React.FC<VenueCardProps> = ({
    venue,
    onSelect,
    showSelectButton = true,
    showAlternativeButton = false,
    onSuggestAlternative,
}) => {
    const status = venue.isAvailable ? 'available' : 'occupied';

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <MaterialCommunityIcons
                        name="office-building"
                        size={20}
                        color={THEME.colors.primary}
                    />
                    <Text style={styles.venueName}>{venue.name}</Text>
                </View>
                <StatusBadge status={status} />
            </View>

            {venue.building && (
                <View style={styles.locationContainer}>
                    <MaterialCommunityIcons
                        name="map-marker"
                        size={16}
                        color={THEME.colors.gray600}
                    />
                    <Text style={styles.locationText}>
                        {venue.building}
                        {venue.floor && `, Floor ${venue.floor}`}
                    </Text>
                </View>
            )}

            <View style={styles.infoRow}>
                <View style={styles.capacityContainer}>
                    <MaterialCommunityIcons
                        name="account-group"
                        size={18}
                        color={THEME.colors.gray700}
                    />
                    <Text style={styles.capacityText}>{venue.capacity} seats</Text>
                </View>
            </View>

            {venue.facilities?.length > 0 && (
                <View style={styles.facilitiesContainer}>
                    <Text style={styles.facilitiesLabel}>Facilities:</Text>
                    <View style={styles.facilitiesList}>
                        {venue.facilities.map((facility, index) => (
                            <View key={index} style={styles.facilityChip}>
                                <Text style={styles.facilityText}>{facility}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {(venue.occupiedTimes?.length > 0) && (
                <View style={styles.occupiedContainer}>
                    <MaterialCommunityIcons
                        name="information"
                        size={14}
                        color={THEME.colors.warning}
                    />
                    <Text style={styles.occupiedText}>
                        {venue.occupiedTimes.length} time slot(s) occupied
                    </Text>
                </View>
            )}

            {showSelectButton && venue.isAvailable && onSelect && (
                <TouchableOpacity
                    style={styles.selectButton}
                    onPress={onSelect}
                    activeOpacity={0.7}
                >
                    <Text style={styles.selectButtonText}>Select this Venue</Text>
                    <MaterialCommunityIcons name="check-circle" size={18} color={THEME.colors.white} />
                </TouchableOpacity>
            )}

            {showAlternativeButton && !venue.isAvailable && onSuggestAlternative && (
                <TouchableOpacity
                    style={styles.alternativeButton}
                    onPress={onSuggestAlternative}
                    activeOpacity={0.7}
                >
                    <Text style={styles.alternativeButtonText}>Suggest Alternatives</Text>
                    <MaterialCommunityIcons name="lightbulb-on" size={18} color={THEME.colors.primary} />
                </TouchableOpacity>
            )}
        </View>
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
    venueName: {
        fontSize: THEME.typography.fontSize.lg,
        fontWeight: '600',
        color: THEME.colors.gray900,
        marginLeft: THEME.spacing.xs,
        flex: 1,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: THEME.spacing.sm,
    },
    locationText: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.gray600,
        marginLeft: THEME.spacing.xs,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: THEME.spacing.sm,
    },
    capacityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    capacityText: {
        fontSize: THEME.typography.fontSize.base,
        fontWeight: '600',
        color: THEME.colors.gray700,
        marginLeft: THEME.spacing.xs,
    },
    facilitiesContainer: {
        marginBottom: THEME.spacing.sm,
    },
    facilitiesLabel: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.gray700,
        fontWeight: '600',
        marginBottom: THEME.spacing.xs,
    },
    facilitiesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: THEME.spacing.xs,
    },
    facilityChip: {
        backgroundColor: THEME.colors.gray100,
        paddingHorizontal: THEME.spacing.sm,
        paddingVertical: THEME.spacing.xs / 2,
        borderRadius: THEME.borderRadius.full,
    },
    facilityText: {
        fontSize: THEME.typography.fontSize.xs,
        color: THEME.colors.gray700,
    },
    occupiedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.colors.gray100,
        padding: THEME.spacing.xs,
        borderRadius: THEME.borderRadius.md,
        marginBottom: THEME.spacing.sm,
    },
    occupiedText: {
        fontSize: THEME.typography.fontSize.xs,
        color: THEME.colors.warning,
        marginLeft: THEME.spacing.xs,
    },
    selectButton: {
        backgroundColor: THEME.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: THEME.spacing.sm + THEME.spacing.xs,
        borderRadius: THEME.borderRadius.md,
        marginTop: THEME.spacing.xs,
        gap: THEME.spacing.xs,
    },
    selectButtonText: {
        color: THEME.colors.white,
        fontSize: THEME.typography.fontSize.base,
        fontWeight: '600',
    },
    alternativeButton: {
        backgroundColor: THEME.colors.white,
        borderWidth: 2,
        borderColor: THEME.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: THEME.spacing.sm + THEME.spacing.xs,
        borderRadius: THEME.borderRadius.md,
        marginTop: THEME.spacing.xs,
        gap: THEME.spacing.xs,
    },
    alternativeButtonText: {
        color: THEME.colors.primary,
        fontSize: THEME.typography.fontSize.base,
        fontWeight: '600',
    },
});

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MdEmail, MdSchool, MdHome } from 'react-icons/md';
import { THEME } from '../../constants/theme';

interface ProfileFieldCardProps {
    icon: string;
    label: string;
    value: string | number;
    color?: string;
}

// Map of icon names to react-icons components for web
const webIconMap: Record<string, React.ComponentType<{ size: number; color: string }>> = {
    'email': MdEmail,
    'school': MdSchool,
    'home': MdHome,
};

export const ProfileFieldCard: React.FC<ProfileFieldCardProps> = ({
    icon,
    label,
    value,
    color = THEME.colors.primary,
}) => {
    const WebIcon = webIconMap[icon];

    return (
        <View style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                {Platform.OS === 'web' && WebIcon ? (
                    <WebIcon size={24} color={color} />
                ) : (
                    <MaterialCommunityIcons
                        name={icon as any}
                        size={24}
                        color={color}
                    />
                )}
            </View>
            <View style={styles.content}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.colors.white,
        padding: THEME.spacing.md,
        borderRadius: THEME.borderRadius.lg,
        marginBottom: THEME.spacing.sm,
        ...THEME.shadows.sm,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: THEME.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: THEME.spacing.md,
    },
    content: {
        flex: 1,
    },
    label: {
        fontSize: THEME.typography.fontSize.xs,
        color: THEME.colors.gray600,
        marginBottom: THEME.spacing.xs / 2,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    value: {
        fontSize: THEME.typography.fontSize.base,
        color: THEME.colors.gray900,
        fontWeight: '600',
    },
});

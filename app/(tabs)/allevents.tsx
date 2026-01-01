import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { THEME } from '../../src/constants/theme';

export default function AllEventsScreen() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.hero}>
                    <Text style={styles.emoji}>🎪</Text>
                    <Text style={styles.title}>All Events</Text>
                    <Text style={styles.description}>
                        Browse and discover campus events
                    </Text>
                </View>

                <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>
                        🔍 Event Discovery Coming Soon
                    </Text>
                    <Text style={styles.placeholderSubtext}>
                        View all campus events, filter by category, and register instantly
                    </Text>
                </View>

                <View style={styles.featureList}>
                    <FeatureCard
                        icon="🔍"
                        title="Browse Events"
                        description="Explore all upcoming campus activities"
                    />
                    <FeatureCard
                        icon="🏷️"
                        title="Filter & Search"
                        description="Find events by category, date, or department"
                    />
                    <FeatureCard
                        icon="⚡"
                        title="Quick Register"
                        description="One-tap event registration"
                    />
                </View>
            </View>
        </ScrollView>
    );
}

const FeatureCard = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
    <View style={styles.card}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    content: {
        padding: THEME.spacing.lg,
    },
    hero: {
        alignItems: 'center',
        marginBottom: THEME.spacing.xl,
        paddingVertical: THEME.spacing.lg,
    },
    emoji: {
        fontSize: 60,
        marginBottom: THEME.spacing.md,
    },
    title: {
        fontSize: THEME.typography.fontSize['2xl'],
        fontWeight: 'bold',
        color: THEME.colors.primary,
        marginBottom: THEME.spacing.xs,
    },
    description: {
        fontSize: THEME.typography.fontSize.base,
        color: THEME.colors.gray600,
        textAlign: 'center',
    },
    placeholder: {
        backgroundColor: THEME.colors.surface,
        borderRadius: THEME.borderRadius.xl,
        padding: THEME.spacing.xl,
        alignItems: 'center',
        marginBottom: THEME.spacing.xl,
        ...THEME.shadows.md,
    },
    placeholderText: {
        fontSize: THEME.typography.fontSize.xl,
        fontWeight: 'bold',
        color: THEME.colors.primary,
        marginBottom: THEME.spacing.sm,
    },
    placeholderSubtext: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.gray600,
        textAlign: 'center',
    },
    featureList: {
        gap: THEME.spacing.md,
    },
    card: {
        backgroundColor: THEME.colors.white,
        borderRadius: THEME.borderRadius.lg,
        padding: THEME.spacing.lg,
        ...THEME.shadows.sm,
    },
    cardIcon: {
        fontSize: 32,
        marginBottom: THEME.spacing.sm,
    },
    cardTitle: {
        fontSize: THEME.typography.fontSize.lg,
        fontWeight: '600',
        color: THEME.colors.gray900,
        marginBottom: THEME.spacing.xs,
    },
    cardDescription: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.gray600,
        lineHeight: THEME.typography.fontSize.sm * THEME.typography.lineHeight.relaxed,
    },
});

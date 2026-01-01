import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { THEME } from '../../src/constants/theme';

export default function TravelSyncScreen() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.hero}>
                    <Text style={styles.emoji}>✈️</Text>
                    <Text style={styles.title}>TravelSync</Text>
                    <Text style={styles.description}>
                        Smart travel planning for hostelers
                    </Text>
                </View>

                <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>
                        🧳 Travel Planning Coming Soon
                    </Text>
                    <Text style={styles.placeholderSubtext}>
                        AI-powered leave recommendations based on holidays and calendar analysis
                    </Text>
                </View>

                <View style={styles.featureList}>
                    <FeatureCard
                        icon="🤖"
                        title="AI Recommendations"
                        description="Smart leave suggestions using Gemini AI"
                    />
                    <FeatureCard
                        icon="📸"
                        title="OCR Upload"
                        description="Upload holiday calendar images for analysis"
                    />
                    <FeatureCard
                        icon="🗺️"
                        title="Travel Distance"
                        description="Calculate optimal travel times with Google Maps"
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
        color: THEME.colors.textSecondary,
        textAlign: 'center',
    },
    placeholder: {
        backgroundColor: THEME.colors.glass,
        borderRadius: THEME.borderRadius.xl,
        padding: THEME.spacing.xl,
        alignItems: 'center',
        marginBottom: THEME.spacing.xl,
        borderWidth: 1,
        borderColor: THEME.colors.glassBorder,
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
        color: THEME.colors.textSecondary,
        textAlign: 'center',
    },
    featureList: {
        gap: THEME.spacing.md,
    },
    card: {
        backgroundColor: THEME.colors.surface,
        borderRadius: THEME.borderRadius.lg,
        padding: THEME.spacing.lg,
        borderWidth: 1,
        borderColor: THEME.colors.border,
        ...THEME.shadows.sm,
    },
    cardIcon: {
        fontSize: 32,
        marginBottom: THEME.spacing.sm,
    },
    cardTitle: {
        fontSize: THEME.typography.fontSize.lg,
        fontWeight: '600',
        color: THEME.colors.textPrimary,
        marginBottom: THEME.spacing.xs,
    },
    cardDescription: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.textSecondary,
        lineHeight: THEME.typography.fontSize.sm * THEME.typography.lineHeight.relaxed,
    },
});

import { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/common/Button';
import { useAppStore } from '../../src/store/appStore';
import { THEME } from '../../src/constants/theme';

const { width } = Dimensions.get('window');

const onboardingData = [
    {
        title: 'Welcome to NexSync',
        description: 'Your all-in-one SECE Campus Automation companion',
        emoji: '🎓',
    },
    {
        title: 'EventSync',
        description: 'Smart event allocation and calendar management for campus activities',
        emoji: '📅',
    },
    {
        title: 'TravelSync',
        description: 'Automated leave recommendations for hostelers based on holidays',
        emoji: '✈️',
    },
];

export default function WelcomeScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const router = useRouter();
    const { completeOnboarding } = useAppStore();

    const handleNext = () => {
        if (currentIndex < onboardingData.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            completeOnboarding();
            router.replace('/(auth)/login');
        }
    };

    const handleSkip = () => {
        completeOnboarding();
        router.replace('/(auth)/login');
    };

    const currentSlide = onboardingData[currentIndex];

    return (
        <View style={styles.container}>
            {/* Skip button */}
            {currentIndex < onboardingData.length - 1 && (
                <View style={styles.skipContainer}>
                    <Button
                        title="Skip"
                        onPress={handleSkip}
                        variant="outline"
                        style={styles.skipButton}
                    />
                </View>
            )}

            {/* Onboarding content */}
            <View style={styles.content}>
                <Text style={styles.emoji}>{currentSlide.emoji}</Text>
                <Text style={styles.title}>{currentSlide.title}</Text>
                <Text style={styles.description}>{currentSlide.description}</Text>
            </View>

            {/* Pagination dots */}
            <View style={styles.pagination}>
                {onboardingData.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            index === currentIndex && styles.activeDot,
                        ]}
                    />
                ))}
            </View>

            {/* Next button */}
            <View style={styles.buttonContainer}>
                <Button
                    title={currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
                    onPress={handleNext}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
        paddingHorizontal: THEME.spacing.lg,
    },
    skipContainer: {
        alignItems: 'flex-end',
        paddingTop: THEME.spacing.xl,
    },
    skipButton: {
        paddingHorizontal: THEME.spacing.lg,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emoji: {
        fontSize: 100,
        marginBottom: THEME.spacing.xl,
    },
    title: {
        fontSize: THEME.typography.fontSize['3xl'],
        fontWeight: 'bold',
        color: THEME.colors.primary,
        textAlign: 'center',
        marginBottom: THEME.spacing.md,
    },
    description: {
        fontSize: THEME.typography.fontSize.lg,
        color: THEME.colors.textSecondary,
        textAlign: 'center',
        lineHeight: THEME.typography.fontSize.lg * THEME.typography.lineHeight.relaxed,
        paddingHorizontal: THEME.spacing.lg,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: THEME.spacing.xl,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: THEME.colors.gray700,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: THEME.colors.primary,
        width: 24,
    },
    buttonContainer: {
        marginBottom: THEME.spacing.xl,
    },
});

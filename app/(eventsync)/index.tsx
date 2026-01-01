import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../../src/constants/theme';
import { EXAMPLE_PROMPTS } from '../../src/constants/eventConstants';
import { ExtractedEventData } from '../../src/types/event.types';
import { eventSyncAPI } from '../../src/services/eventSync.service';

export default function EventSyncHomeScreen() {
    const router = useRouter();
    const [inputText, setInputText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Real AI extraction using backend Gemini service
    const handleAIExtract = async () => {
        if (!inputText.trim()) {
            alert('Please describe your event first');
            return;
        }

        setIsProcessing(true);

        try {
            // Call backend API to extract event data using Gemini AI
            const result = await eventSyncAPI.extractEvent(inputText);

            if (result.success && result.data) {
                // Navigate to details screen with real extracted data
                router.push({
                    pathname: '/(eventsync)/details',
                    params: {
                        eventData: JSON.stringify(result.data),
                    },
                });
            } else {
                throw new Error('Failed to extract event data');
            }
        } catch (error: any) {
            console.error('AI extraction error:', error);
            alert(error.response?.data?.message || 'Failed to process your request. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleExamplePress = (example: string) => {
        setInputText(example);
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <MaterialCommunityIcons
                        name="robot"
                        size={60}
                        color={THEME.colors.primary}
                    />
                    <Text style={styles.title}>AI-Powered Venue Booking</Text>
                    <Text style={styles.subtitle}>
                        Describe your event in natural language, and let AI find the perfect venue
                    </Text>
                </View>

                {/* Example Prompts */}
                <View style={styles.examplesSection}>
                    <Text style={styles.examplesTitle}>Try these examples:</Text>
                    {EXAMPLE_PROMPTS.slice(0, 3).map((example, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.exampleCard}
                            onPress={() => handleExamplePress(example)}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons
                                name="lightbulb-on-outline"
                                size={16}
                                color={THEME.colors.primary}
                            />
                            <Text style={styles.exampleText}>{example}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Quick Access Buttons */}
                <View style={styles.quickAccessContainer}>
                    <TouchableOpacity
                        style={styles.quickAccessButton}
                        onPress={() => router.push('/(eventsync)/pending')}
                    >
                        <MaterialCommunityIcons name="clock-outline" size={24} color={THEME.colors.warning} />
                        <Text style={styles.quickAccessText}>Pending</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickAccessButton}
                        onPress={() => router.push('/(eventsync)/approved')}
                    >
                        <MaterialCommunityIcons name="check-circle" size={24} color={THEME.colors.success} />
                        <Text style={styles.quickAccessText}>Approved</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickAccessButton}
                        onPress={() => router.push('/(eventsync)/available')}
                    >
                        <MaterialCommunityIcons name="calendar-search" size={24} color={THEME.colors.primary} />
                        <Text style={styles.quickAccessText}>Browse</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Chat-style Input at Bottom */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Describe your event here..."
                    placeholderTextColor={THEME.colors.gray400}
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    maxLength={500}
                    editable={!isProcessing}
                />
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        (!inputText.trim() || isProcessing) && styles.sendButtonDisabled,
                    ]}
                    onPress={handleAIExtract}
                    disabled={!inputText.trim() || isProcessing}
                    activeOpacity={0.7}
                >
                    {isProcessing ? (
                        <ActivityIndicator size="small" color={THEME.colors.white} />
                    ) : (
                        <MaterialCommunityIcons name="send" size={24} color={THEME.colors.white} />
                    )}
                </TouchableOpacity>
            </View>

            {isProcessing && (
                <View style={styles.processingOverlay}>
                    <View style={styles.processingCard}>
                        <ActivityIndicator size="large" color={THEME.colors.primary} />
                        <Text style={styles.processingText}>AI is analyzing your request...</Text>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: THEME.spacing.lg,
        paddingBottom: 100,
    },
    header: {
        alignItems: 'center',
        marginBottom: THEME.spacing.xl,
    },
    title: {
        fontSize: THEME.typography.fontSize['2xl'],
        fontWeight: 'bold',
        color: THEME.colors.primary,
        marginTop: THEME.spacing.md,
        marginBottom: THEME.spacing.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.gray600,
        textAlign: 'center',
        paddingHorizontal: THEME.spacing.md,
    },
    examplesSection: {
        marginBottom: THEME.spacing.xl,
    },
    examplesTitle: {
        fontSize: THEME.typography.fontSize.base,
        fontWeight: '600',
        color: THEME.colors.gray700,
        marginBottom: THEME.spacing.sm,
    },
    exampleCard: {
        flexDirection: 'row',
        backgroundColor: THEME.colors.gray100,
        padding: THEME.spacing.sm,
        borderRadius: THEME.borderRadius.md,
        marginBottom: THEME.spacing.xs,
        borderLeftWidth: 3,
        borderLeftColor: THEME.colors.primary,
    },
    exampleText: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.gray700,
        marginLeft: THEME.spacing.xs,
        flex: 1,
    },
    quickAccessContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: THEME.spacing.sm,
    },
    quickAccessButton: {
        flex: 1,
        backgroundColor: THEME.colors.white,
        padding: THEME.spacing.md,
        borderRadius: THEME.borderRadius.lg,
        alignItems: 'center',
        ...THEME.shadows.sm,
    },
    quickAccessText: {
        fontSize: THEME.typography.fontSize.xs,
        color: THEME.colors.gray700,
        fontWeight: '600',
        marginTop: THEME.spacing.xs,
    },
    inputContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: THEME.spacing.md,
        backgroundColor: THEME.colors.white,
        borderTopWidth: 1,
        borderTopColor: THEME.colors.gray200,
        ...THEME.shadows.lg,
    },
    input: {
        flex: 1,
        backgroundColor: THEME.colors.gray100,
        borderRadius: THEME.borderRadius.xl,
        paddingHorizontal: THEME.spacing.md,
        paddingVertical: THEME.spacing.sm,
        fontSize: THEME.typography.fontSize.base,
        color: THEME.colors.gray900,
        maxHeight: 100,
        marginRight: THEME.spacing.sm,
    },
    sendButton: {
        backgroundColor: THEME.colors.primary,
        width: 48,
        height: 48,
        borderRadius: THEME.borderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        ...THEME.shadows.md,
    },
    sendButtonDisabled: {
        backgroundColor: THEME.colors.gray400,
        opacity: 0.5,
    },
    processingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    processingCard: {
        backgroundColor: THEME.colors.white,
        padding: THEME.spacing.xl,
        borderRadius: THEME.borderRadius.xl,
        alignItems: 'center',
        ...THEME.shadows.lg,
    },
    processingText: {
        fontSize: THEME.typography.fontSize.base,
        color: THEME.colors.gray700,
        marginTop: THEME.spacing.md,
    },
});

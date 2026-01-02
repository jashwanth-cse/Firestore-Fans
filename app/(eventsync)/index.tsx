import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../../src/constants/theme';
import { EXAMPLE_PROMPTS } from '../../src/constants/eventConstants';
import { eventSyncAPI } from '../../src/services/eventSync.service';
import { useAuthStore } from '../../src/store/authStore';
import { useToast } from '../../src/hooks/useToast';

export default function EventSyncHomeScreen() {
    const router = useRouter();
    const { role } = useAuthStore();
    const { showError, showInfo, showSuccess } = useToast();
    const scrollViewRef = useRef<ScrollView>(null);
    const [inputText, setInputText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Auto-scroll to bottom when processing starts
    useEffect(() => {
        if (isProcessing) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [isProcessing]);

    // Real AI extraction using backend Gemini service
    const handleAIExtract = async () => {
        if (!inputText.trim()) {
            setErrorMessage('⚠️ Please describe your event first');
            setTimeout(() => setErrorMessage(''), 3000);
            return;
        }

        // Validate minimum input length
        if (inputText.trim().length < 10) {
            setErrorMessage('⚠️ Please provide more details about your event');
            setTimeout(() => setErrorMessage(''), 3000);
            return;
        }

        setIsProcessing(true);
        setErrorMessage('');

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
                throw new Error('Failed to extract event data from your description');
            }
        } catch (error: any) {
            // Handle different types of errors with toast notifications
            let userMessage = '';

            if (error.response?.status === 400) {
                userMessage = 'Unable to extract event details. Please be more specific about event name, date, time, and number of participants.';
            } else if (error.response?.status === 500) {
                userMessage = 'Server error occurred. Please try again in a moment.';
            } else if (error.code === 'NETWORK_ERROR' || error.message.includes('network')) {
                userMessage = 'Network error. Please check your internet connection.';
            } else if (error.response?.data?.message) {
                userMessage = error.response.data.message;
            } else {
                userMessage = 'Could not process your request. Please try rephrasing with more details.';
            }

            showError(userMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleExamplePress = (example: string) => {
        setInputText(example);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <MaterialCommunityIcons
                        name="creation"
                        size={56}
                        color={THEME.colors.primary}
                    />
                    <Text style={styles.title}>AI-Powered Venue Booking</Text>
                    <Text style={styles.subtitle}>
                        Describe your event in natural language, and let AI find the perfect venue
                    </Text>
                </View>

                {/* Admin Dashboard Section - ONLY for Admins */}
                {role === 'admin' && (
                    <View style={styles.adminSection}>
                        <Text style={styles.sectionTitle}>Administration</Text>
                        <TouchableOpacity
                            style={styles.adminButton}
                            onPress={() => router.push('/(admin)/dashboard')}
                        >
                            <View style={styles.adminIconBox}>
                                <MaterialCommunityIcons name="shield-account" size={24} color={THEME.colors.white} />
                            </View>
                            <View style={styles.adminButtonContent}>
                                <Text style={styles.adminButtonTitle}>Admin Dashboard</Text>
                                <Text style={styles.adminButtonSubtitle}>Manage pending approvals</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color={THEME.colors.gray400} />
                        </TouchableOpacity>
                    </View>
                )}

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

            {/* Error Message Display */}
            {errorMessage ? (
                <View style={styles.errorMessageContainer}>
                    <Text style={styles.errorMessageText}>{errorMessage}</Text>
                </View>
            ) : null}

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
        </KeyboardAvoidingView>
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
        padding: THEME.spacing.md,
        paddingBottom: 120, // Space for input bar
    },
    header: {
        alignItems: 'center',
        marginBottom: THEME.spacing.lg,
        paddingVertical: THEME.spacing.lg,
        paddingHorizontal: THEME.spacing.md,
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        borderRadius: THEME.borderRadius.xl,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    title: {
        fontSize: THEME.typography.fontSize['2xl'],
        fontWeight: 'bold',
        color: THEME.colors.primaryLight,
        marginTop: THEME.spacing.md,
        marginBottom: THEME.spacing.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: THEME.spacing.md,
    },
    examplesSection: {
        marginBottom: THEME.spacing.xl,
    },
    examplesTitle: {
        fontSize: THEME.typography.fontSize.base,
        fontWeight: '600',
        color: THEME.colors.textPrimary,
        marginBottom: THEME.spacing.sm,
    },
    exampleCard: {
        flexDirection: 'row',
        backgroundColor: THEME.colors.glass,
        padding: THEME.spacing.md,
        borderRadius: THEME.borderRadius.md,
        marginBottom: THEME.spacing.sm,
        borderLeftWidth: 3,
        borderLeftColor: THEME.colors.primaryLight,
        borderWidth: 1,
        borderColor: THEME.colors.glassBorder,
    },
    exampleText: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.textSecondary,
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
        backgroundColor: THEME.colors.surfaceLight,
        padding: THEME.spacing.md,
        borderRadius: THEME.borderRadius.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.colors.borderAccent,
        ...THEME.shadows.sm,
    },
    quickAccessText: {
        fontSize: THEME.typography.fontSize.xs,
        color: THEME.colors.textPrimary,
        fontWeight: '600',
        marginTop: THEME.spacing.xs,
    },
    errorMessageContainer: {
        position: 'absolute',
        bottom: 80,
        left: THEME.spacing.md,
        right: THEME.spacing.md,
        backgroundColor: THEME.colors.glass,
        borderWidth: 1,
        borderColor: THEME.colors.error,
        borderRadius: THEME.borderRadius.md,
        padding: THEME.spacing.md,
        ...THEME.shadows.lg,
        zIndex: 100,
    },
    errorMessageText: {
        color: THEME.colors.error,
        fontSize: THEME.typography.fontSize.sm,
        textAlign: 'center',
        fontWeight: '500',
    },
    inputContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: THEME.spacing.md,
        backgroundColor: THEME.colors.surface,
        borderTopWidth: 1,
        borderTopColor: THEME.colors.border,
        ...THEME.shadows.lg,
    },
    input: {
        flex: 1,
        backgroundColor: THEME.colors.glass,
        borderRadius: THEME.borderRadius.xl,
        paddingHorizontal: THEME.spacing.md,
        paddingVertical: THEME.spacing.sm,
        fontSize: THEME.typography.fontSize.base,
        color: THEME.colors.textPrimary,
        maxHeight: 100,
        marginRight: THEME.spacing.sm,
        borderWidth: 1,
        borderColor: THEME.colors.glassBorder,
    },
    sendButton: {
        backgroundColor: THEME.colors.primaryLight,
        width: 48,
        height: 48,
        borderRadius: THEME.borderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        ...THEME.shadows.md,
    },
    sendButtonDisabled: {
        backgroundColor: THEME.colors.gray600,
        opacity: 0.5,
    },
    processingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    processingCard: {
        backgroundColor: THEME.colors.surfaceLight,
        padding: THEME.spacing.xl,
        borderRadius: THEME.borderRadius.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.colors.borderAccent,
        ...THEME.shadows.lg,
    },
    processingText: {
        fontSize: THEME.typography.fontSize.base,
        color: THEME.colors.textPrimary,
        marginTop: THEME.spacing.md,
    },
    adminSection: {
        marginBottom: THEME.spacing.xl,
    },
    sectionTitle: {
        fontSize: THEME.typography.fontSize.lg,
        fontWeight: '600',
        color: THEME.colors.textPrimary,
        marginBottom: THEME.spacing.sm,
    },
    adminButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.colors.surfaceHighlight,
        padding: THEME.spacing.md,
        borderRadius: THEME.borderRadius.lg,
        borderWidth: 1,
        borderColor: THEME.colors.primaryLight,
        ...THEME.shadows.md,
    },
    adminIconBox: {
        width: 40,
        height: 40,
        borderRadius: THEME.borderRadius.md,
        backgroundColor: THEME.colors.primaryGlow,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: THEME.spacing.md,
    },
    adminButtonContent: {
        flex: 1,
    },
    adminButtonTitle: {
        color: THEME.colors.textPrimary,
        fontSize: THEME.typography.fontSize.base,
        fontWeight: 'bold',
    },
    adminButtonSubtitle: {
        color: THEME.colors.textSecondary,
        fontSize: THEME.typography.fontSize.xs,
    },
});

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
    Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MdAdminPanelSettings } from 'react-icons/md';
import { Icon } from '../../../src/components/common/Icon';
import { THEME } from '../../../src/constants/theme';
import { EXAMPLE_PROMPTS } from '../../../src/constants/eventConstants';
import { eventSyncAPI } from '../../../src/services/eventSync.service';
import { useAuthStore } from '../../../src/store/authStore';

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'ai';
};

const MessageBubble = ({ text, sender }: Message) => {
    const slideAnim = useRef(new Animated.Value(sender === 'user' ? 40 : -40)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
                alignSelf: sender === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 14,
                maxWidth: '82%',
            }}
        >
            <View
                style={[
                    styles.message,
                    sender === 'user' ? styles.userMessage : styles.aiMessage,
                ]}
            >
                <Text style={[styles.messageText, sender === 'user' && { color: '#fff' }]}>
                    {text}
                </Text>
            </View>
        </Animated.View>
    );
};

export default function EventSyncHomeScreen() {
    const router = useRouter();
    const { role, user } = useAuthStore();
    const scrollRef = useRef<ScrollView>(null);

    const [input, setInput] = useState('');
    const [processing, setProcessing] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            text: 'Hi! Describe your event and I will help you find the perfect venue.',
            sender: 'ai',
        },
    ]);

    useEffect(() => {
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, [messages, processing]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setProcessing(true);

        if (input.trim().length < 10) {
            setTimeout(() => {
                setMessages(prev => [
                    ...prev,
                    {
                        id: Math.random().toString(),
                        text: 'I need a little more detail - please include date, time, or attendees.',
                        sender: 'ai',
                    },
                ]);
                setProcessing(false);
            }, 600);
            return;
        }

        try {
            const result = await eventSyncAPI.extractEvent(input);

            if (result.success && result.data) {
                router.push({
                    pathname: '/eventsync/details',
                    params: { eventData: JSON.stringify(result.data) },
                });
            } else {
                throw new Error();
            }
        } catch {
            setMessages(prev => [
                ...prev,
                {
                    id: Math.random().toString(),
                    text: 'I could not understand fully. Please add event name, date, time, and attendees.',
                    sender: 'ai',
                },
            ]);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
        >

            <View style={styles.contentContainer}>
                {/* Admin Dashboard Icon - Web Only */}
                {Platform.OS === 'web' && role === 'admin' && (
                    <TouchableOpacity
                        style={styles.adminIcon}
                        onPress={() => router.push('/(admin)/dashboard')}
                    >
                        <MdAdminPanelSettings size={28} color={THEME.colors.primary} />
                    </TouchableOpacity>
                )}





                <ScrollView
                    ref={scrollRef}
                    contentContainerStyle={styles.chat}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {messages.map(msg => (
                        <MessageBubble key={msg.id} {...msg} />
                    ))}

                    <View style={styles.suggestions}>
                        {EXAMPLE_PROMPTS.slice(0, 3).map((s, i) => (
                            <TouchableOpacity
                                key={i}
                                style={styles.suggestionCard}
                                activeOpacity={0.7}
                                onPress={() => setInput(s)}
                            >
                                <Icon name="lightbulb-on-outline" size={18} color={"#6365f17a"} />
                                <Text style={styles.suggestionText}>{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                <View style={styles.inputBar}>
                    <TextInput
                        value={input}
                        onChangeText={setInput}
                        placeholder="Describe your event..."
                        placeholderTextColor={THEME.colors.gray400}
                        style={styles.input}
                        multiline
                        onFocus={() => {
                            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
                        }}
                    />
                    <TouchableOpacity
                        style={styles.sendBtn}
                        onPress={sendMessage}
                        disabled={processing}
                    >
                        {processing ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Icon name="send" size={22} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.colors.background },
    contentContainer: { flex: 1, flexDirection: 'column' },
    adminIcon: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
        backgroundColor: THEME.colors.white,
        borderRadius: 20,
        padding: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    chat: { padding: 16, paddingBottom: 20 }, // Removed large bottom padding

    message: {
        padding: 14,
        borderRadius: 16,
    },
    userMessage: {
        backgroundColor: THEME.colors.primaryLight,
        borderTopRightRadius: 0,
    },
    aiMessage: {
        backgroundColor: THEME.colors.surface,
        borderWidth: 1.5,
        borderColor: THEME.colors.primaryLight,
        borderTopLeftRadius: 0,
    },
    messageText: {
        fontSize: 14,
        color: THEME.colors.textPrimary,
        lineHeight: 20,
    },

    suggestions: { marginTop: 10 },
    suggestionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.colors.glass,
        padding: 12,
        borderRadius: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#6365f17a',
    },
    suggestionText: {
        marginLeft: 8,
        fontSize: 13,
        color: "#a1a1a1ff",
        flex: 1,
    },

    inputBar: {
        // Removed absolute positioning
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: THEME.colors.surface,
        borderTopWidth: 1,
        borderColor: THEME.colors.border,
    },
    input: {
        flex: 1,
        width: '100%',
        backgroundColor: THEME.colors.glass,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: THEME.colors.textPrimary,
        maxHeight: 100,
    },
    sendBtn: {
        backgroundColor: THEME.colors.primaryLight,
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
});

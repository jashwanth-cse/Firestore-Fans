import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/common/Input';
import { Button } from '../../src/components/common/Button';
import { signIn, getUserProfile } from '../../src/services/auth.service';
import { useAuthStore } from '../../src/store/authStore';
import { useToast } from '../../src/hooks/useToast';
import { THEME } from '../../src/constants/theme';

// Helper function to get user-friendly error messages
const getAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/user-not-found':
            return 'No account found with this email address.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/too-many-requests':
            return 'Too many failed login attempts. Please try again later.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your internet connection.';
        default:
            return 'Login failed. Please check your credentials and try again.';
    }
};

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ email: '', password: '', general: '' });

    const router = useRouter();
    const { setUser, setRole, setHostelerStatus } = useAuthStore();
    const { showError, showSuccess } = useToast();

    const validateForm = (): boolean => {
        const newErrors = { email: '', password: '', general: '' };
        let isValid = true;

        if (!email) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!email.includes('@')) {
            newErrors.email = 'Please enter a valid email address';
            isValid = false;
        }

        if (!password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setErrors({ email: '', password: '', general: '' });

        try {
            const userCredential = await signIn(email, password);
            setUser(userCredential.user);

            // Fetch user profile
            const profile = await getUserProfile(userCredential.user.uid);
            if (profile) {
                setRole(profile.role);
                setHostelerStatus(profile.isHosteler);
            }

            router.replace('/(tabs)/eventsync');
        } catch (error: any) {
            const errorCode = error.code || 'unknown';
            const errorMessage = getAuthErrorMessage(errorCode);
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.logo}>🎓</Text>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to your NexSync account</Text>
                </View>

                {/* General Error Message */}
                {errors.general ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>⚠️ {errors.general}</Text>
                    </View>
                ) : null}

                <View style={styles.form}>
                    <Input
                        label="Email"
                        placeholder="your.name@sece.ac.in"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        textContentType="username"
                        id="email-input"
                        error={errors.email}
                    />

                    <Input
                        label="Password"
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoComplete="password"
                        textContentType="password"
                        id="password-input"
                        error={errors.password}
                    />

                    <Button
                        title="Sign In"
                        onPress={handleLogin}
                        loading={loading}
                        style={styles.button}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                        <Text style={styles.link}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: THEME.spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: THEME.spacing['2xl'],
    },
    logo: {
        fontSize: 80,
        marginBottom: THEME.spacing.md,
    },
    title: {
        fontSize: THEME.typography.fontSize['3xl'],
        fontWeight: 'bold',
        color: THEME.colors.primary,
        marginBottom: THEME.spacing.xs,
    },
    subtitle: {
        fontSize: THEME.typography.fontSize.base,
        color: THEME.colors.textSecondary,
    },
    errorContainer: {
        backgroundColor: THEME.colors.glass,
        borderWidth: 1,
        borderColor: THEME.colors.error,
        borderRadius: THEME.borderRadius.md,
        padding: THEME.spacing.md,
        marginBottom: THEME.spacing.lg,
    },
    errorText: {
        color: THEME.colors.error,
        fontSize: THEME.typography.fontSize.sm,
        textAlign: 'center',
    },
    form: {
        marginBottom: THEME.spacing.xl,
    },
    button: {
        marginTop: THEME.spacing.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: THEME.typography.fontSize.base,
        color: THEME.colors.textSecondary,
    },
    link: {
        fontSize: THEME.typography.fontSize.base,
        color: THEME.colors.primary,
        fontWeight: '600',
    },
});

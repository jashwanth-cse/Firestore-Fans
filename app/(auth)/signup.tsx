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
import { signUp, getUserProfile } from '../../src/services/auth.service';
import { useAuthStore } from '../../src/store/authStore';
import { validateSeceEmailComplete, isStrongPassword, getPasswordStrengthMessage } from '../../src/utils/validation';
import { THEME } from '../../src/constants/theme';

// Helper function to get user-friendly error messages for signup
const getSignupErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'An account with this email already exists. Please sign in instead.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/operation-not-allowed':
            return 'Account creation is currently disabled. Please contact support.';
        case 'auth/weak-password':
            return 'Password is too weak. Please use a stronger password.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your internet connection.';
        default:
            return 'Failed to create account. Please try again.';
    }
};

export default function SignupScreen() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: '',
        isHosteler: false,
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: '',
        general: '',
    });

    const router = useRouter();
    const { setUser, setRole, setHostelerStatus } = useAuthStore();

    const validateForm = (): boolean => {
        const newErrors = {
            email: '',
            password: '',
            confirmPassword: '',
            displayName: '',
            general: '',
        };
        let isValid = true;

        // Email validation
        const emailValidation = validateSeceEmailComplete(formData.email);
        if (!emailValidation.valid) {
            newErrors.email = emailValidation.message;
            isValid = false;
        }

        // Display name validation
        if (!formData.displayName.trim()) {
            newErrors.displayName = 'Name is required';
            isValid = false;
        }

        // Password validation
        if (!isStrongPassword(formData.password)) {
            newErrors.password = getPasswordStrengthMessage(formData.password);
            isValid = false;
        }

        // Confirm password validation
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSignup = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setErrors({
            email: '',
            password: '',
            confirmPassword: '',
            displayName: '',
            general: '',
        });

        try {
            const userCredential = await signUp(formData.email, formData.password, {
                displayName: formData.displayName,
                isHosteler: formData.isHosteler,
                role: 'student',
            });

            setUser(userCredential.user);

            // Fetch user profile
            const profile = await getUserProfile(userCredential.user.uid);
            if (profile) {
                setRole(profile.role);
                setHostelerStatus(profile.isHosteler);
            }

            router.replace('/(tabs)/eventsync');
        } catch (error: any) {
            console.error('Signup error:', error);

            // Extract Firebase error code
            const errorCode = error.code || 'unknown';
            const errorMessage = getSignupErrorMessage(errorCode);

            setErrors({
                email: '',
                password: '',
                confirmPassword: '',
                displayName: '',
                general: errorMessage,
            });
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
                    <Text style={styles.title}>Join NexSync</Text>
                    <Text style={styles.subtitle}>Create your SECE account</Text>
                </View>

                {/* General Error Message */}
                {errors.general ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>⚠️ {errors.general}</Text>
                    </View>
                ) : null}

                <View style={styles.form}>
                    <Input
                        label="Full Name"
                        placeholder="Enter your name"
                        value={formData.displayName}
                        onChangeText={(text) => setFormData({ ...formData, displayName: text })}
                        autoComplete="name"
                        textContentType="name"
                        id="name-input"
                        error={errors.displayName}
                    />

                    <Input
                        label="SECE Email"
                        placeholder="your.name@sece.ac.in"
                        value={formData.email}
                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        textContentType="username"
                        id="email-signup-input"
                        error={errors.email}
                    />

                    <Input
                        label="Password"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChangeText={(text) => setFormData({ ...formData, password: text })}
                        secureTextEntry
                        textContentType="newPassword"
                        autoComplete="password"
                        id="new-password-input"
                        error={errors.password}
                    />

                    <Input
                        label="Confirm Password"
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                        secureTextEntry
                        autoComplete="off"
                        error={errors.confirmPassword}
                    />

                    <View style={styles.checkboxContainer}>
                        <TouchableOpacity
                            style={styles.checkbox}
                            onPress={() => setFormData({ ...formData, isHosteler: !formData.isHosteler })}
                        >
                            <View style={[styles.checkboxBox, formData.isHosteler && styles.checkboxChecked]}>
                                {formData.isHosteler && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.checkboxLabel}>I am a hosteler</Text>
                        </TouchableOpacity>
                    </View>

                    <Button
                        title="Create Account"
                        onPress={handleSignup}
                        loading={loading}
                        style={styles.button}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                        <Text style={styles.link}>Sign In</Text>
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
        paddingHorizontal: THEME.spacing.lg,
        paddingVertical: THEME.spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: THEME.spacing.xl,
    },
    logo: {
        fontSize: 60,
        marginBottom: THEME.spacing.md,
    },
    title: {
        fontSize: THEME.typography.fontSize['2xl'],
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
        marginBottom: THEME.spacing.lg,
    },
    checkboxContainer: {
        marginVertical: THEME.spacing.md,
    },
    checkbox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxBox: {
        width: 24,
        height: 24,
        borderRadius: THEME.borderRadius.sm,
        borderWidth: 2,
        borderColor: THEME.colors.border,
        marginRight: THEME.spacing.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: THEME.colors.primary,
        borderColor: THEME.colors.primary,
    },
    checkmark: {
        color: THEME.colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    checkboxLabel: {
        fontSize: THEME.typography.fontSize.base,
        color: THEME.colors.textPrimary,
    },
    button: {
        marginTop: THEME.spacing.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: THEME.spacing.md,
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

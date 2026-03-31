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
import { useToast } from '../../src/hooks/useToast';
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
        role: 'student' as 'student' | 'faculty',
        isHosteler: false,
        department: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: '',
        department: '',
        general: '',
    });

    const router = useRouter();
    const { setUser, setRole, setHostelerStatus } = useAuthStore();
    const { showError, showSuccess } = useToast();

    const validateForm = (): boolean => {
        const newErrors = {
            email: '',
            password: '',
            confirmPassword: '',
            displayName: '',
            department: '',
            general: '',
        };
        let isValid = true;

        const isStudent = formData.role === 'student';

        // Role-specific validation
        if (!isStudent) {
            // Teacher needs a name and department
            if (!formData.displayName.trim()) {
                newErrors.displayName = 'Name is required';
                isValid = false;
            }
            if (!formData.department.trim()) {
                newErrors.department = 'Department is required';
                isValid = false;
            }
        }

        // Email validation
        const emailValidation = validateSeceEmailComplete(formData.email);
        if (!emailValidation.valid) {
            newErrors.email = emailValidation.message;
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
            department: '',
            general: '',
        });

        try {
            const userCredential = await signUp(formData.email, formData.password, {
                displayName: formData.displayName,
                isHosteler: formData.role === 'student' ? formData.isHosteler : false,
                role: formData.role,
                department: formData.role === 'faculty' ? formData.department : '',
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
            const errorCode = error.code || 'unknown';
            const errorMessage = getSignupErrorMessage(errorCode);
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
                    <Text style={styles.title}>Join NexSync</Text>
                    <Text style={styles.subtitle}>Create your SECE Campus account</Text>
                </View>

                {/* General Error Message */}
                {errors.general ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>⚠️ {errors.general}</Text>
                    </View>
                ) : null}

                <View style={styles.form}>
                    {/* Role Selection */}
                    <View style={styles.roleContainer}>
                        <Text style={styles.roleLabel}>I am a...</Text>
                        <View style={styles.roleButtons}>
                            <TouchableOpacity
                                style={[styles.roleButton, formData.role === 'student' && styles.roleButtonActive]}
                                onPress={() => setFormData({ ...formData, role: 'student' })}
                            >
                                <Text style={[styles.roleButtonText, formData.role === 'student' && styles.roleButtonTextActive]}>Student</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.roleButton, formData.role === 'faculty' && styles.roleButtonActive]}
                                onPress={() => setFormData({ ...formData, role: 'faculty' })}
                            >
                                <Text style={[styles.roleButtonText, formData.role === 'faculty' && styles.roleButtonTextActive]}>Teacher</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Conditional Rendering based on Role */}
                    {formData.role === 'faculty' ? (
                        <>
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
                                label="Department"
                                placeholder="e.g. CSE, AI&DS, ECE"
                                value={formData.department}
                                onChangeText={(text) => setFormData({ ...formData, department: text })}
                                error={errors.department}
                            />
                        </>
                    ) : null}

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

                    {/* Conditional Rendering for Student Residency */}
                    {formData.role === 'student' ? (
                        <View style={styles.hostelerContainer}>
                            <Text style={styles.hostelerLabel}>I stay at...</Text>
                            <View style={styles.hostelerButtons}>
                                <TouchableOpacity
                                    style={[styles.hostelerButton, formData.isHosteler && styles.hostelerButtonActive]}
                                    onPress={() => setFormData({ ...formData, isHosteler: true })}
                                >
                                    <Text style={[styles.hostelerButtonText, formData.isHosteler && styles.hostelerButtonTextActive]}>Hosteler</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.hostelerButton, !formData.isHosteler && styles.hostelerButtonActive]}
                                    onPress={() => setFormData({ ...formData, isHosteler: false })}
                                >
                                    <Text style={[styles.hostelerButtonText, !formData.isHosteler && styles.hostelerButtonTextActive]}>Day Scholar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : null}

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
        textAlign: 'center',
    },
    subtitle: {
        fontSize: THEME.typography.fontSize.base,
        color: THEME.colors.textSecondary,
        textAlign: 'center',
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
    roleContainer: {
        marginBottom: THEME.spacing.lg,
    },
    roleLabel: {
        fontSize: THEME.typography.fontSize.sm,
        fontWeight: '600',
        color: THEME.colors.textSecondary,
        marginBottom: THEME.spacing.sm,
    },
    roleButtons: {
        flexDirection: 'row',
        gap: THEME.spacing.sm,
    },
    roleButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: THEME.borderRadius.md,
        backgroundColor: THEME.colors.glass,
        borderWidth: 1,
        borderColor: THEME.colors.border,
        alignItems: 'center',
    },
    roleButtonActive: {
        backgroundColor: THEME.colors.primary,
        borderColor: THEME.colors.primary,
    },
    roleButtonText: {
        fontSize: THEME.typography.fontSize.base,
        color: THEME.colors.textPrimary,
        fontWeight: '500',
    },
    roleButtonTextActive: {
        color: THEME.colors.white,
    },
    hostelerContainer: {
        marginTop: THEME.spacing.md,
        marginBottom: THEME.spacing.lg,
    },
    hostelerLabel: {
        fontSize: THEME.typography.fontSize.sm,
        fontWeight: '600',
        color: THEME.colors.textSecondary,
        marginBottom: THEME.spacing.sm,
    },
    hostelerButtons: {
        flexDirection: 'row',
        gap: THEME.spacing.sm,
    },
    hostelerButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: THEME.borderRadius.md,
        backgroundColor: THEME.colors.glass,
        borderWidth: 1,
        borderColor: THEME.colors.border,
        alignItems: 'center',
    },
    hostelerButtonActive: {
        backgroundColor: THEME.colors.primary,
        borderColor: THEME.colors.primary,
    },
    hostelerButtonText: {
        fontSize: THEME.typography.fontSize.base,
        color: THEME.colors.textPrimary,
        fontWeight: '500',
    },
    hostelerButtonTextActive: {
        color: THEME.colors.white,
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

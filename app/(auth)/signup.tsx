import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/common/Input';
import { Button } from '../../src/components/common/Button';
import { signUp, getUserProfile } from '../../src/services/auth.service';
import { useAuthStore } from '../../src/store/authStore';
import { validateSeceEmailComplete, isStrongPassword, getPasswordStrengthMessage } from '../../src/utils/validation';
import { THEME } from '../../src/constants/theme';

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
    });

    const router = useRouter();
    const { setUser, setRole, setHostelerStatus } = useAuthStore();

    const validateForm = (): boolean => {
        const newErrors = {
            email: '',
            password: '',
            confirmPassword: '',
            displayName: '',
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
            Alert.alert('Signup Failed', error.message);
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

                <View style={styles.form}>
                    <Input
                        label="Full Name"
                        placeholder="Enter your name"
                        value={formData.displayName}
                        onChangeText={(text) => setFormData({ ...formData, displayName: text })}
                        error={errors.displayName}
                    />

                    <Input
                        label="SECE Email"
                        placeholder="your.name@sece.ac.in"
                        value={formData.email}
                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={errors.email}
                    />

                    <Input
                        label="Password"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChangeText={(text) => setFormData({ ...formData, password: text })}
                        secureTextEntry
                        error={errors.password}
                    />

                    <Input
                        label="Confirm Password"
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                        secureTextEntry
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
        backgroundColor: THEME.colors.white,
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
        color: THEME.colors.gray600,
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
        borderColor: THEME.colors.gray400,
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
        color: THEME.colors.gray700,
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
        color: THEME.colors.gray600,
    },
    link: {
        fontSize: THEME.typography.fontSize.base,
        color: THEME.colors.primary,
        fontWeight: '600',
    },
});

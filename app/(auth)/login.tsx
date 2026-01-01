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
import { signIn, getUserProfile } from '../../src/services/auth.service';
import { useAuthStore } from '../../src/store/authStore';
import { THEME } from '../../src/constants/theme';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ email: '', password: '' });

    const router = useRouter();
    const { setUser, setRole, setHostelerStatus } = useAuthStore();

    const validateForm = (): boolean => {
        const newErrors = { email: '', password: '' };
        let isValid = true;

        if (!email) {
            newErrors.email = 'Email is required';
            isValid = false;
        }

        if (!password) {
            newErrors.password = 'Password is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);
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
            Alert.alert('Login Failed', error.message);
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

                <View style={styles.form}>
                    <Input
                        label="Email"
                        placeholder="your.name@sece.ac.in"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={errors.email}
                    />

                    <Input
                        label="Password"
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
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
        backgroundColor: THEME.colors.white,
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
        color: THEME.colors.gray600,
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
        color: THEME.colors.gray600,
    },
    link: {
        fontSize: THEME.typography.fontSize.base,
        color: THEME.colors.primary,
        fontWeight: '600',
    },
});

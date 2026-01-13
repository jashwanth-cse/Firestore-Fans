import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Icon } from '../../src/components/common/Icon';
import { useAuthStore } from '../../src/store/authStore';
import { logout as authLogout } from '../../src/services/auth.service';
import { THEME } from '../../src/constants/theme';
import { ProfileFieldCard } from '../../src/components/profile/ProfileFieldCard';
import { auth } from '../../src/services/firebase';
import axios from 'axios';

interface UserProfile {
    uid: string;
    displayName: string | null;
    email: string | null;
    department: string | null;
    role: string;
    isHosteler: boolean;
    createdAt: string | null;
}

export default function ProfileScreen() {
    const router = useRouter();
    const { user, logout: storeLogout } = useAuthStore();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const shouldShowField = (value: any): boolean => {
        if (value === null) return false;
        if (value === undefined) return false;
        if (typeof value === 'string' && value.trim() === '') return false;
        return true;
    };

    const fetchProfile = async () => {
        const currentUid = user?.uid || auth.currentUser?.uid;

        if (!currentUid) {
            setLoading(false);
            setError('User not authenticated');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';
            const response = await axios.get(`${API_URL}/api/users/profile/${currentUid}`);

            if (response.data.success) {
                setProfile(response.data.profile);
            } else {
                setError('Failed to load profile');
            }
        } catch (err: any) {
            console.error('Error fetching profile:', err);
            setError(err.response?.data?.error || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchProfile();
        }, [user?.uid])
    );

    /* ===========================
       ✅ FIXED LOGOUT FUNCTION
       (nothing else changed)
    ============================ */
    const handleLogout = async () => {
        try {
            console.log('🚪 Logging out...');

            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

            try {
                const token = await auth.currentUser?.getIdToken();
                if (token) {
                    await axios.post(
                        `${API_URL}/api/users/logout`,
                        {},
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    console.log('✅ Backend logout successful');
                }
            } catch (apiError) {
                console.warn('⚠️ Backend logout failed:', apiError);
            }

            await authLogout();
            console.log('✅ Firebase logout successful');

            storeLogout();
            console.log('✅ Store cleared');

            router.replace('/(auth)/login');
            console.log('✅ Navigated to login');
        } catch (error: any) {
            console.error('❌ Logout error:', error);
            Alert.alert('Logout Failed', error.message || 'Failed to logout');
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={THEME.colors.primary} />
                    <Text style={styles.loadingText}>Loading profile...</Text>
                </View>
            </View>
        );
    }

    if (error || !profile) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Icon
                        name="alert-circle"
                        size={60}
                        color={THEME.colors.error}
                    />
                    <Text style={styles.errorTitle}>Unable to Load Profile</Text>
                    <Text style={styles.errorText}>{error || 'Profile data not available'}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {profile.email?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <Text style={styles.name}>
                        {profile.displayName || profile.email?.split('@')[0] || 'User'}
                    </Text>
                    <Text style={styles.email}>{profile.email}</Text>
                    <View style={styles.badges}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.fieldsContainer}>
                    <Text style={styles.sectionTitle}>Profile Information</Text>

                    {shouldShowField(profile.email) && (
                        <ProfileFieldCard
                            icon="email"
                            label="Email"
                            value={profile.email!}
                            color={THEME.colors.primary}
                        />
                    )}

                    {shouldShowField(profile.department) && (
                        <ProfileFieldCard
                            icon="school"
                            label="Department"
                            value={profile.department!}
                            color={THEME.colors.primary}
                        />
                    )}

                    <ProfileFieldCard
                        icon="home"
                        label="Residence"
                        value={profile.isHosteler ? 'Hosteler' : 'Day Scholar'}
                        color={THEME.colors.primary}
                    />
                </View>

                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.7}
                    >
                        <Icon name="logout" size={20} color={THEME.colors.error} />
                        <Text style={styles.logoutButtonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
        paddingBottom: 80,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: THEME.spacing.md,
        fontSize: THEME.typography.fontSize.base,
        color: THEME.colors.gray600,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: THEME.spacing.xl,
    },
    errorTitle: {
        fontSize: THEME.typography.fontSize.xl,
        fontWeight: 'bold',
        color: THEME.colors.gray900,
        marginTop: THEME.spacing.md,
        marginBottom: THEME.spacing.sm,
    },
    errorText: {
        fontSize: THEME.typography.fontSize.base,
        color: THEME.colors.gray600,
        textAlign: 'center',
        marginBottom: THEME.spacing.lg,
    },
    retryButton: {
        backgroundColor: THEME.colors.primary,
        paddingVertical: THEME.spacing.sm,
        paddingHorizontal: THEME.spacing.xl,
        borderRadius: THEME.borderRadius.md,
    },
    retryButtonText: {
        color: THEME.colors.white,
        fontSize: THEME.typography.fontSize.base,
        fontWeight: '600',
    },
    header: {
        backgroundColor: THEME.colors.primary,
        paddingHorizontal: THEME.spacing.lg,
        paddingVertical: THEME.spacing.lg,
        alignItems: 'center',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: THEME.colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: THEME.spacing.md,
        borderWidth: 4,
        borderColor: THEME.colors.white + '30',
        overflow: 'hidden',
    },
    avatarText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: THEME.colors.white,
    },
    name: {
        fontSize: THEME.typography.fontSize.xl,
        fontWeight: 'bold',
        color: THEME.colors.white,
        marginBottom: THEME.spacing.xs,
        textTransform: 'capitalize',
    },
    email: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.white,
        opacity: 0.9,
        marginBottom: THEME.spacing.md,
    },
    badges: {
        flexDirection: 'row',
        gap: THEME.spacing.sm,
    },
    badge: {
        backgroundColor: THEME.colors.white,
        paddingHorizontal: THEME.spacing.md,
        paddingVertical: THEME.spacing.xs,
        borderRadius: THEME.borderRadius.full,
    },
    badgeText: {
        fontSize: THEME.typography.fontSize.xs,
        fontWeight: '600',
        color: THEME.colors.primary,
        textTransform: 'uppercase',
    },
    fieldsContainer: {
        padding: THEME.spacing.md,
        marginTop: THEME.spacing.sm,
    },
    sectionTitle: {
        fontSize: THEME.typography.fontSize.lg,
        fontWeight: '600',
        color: THEME.colors.gray900,
        marginBottom: THEME.spacing.md,
    },
    actionsContainer: {
        padding: THEME.spacing.md,
        marginTop: THEME.spacing.md,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: THEME.colors.white,
        padding: THEME.spacing.md,
        borderRadius: THEME.borderRadius.lg,
        borderWidth: 2,
        borderColor: THEME.colors.error,
        gap: THEME.spacing.sm,
        ...THEME.shadows.sm,
    },
    logoutButtonText: {
        fontSize: THEME.typography.fontSize.base,
        fontWeight: '600',
        color: THEME.colors.error,
    },
});

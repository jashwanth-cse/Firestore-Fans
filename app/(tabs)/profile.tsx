import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { logout as authLogout } from '../../src/services/auth.service';
import { THEME } from '../../src/constants/theme';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, role, isHosteler, logout: storeLogout } = useAuthStore();

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await authLogout();
                            storeLogout();
                            router.replace('/(auth)/login');
                        } catch (error: any) {
                            Alert.alert('Logout Failed', error.message);
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                {/* Profile Header */}
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <MaterialCommunityIcons name="account" size={60} color={THEME.colors.white} />
                    </View>
                    <Text style={styles.name}>
                        {user?.displayName || user?.email?.split('@')[0] || 'User'}
                    </Text>
                    <Text style={styles.email}>{user?.email}</Text>
                    <View style={styles.badges}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{role || 'Student'}</Text>
                        </View>
                        {isHosteler && (
                            <View style={[styles.badge, styles.badgeHosteler]}>
                                <Text style={styles.badgeText}>Hosteler</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menu}>
                    <MenuItem
                        icon="account-edit"
                        title="Edit Profile"
                        onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available soon')}
                    />
                    <MenuItem
                        icon="shield-lock"
                        title="Change Password"
                        onPress={() => Alert.alert('Coming Soon', 'Password change will be available soon')}
                    />
                    <MenuItem
                        icon="bell"
                        title="Notifications"
                        onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available soon')}
                    />
                    <MenuItem
                        icon="information"
                        title="About"
                        onPress={() => Alert.alert('NexSync', 'Version 1.0.0\nSECE Campus Automation App')}
                    />
                    <MenuItem
                        icon="logout"
                        title="Logout"
                        onPress={handleLogout}
                        destructive
                    />
                </View>
            </View>
        </ScrollView>
    );
}

const MenuItem = ({
    icon,
    title,
    onPress,
    destructive = false
}: {
    icon: string;
    title: string;
    onPress: () => void;
    destructive?: boolean;
}) => (
    <TouchableOpacity
        style={styles.menuItem}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <MaterialCommunityIcons
            name={icon as any}
            size={24}
            color={destructive ? THEME.colors.error : THEME.colors.gray700}
        />
        <Text style={[styles.menuItemText, destructive && styles.menuItemTextDestructive]}>
            {title}
        </Text>
        <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={THEME.colors.gray400}
        />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    content: {
        flex: 1,
    },
    header: {
        backgroundColor: THEME.colors.primary,
        padding: THEME.spacing.xl,
        alignItems: 'center',
        paddingTop: THEME.spacing['2xl'],
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: THEME.colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: THEME.spacing.md,
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
    badgeHosteler: {
        backgroundColor: THEME.colors.accent,
    },
    badgeText: {
        fontSize: THEME.typography.fontSize.xs,
        fontWeight: '600',
        color: THEME.colors.primary,
        textTransform: 'uppercase',
    },
    menu: {
        marginTop: THEME.spacing.lg,
        backgroundColor: THEME.colors.white,
        borderTopWidth: 1,
        borderTopColor: THEME.colors.gray200,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: THEME.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: THEME.colors.gray200,
    },
    menuItemText: {
        flex: 1,
        marginLeft: THEME.spacing.md,
        fontSize: THEME.typography.fontSize.base,
        color: THEME.colors.gray900,
        fontWeight: '500',
    },
    menuItemTextDestructive: {
        color: THEME.colors.error,
    },
});

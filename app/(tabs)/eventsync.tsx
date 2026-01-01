import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { THEME } from '../../src/constants/theme';

export default function EventSyncTab() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to EventSync module
        router.replace('/(eventsync)');
    }, []);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={THEME.colors.primary} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: THEME.colors.background,
    },
});

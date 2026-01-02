import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { THEME } from '../../src/constants/theme';
import { eventSyncAPI } from '../../src/services/eventSync.service';
import { Event } from '../../src/types/event.types';
import { useToast } from '../../src/hooks/useToast';

export default function AdminDashboardScreen() {
    const { showError, showSuccess } = useToast();
    const [requests, setRequests] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const loadRequests = useCallback(async () => {
        try {
            const result = await eventSyncAPI.admin.getAllPending();
            if (result.success) {
                setRequests(result.requests || []);
            }
        } catch (error) {
            showError('Failed to load pending requests');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadRequests();
        setRefreshing(false);
    };

    const handleApprove = async (request: Event) => {
        if (actionLoading) return;

        try {
            setActionLoading(request.id);
            await eventSyncAPI.admin.approveRequest(request.id);

            // Remove from list locally
            setRequests(prev => prev.filter(req => req.id !== request.id));

            showSuccess(`"${request.name || request.eventName || 'Event'}" approved!`);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to approve request';
            showError(msg);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = (request: Event) => {
        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to reject this request?')) {
                performReject(request);
            }
        } else {
            Alert.alert(
                'Confirm Rejection',
                'Are you sure you want to reject this request? It will be deleted.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Reject', style: 'destructive', onPress: () => performReject(request) }
                ]
            );
        }
    };

    const performReject = async (request: Event) => {
        if (actionLoading) return;

        try {
            setActionLoading(request.id);
            await eventSyncAPI.admin.rejectRequest(request.id, 'Admin rejected');

            // Remove from list locally
            setRequests(prev => prev.filter(req => req.id !== request.id));

            if (Platform.OS === 'web') {
                window.alert('Request rejected');
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to reject request';
            if (Platform.OS === 'web') {
                window.alert(msg);
            } else {
                Alert.alert('Error', msg);
            }
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={THEME.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Pending Approvals</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{requests.length}</Text>
                    </View>
                </View>

                {requests.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="check-all" size={64} color={THEME.colors.success} />
                        <Text style={styles.emptyText}>All caught up! No pending requests.</Text>
                    </View>
                ) : (
                    requests.map((req) => (
                        <View key={req.id} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.dateBox}>
                                    <Text style={styles.dateMonth}>
                                        {new Date(req.date).toLocaleString('default', { month: 'short' })}
                                    </Text>
                                    <Text style={styles.dateDay}>
                                        {new Date(req.date).getDate()}
                                    </Text>
                                </View>
                                <View style={styles.headerInfo}>
                                    <Text style={styles.eventName}>{req.name}</Text>
                                    <View style={styles.venueRow}>
                                        <MaterialCommunityIcons name="map-marker" size={14} color={THEME.colors.gray500} />
                                        <Text style={styles.venueName}>{req.venueName}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.detailsContainer}>
                                <View style={styles.detailRow}>
                                    <MaterialCommunityIcons name="clock-outline" size={16} color={THEME.colors.gray600} />
                                    <Text style={styles.detailText}>
                                        {req.startTime} ({req.duration} mins)
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <MaterialCommunityIcons name="account-group" size={16} color={THEME.colors.gray600} />
                                    <Text style={styles.detailText}>{req.requiredSeats} Seats Required</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <MaterialCommunityIcons name="account" size={16} color={THEME.colors.gray600} />
                                    <Text style={styles.detailText}>By: {req.userEmail || 'User'}</Text>
                                </View>
                            </View>

                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={[styles.button, styles.rejectButton]}
                                    onPress={() => handleReject(req)}
                                    disabled={!!actionLoading}
                                >
                                    <Text style={styles.rejectButtonText}>Reject</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.button, styles.approveButton]}
                                    onPress={() => handleApprove(req)}
                                    disabled={!!actionLoading}
                                >
                                    {actionLoading === req.id ? (
                                        <ActivityIndicator color={THEME.colors.white} size="small" />
                                    ) : (
                                        <Text style={styles.approveButtonText}>Approve</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: THEME.spacing.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: THEME.spacing.lg,
    },
    headerTitle: {
        fontSize: THEME.typography.fontSize.xl,
        fontWeight: 'bold',
        color: THEME.colors.gray900,
        marginRight: THEME.spacing.sm,
    },
    badge: {
        backgroundColor: THEME.colors.warning,
        paddingHorizontal: THEME.spacing.sm,
        paddingVertical: 2,
        borderRadius: THEME.borderRadius.full,
    },
    badgeText: {
        color: THEME.colors.white,
        fontSize: THEME.typography.fontSize.xs,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: THEME.spacing['2xl'],
    },
    emptyText: {
        marginTop: THEME.spacing.md,
        fontSize: THEME.typography.fontSize.lg,
        color: THEME.colors.gray500,
    },
    card: {
        backgroundColor: THEME.colors.white,
        borderRadius: THEME.borderRadius.lg,
        padding: THEME.spacing.md,
        marginBottom: THEME.spacing.md,
        ...THEME.shadows.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: THEME.spacing.md,
    },
    dateBox: {
        backgroundColor: THEME.colors.gray100,
        padding: THEME.spacing.xs,
        borderRadius: THEME.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 50,
        marginRight: THEME.spacing.md,
    },
    dateMonth: {
        fontSize: THEME.typography.fontSize.xs,
        fontWeight: 'bold',
        color: THEME.colors.primary,
        textTransform: 'uppercase',
    },
    dateDay: {
        fontSize: THEME.typography.fontSize.lg,
        fontWeight: 'bold',
        color: THEME.colors.gray900,
    },
    headerInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    eventName: {
        fontSize: THEME.typography.fontSize.lg,
        fontWeight: '600',
        color: THEME.colors.gray900,
        marginBottom: 2,
    },
    venueRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    venueName: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.gray600,
        marginLeft: 4,
    },
    detailsContainer: {
        backgroundColor: THEME.colors.gray100,
        padding: THEME.spacing.sm,
        borderRadius: THEME.borderRadius.md,
        marginBottom: THEME.spacing.md,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    detailText: {
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.gray700,
        marginLeft: THEME.spacing.xs,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: THEME.spacing.md,
    },
    button: {
        flex: 1,
        paddingVertical: THEME.spacing.sm,
        borderRadius: THEME.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rejectButton: {
        backgroundColor: THEME.colors.gray100,
        borderWidth: 1,
        borderColor: THEME.colors.gray300,
    },
    rejectButtonText: {
        color: THEME.colors.error,
        fontWeight: '600',
    },
    approveButton: {
        backgroundColor: THEME.colors.success,
    },
    approveButtonText: {
        color: THEME.colors.white,
        fontWeight: '600',
    },
});

import React, { useState, useRef, useMemo } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Animated,
    PanResponder,
    Dimensions,
    Platform,
    InteractionManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '../common/Icon';
import { THEME } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

type MenuAction = 'home' | 'browse' | 'pending' | 'approved' | 'admin';

const BASE_MENU_ITEMS = [
    { id: 'home', icon: 'chat-processing', route: '/(tabs)/eventsync' },
    { id: 'browse', icon: 'map-marker-multiple', route: '/(tabs)/eventsync/browse' },
    { id: 'pending', icon: 'clock-outline', route: '/(tabs)/eventsync/pending' },
    { id: 'approved', icon: 'check-circle', route: '/(tabs)/eventsync/approved' },
];

const ADMIN_ITEM = {
    id: 'admin',
    icon: 'shield-account',
    route: '/(admin)/dashboard',
};

const { width, height } = Dimensions.get('window');

const FAB_SIZE = 52;
const ITEM_SIZE = 46;
const MAX_ITEMS = 5;
const RADIUS = Platform.OS === 'web' ? 95 : 80;
const ANGLE_SPREAD = Math.PI / 1.5;
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

export const MagicFabMenu: React.FC = () => {
    const router = useRouter();
    const { role } = useAuthStore();

    const menuItems = useMemo(
        () => (role === 'admin' ? [...BASE_MENU_ITEMS, ADMIN_ITEM] : BASE_MENU_ITEMS),
        [role]
    );

    const [isOpen, setIsOpen] = useState(false);
    const isAnimating = useRef(false);

    const pan = useRef(new Animated.ValueXY({ x: 20, y: 140 })).current;

    // ✅ Stable animation pool (never changes)
    const anim = useRef({
        fab: new Animated.Value(1),
        backdrop: new Animated.Value(0),
        items: Array.from({ length: MAX_ITEMS }, () => ({
            x: new Animated.Value(0),
            y: new Animated.Value(0),
            scale: new Animated.Value(0),
        })),
    }).current;

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, g) =>
                !isOpen && (Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6),
            onPanResponderGrant: () => {
                // Set offset to current position for smooth dragging
                pan.setOffset({
                    x: (pan.x as any)._value,
                    y: (pan.y as any)._value,
                });
                // Reset value to 0 so dx/dy are relative to touch point
                pan.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: () => {
                // Flatten offset into main value
                pan.flattenOffset();

                const x = (pan.x as any)._value;
                const y = (pan.y as any)._value;

                Animated.spring(pan, {
                    toValue: {
                        x: Math.min(Math.max(10, x), width - FAB_SIZE - 10),
                        y: Math.min(Math.max(80, y), height - FAB_SIZE - 120),
                    },
                    useNativeDriver: false,
                }).start();
            },
        })
    ).current;

    const toggleMenu = () => {
        if (isAnimating.current) return;
        isAnimating.current = true;

        const open = !isOpen;
        const count = menuItems.length;

        Animated.parallel([
            Animated.spring(anim.fab, {
                toValue: open ? 1.15 : 1,
                useNativeDriver: USE_NATIVE_DRIVER,
            }),
            Animated.timing(anim.backdrop, {
                toValue: open ? 1 : 0,
                duration: 180,
                useNativeDriver: USE_NATIVE_DRIVER,
            }),
            Animated.stagger(
                40,
                anim.items.map((slot, i) => {
                    if (i >= count) {
                        return Animated.parallel([
                            Animated.spring(slot.scale, {
                                toValue: 0,
                                useNativeDriver: USE_NATIVE_DRIVER,
                            }),
                        ]);
                    }

                    // Wider spread for 5 items (admin), normal for 4 items
                    const angleSpread = count === 5 ? Math.PI / 1.2 : ANGLE_SPREAD;
                    const angle =
                        -angleSpread / 2 +
                        (angleSpread / Math.max(count - 1, 1)) * i;

                    return Animated.parallel([
                        Animated.spring(slot.x, {
                            toValue: open ? Math.cos(angle) * RADIUS : 0,
                            useNativeDriver: USE_NATIVE_DRIVER,
                        }),
                        Animated.spring(slot.y, {
                            toValue: open ? Math.sin(angle) * RADIUS : 0,
                            useNativeDriver: USE_NATIVE_DRIVER,
                        }),
                        Animated.spring(slot.scale, {
                            toValue: open ? 1 : 0,
                            useNativeDriver: USE_NATIVE_DRIVER,
                        }),
                    ]);
                })
            ),
        ]).start(() => {
            setIsOpen(open);
            isAnimating.current = false;
        });
    };

    const navigate = (route: string) => {
        toggleMenu();
        InteractionManager.runAfterInteractions(() =>
            router.push(route as any)
        );
    };

    return (
        <>
            {isOpen && (
                Platform.OS === 'web' ? (
                    <Animated.View
                        pointerEvents="auto"
                        style={[
                            StyleSheet.absoluteFill,
                            {
                                backgroundColor: 'rgba(0,0,0,0.45)',
                                opacity: anim.backdrop,
                            },
                        ]}
                        onTouchEnd={toggleMenu}
                    />
                ) : (
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={toggleMenu}
                    >
                        <Animated.View
                            style={[
                                StyleSheet.absoluteFill,
                                {
                                    backgroundColor: 'rgba(0,0,0,0.45)',
                                    opacity: anim.backdrop,
                                },
                            ]}
                        />
                    </TouchableOpacity>
                )
            )}


            <Animated.View
                style={[styles.root, { transform: pan.getTranslateTransform() }]}
                {...panResponder.panHandlers}
                pointerEvents="auto"
            >
                <View style={styles.container}>
                    {menuItems.map((item, i) => (
                        <Animated.View
                            key={item.id}
                            style={[
                                styles.item,
                                {
                                    transform: [
                                        { translateX: anim.items[i].x },
                                        { translateY: anim.items[i].y },
                                        { scale: anim.items[i].scale },
                                    ],
                                },
                            ]}
                            pointerEvents={isOpen ? 'auto' : 'none'}
                        >
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => navigate(item.route)}
                            >
                                <Icon name={item.icon} size={22} color="#fff" />
                            </TouchableOpacity>
                        </Animated.View>
                    ))}

                    <Animated.View style={{ transform: [{ scale: anim.fab }] }}>
                        <TouchableOpacity style={styles.fab} onPress={toggleMenu}>
                            <Icon name="apps" size={26} color="#fff" />
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Animated.View>
        </>
    );
};

const styles = StyleSheet.create({
    root: {
        position: 'absolute',
        zIndex: 9999,
        elevation: 999,
    },
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    fab: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: FAB_SIZE / 2,
        backgroundColor: THEME.colors.primaryGlow,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 12,
    },
    item: {
        position: 'absolute',
    },
    button: {
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        borderRadius: ITEM_SIZE / 2,
        backgroundColor: THEME.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
    },
});

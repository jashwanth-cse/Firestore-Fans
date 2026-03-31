import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { THEME } from '../../constants/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
    textStyle,
}) => {
    const getButtonStyle = (): ViewStyle => {
        const baseStyle = styles.button;

        switch (variant) {
            case 'secondary':
                return { ...baseStyle, ...styles.buttonSecondary };
            case 'outline':
                return { ...baseStyle, ...styles.buttonOutline };
            default:
                return { ...baseStyle, ...styles.buttonPrimary };
        }
    };

    const getTextStyle = (): TextStyle => {
        const baseStyle = styles.buttonText;

        switch (variant) {
            case 'outline':
                return { ...baseStyle, ...styles.buttonTextOutline };
            default:
                return baseStyle;
        }
    };

    return (
        <TouchableOpacity
            style={[
                getButtonStyle(),
                (disabled || loading) && styles.buttonDisabled,
                style,
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={THEME.colors.white} />
            ) : (
                <Text style={[getTextStyle(), textStyle]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: THEME.spacing.md,
        paddingHorizontal: THEME.spacing.xl,
        borderRadius: THEME.borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
        ...THEME.shadows.sm,
    },
    buttonPrimary: {
        backgroundColor: THEME.colors.primary,
    },
    buttonSecondary: {
        backgroundColor: THEME.colors.accent,
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: THEME.colors.primary,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: THEME.colors.white,
        fontSize: THEME.typography.fontSize.base,
        fontWeight: '600',
    },
    buttonTextOutline: {
        color: THEME.colors.primary,
    },
});

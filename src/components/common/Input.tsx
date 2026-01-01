import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    TextInputProps,
} from 'react-native';
import { THEME } from '../../constants/theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    autoComplete?: 'email' | 'name' | 'username' | 'password' | 'off' | 'tel' | 'street-address' | 'name-family' | 'name-given';
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    containerStyle,
    inputStyle,
    autoComplete,
    id,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    isFocused && styles.inputFocused,
                    error && styles.inputError,
                    inputStyle,
                ]}
                placeholderTextColor={THEME.colors.gray400}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoComplete={autoComplete}
                id={id}
                nativeID={id} // Helper for Web
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: THEME.spacing.md,
    },
    label: {
        fontSize: THEME.typography.fontSize.sm,
        fontWeight: '600',
        color: THEME.colors.textPrimary,
        marginBottom: THEME.spacing.xs,
    },
    input: {
        borderWidth: 1,
        borderColor: THEME.colors.border,
        borderRadius: THEME.borderRadius.md,
        paddingVertical: THEME.spacing.sm + THEME.spacing.xs,
        paddingHorizontal: THEME.spacing.md,
        fontSize: THEME.typography.fontSize.base,
        color: THEME.colors.textPrimary,
        backgroundColor: THEME.colors.glass,
    },
    inputFocused: {
        borderColor: THEME.colors.primary,
        borderWidth: 2,
    },
    inputError: {
        borderColor: THEME.colors.error,
    },
    errorText: {
        fontSize: THEME.typography.fontSize.xs,
        color: THEME.colors.error,
        marginTop: THEME.spacing.xs,
    },
});

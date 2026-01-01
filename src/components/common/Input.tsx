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
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    containerStyle,
    inputStyle,
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
        color: THEME.colors.gray700,
        marginBottom: THEME.spacing.xs,
    },
    input: {
        borderWidth: 1,
        borderColor: THEME.colors.gray300,
        borderRadius: THEME.borderRadius.md,
        paddingVertical: THEME.spacing.sm + THEME.spacing.xs,
        paddingHorizontal: THEME.spacing.md,
        fontSize: THEME.typography.fontSize.base,
        color: THEME.colors.gray900,
        backgroundColor: THEME.colors.white,
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

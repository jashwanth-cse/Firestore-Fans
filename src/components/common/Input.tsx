import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    TextInputProps,
    TouchableOpacity,
} from 'react-native';
import { Icon } from './Icon';
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
    secureTextEntry,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.inputContainer}>
                <TextInput
                    style={[
                        styles.input,
                        isFocused && styles.inputFocused,
                        error && styles.inputError,
                        secureTextEntry && styles.inputWithIcon,
                        inputStyle,
                    ]}
                    placeholderTextColor={THEME.colors.gray400}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoComplete={autoComplete}
                    id={id}
                    nativeID={id} // Helper for Web
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    {...props}
                />
                {secureTextEntry && (
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={togglePasswordVisibility}
                        activeOpacity={0.7}
                    >
                        <Icon
                            name={isPasswordVisible ? 'eye-off' : 'eye'}
                            size={20}
                            color={THEME.colors.gray600}
                        />
                    </TouchableOpacity>
                )}
            </View>
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
    inputContainer: {
        position: 'relative',
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
    inputWithIcon: {
        paddingRight: 48,
    },
    iconButton: {
        position: 'absolute',
        right: THEME.spacing.md,
        top: '50%',
        transform: [{ translateY: -10 }],
        padding: 4,
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

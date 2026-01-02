import React from 'react';
import Toast, { BaseToast, ErrorToast, InfoToast } from 'react-native-toast-message';
import { THEME } from '../../constants/theme';

const toastConfig = {
    success: (props: any) => (
        <BaseToast
            {...props}
            style={{
                borderLeftColor: THEME.colors.success,
                backgroundColor: THEME.colors.white,
            }}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{
                fontSize: 16,
                fontWeight: '600',
                color: THEME.colors.gray900,
            }}
            text2Style={{
                fontSize: 14,
                color: THEME.colors.gray700,
            }}
        />
    ),
    error: (props: any) => (
        <ErrorToast
            {...props}
            style={{
                borderLeftColor: THEME.colors.error,
                backgroundColor: THEME.colors.white,
            }}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{
                fontSize: 16,
                fontWeight: '600',
                color: THEME.colors.gray900,
            }}
            text2Style={{
                fontSize: 14,
                color: THEME.colors.gray700,
            }}
        />
    ),
    info: (props: any) => (
        <InfoToast
            {...props}
            style={{
                borderLeftColor: THEME.colors.primary,
                backgroundColor: THEME.colors.white,
            }}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{
                fontSize: 16,
                fontWeight: '600',
                color: THEME.colors.gray900,
            }}
            text2Style={{
                fontSize: 14,
                color: THEME.colors.gray700,
            }}
        />
    ),
};

export const AppToast = () => {
    return <Toast config={toastConfig} />;
};

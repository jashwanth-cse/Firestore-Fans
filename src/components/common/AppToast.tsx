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
                width: '90%',
                maxWidth: 500,
            }}
            contentContainerStyle={{ paddingHorizontal: 15, flex: 1 }}
            text1Style={{
                fontSize: 16,
                fontWeight: '600',
                color: THEME.colors.gray900,
            }}
            text2Style={{
                fontSize: 14,
                color: THEME.colors.gray700,
                flexWrap: 'wrap',
            }}
            text1NumberOfLines={2}
            text2NumberOfLines={3}
        />
    ),
    error: (props: any) => (
        <ErrorToast
            {...props}
            style={{
                borderLeftColor: THEME.colors.error,
                backgroundColor: THEME.colors.white,
                width: '90%',
                maxWidth: 500,
            }}
            contentContainerStyle={{ paddingHorizontal: 15, flex: 1 }}
            text1Style={{
                fontSize: 16,
                fontWeight: '600',
                color: THEME.colors.gray900,
            }}
            text2Style={{
                fontSize: 14,
                color: THEME.colors.gray700,
                flexWrap: 'wrap',
            }}
            text1NumberOfLines={2}
            text2NumberOfLines={3}
        />
    ),
    info: (props: any) => (
        <InfoToast
            {...props}
            style={{
                borderLeftColor: THEME.colors.primary,
                backgroundColor: THEME.colors.white,
                width: '90%',
                maxWidth: 500,
            }}
            contentContainerStyle={{ paddingHorizontal: 15, flex: 1 }}
            text1Style={{
                fontSize: 16,
                fontWeight: '600',
                color: THEME.colors.gray900,
            }}
            text2Style={{
                fontSize: 14,
                color: THEME.colors.gray700,
                flexWrap: 'wrap',
            }}
            text1NumberOfLines={2}
            text2NumberOfLines={3}
        />
    ),
};

export const AppToast = () => {
    return <Toast config={toastConfig} />;
};

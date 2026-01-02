import Toast from 'react-native-toast-message';

export const useToast = () => {
    const showSuccess = (message: string) => {
        Toast.show({
            type: 'success',
            text1: 'Success',
            text2: message,
            position: 'top',
            visibilityTime: 3000,
            topOffset: 50,
        });
    };

    const showError = (message: string) => {
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: message,
            position: 'top',
            visibilityTime: 4000,
            topOffset: 50,
        });
    };

    const showInfo = (message: string) => {
        Toast.show({
            type: 'info',
            text1: 'Info',
            text2: message,
            position: 'top',
            visibilityTime: 3000,
            topOffset: 50,
        });
    };

    return { showSuccess, showError, showInfo };
};

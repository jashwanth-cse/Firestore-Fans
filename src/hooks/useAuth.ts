import { useAuthStore } from '../store/authStore';

/**
 * Custom hook to access auth state and actions
 */
export const useAuth = () => {
    const {
        user,
        isAuthenticated,
        isLoading,
        role,
        isHosteler,
        setUser,
        setLoading,
        setRole,
        setHostelerStatus,
        logout,
    } = useAuthStore();

    return {
        user,
        isAuthenticated,
        isLoading,
        role,
        isHosteler,
        setUser,
        setLoading,
        setRole,
        setHostelerStatus,
        logout,
    };
};

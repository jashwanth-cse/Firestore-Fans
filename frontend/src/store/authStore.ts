import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    role: 'student' | 'faculty' | 'admin' | null;
    isHosteler: boolean;

    // Actions
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    setRole: (role: 'student' | 'faculty' | 'admin' | null) => void;
    setHostelerStatus: (isHosteler: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    role: null,
    isHosteler: false,

    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setLoading: (loading) => set({ isLoading: loading }),
    setRole: (role) => set({ role }),
    setHostelerStatus: (isHosteler) => set({ isHosteler }),
    logout: () => set({
        user: null,
        isAuthenticated: false,
        role: null,
        isHosteler: false,
    }),
}));

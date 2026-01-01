import { create } from 'zustand';

interface AppState {
    theme: 'light' | 'dark';
    isOnboardingComplete: boolean;

    // Actions
    setTheme: (theme: 'light' | 'dark') => void;
    toggleTheme: () => void;
    completeOnboarding: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    theme: 'light',
    isOnboardingComplete: false,

    setTheme: (theme) => set({ theme }),
    toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light',
    })),
    completeOnboarding: () => set({ isOnboardingComplete: true }),
}));

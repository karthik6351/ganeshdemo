import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UIState {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    language: 'en' | 'te';
    setLanguage: (lang: 'en' | 'te') => void;
    sidebarOpen: boolean;
    toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            theme: 'light',
            toggleTheme: () => set((state) => {
                const newTheme = state.theme === 'light' ? 'dark' : 'light';
                if (newTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
                return { theme: newTheme };
            }),
            language: 'te',
            setLanguage: (lang) => set({ language: lang }),
            sidebarOpen: false,
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        }),
        {
            name: 'ui-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                // Apply theme on load
                if (state?.theme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        }
    )
);

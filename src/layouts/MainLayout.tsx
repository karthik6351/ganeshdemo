import React from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Languages } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useUIStore } from '../store/uiStore';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '../utils/cn';

export const MainLayout = () => {
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme, language, setLanguage } = useUIStore();
    const location = useLocation();

    const handleLanguageToggle = () => {
        const newLang = language === 'en' ? 'te' : 'en';
        setLanguage(newLang);
        i18n.changeLanguage(newLang);
    };

    const navItems = [
        { path: '/', label: t('nav.tree') },
        { path: '/list', label: t('nav.list') },
        { path: '/settings', label: t('nav.settings') },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 h-16">
                <div className="container mx-auto px-4 h-full flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Logo/Title */}
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                                {t('app_title')}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleLanguageToggle} title="Switch Language">
                            <Languages className="w-5 h-5 mr-1" />
                            <span className="uppercase text-xs font-bold">{language}</span>
                        </Button>

                        <Button variant="ghost" size="sm" onClick={toggleTheme} title="Toggle Theme">
                            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Bottom Nav (Mobile) */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 h-16 flex items-center justify-around sm:hidden pb-safe">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors",
                            location.pathname === item.path
                                ? "text-primary-600 dark:text-primary-400"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900"
                        )}
                    >
                        <span className="mt-1">{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Main Content */}
            <main className="pt-20 pb-20 sm:pb-8 px-4 container mx-auto min-h-screen">
                <Outlet />
            </main>
        </div>
    );
};

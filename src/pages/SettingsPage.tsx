import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Upload, Trash2, Globe, Moon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { exportTreeToJSON, importTreeFromJSON } from '../utils/dataUtils';
import { useFamilyStore } from '../store/familyStore';
import { useUIStore } from '../store/uiStore';

export const SettingsPage = () => {
    const { t, i18n } = useTranslation();
    const { resetTree } = useFamilyStore();
    const { theme, toggleTheme, language, setLanguage } = useUIStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                await importTreeFromJSON(file);
                alert('Tree imported successfully!');
            } catch (error) {
                alert('Failed to import tree: Invalid format');
            }
        }
    };

    const handleClear = () => {
        if (window.confirm('Are you sure you want to delete all data? This cannot be undone.')) {
            resetTree();
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('nav.settings')}</h2>

            {/* Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle>App Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Language */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-gray-500" />
                            <div>
                                <p className="font-medium text-gray-900">Language</p>
                                <p className="text-sm text-gray-500">Select your preferred language</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={language === 'te' ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => { i18n.changeLanguage('te'); setLanguage('te'); }}
                            >
                                Telugu
                            </Button>
                            <Button
                                variant={language === 'en' ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => { i18n.changeLanguage('en'); setLanguage('en'); }}
                            >
                                English
                            </Button>
                        </div>
                    </div>

                    {/* Theme */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                            <Moon className="w-5 h-5 text-gray-500" />
                            <div>
                                <p className="font-medium text-gray-900">Theme</p>
                                <p className="text-sm text-gray-500">Switch between light and dark mode</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={toggleTheme}>
                            {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
                <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-gray-500">
                        Your family tree is stored locally on this device. You can export it to a file for backup or transfer.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button onClick={exportTreeToJSON} className="flex-1">
                            <Download className="w-4 h-4 mr-2" />
                            {t('actions.export')}
                        </Button>

                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1">
                            <Upload className="w-4 h-4 mr-2" />
                            {t('actions.import')}
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".json"
                            onChange={handleImport}
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
                        <Button variant="danger" onClick={handleClear} className="w-full sm:w-auto">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete All Data
                        </Button>

                        <Button variant="secondary" onClick={() => {
                            const { generateSampleData } = require('../utils/sampleData'); // Dynamic import or just import top level
                            const data = generateSampleData();
                            useFamilyStore.getState().setTree(data);
                            alert('Sample data generated!');
                        }} className="w-full sm:w-auto">
                            Generate Sample Data
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

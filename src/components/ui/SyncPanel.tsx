import React from 'react';
import { Cloud, CloudOff, RefreshCw, X, Clock } from 'lucide-react';
import { useFamily } from '../../context/FamilyContext';

export const SyncPanel: React.FC = () => {
    const { syncStatus, toggleSync, syncNow, error } = useFamily();

    const formatLastSync = (date: Date | null): string => {
        if (!date) return 'Never';

        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} min ago`;
        if (hours < 24) return `${hours} hr ago`;
        return `${days} days ago`;
    };

    const handleSyncToggle = () => {
        toggleSync(!syncStatus.enabled);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {syncStatus.enabled ? (
                        <Cloud className="w-5 h-5 text-blue-600" />
                    ) : (
                        <CloudOff className="w-5 h-5 text-gray-400" />
                    )}
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        Cloud Sync
                    </h3>
                </div>

                <button
                    onClick={handleSyncToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${syncStatus.enabled ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                    aria-label="Toggle sync"
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${syncStatus.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                    />
                </button>
            </div>

            {syncStatus.enabled && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>Last sync:</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                            {formatLastSync(syncStatus.lastSync)}
                        </span>
                    </div>

                    {error && error.includes('Sync') && (
                        <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-600 dark:text-red-400">
                            <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        onClick={syncNow}
                        disabled={syncStatus.syncing}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${syncStatus.syncing
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                            }`}
                    >
                        {syncStatus.syncing ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Syncing...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                Sync Now
                            </>
                        )}
                    </button>

                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {syncStatus.enabled
                                ? '✓ Data is backed up to MongoDB cloud'
                                : '○ Working in offline mode'}
                        </p>
                    </div>
                </div>
            )}

            {!syncStatus.enabled && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enable cloud sync to backup your family tree data to MongoDB and access it from multiple devices.
                </p>
            )}
        </div>
    );
};

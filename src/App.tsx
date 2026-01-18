import React, { useState } from 'react';
import { FamilyProvider, useFamily } from './context/FamilyContext';
import { TreeCanvas } from './components/tree/TreeCanvas';
import { MemberModal } from './components/ui/MemberModal';
import { translations } from './utils/translations';
import { Search, Menu, Download, Settings, Plus, Users } from 'lucide-react';

const AppContent = () => {
  const { settings, setLanguage, exportData, openModal } = useFamily();
  const t = translations[settings.language];
  const [view, setView] = useState<'tree' | 'list'>('tree');
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <MemberModal />

      {/* HEADER - Mobile Optimized */}
      <header className="bg-gradient-to-r from-orange-600 to-red-700 text-white shadow-lg z-50 sticky top-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm flex-shrink-0">
              <Users size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-lg md:text-xl font-bold leading-tight truncate">
                {translations['te'].appName}
              </h1>
              <p className="text-[10px] sm:text-xs text-orange-100 opacity-90 truncate">Gonugunta Family Tree</p>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <button
              onClick={() => setLanguage(settings.language === 'te' ? 'en' : 'te')}
              className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-bold bg-white text-orange-700 rounded-full shadow-sm touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle language"
            >
              {settings.language === 'te' ? 'ENG' : 'తెలుగు'}
            </button>
            <button
              className="p-2 sm:p-2.5 hover:bg-white/10 rounded-full touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Menu"
            >
              <Menu size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* TOOLBAR - Mobile Optimized */}
      <div className="bg-white border-b border-orange-100 px-2 sm:px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto scrollbar-thin">
        <div className="flex bg-gray-100 rounded-lg p-1 flex-shrink-0">
          <button
            onClick={() => setView('tree')}
            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all touch-manipulation ${view === 'tree' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}
          >
            Tree View
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all touch-manipulation ${view === 'list' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}
          >
            List View
          </button>
        </div>

        <div className="flex space-x-2 flex-shrink-0">
          <button
            onClick={exportData}
            className="flex items-center space-x-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-xs sm:text-sm hover:bg-green-100 touch-manipulation min-h-[44px]"
            aria-label="Export data"
          >
            <Download size={16} />
            <span className="hidden sm:inline">{t.export}</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 relative bg-orange-50/50">
        {view === 'tree' ? (
          <TreeCanvas />
        ) : (
          <div className="p-4 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
              {/* List View Implementation would go here */}
              <p>List View is under construction. Please use Tree View to add members.</p>
            </div>
          </div>
        )}
      </main>

      {/* FLOATING ACTION BUTTON - Mobile Optimized with Safe Area */}
      <button
        onClick={() => openModal('add')}
        className="fixed bottom-6 right-6 w-14 h-14 sm:w-16 sm:h-16 bg-orange-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-orange-700 hover:scale-105 active:scale-95 transition-all z-40 touch-manipulation"
        style={{
          bottom: 'max(1.5rem, env(safe-area-inset-bottom))',
          right: 'max(1.5rem, env(safe-area-inset-right))'
        }}
        aria-label="Add member"
      >
        <Plus size={28} className="sm:w-8 sm:h-8" />
      </button>
    </div>
  );
};

export default function App() {
  return (
    <FamilyProvider>
      <AppContent />
    </FamilyProvider>
  );
}

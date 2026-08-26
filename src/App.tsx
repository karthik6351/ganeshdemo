import { useState } from 'react';
import { FamilyProvider, useFamily } from './context/FamilyContext';
import { TreeCanvas } from './components/tree/TreeCanvas';
import { MemberModal } from './components/ui/MemberModal';
import { translations } from './utils/translations';
import { Download, Plus, Users, X, Edit, Eye } from 'lucide-react';

const AppContent = () => {
  const { exportData, openModal, settings, setLanguage } = useFamily();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editMode, setEditMode] = useState(false); // New: Edit mode state

  const toggleEditMode = () => {
    setEditMode(!editMode);
    setDrawerOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <MemberModal />

      {/* HEADER */}
      <header className="bg-gradient-to-r from-orange-600 to-red-700 text-white shadow-lg z-50 sticky top-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          {/* Logo - Clickable to open drawer */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center space-x-2 sm:space-x-3 hover:opacity-90 transition-opacity touch-manipulation"
          >
            <img
              src="/logo.jpg"
              alt="Ganesh Demo Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white/80 shadow-lg"
            />
            <div className="text-left flex flex-col justify-center">
              <h1 className="text-sm sm:text-lg md:text-xl font-bold leading-tight">
                {translations[settings.language || 'en'].appName || 'Ganesh Demo'}
              </h1>
              <p className="text-[10px] sm:text-xs text-orange-100 opacity-90">Ganesh Mandapa Demo</p>
            </div>
          </button>

          {/* Branding and Mode indicator */}
          <div className="flex flex-col items-end gap-1">
            <a href="https://mangolabz.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-[8px] sm:text-[10px] text-white/80 hover:text-white uppercase tracking-wider font-bold">
              DESIGNED by mango Labz
            </a>
            {editMode && (
              <div className="bg-yellow-500/90 text-white px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1">
                <Edit size={12} />
                <span className="hidden sm:inline">Edit Mode</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Side Drawer */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-[70]">
            <div className="flex flex-col h-full">
              {/* Drawer Header */}
              <div className="bg-gradient-to-r from-orange-600 to-red-700 text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src="/logo.jpg"
                    alt="Logo"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  <div>
                    <h2 className="font-bold text-lg">Menu</h2>
                    <p className="text-xs opacity-90">Ganesh Demo</p>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <nav className="space-y-2">
                  {/* Toggle Edit/View Mode */}
                  <button
                    onClick={toggleEditMode}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-orange-50 transition-colors text-left group"
                  >
                    <div className={`p-2 rounded-lg group-hover:bg-orange-200 transition-colors ${editMode ? 'bg-orange-200' : 'bg-orange-100'}`}>
                      {editMode ? <Eye className="w-5 h-5 text-orange-600" /> : <Edit className="w-5 h-5 text-orange-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {editMode ? 'View Mode' : 'Edit Data'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {editMode ? 'Switch to read-only view' : 'Add or modify family members'}
                      </p>
                    </div>
                  </button>

                  {/* Tree View */}
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-orange-50 transition-colors text-left group"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Tree View</p>
                      <p className="text-xs text-gray-500">Visual family tree</p>
                    </div>
                  </button>

                  {/* Export Data */}
                  <button
                    onClick={() => {
                      exportData();
                      setDrawerOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-orange-50 transition-colors text-left group"
                  >
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <Download className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Export Data</p>
                      <p className="text-xs text-gray-500">Download family tree backup</p>
                    </div>
                  </button>

                  {/* Language Switcher */}
                  <div className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200">
                    <p className="font-medium text-gray-900 mb-2 text-sm">Language / భాష</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setLanguage('en');
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${settings.language === 'en'
                          ? 'bg-orange-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                          }`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => {
                          setLanguage('te');
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${settings.language === 'te'
                          ? 'bg-orange-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                          }`}
                      >
                        తెలుగు
                      </button>
                    </div>
                  </div>
                </nav>

                {/* Mode Status */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 font-medium mb-1">Current Mode:</p>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    {editMode ? (
                      <><Edit size={16} className="text-orange-600" /> Edit Mode - Click members to edit</>
                    ) : (
                      <><Eye size={16} className="text-blue-600" /> View Only - Read-only access</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden bg-orange-50">
        <TreeCanvas editMode={editMode} />
      </main>

      {/* FAB - Add Member (Always visible) */}
      <button
        onClick={() => openModal('add')}
        className="fixed w-14 h-14 sm:w-16 sm:h-16 bg-orange-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-orange-700 hover:scale-105 active:scale-95 transition-all z-40 touch-manipulation"
        style={{
          bottom: 'max(1.5rem, env(safe-area-inset-bottom))',
          right: 'max(1.5rem, env(safe-area-inset-right))'
        }}
        aria-label="Add member"
      >
        <Plus size={28} />
      </button>

      {/* Edit Mode Toggle FAB (Quick access) */}
      <button
        onClick={toggleEditMode}
        className={`fixed w-12 h-12 sm:w-14 sm:h-14 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 touch-manipulation ${editMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'
          }`}
        style={{
          bottom: 'max(5.5rem, calc(env(safe-area-inset-bottom) + 4rem))',
          right: 'max(1.5rem, env(safe-area-inset-right))'
        }}
        aria-label="Toggle edit mode"
      >
        {editMode ? <Eye size={22} /> : <Edit size={22} />}
      </button>
    </div>
  );
};

function App() {
  return (
    <FamilyProvider>
      <AppContent />
    </FamilyProvider>
  );
}

export default App;

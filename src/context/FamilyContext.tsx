import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Member, Branch } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Sample Data
const INITIAL_DATA: AppState = {
    members: [
        {
            id: 'root-1',
            firstName: 'వెంకటేశ్వర్లు',
            gender: 'male',
            isAlive: false,
            branchId: 'main',
            notes: 'మూల పురుషుడు'
        }
    ],
    branches: [{ id: 'main', name: 'ప్రధాన శాఖ' }],
    settings: { language: 'te', darkMode: false, locked: false }
};

interface ModalState {
    isOpen: boolean;
    mode: 'add' | 'edit';
    data?: Partial<Member> | null;
    parentId?: string; // For adding children
    spouseId?: string; // For adding spouse
}

interface FamilyContextType extends AppState {
    addMember: (member: Omit<Member, 'id'>) => void;
    updateMember: (id: string, data: Partial<Member>) => void;
    deleteMember: (id: string) => void;
    setLanguage: (lang: 'te' | 'en') => void;
    exportData: () => void;

    // Modal State
    modalState: ModalState;
    openModal: (mode: 'add' | 'edit', data?: Partial<Member> | null, parentId?: string, spouseId?: string) => void;
    closeModal: () => void;
}

const FamilyContext = createContext<FamilyContextType | null>(null);

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AppState>(() => {
        const saved = localStorage.getItem('gonugunta_tree_v1');
        return saved ? JSON.parse(saved) : INITIAL_DATA;
    });

    const [modalState, setModalState] = useState<ModalState>({
        isOpen: false,
        mode: 'add',
        data: null
    });

    useEffect(() => {
        localStorage.setItem('gonugunta_tree_v1', JSON.stringify(state));
    }, [state]);

    const addMember = (data: Omit<Member, 'id'>) => {
        const newMember = { ...data, id: uuidv4() };
        setState(prev => ({ ...prev, members: [...prev.members, newMember] }));
    };

    const updateMember = (id: string, data: Partial<Member>) => {
        setState(prev => ({
            ...prev,
            members: prev.members.map(m => m.id === id ? { ...m, ...data } : m)
        }));
    };

    const deleteMember = (id: string) => {
        if (!window.confirm("మీరు ఖచ్చితంగా తొలగించాలనుకుంటున్నారా?")) return;
        setState(prev => ({
            ...prev,
            members: prev.members.filter(m => m.id !== id)
        }));
    };

    const setLanguage = (lang: 'te' | 'en') => {
        setState(prev => ({ ...prev, settings: { ...prev.settings, language: lang } }));
    };

    const exportData = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "gonugunta_tree_backup.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const openModal = (mode: 'add' | 'edit', data: Partial<Member> | null = null, parentId?: string, spouseId?: string) => {
        setModalState({ isOpen: true, mode, data, parentId, spouseId });
    };

    const closeModal = () => {
        setModalState(prev => ({ ...prev, isOpen: false, data: null, parentId: undefined, spouseId: undefined }));
    };

    return (
        <FamilyContext.Provider value={{
            ...state,
            addMember,
            updateMember,
            deleteMember,
            setLanguage,
            exportData,
            modalState,
            openModal,
            closeModal
        }}>
            {children}
        </FamilyContext.Provider>
    );
};

export const useFamily = () => {
    const context = useContext(FamilyContext);
    if (!context) throw new Error("useFamily must be used within FamilyProvider");
    return context;
};

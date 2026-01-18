import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Member, Branch } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { api } from '../services/api';

// Sample Data - used as fallback
const INITIAL_DATA: AppState = {
    members: [],
    branches: [{ id: 'main', name: 'ప్రధాన శాఖ' }],
    settings: { language: 'te', darkMode: false, locked: false }
};

interface ModalState {
    isOpen: boolean;
    mode: 'add' | 'edit';
    data?: Partial<Member> | null;
    parentId?: string;
    spouseId?: string;
}

interface FamilyContextType extends AppState {
    addMember: (member: Omit<Member, 'id'>) => Promise<void>;
    updateMember: (id: string, data: Partial<Member>) => Promise<void>;
    deleteMember: (id: string) => Promise<void>;
    setLanguage: (lang: 'te' | 'en') => void;
    exportData: () => void;
    loading: boolean;
    error: string | null;

    // Modal State
    modalState: ModalState;
    openModal: (mode: 'add' | 'edit', data?: Partial<Member> | null, parentId?: string, spouseId?: string) => void;
    closeModal: () => void;
}

const FamilyContext = createContext<FamilyContextType | null>(null);

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AppState>(INITIAL_DATA);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [modalState, setModalState] = useState<ModalState>({
        isOpen: false,
        mode: 'add',
        data: null
    });

    // Fetch members from API on mount
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                setLoading(true);
                const members = await api.getMembers();
                setState(prev => ({ ...prev, members }));
                setError(null);
            } catch (err) {
                console.error('Error fetching members:', err);
                setError('Failed to load family tree data');
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, []);

    const addMember = async (data: Omit<Member, 'id'>) => {
        try {
            const newMember = { ...data, id: uuidv4() };
            const createdMember = await api.createMember(newMember);
            setState(prev => ({ ...prev, members: [...prev.members, createdMember] }));
        } catch (err) {
            console.error('Error adding member:', err);
            alert('Failed to add member. Please try again.');
            throw err;
        }
    };

    const updateMember = async (id: string, data: Partial<Member>) => {
        try {
            const updatedMember = await api.updateMember(id, data);
            setState(prev => ({
                ...prev,
                members: prev.members.map(m => m.id === id ? updatedMember : m)
            }));
        } catch (err) {
            console.error('Error updating member:', err);
            alert('Failed to update member. Please try again.');
            throw err;
        }
    };

    const deleteMember = async (id: string) => {
        if (!window.confirm("మీరు ఖచ్చితంగా తొలగించాలనుకుంటున్నారా?")) return;
        try {
            await api.deleteMember(id);
            setState(prev => ({
                ...prev,
                members: prev.members.filter(m => m.id !== id)
            }));
        } catch (err) {
            console.error('Error deleting member:', err);
            alert('Failed to delete member. Please try again.');
            throw err;
        }
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
            loading,
            error,
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

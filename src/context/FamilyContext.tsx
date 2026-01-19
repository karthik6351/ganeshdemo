import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Member } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { api } from '../services/api';
import { generateSampleData } from '../utils/sampleData';

// Initial data structure
const INITIAL_DATA: AppState = {
    members: [],
    branches: [{ id: 'main', name: 'ప్రధాన శాఖ', description: 'Main family branch' }],
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
    importData: (jsonString: string) => Promise<void>;
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

    // Fetch members from MongoDB on mount
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                setLoading(true);
                setError(null);
                const members = await api.getMembers();

                // If no members exist, initialize with sample data
                if (members.length === 0) {
                    console.log('No members found, initializing with sample data...');
                    const sampleData = generateSampleData();

                    // Create all sample members in MongoDB
                    for (const member of sampleData.members) {
                        await api.createMember(member);
                    }

                    // Fetch again to get the created members
                    const newMembers = await api.getMembers();
                    setState(prev => ({ ...prev, members: newMembers }));
                } else {
                    setState(prev => ({ ...prev, members }));
                }
            } catch (err) {
                console.error('Error fetching members:', err);
                setError('Failed to load family tree data. Make sure MongoDB server is running.');
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, []);

    const addMember = async (data: Omit<Member, 'id'>) => {
        try {
            const newMember: Member = {
                ...data,
                id: uuidv4(),
                isAlive: data.isAlive ?? true
            } as Member;

            const createdMember = await api.createMember(newMember);

            // If this is a spouse, update the original member to link back (bidirectional)
            if (data.spouseId) {
                const originalSpouse = state.members.find(m => m.id === data.spouseId);
                if (originalSpouse) {
                    await api.updateMember(data.spouseId, { spouseId: createdMember.id });
                    setState(prev => ({
                        ...prev,
                        members: [
                            ...prev.members.map(m =>
                                m.id === data.spouseId
                                    ? { ...m, spouseId: createdMember.id }
                                    : m
                            ),
                            createdMember
                        ]
                    }));
                } else {
                    setState(prev => ({ ...prev, members: [...prev.members, createdMember] }));
                }
            } else {
                setState(prev => ({ ...prev, members: [...prev.members, createdMember] }));
            }
        } catch (err) {
            console.error('Error adding member:', err);
            setError('Failed to add member');
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
            setError('Failed to update member');
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
            setError('Failed to delete member');
            throw err;
        }
    };

    const setLanguage = (lang: 'te' | 'en') => {
        setState(prev => ({ ...prev, settings: { ...prev.settings, language: lang } }));
    };

    const exportData = () => {
        const dataStr = JSON.stringify(state, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", url);
        downloadAnchorNode.setAttribute("download", `gonugunta_tree_backup_${Date.now()}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        URL.revokeObjectURL(url);
    };

    const importData = async (jsonString: string) => {
        try {
            const imported = JSON.parse(jsonString) as Partial<AppState>;

            if (imported.members && Array.isArray(imported.members)) {
                // Clear existing members and add imported ones
                const currentMembers = await api.getMembers();

                // Delete all existing members
                for (const member of currentMembers) {
                    await api.deleteMember(member.id);
                }

                // Add imported members
                for (const member of imported.members) {
                    await api.createMember(member);
                }

                // Refresh state
                const newMembers = await api.getMembers();
                setState(prev => ({ ...prev, members: newMembers }));
            }
        } catch (err) {
            console.error('Error importing data:', err);
            setError('Failed to import data. Please check the file format.');
            throw err;
        }
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
            importData,
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

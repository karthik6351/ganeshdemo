import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { FamilyTreeState, Member, Branch, Relationship } from '../types';

interface FamilyTreeActions {
    addMember: (member: Omit<Member, 'id' | 'relationships'> & { relationships?: Relationship[] }) => string;
    updateMember: (id: string, updates: Partial<Member>) => void;
    deleteMember: (id: string) => void;
    addBranch: (branch: Branch) => void;
    removeBranch: (id: string) => void;
    setTree: (state: Partial<FamilyTreeState>) => void;
    resetTree: () => void;
    getMember: (id: string) => Member | undefined;
}

const initialState: FamilyTreeState = {
    members: {},
    branches: {
        'main': { id: 'main', name: 'Main Branch' }
    },
    rootMemberId: undefined,
};

export const useFamilyStore = create<FamilyTreeState & FamilyTreeActions>()(
    persist(
        (set, get) => ({
            ...initialState,

            addMember: (memberData) => {
                const id = uuidv4();
                const newMember: Member = {
                    id,
                    relationships: [],
                    ...memberData,
                    metadata: {
                        created: Date.now(),
                        updated: Date.now(),
                    },
                };

                set((state) => ({
                    members: { ...state.members, [id]: newMember },
                    rootMemberId: state.rootMemberId ? state.rootMemberId : id, // First member becomes root if none exists
                }));
                return id;
            },

            updateMember: (id, updates) => {
                set((state) => {
                    const member = state.members[id];
                    if (!member) return state;
                    return {
                        members: {
                            ...state.members,
                            [id]: {
                                ...member,
                                ...updates,
                                metadata: {
                                    ...member.metadata!,
                                    updated: Date.now(),
                                },
                            },
                        },
                    };
                });
            },

            deleteMember: (id) => {
                set((state) => {
                    const { [id]: deleted, ...remainingMembers } = state.members;
                    // Also remove relationships pointing to this member
                    // This is a naive implementation; in a fuller one we'd clean up the other side of relationships
                    // But for a simple store, we might just filter them on render or clean strictly here.
                    // Let's clean strictly.

                    const cleanedMembers = Object.entries(remainingMembers).reduce((acc, [mId, m]) => {
                        acc[mId] = {
                            ...m,
                            relationships: m.relationships.filter(r => r.relatedMemberId !== id)
                        };
                        return acc;
                    }, {} as Record<string, Member>);

                    return {
                        members: cleanedMembers,
                        rootMemberId: state.rootMemberId === id ? undefined : state.rootMemberId,
                    };
                });
            },

            addBranch: (branch) => {
                set((state) => ({
                    branches: { ...state.branches, [branch.id]: branch },
                }));
            },

            removeBranch: (id) => {
                set((state) => {
                    const { [id]: deleted, ...remaining } = state.branches;
                    return { branches: remaining };
                });
            },

            setTree: (newState) => set((state) => ({ ...state, ...newState })),

            resetTree: () => set(initialState),

            getMember: (id) => get().members[id],
        }),
        {
            name: 'family-tree-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

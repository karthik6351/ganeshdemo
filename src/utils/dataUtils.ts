
import { useFamilyStore } from '../store/familyStore';

export const exportTreeToJSON = () => {
    const state = useFamilyStore.getState();
    const data = {
        members: state.members,
        branches: state.branches,
        rootMemberId: state.rootMemberId,
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `family_tree_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

export const importTreeFromJSON = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                // Basic validation
                if (!json.members || !json.branches) {
                    throw new Error('Invalid file format');
                }

                // Update store
                useFamilyStore.getState().setTree({
                    members: json.members,
                    branches: json.branches,
                    rootMemberId: json.rootMemberId
                });
                resolve();
            } catch (err) {
                reject(err);
            }
        };
        reader.readAsText(file);
    });
};

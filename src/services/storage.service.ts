import { Member, AppState, Branch } from '../types';

const STORAGE_KEY = 'family_tree_data';
const VERSION_KEY = 'family_tree_version';
const CURRENT_VERSION = '1.0.0';

export interface StorageData extends AppState {
    version: string;
    lastModified: number;
}

/**
 * Local Storage Service
 * Provides CRUD operations with automatic persistence to localStorage
 */
class LocalStorageService {
    private data: StorageData;

    constructor() {
        this.data = this.loadFromStorage();
    }

    /**
     * Load data from localStorage or return initial data
     */
    private loadFromStorage(): StorageData {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as StorageData;

                // Check version compatibility
                if (parsed.version !== CURRENT_VERSION) {
                    console.warn('Version mismatch, migrating data...');
                    return this.migrateData(parsed);
                }

                return parsed;
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }

        // Return initial empty state
        return {
            members: [],
            branches: [{ id: 'main', name: 'ప్రధాన శాఖ', description: 'Main family branch' }],
            settings: {
                language: 'te',
                darkMode: false,
                locked: false
            },
            version: CURRENT_VERSION,
            lastModified: Date.now()
        };
    }

    /**
     * Migrate data from old version to new version
     */
    private migrateData(oldData: any): StorageData {
        // Add migration logic here if schema changes
        return {
            ...oldData,
            version: CURRENT_VERSION,
            lastModified: Date.now()
        };
    }

    /**
     * Save data to localStorage
     */
    private saveToStorage(): void {
        try {
            this.data.lastModified = Date.now();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
            localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            throw new Error('Failed to save data to local storage');
        }
    }

    /**
     * Get all members
     */
    getMembers(): Member[] {
        return [...this.data.members];
    }

    /**
     * Get single member by ID
     */
    getMember(id: string): Member | undefined {
        return this.data.members.find(m => m.id === id);
    }

    /**
     * Add new member
     */
    addMember(member: Member): Member {
        // Check for duplicate ID
        if (this.data.members.some(m => m.id === member.id)) {
            throw new Error('Member with this ID already exists');
        }

        this.data.members.push(member);
        this.saveToStorage();
        return member;
    }

    /**
     * Update existing member
     */
    updateMember(id: string, updates: Partial<Member>): Member {
        const index = this.data.members.findIndex(m => m.id === id);
        if (index === -1) {
            throw new Error('Member not found');
        }

        this.data.members[index] = {
            ...this.data.members[index],
            ...updates,
            id // Ensure ID cannot be changed
        };

        this.saveToStorage();
        return this.data.members[index];
    }

    /**
     * Delete member
     */
    deleteMember(id: string): void {
        const index = this.data.members.findIndex(m => m.id === id);
        if (index === -1) {
            throw new Error('Member not found');
        }

        this.data.members.splice(index, 1);
        this.saveToStorage();
    }

    /**
     * Get all branches
     */
    getBranches(): Branch[] {
        return [...this.data.branches];
    }

    /**
     * Add new branch
     */
    addBranch(branch: Branch): Branch {
        if (this.data.branches.some(b => b.id === branch.id)) {
            throw new Error('Branch with this ID already exists');
        }

        this.data.branches.push(branch);
        this.saveToStorage();
        return branch;
    }

    /**
     * Get all data
     */
    getAllData(): AppState {
        return {
            members: this.data.members,
            branches: this.data.branches,
            settings: this.data.settings
        };
    }

    /**
     * Set all data (for import)
     */
    setAllData(data: Partial<AppState>): void {
        if (data.members) {
            this.data.members = data.members;
        }
        if (data.branches) {
            this.data.branches = data.branches;
        }
        if (data.settings) {
            this.data.settings = { ...this.data.settings, ...data.settings };
        }
        this.saveToStorage();
    }

    /**
     * Update settings
     */
    updateSettings(settings: Partial<AppState['settings']>): void {
        this.data.settings = { ...this.data.settings, ...settings };
        this.saveToStorage();
    }

    /**
     * Clear all data
     */
    clearAllData(): void {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(VERSION_KEY);
        this.data = this.loadFromStorage();
    }

    /**
     * Export data as JSON string
     */
    exportData(): string {
        return JSON.stringify(this.data, null, 2);
    }

    /**
     * Import data from JSON string
     */
    importData(jsonString: string): void {
        try {
            const imported = JSON.parse(jsonString) as Partial<StorageData>;
            this.setAllData(imported);
        } catch (error) {
            console.error('Error importing data:', error);
            throw new Error('Invalid JSON format');
        }
    }

    /**
     * Get storage statistics
     */
    getStats() {
        return {
            totalMembers: this.data.members.length,
            totalBranches: this.data.branches.length,
            livingMembers: this.data.members.filter(m => m.isAlive).length,
            deceasedMembers: this.data.members.filter(m => !m.isAlive).length,
            maleMembers: this.data.members.filter(m => m.gender === 'male').length,
            femaleMembers: this.data.members.filter(m => m.gender === 'female').length,
            lastModified: new Date(this.data.lastModified).toLocaleString(),
            version: this.data.version
        };
    }
}

// Export singleton instance
export const localStorageService = new LocalStorageService();

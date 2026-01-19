import { Member } from '../types';
import { localStorageService } from './storage.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SYNC_ENABLED_KEY = 'sync_enabled';
const LAST_SYNC_KEY = 'last_sync';

/**
 * Hybrid Sync Service
 * Manages sync between localStorage and MongoDB backend
 * - Works offline-first with localStorage
 * - Syncs with backend when available
 * - Graceful fallback when backend is offline
 */
class HybridSyncService {
    private syncEnabled: boolean;
    private syncInProgress: boolean = false;

    constructor() {
        this.syncEnabled = localStorage.getItem(SYNC_ENABLED_KEY) === 'true';
    }

    /**
     * Check if backend is available
     */
    private async checkBackendHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${API_URL.replace('/api', '')}/api/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(3000) // 3 second timeout
            });
            return response.ok;
        } catch (error) {
            console.warn('Backend not available:', error);
            return false;
        }
    }

    /**
     * Enable/disable sync
     */
    setSyncEnabled(enabled: boolean): void {
        this.syncEnabled = enabled;
        localStorage.setItem(SYNC_ENABLED_KEY, enabled.toString());
    }

    /**
     * Check if sync is enabled
     */
    isSyncEnabled(): boolean {
        return this.syncEnabled;
    }

    /**
     * Get last sync timestamp
     */
    getLastSync(): Date | null {
        const lastSync = localStorage.getItem(LAST_SYNC_KEY);
        return lastSync ? new Date(parseInt(lastSync)) : null;
    }

    /**
     * Set last sync timestamp
     */
    private setLastSync(): void {
        localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    }

    /**
     * Sync local data to backend
     */
    async syncToBackend(): Promise<{ success: boolean; message: string }> {
        if (!this.syncEnabled) {
            return { success: false, message: 'Sync is disabled' };
        }

        if (this.syncInProgress) {
            return { success: false, message: 'Sync already in progress' };
        }

        try {
            this.syncInProgress = true;

            // Check backend health
            const isHealthy = await this.checkBackendHealth();
            if (!isHealthy) {
                return { success: false, message: 'Backend is not available' };
            }

            // Get local members
            const localMembers = localStorageService.getMembers();

            // Fetch remote members
            const remoteMembersResponse = await this.fetchRemoteMembers();
            if (!remoteMembersResponse.success || !remoteMembersResponse.data) {
                return { success: false, message: remoteMembersResponse.message || 'Failed to fetch remote members' };
            }

            const remoteMembers = remoteMembersResponse.data || [];

            // Sync logic: local data takes precedence (last-write-wins)
            const membersToSync = this.resolveSyncConflicts(localMembers, remoteMembers);

            // Push local changes to backend
            for (const member of membersToSync.toCreate) {
                await this.createRemoteMember(member);
            }

            for (const member of membersToSync.toUpdate) {
                await this.updateRemoteMember(member);
            }

            for (const memberId of membersToSync.toDelete) {
                await this.deleteRemoteMember(memberId);
            }

            this.setLastSync();
            return { success: true, message: 'Sync completed successfully' };
        } catch (error) {
            console.error('Sync error:', error);
            return { success: false, message: `Sync failed: ${error}` };
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Sync backend data to local
     */
    async syncFromBackend(): Promise<{ success: boolean; message: string }> {
        if (!this.syncEnabled) {
            return { success: false, message: 'Sync is disabled' };
        }

        try {
            const isHealthy = await this.checkBackendHealth();
            if (!isHealthy) {
                return { success: false, message: 'Backend is not available' };
            }

            const response = await this.fetchRemoteMembers();
            if (!response.success || !response.data) {
                return { success: false, message: 'Failed to fetch remote data' };
            }

            // Replace local data with remote data
            localStorageService.setAllData({ members: response.data });
            this.setLastSync();

            return { success: true, message: 'Data synced from backend' };
        } catch (error) {
            console.error('Sync from backend error:', error);
            return { success: false, message: `Sync failed: ${error}` };
        }
    }

    /**
     * Resolve sync conflicts between local and remote data
     */
    private resolveSyncConflicts(localMembers: Member[], remoteMembers: Member[]) {
        const localIds = new Set(localMembers.map(m => m.id));
        const remoteIds = new Set(remoteMembers.map(m => m.id));

        const toCreate: Member[] = [];
        const toUpdate: Member[] = [];
        const toDelete: string[] = [];

        // Find members to create (in local but not in remote)
        for (const member of localMembers) {
            if (!remoteIds.has(member.id)) {
                toCreate.push(member);
            }
        }

        // Find members to update (in both, but local is newer)
        for (const localMember of localMembers) {
            const remoteMember = remoteMembers.find(m => m.id === localMember.id);
            if (remoteMember) {
                toUpdate.push(localMember);
            }
        }

        // Find members to delete (in remote but not in local)
        for (const remoteMember of remoteMembers) {
            if (!localIds.has(remoteMember.id)) {
                toDelete.push(remoteMember.id);
            }
        }

        return { toCreate, toUpdate, toDelete };
    }

    /**
     * Fetch all members from backend
     */
    private async fetchRemoteMembers(): Promise<{ success: boolean; data?: Member[]; message?: string }> {
        try {
            const response = await fetch(`${API_URL}/members`);
            if (!response.ok) {
                return { success: false, message: 'Failed to fetch members' };
            }
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, message: `Error: ${error}` };
        }
    }

    /**
     * Create member on backend
     */
    private async createRemoteMember(member: Member): Promise<void> {
        const response = await fetch(`${API_URL}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(member)
        });

        if (!response.ok) {
            throw new Error('Failed to create member on backend');
        }
    }

    /**
     * Update member on backend
     */
    private async updateRemoteMember(member: Member): Promise<void> {
        const response = await fetch(`${API_URL}/members/${member.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(member)
        });

        if (!response.ok) {
            throw new Error('Failed to update member on backend');
        }
    }

    /**
     * Delete member on backend
     */
    private async deleteRemoteMember(id: string): Promise<void> {
        const response = await fetch(`${API_URL}/members/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete member on backend');
        }
    }

    /**
     * Get all members (from local storage)
     */
    async getMembers(): Promise<Member[]> {
        // Always return from local storage (offline-first)
        return localStorageService.getMembers();
    }

    /**
     * Get single member
     */
    async getMember(id: string): Promise<Member | undefined> {
        return localStorageService.getMember(id);
    }

    /**
     * Create member (local + optional sync)
     */
    async createMember(member: Member): Promise<Member> {
        // Add to local storage first
        const created = localStorageService.addMember(member);

        // Try to sync to backend if enabled
        if (this.syncEnabled) {
            try {
                const isHealthy = await this.checkBackendHealth();
                if (isHealthy) {
                    await this.createRemoteMember(created);
                }
            } catch (error) {
                console.warn('Failed to sync create to backend:', error);
                // Continue anyway - local data is saved
            }
        }

        return created;
    }

    /**
     * Update member (local + optional sync)
     */
    async updateMember(id: string, updates: Partial<Member>): Promise<Member> {
        // Update local storage first
        const updated = localStorageService.updateMember(id, updates);

        // Try to sync to backend if enabled
        if (this.syncEnabled) {
            try {
                const isHealthy = await this.checkBackendHealth();
                if (isHealthy) {
                    await this.updateRemoteMember(updated);
                }
            } catch (error) {
                console.warn('Failed to sync update to backend:', error);
                // Continue anyway - local data is saved
            }
        }

        return updated;
    }

    /**
     * Delete member (local + optional sync)
     */
    async deleteMember(id: string): Promise<void> {
        // Delete from local storage first
        localStorageService.deleteMember(id);

        // Try to sync to backend if enabled
        if (this.syncEnabled) {
            try {
                const isHealthy = await this.checkBackendHealth();
                if (isHealthy) {
                    await this.deleteRemoteMember(id);
                }
            } catch (error) {
                console.warn('Failed to sync delete to backend:', error);
                // Continue anyway - local data is deleted
            }
        }
    }
}

// Export singleton instance
export const hybridSyncService = new HybridSyncService();

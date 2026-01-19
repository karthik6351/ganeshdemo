import { Member } from '../types';

const API_URL = '/api';

export const api = {
    // Get all members
    async getMembers(): Promise<Member[]> {
        const response = await fetch(`${API_URL}/members`);
        if (!response.ok) throw new Error('Failed to fetch members');
        return response.json();
    },

    // Get single member
    async getMember(id: string): Promise<Member> {
        const response = await fetch(`${API_URL}/members/${id}`);
        if (!response.ok) throw new Error('Failed to fetch member');
        return response.json();
    },

    // Create member
    async createMember(member: Member): Promise<Member> {
        const response = await fetch(`${API_URL}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(member)
        });
        if (!response.ok) throw new Error('Failed to create member');
        return response.json();
    },

    // Update member
    async updateMember(id: string, data: Partial<Member>): Promise<Member> {
        const response = await fetch(`${API_URL}/members/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update member');
        return response.json();
    },

    // Delete member
    async deleteMember(id: string): Promise<void> {
        const response = await fetch(`${API_URL}/members/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete member');
    }
};

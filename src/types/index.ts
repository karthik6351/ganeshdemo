export type Gender = 'male' | 'female' | 'other';
export type RelationType = 'spouse' | 'child' | 'parent';

export interface Member {
    id: string;
    firstName: string; // Telugu preferred
    lastName?: string;
    gender: Gender;
    dob?: string;
    dod?: string; // Date of death (optional)
    isAlive: boolean;
    photoUrl?: string;
    phone?: string;
    location?: string;
    notes?: string;

    // Relations
    fatherId?: string;
    motherId?: string;
    spouseId?: string;

    // Metadata
    branchId: string;
}

export interface Branch {
    id: string;
    name: string;
    description?: string;
}

export interface AppState {
    members: Member[];
    branches: Branch[];
    settings: {
        language: 'te' | 'en';
        darkMode: boolean;
        locked: boolean;
    };
}

import { Member, AppState } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate sample family tree data for testing
 */
export const generateSampleData = (): AppState => {
    // Root couple
    const root1Id = uuidv4();
    const root1SpouseId = uuidv4();

    // First generation (children of root couple)
    const child1Id = uuidv4();
    const child2Id = uuidv4();
    const child3Id = uuidv4();

    // Second generation (grandchildren)
    const grandchild1Id = uuidv4();
    const grandchild2Id = uuidv4();

    const members: Member[] = [
        // Root couple
        {
            id: root1Id,
            firstName: 'రామారావు',
            lastName: 'గోనుగుంట',
            gender: 'male',
            dob: '1950-05-15',
            isAlive: false,
            branchId: 'main',
            spouseId: root1SpouseId,
            location: 'Guntur, AP',
            notes: 'మూల పురుషుడు'
        },
        {
            id: root1SpouseId,
            firstName: 'లక్ష్మీ',
            lastName: 'గోనుగుంట',
            gender: 'female',
            dob: '1955-08-20',
            isAlive: true,
            branchId: 'main',
            spouseId: root1Id,
            location: 'Guntur, AP'
        },

        // First generation
        {
            id: child1Id,
            firstName: 'శ్రీనివాస్',
            lastName: 'గోనుగుంట',
            gender: 'male',
            dob: '1975-03-10',
            isAlive: true,
            branchId: 'main',
            fatherId: root1Id,
            motherId: root1SpouseId,
            location: 'Hyderabad, TS',
            phone: '9876543210',
            notes: 'Software Engineer'
        },
        {
            id: child2Id,
            firstName: 'కవిత',
            lastName: 'గోనుగుంట',
            gender: 'female',
            dob: '1978-07-25',
            isAlive: true,
            branchId: 'main',
            fatherId: root1Id,
            motherId: root1SpouseId,
            location: 'Vijayawada, AP'
        },
        {
            id: child3Id,
            firstName: 'రవి',
            lastName: 'గోనుగుంట',
            gender: 'male',
            dob: '1982-11-05',
            isAlive: true,
            branchId: 'main',
            fatherId: root1Id,
            motherId: root1SpouseId,
            location: 'Bangalore, KA',
            phone: '9123456789'
        },

        // Second generation (grandchildren)
        {
            id: grandchild1Id,
            firstName: 'ప్రియ',
            lastName: 'గోనుగుంట',
            gender: 'female',
            dob: '2005-01-15',
            isAlive: true,
            branchId: 'main',
            fatherId: child1Id,
            location: 'Hyderabad, TS',
            notes: 'College student'
        },
        {
            id: grandchild2Id,
            firstName: 'అర్జున్',
            lastName: 'గోనుగుంట',
            gender: 'male',
            dob: '2008-09-20',
            isAlive: true,
            branchId: 'main',
            fatherId: child1Id,
            location: 'Hyderabad, TS',
            notes: 'High school student'
        }
    ];

    return {
        members,
        branches: [
            {
                id: 'main',
                name: 'ప్రధాన శాఖ',
                description: 'గోనుగుంట వంశ ప్రధాన శాఖ'
            }
        ],
        settings: {
            language: 'te',
            darkMode: false,
            locked: false
        }
    };
};

/**
 * Initialize sample data if no data exists
 */
export const initializeSampleData = (): boolean => {
    try {
        const stored = localStorage.getItem('family_tree_data');
        if (!stored || JSON.parse(stored).members.length === 0) {
            const sampleData = generateSampleData();
            localStorage.setItem('family_tree_data', JSON.stringify({
                ...sampleData,
                version: '1.0.0',
                lastModified: Date.now()
            }));
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error initializing sample data:', error);
        return false;
    }
};

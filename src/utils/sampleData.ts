import { v4 as uuidv4 } from 'uuid';
import { FamilyTreeState, Member } from '../types';

export const generateSampleData = (): Partial<FamilyTreeState> => {
    const rootId = uuidv4();
    const spouseId = uuidv4();
    const child1Id = uuidv4();
    const child2Id = uuidv4();
    const grandChildId = uuidv4();

    const members: Record<string, Member> = {
        [rootId]: {
            id: rootId,
            firstName: 'Ramarao',
            lastName: 'Gonugunta',
            gender: 'male',
            dob: '1950-01-01',
            isLiving: true,
            branchId: 'main',
            relationships: [
                { id: uuidv4(), type: 'spouse', relatedMemberId: spouseId },
                { id: uuidv4(), type: 'parent', relatedMemberId: child1Id }, // Implies child1 is child
                { id: uuidv4(), type: 'parent', relatedMemberId: child2Id },
            ],
            metadata: { created: Date.now(), updated: Date.now() }
        },
        [spouseId]: {
            id: spouseId,
            firstName: 'Lakshmi',
            lastName: 'Gonugunta',
            gender: 'female',
            dob: '1955-05-15',
            isLiving: true,
            branchId: 'main',
            relationships: [
                { id: uuidv4(), type: 'spouse', relatedMemberId: rootId },
                { id: uuidv4(), type: 'parent', relatedMemberId: child1Id },
                { id: uuidv4(), type: 'parent', relatedMemberId: child2Id },
            ],
            metadata: { created: Date.now(), updated: Date.now() }
        },
        [child1Id]: {
            id: child1Id,
            firstName: 'Srinivas',
            lastName: 'Gonugunta',
            gender: 'male',
            dob: '1980-08-20',
            isLiving: true,
            branchId: 'main',
            relationships: [
                { id: uuidv4(), type: 'child', relatedMemberId: rootId },
                { id: uuidv4(), type: 'child', relatedMemberId: spouseId },
                { id: uuidv4(), type: 'parent', relatedMemberId: grandChildId },
            ],
            metadata: { created: Date.now(), updated: Date.now() }
        },
        [child2Id]: {
            id: child2Id,
            firstName: 'Kavitha',
            lastName: 'Gonugunta',
            gender: 'female',
            dob: '1985-02-10',
            isLiving: true,
            branchId: 'main',
            relationships: [
                { id: uuidv4(), type: 'child', relatedMemberId: rootId },
                { id: uuidv4(), type: 'child', relatedMemberId: spouseId },
            ],
            metadata: { created: Date.now(), updated: Date.now() }
        },
        [grandChildId]: {
            id: grandChildId,
            firstName: 'Chintu',
            lastName: 'Gonugunta',
            gender: 'male',
            dob: '2010-11-14',
            isLiving: true,
            branchId: 'main',
            relationships: [
                { id: uuidv4(), type: 'child', relatedMemberId: child1Id },
            ],
            metadata: { created: Date.now(), updated: Date.now() }
        }
    };

    return {
        members,
        rootMemberId: rootId,
        branches: { 'main': { id: 'main', name: 'Main Branch' } }
    };
};

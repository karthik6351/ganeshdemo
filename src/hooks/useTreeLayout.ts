import { useMemo } from 'react';
import { Member } from '../types';

interface TreeNode {
    id: string;
    x: number;
    y: number;
    data: Member;
    children: TreeNode[];
    spouses: TreeNode[];
}

interface TreeLayout {
    nodes: { id: string; x: number; y: number; data: Member }[];
    links: { source: { x: number; y: number }; target: { x: number; y: number }; type: 'parent' | 'spouse' }[];
    width: number;
    height: number;
}

export const useTreeLayout = (
    members: Record<string, Member>,
    rootId?: string
): TreeLayout => {
    return useMemo(() => {
        if (!rootId || !members[rootId]) {
            return { nodes: [], links: [], width: 0, height: 0 };
        }

        // Simplified layout logic for MVP
        // In a real app, use d3-hierarchy or elkjs
        // Here we'll do a simple generation-based layout

        const NODE_WIDTH = 120;
        const NODE_HEIGHT = 80;
        const HORIZONTAL_GAP = 40;
        const VERTICAL_GAP = 100;

        const levels: Record<number, string[]> = {};
        const positions: Record<string, { x: number; y: number }> = {};
        const visited = new Set<string>();

        const nodes: TreeLayout['nodes'] = [];
        const links: TreeLayout['links'] = [];

        // Helper to find children
        const getChildren = (id: string) => {
            const member = members[id];
            if (!member) return [];
            // Find members who list this 'id' as 'parent' 
            // OR members listed in this 'id's relationships as 'child'
            // My schema allows both, but let's assume consistent "relatedMemberId"

            return Object.values(members).filter(m =>
                m.relationships.some(r => r.relatedMemberId === id && r.type === 'parent')
            ).map(m => m.id);
        };

        // BFS to assign levels
        const queue: { id: string; level: number }[] = [{ id: rootId, level: 0 }];
        visited.add(rootId);

        while (queue.length > 0) {
            const { id, level } = queue.shift()!;
            if (!levels[level]) levels[level] = [];
            levels[level].push(id);

            const children = getChildren(id);
            children.forEach(childId => {
                if (!visited.has(childId)) {
                    visited.add(childId);
                    queue.push({ id: childId, level: level + 1 });
                }
            });
        }

        // Assign X positions (centering)
        let maxWidth = 0;
        const levelDepths = Object.keys(levels).map(Number).sort((a, b) => a - b);

        levelDepths.forEach(level => {
            const ids = levels[level];
            const levelWidth = ids.length * (NODE_WIDTH + HORIZONTAL_GAP) - HORIZONTAL_GAP;
            maxWidth = Math.max(maxWidth, levelWidth);

            let startX = -levelWidth / 2;

            ids.forEach((id, index) => {
                const x = startX + index * (NODE_WIDTH + HORIZONTAL_GAP); // + NODE_WIDTH/2
                const y = level * (NODE_HEIGHT + VERTICAL_GAP);
                positions[id] = { x, y };
                nodes.push({ id, x, y, data: members[id] });
            });
        });

        // Create links
        nodes.forEach(node => {
            const children = getChildren(node.id);
            children.forEach(childId => {
                const childPos = positions[childId];
                if (childPos) {
                    links.push({
                        source: { x: node.x + NODE_WIDTH / 2, y: node.y + NODE_HEIGHT },
                        target: { x: childPos.x + NODE_WIDTH / 2, y: childPos.y },
                        type: 'parent'
                    });
                }
            });
        });

        return {
            nodes,
            links,
            width: maxWidth + 200,
            height: (levelDepths.length * (NODE_HEIGHT + VERTICAL_GAP)) + 200
        };
    }, [members, rootId]);
};

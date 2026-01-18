import React from 'react';

interface TreeLinkProps {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    type?: 'parent' | 'spouse';
}

export const TreeLink: React.FC<TreeLinkProps> = ({ x1, y1, x2, y2, type = 'parent' }) => {
    // Beziers for smooth curves
    const midY = y1 + (y2 - y1) / 2;
    const path = type === 'parent'
        ? `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`
        : `M ${x1} ${y1} L ${x2} ${y2}`; // Spouse link might be straight or curved differently

    return (
        <path
            d={path}
            fill="none"
            stroke={type === 'spouse' ? '#f59e0b' : '#94a3b8'}
            strokeWidth={2}
            strokeDasharray={type === 'spouse' ? '4 4' : 'none'}
            className="transition-all duration-300"
        />
    );
};

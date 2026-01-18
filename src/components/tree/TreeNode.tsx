import React from 'react';
import { User, Heart } from 'lucide-react';
import { Member } from '../../types';
import { cn } from '../../utils/cn';

interface TreeNodeProps {
    member: Member;
    onClick: (id: string) => void;
    selected?: boolean;
    style?: React.CSSProperties;
}

export const TreeNode: React.FC<TreeNodeProps> = ({ member, onClick, selected, style }) => {
    return (
        <div
            style={style}
            onClick={(e) => {
                e.stopPropagation();
                onClick(member.id);
            }}
            className={cn(
                "absolute flex flex-col items-center p-2 bg-white rounded-lg shadow-md border-2 transition-all cursor-pointer w-[120px] hover:scale-105 hover:shadow-lg",
                selected ? "border-primary-500 ring-2 ring-primary-200" : "border-gray-200",
                !member.isLiving && "grayscale bg-gray-50"
            )}
        >
            <div className="relative mb-2">
                {member.photoUrl ? (
                    <img
                        src={member.photoUrl}
                        alt={member.firstName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center border-2 border-white shadow-sm text-primary-600">
                        <User size={24} />
                    </div>
                )}
                {!member.isLiving && (
                    <span className="absolute -bottom-1 -right-1 bg-gray-800 text-white text-[10px] px-1 rounded-full">RIP</span>
                )}
            </div>

            <div className="text-center w-full overflow-hidden">
                <h3 className="text-sm font-bold text-gray-900 truncate" title={`${member.firstName} ${member.lastName}`}>
                    {member.firstName}
                </h3>
                <p className="text-xs text-gray-500 truncate">{member.lastName}</p>
            </div>

            {/* Decorative life line or status */}
            <div className={cn("w-full h-1 mt-2 rounded-full", member.gender === 'male' ? "bg-blue-400" : member.gender === 'female' ? "bg-pink-400" : "bg-purple-400")} />
        </div>
    );
};

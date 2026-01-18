import { useEffect, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useFamily } from '../../context/FamilyContext';
import { Member } from '../../types';
import { User, Plus, Edit, ZoomIn, ZoomOut, Maximize2, Eye } from 'lucide-react';
import { translations } from '../../utils/translations';
import { MemberProfile } from '../ui/MemberProfile';

// Recursive Tree Node Component
const TreeNode = ({ memberId, editMode, onViewProfile }: { memberId: string, editMode: boolean, onViewProfile?: (member: Member) => void }) => {
    const { members, settings, openModal } = useFamily();
    const t = translations[settings.language];

    const member = members.find(m => m.id === memberId);
    if (!member) return null;

    // Get children
    const children = members.filter(m => m.fatherId === memberId || m.motherId === memberId);

    // Get spouse
    const spouse = member.spouseId ? members.find(m => m.id === member.spouseId) : null;

    return (
        <div className="flex flex-col items-center mx-2 sm:mx-4">
            {/* Parent + Spouse Row */}
            <div className="flex items-center space-x-1 sm:space-x-2 relative z-10 mb-6 sm:mb-8">
                <MemberCard member={member} editMode={editMode} onViewProfile={onViewProfile} />

                {spouse && (
                    <>
                        <div className="w-4 sm:w-6 h-0.5 bg-pink-300" />
                        <MemberCard member={spouse} editMode={editMode} onViewProfile={onViewProfile} />
                    </>
                )}

                {/* Add Spouse Button - only in edit mode */}
                {editMode && !spouse && (
                    <button
                        onClick={() => openModal('add', { spouseId: memberId })}
                        className="w-6 h-6 sm:w-8 sm:h-8 bg-pink-100 hover:bg-pink-200 rounded-full flex items-center justify-center text-pink-600 transition-colors touch-manipulation"
                        aria-label="Add spouse"
                    >
                        <Plus size={14} className="sm:w-4 sm:h-4" />
                    </button>
                )}
            </div>

            {/* Connector Line to Children */}
            {children.length > 0 && (
                <div className="w-0.5 h-4 sm:h-6 bg-gray-300" />
            )}

            {/* Children Row */}
            {children.length > 0 && (
                <div className="flex items-start mt-2 sm:mt-4">
                    {children.map((child, index) => (
                        <div key={child.id} className="relative">
                            {index > 0 && <div className="absolute -left-2 sm:-left-4 top-0 w-2 sm:w-4 h-0.5 bg-gray-300" />}
                            <TreeNode memberId={child.id} editMode={editMode} onViewProfile={onViewProfile} />
                        </div>
                    ))}

                    {/* Add Child Button - only in edit mode */}
                    {editMode && (
                        <button
                            onClick={() => openModal('add', { fatherId: memberId })}
                            className="ml-2 sm:ml-4 w-16 sm:w-20 h-16 sm:h-20 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 transition-colors border-2 border-dashed border-blue-300 touch-manipulation"
                            aria-label="Add child"
                        >
                            <Plus size={20} className="sm:w-6 sm:h-6" />
                        </button>
                    )}
                </div>
            )}

            {/* Add First Child Button (if no children) - only in edit mode */}
            {editMode && children.length === 0 && (
                <button
                    onClick={() => openModal('add', { fatherId: memberId })}
                    className="mt-2 sm:mt-4 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-100 hover:bg-blue-200 rounded-full text-blue-700 text-[10px] sm:text-xs font-medium transition-colors flex items-center gap-1 touch-manipulation"
                >
                    <Plus size={12} className="sm:w-3 sm:h-3" />
                    {t.addMember}
                </button>
            )}
        </div>
    );
};

const MemberCard = ({ member, editMode, onViewProfile }: { member: Member, editMode: boolean, onViewProfile?: (member: Member) => void }) => {
    const { openModal } = useFamily();
    const borderColor = member.gender === 'male' ? 'border-blue-400' : 'border-pink-400';
    const bgColor = member.isAlive ? 'bg-white' : 'bg-gray-100 grayscale';

    const handleClick = () => {
        if (editMode) {
            openModal('edit', member);
        } else if (onViewProfile) {
            onViewProfile(member);
        }
    };

    return (
        <div
            className={`relative group flex flex-col items-center justify-center w-20 sm:w-28 p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-b-2 sm:border-b-4 ${borderColor} ${bgColor} transition-transform hover:scale-105 active:scale-95 cursor-pointer touch-manipulation`}
            onClick={handleClick}
        >
            {/* Edit Overlay - only visible in edit mode */}
            {editMode && (
                <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white rounded-full p-0.5 sm:p-1 shadow-sm">
                        <Edit className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600" />
                    </div>
                </div>
            )}

            {/* Profile Photo */}
            {member.photoUrl ? (
                <img
                    src={member.photoUrl}
                    alt={member.firstName}
                    className="w-8 h-8 sm:w-12 sm:h-12 rounded-full object-cover mb-1 sm:mb-1.5 border border-gray-200"
                />
            ) : (
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gray-100 flex items-center justify-center mb-1 sm:mb-1.5 border border-gray-200">
                    <User className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />
                </div>
            )}

            {/* Name */}
            <p className="text-[10px] sm:text-xs font-bold text-gray-900 text-center leading-tight truncate w-full px-0.5">
                {member.firstName}
            </p>
            {member.lastName && (
                <p className="text-[8px] sm:text-[10px] text-gray-600 truncate w-full text-center">
                    {member.lastName}
                </p>
            )}

            {/* Status Badge */}
            {!member.isAlive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full">
                    RIP
                </div>
            )}
        </div>
    );
};

export const TreeCanvas = ({ editMode = false }: { editMode?: boolean }) => {
    const { members, loading } = useFamily();
    const [isMobile, setIsMobile] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                Loading family tree...
            </div>
        );
    }

    if (!members || members.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                <User size={48} className="mb-4 text-gray-300" />
                <p className="text-center">No family members yet</p>
                {editMode && <p className="text-sm text-center mt-2">Click the + button to add members</p>}
            </div>
        );
    }

    // Find root nodes (no parents)
    const roots = members.filter(m => !m.fatherId && !m.motherId && !m.spouseId);
    // If no clear root, take the first member
    const rootId = roots.length > 0 ? roots[0].id : members[0]?.id;

    const onViewProfile = (member: Member) => {
        setSelectedMember(member);
    };

    return (
        <>
            {/* Member Profile Modal */}
            {selectedMember && (
                <MemberProfile
                    member={selectedMember}
                    onClose={() => setSelectedMember(null)}
                />
            )}

            <div className="w-full h-[60vh] sm:h-[75vh] lg:h-[80vh] bg-orange-50 overflow-hidden border-t border-orange-200 relative">
                <TransformWrapper
                    initialScale={isMobile ? 0.7 : 1}
                    minScale={0.3}
                    maxScale={2.5}
                    centerOnInit
                    wheel={{ step: 0.1 }}
                    pinch={{ step: 5 }}
                    doubleClick={{ disabled: false, step: 0.7 }}
                    panning={{ velocityDisabled: false }}
                >
                    {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                            {/* Mobile-friendly Zoom Controls */}
                            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                                <button
                                    onClick={() => zoomIn()}
                                    className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 touch-manipulation"
                                    aria-label="Zoom in"
                                >
                                    <ZoomIn size={20} className="sm:w-6 sm:h-6 text-gray-700" />
                                </button>
                                <button
                                    onClick={() => zoomOut()}
                                    className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 touch-manipulation"
                                    aria-label="Zoom out"
                                >
                                    <ZoomOut size={20} className="sm:w-6 sm:h-6 text-gray-700" />
                                </button>
                                <button
                                    onClick={() => resetTransform()}
                                    className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 touch-manipulation"
                                    aria-label="Reset zoom"
                                >
                                    <Maximize2 size={20} className="sm:w-6 sm:h-6 text-gray-700" />
                                </button>
                            </div>

                            <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full flex items-center justify-center">
                                <div className="p-10 sm:p-20 min-w-max">
                                    {rootId && <TreeNode memberId={rootId} editMode={editMode} onViewProfile={onViewProfile} />}
                                </div>
                            </TransformComponent>
                        </>
                    )}
                </TransformWrapper>

                {/* Gesture Hint for Mobile */}
                {isMobile && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-2 rounded-full pointer-events-none">
                        👆 Pinch to zoom • Drag to pan
                    </div>
                )}

                {/* Mode Indicator */}
                {!editMode && (
                    <div className="absolute top-4 left-4 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Eye size={14} />
                        View Only
                    </div>
                )}
            </div>
            );
};

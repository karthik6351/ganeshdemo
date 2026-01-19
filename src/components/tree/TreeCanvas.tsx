import { useEffect, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useFamily } from '../../context/FamilyContext';
import { Member } from '../../types';
import { User, Plus, Edit, Eye, ChevronDown } from 'lucide-react';
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
                    <div className="flex items-center">
                        <div className="w-3 sm:w-4 h-1 bg-gradient-to-r from-pink-400 to-red-400 rounded-l-full" />
                        <div className="bg-white/80 backdrop-blur-sm p-0.5 rounded-full border border-pink-200 shadow-sm z-10">
                            <span className="text-[10px] sm:text-xs">❤️</span>
                        </div>
                        <div className="w-3 sm:w-4 h-1 bg-gradient-to-r from-red-400 to-pink-400 rounded-r-full" />
                        <MemberCard member={spouse} editMode={editMode} onViewProfile={onViewProfile} />
                    </div>
                )}

                {/* Add Spouse Button - only in edit mode */}
                {editMode && !spouse && (
                    <button
                        onClick={() => openModal('add', { spouseId: memberId })}
                        className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 rounded-full flex items-center justify-center text-white transition-all shadow-lg hover:shadow-pink-500/50 hover:scale-110 ml-2"
                        aria-label="Add spouse"
                    >
                        <Plus size={18} className="sm:w-5 sm:h-5" />
                    </button>
                )}
            </div>

            {/* Connector Line to Children */}
            {children.length > 0 && (
                <div className="flex flex-col items-center -mt-2 sm:-mt-4 relative z-0">
                    <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-purple-400 via-blue-400 to-purple-400 rounded-t-full shadow-sm" />
                    <ChevronDown size={16} className="text-purple-400 -mt-1 drop-shadow-sm" strokeWidth={2.5} />
                </div>
            )}

            {/* Children Row */}
            {children.length > 0 && (
                <div className="flex items-start mt-2 sm:mt-4">
                    {children.map((child, index) => (
                        <div key={child.id} className="relative">
                            {index > 0 && <div className="absolute -left-2 sm:-left-4 top-0 w-2 sm:w-4 h-1 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full shadow-sm" />}
                            <TreeNode memberId={child.id} editMode={editMode} onViewProfile={onViewProfile} />
                        </div>
                    ))}

                    {/* Add Child Button - only in edit mode */}
                    {editMode && (
                        <button
                            onClick={() => openModal('add', { fatherId: memberId })}
                            className="ml-2 sm:ml-4 w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-2xl flex items-center justify-center text-blue-600 transition-all border-2 border-dashed border-blue-400 hover:border-purple-400 shadow-lg hover:shadow-xl hover:scale-105"
                            aria-label="Add child"
                        >
                            <Plus size={24} className="sm:w-7 sm:h-7" />
                        </button>
                    )}
                </div>
            )}

            {/* Add First Child Button (if no children) - only in edit mode */}
            {editMode && children.length === 0 && (
                <button
                    onClick={() => openModal('add', { fatherId: memberId })}
                    className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-full text-white text-xs sm:text-sm font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-1.5"
                >
                    <Plus size={14} className="sm:w-4 sm:h-4" />
                    {t.addMember}
                </button>
            )}
        </div>
    );
};

const MemberCard = ({ member, editMode, onViewProfile }: { member: Member, editMode: boolean, onViewProfile?: (member: Member) => void }) => {
    const { openModal } = useFamily();

    // Premium gradient colors based on gender
    const gradientColors = member.gender === 'male'
        ? 'from-blue-400 via-blue-500 to-purple-500'
        : 'from-pink-400 via-pink-500 to-orange-400';

    const glowColor = member.gender === 'male'
        ? 'shadow-blue-500/50'
        : 'shadow-pink-500/50';

    const handleClick = () => {
        if (editMode) {
            openModal('edit', member);
        } else if (onViewProfile) {
            onViewProfile(member);
        }
    };

    return (
        <div
            className={`
                relative group flex flex-col items-center justify-center 
                w-24 sm:w-32 p-2 sm:p-3 rounded-2xl sm:rounded-3xl
                backdrop-blur-lg bg-white/80 dark:bg-gray-800/80
                border border-white/20 dark:border-gray-700/20
                shadow-xl hover:shadow-2xl ${glowColor}
                transition-all duration-300 ease-out
                hover:scale-110 hover:-translate-y-2
                active:scale-95
                cursor-pointer touch-manipulation
                ${!member.isAlive ? 'grayscale opacity-75' : ''}
                before:absolute before:inset-0 before:rounded-2xl sm:before:rounded-3xl
                before:bg-gradient-to-br ${gradientColors}
                before:opacity-0 hover:before:opacity-20
                before:transition-opacity before:duration-300
            `}
            onClick={handleClick}
            style={{
                animation: 'fadeInUp 0.6s ease-out backwards',
                animationDelay: `${Math.random() * 0.3}s`
            }}
        >
            {/* Animated gradient border glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-75 blur-sm transition-all duration-300" />

            {/* Card content */}
            <div className="relative z-10 w-full flex flex-col items-center">
                {/* Edit Badge - only visible in edit mode */}
                {editMode && (
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit className="w-3 h-3 text-white" />
                    </div>
                )}

                {/* Profile Photo with gradient ring */}
                <div className="relative mb-2">
                    {/* Gradient ring */}
                    <div className={`absolute -inset-1 bg-gradient-to-r ${gradientColors} rounded-full opacity-75 blur-sm group-hover:blur-md transition-all`} />

                    {/* Photo */}
                    <div className="relative">
                        {member.photoUrl ? (
                            <img
                                src={member.photoUrl}
                                alt={member.firstName}
                                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-white/50 shadow-lg"
                            />
                        ) : (
                            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${gradientColors} flex items-center justify-center ring-2 ring-white/50 shadow-lg`}>
                                <User className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Name with premium typography */}
                <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white text-center leading-tight truncate w-full px-1 drop-shadow-sm">
                    {member.firstName}
                </p>
                {member.lastName && (
                    <p className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-300 truncate w-full text-center">
                        {member.lastName}
                    </p>
                )}

                {/* Status Badge */}
                {!member.isAlive && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gray-700 to-gray-900 text-white text-[10px] sm:text-xs px-2 py-0.5 rounded-full shadow-lg font-semibold">
                        ✝ RIP
                    </div>
                )}
            </div>
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

            <div className="w-full h-[60vh] sm:h-[75vh] lg:h-[80vh] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 overflow-hidden border-t border-white/20 relative">
                {/* Premium animated background overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)] animate-pulse" />

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
                    {() => (
                        <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full flex items-center justify-center">
                            <div className="p-10 sm:p-20 min-w-max">
                                {rootId && <TreeNode memberId={rootId} editMode={editMode} onViewProfile={onViewProfile} />}
                            </div>
                        </TransformComponent>
                    )}
                </TransformWrapper>

                {/* Gesture Hint for Mobile with premium styling */}
                {isMobile && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 backdrop-blur-lg bg-black/60 text-white text-xs px-4 py-2 rounded-full pointer-events-none shadow-xl border border-white/20">
                        <span className="font-medium">👆 Pinch to zoom • Drag to pan</span>
                    </div>
                )}

                {/* Mode Indicator with premium styling */}
                {!editMode && (
                    <div className="absolute top-4 left-4 backdrop-blur-lg bg-gradient-to-r from-blue-500/90 to-purple-500/90 text-white px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 shadow-xl border border-white/20">
                        <Eye size={14} />
                        <span>View Mode</span>
                    </div>
                )}
            </div>
        </>
    );
};

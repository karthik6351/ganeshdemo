import { useEffect, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useFamily } from '../../context/FamilyContext';
import { Member } from '../../types';
import { User, Plus, Edit, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { translations } from '../../utils/translations';

// Recursive Tree Node Component
const TreeNode = ({ memberId }: { memberId: string }) => {
    const { members, settings, openModal } = useFamily();
    const t = translations[settings.language];

    const member = members.find(m => m.id === memberId);
    if (!member) return null;

    const children = members.filter(m => m.fatherId === member.id || m.motherId === member.id);
    const spouse = members.find(m => m.spouseId === member.id || member.spouseId === m.id);

    return (
        <div className="flex flex-col items-center mx-2 sm:mx-4">
            {/* Card Group (Couple) */}
            <div className="flex items-center space-x-1 sm:space-x-2 relative z-10 mb-6 sm:mb-8">
                <MemberCard member={member} />

                {spouse && (
                    <>
                        <div className="w-4 sm:w-8 h-0.5 sm:h-1 bg-pink-400"></div> {/* Marriage Link */}
                        <MemberCard member={spouse} isSpouse />
                    </>
                )}

                {!spouse && (
                    <button
                        onClick={() => openModal('add', undefined, undefined, member.id)}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 text-gray-500 border border-dashed border-gray-400 touch-manipulation"
                        title={t.addMember}
                    >
                        <Plus size={12} className="sm:w-3.5 sm:h-3.5" />
                    </button>
                )}
            </div>

            {/* Children Line */}
            {children.length > 0 && (
                <div className="relative flex flex-col items-center w-full">
                    {/* Vertical line from parents */}
                    <div className="absolute -top-6 sm:-top-8 w-0.5 h-6 sm:h-8 bg-brand-300"></div>

                    {/* Horizontal Connector for children */}
                    <div className="relative flex pt-3 sm:pt-4 border-t-2 border-brand-300">
                        {children.map((child) => (
                            <div key={child.id} className="relative pt-3 sm:pt-4">
                                {/* Vertical line to child */}
                                <div className="absolute -top-3 sm:-top-4 left-1/2 w-0.5 h-3 sm:h-4 bg-brand-300 -translate-x-1/2"></div>
                                <TreeNode memberId={child.id} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Child Button if no children */}
            {children.length === 0 && (
                <button
                    onClick={() => openModal('add',
                        { gender: 'male', isAlive: true, branchId: 'main' },
                        member.id
                    )}
                    className="mt-2 text-[10px] sm:text-xs text-brand-600 bg-brand-50 px-2 py-1 rounded-full border border-brand-200 hover:bg-brand-100 touch-manipulation"
                >
                    + {t.addMember}
                </button>
            )}
        </div>
    );
};

const MemberCard = ({ member, isSpouse }: { member: Member, isSpouse?: boolean }) => {
    const { openModal } = useFamily();
    const borderColor = member.gender === 'male' ? 'border-blue-400' : 'border-pink-400';
    const bgColor = member.isAlive ? 'bg-white' : 'bg-gray-100 grayscale';

    return (
        <div
            className={`relative group flex flex-col items-center justify-center w-20 sm:w-28 p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-b-2 sm:border-b-4 ${borderColor} ${bgColor} transition-transform hover:scale-105 active:scale-95 cursor-pointer touch-manipulation`}
            onClick={() => openModal('edit', member)}
        >
            {/* Edit Overlay */}
            <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white rounded-full p-0.5 sm:p-1 shadow-sm">
                    <Edit size={10} className="sm:w-3 sm:h-3 text-gray-500" />
                </div>
            </div>

            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-200 mb-1 sm:mb-2 border-2 border-white shadow-sm">
                {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.firstName} className="w-full h-full object-cover" />
                ) : (
                    <User className="w-full h-full p-2 text-gray-400" />
                )}
            </div>
            <span className="text-xs sm:text-sm font-bold text-center text-gray-800 line-clamp-2 leading-tight px-0.5">
                {member.firstName}
            </span>
            <span className="text-[9px] sm:text-[10px] text-gray-500">{member.dob || '---'}</span>
        </div>
    );
};

export const TreeCanvas = () => {
    const { members } = useFamily();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Find root nodes (no parents)
    const roots = members.filter(m => !m.fatherId && !m.motherId && !m.spouseId);
    // If no clear root, take the first member
    const rootId = roots.length > 0 ? roots[0].id : members[0]?.id;

    return (
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
                                {rootId && <TreeNode memberId={rootId} />}
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
        </div>
    );
};

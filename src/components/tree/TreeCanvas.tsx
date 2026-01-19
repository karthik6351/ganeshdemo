import { useEffect, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useFamily } from '../../context/FamilyContext';
import { Member } from '../../types';
import { User, Plus, Edit, Eye, Heart } from 'lucide-react';
import { translations } from '../../utils/translations';

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
        <div className="flex flex-col items-center mx-4">
            {/* Parent + Spouse Row */}
            <div className="flex items-center space-x-4 relative z-10 mb-8">
                <MemberCard member={member} editMode={editMode} onViewProfile={onViewProfile} />

                {spouse && (
                    <div className="flex items-center relative">
                        {/* Connecting Line */}
                        <div className="w-8 h-0.5 bg-rose-300 absolute left-[-1rem] right-[-1rem] -z-10" />
                        <div className="w-6 h-6 bg-white rounded-full border border-rose-200 flex items-center justify-center shadow-sm z-10 transition-transform hover:scale-125">
                            <Heart size={12} className="text-rose-500 fill-rose-500" />
                        </div>
                        <MemberCard member={spouse} editMode={editMode} onViewProfile={onViewProfile} />
                    </div>
                )}

                {/* Add Spouse Button */}
                {editMode && !spouse && (
                    <button
                        onClick={() => openModal('add', { spouseId: memberId })}
                        className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 border border-rose-200 flex items-center justify-center hover:bg-rose-100 transition-colors shadow-sm ml-[-1rem] z-20"
                        title={t.spouse}
                    >
                        <Plus size={16} />
                    </button>
                )}
            </div>

            {/* Children Connector Logic */}
            {children.length > 0 && (
                <div className="flex flex-col items-center -mt-8 mb-4 w-full relative">
                    {/* Vertical Line from Parent (goes down from middle of parent card or spouse-pair center) */}
                    {/* If spouse exists, the center is the heart. If not, it's the member card. 
                        Actually, flex-col centers `TreeNode`. The `Parent+Spouse` row is centered.
                        So a simple vertical line works.
                    */}
                    <div className="w-0.5 h-8 bg-gray-300" />
                </div>
            )}

            {/* Children Row */}
            {children.length > 0 && (
                <div className="flex justify-center items-start pt-4 relative">
                    {/* Horizontal Connector Line Container */}
                    {/* We draw a line from the center of the first child to the center of the last child. */}
                    {children.length > 1 && (
                        <div className="absolute top-0 left-0 right-0 h-4">
                            {/* This line needs to be limited. A simple absolute div with left/right adjustments works if we knew widths. 
                                Instead, we can use the technique where each child draws its share of the connector.
                            */}
                        </div>
                    )}

                    {children.map((child, index) => (
                        <div key={child.id} className="flex flex-col items-center relative px-4">
                            {/* Horizontal Connector Line logic per child */}
                            {children.length > 1 && (
                                <>
                                    {/* Line to Left (if not first) */}
                                    {index > 0 && (
                                        <div className="absolute top-[-1rem] left-0 w-1/2 h-0.5 bg-gray-300" />
                                    )}
                                    {/* Line to Right (if not last) */}
                                    {index < children.length - 1 && (
                                        <div className="absolute top-[-1rem] right-0 w-1/2 h-0.5 bg-gray-300" />
                                    )}
                                </>
                            )}

                            {/* Vertical Connector to Child Card */}
                            {/* Goes from the horizontal line (top -1rem) down to the child (0). height needs to be 1rem + extra space */}
                            <div className="w-0.5 h-6 bg-gray-300 -mt-4 mb-2" />

                            <TreeNode memberId={child.id} editMode={editMode} onViewProfile={onViewProfile} />
                        </div>
                    ))}

                    {/* Add Child Button */}
                    {editMode && (
                        <div className="relative px-4 flex flex-col items-center">
                            {children.length > 0 && <div className="absolute top-[-1rem] left-0 w-1/2 h-0.5 bg-gray-300" />}
                            <div className="w-0.5 h-6 bg-gray-300 -mt-4 mb-2" />
                            <button
                                onClick={() => openModal('add', { fatherId: memberId })}
                                className="w-10 h-10 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-green-600 hover:border-green-400 hover:bg-green-50 transition-all shadow-sm bg-white"
                                title={t.addMember}
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Add First Child Button (if no children) */}
            {editMode && children.length === 0 && (
                <div className="flex flex-col items-center">
                    <div className="w-0.5 h-6 bg-gray-200" />
                    <button
                        onClick={() => openModal('add', { fatherId: memberId })}
                        className="px-4 py-1.5 rounded-full bg-green-50 text-green-600 border border-green-200 text-xs font-semibold hover:bg-green-100 transition-colors shadow-sm flex items-center gap-1.5"
                    >
                        <Plus size={14} /> {t.addMember}
                    </button>
                </div>
            )}
        </div>
    );
};

// Premium Member Card Component
const MemberCard = ({ member, editMode, onViewProfile }: { member: Member, editMode: boolean, onViewProfile?: (member: Member) => void }) => {
    const { openModal } = useFamily();

    const isMale = member.gender === 'male';

    // Aesthetic choices for cards
    const borderColor = isMale ? 'group-hover:border-blue-300' : 'group-hover:border-pink-300';
    const ringColor = isMale ? 'ring-blue-50' : 'ring-pink-50';
    const iconColor = isMale ? 'text-blue-400' : 'text-pink-400';

    const handleClick = () => {
        if (editMode) {
            openModal('edit', member);
        } else if (onViewProfile) {
            onViewProfile(member);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`
                group relative flex flex-col items-center 
                w-32 py-4 px-2 rounded-2xl bg-white 
                border-2 border-slate-100 ${borderColor}
                shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] 
                hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.1)]
                hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer
                ${!member.isAlive ? 'grayscale opacity-75' : ''}
            `}
        >
            {editMode && (
                <div className="absolute -top-2 -right-2 bg-slate-800 text-white p-1.5 rounded-full shadow-lg z-20 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                    <Edit size={12} />
                </div>
            )}

            {/* Profile Image Container */}
            <div className={`relative w-16 h-16 mb-3 rounded-full padding-1 ring-4 ${ringColor} bg-white transition-all group-hover:ring-8`}>
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-100">
                    {member.photoUrl ? (
                        <img src={member.photoUrl} alt={member.firstName} className="w-full h-full object-cover" />
                    ) : (
                        <User size={32} className={`${iconColor} opacity-50`} />
                    )}
                </div>
                {!member.isAlive && (
                    <div className="absolute bottom-0 right-0 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold tracking-wider shadow-sm border border-white">
                        RIP
                    </div>
                )}
            </div>

            {/* Text Content */}
            <div className="text-center w-full px-1">
                <h3 className="text-sm font-bold text-slate-800 truncate leading-tight mb-0.5">
                    {member.firstName}
                </h3>
                {member.lastName && (
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 truncate">
                        {member.lastName}
                    </p>
                )}
            </div>
        </div>
    );
};

export const TreeCanvas = ({ editMode = false }: { editMode?: boolean }) => {
    const { members, loading } = useFamily();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (loading) return <div className="flex items-center justify-center h-full text-slate-400">Loading tree data...</div>;

    if (!members || members.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <User size={32} className="text-slate-300" />
                </div>
                <p>No family members found</p>
                {editMode && <p className="text-sm">Start by adding a member below</p>}
            </div>
        );
    }

    const roots = members.filter(m => !m.fatherId && !m.motherId && !m.spouseId);
    const rootId = roots.length > 0 ? roots[0].id : members[0]?.id;

    return (
        <div className="w-full h-[calc(100vh-64px)] bg-slate-50 relative overflow-hidden font-sans">
            {/* Professional Dot Grid Background */}
            <div
                className="absolute inset-0 opacity-[0.4] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            />

            <TransformWrapper
                initialScale={isMobile ? 0.6 : 0.9}
                minScale={0.2}
                maxScale={3}
                centerOnInit
                limitToBounds={false}
                panning={{ velocityDisabled: false }}
            >
                {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                        {/* Floating Controls */}
                        <div className="absolute bottom-8 right-6 flex flex-col gap-3 z-50">
                            <button onClick={() => zoomIn()} className="w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center text-slate-700 hover:text-blue-600 hover:scale-110 transition-all border border-slate-100">
                                <Plus size={24} />
                            </button>
                            <button onClick={() => zoomOut()} className="w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center text-slate-700 hover:text-blue-600 hover:scale-110 transition-all border border-slate-100">
                                <div className="w-4 h-0.5 bg-current" />
                            </button>
                            <button onClick={() => resetTransform()} className="w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center text-slate-700 hover:text-blue-600 hover:scale-110 transition-all border border-slate-100 text-[10px] font-bold tracking-widest">
                                FIT
                            </button>
                        </div>

                        <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full flex items-center justify-center">
                            <div className="p-32 min-w-max">
                                {rootId && <TreeNode memberId={rootId} editMode={editMode} onViewProfile={undefined} />}
                            </div>
                        </TransformComponent>
                    </>
                )}
            </TransformWrapper>

            {/* Mode Indicator */}
            <div className="absolute top-6 left-6 z-50">
                <div className={`
                    backdrop-blur-md bg-white/80 border border-white/40 shadow-lg px-4 py-2 rounded-full 
                    flex items-center gap-2.5 transition-all
                    ${editMode ? 'ring-2 ring-amber-100' : ''}
                `}>
                    <div className={`
                        w-2.5 h-2.5 rounded-full shadow-sm
                        ${editMode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}
                    `} />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                        {editMode ? 'Editing' : 'Viewing'}
                    </span>
                </div>
            </div>
        </div>
    );
};

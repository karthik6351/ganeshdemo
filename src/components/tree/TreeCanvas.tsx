import { useEffect, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useFamily } from '../../context/FamilyContext';
import { Member } from '../../types';
import { User, Plus, Edit, Heart } from 'lucide-react';
// import { translations } from '../../utils/translations';

// Recursive Tree Node Component
const TreeNode = ({ memberId, editMode, onViewProfile }: { memberId: string, editMode: boolean, onViewProfile?: (member: Member) => void }) => {
    const { members, openModal } = useFamily();
    // const t = translations[settings.language]; // unused for now in this scope

    // Local state for the add menu (only one active at a time could be handled by context or global state, but local here works per node if careful, 
    // actually purely local state inside recursion might be tricky if we want to close others. 
    // Let's use a simple approach: The menu is part of the render. We can't easily lift state without context. 
    // BUT we can use a useState at the TreeCanvas level? No, recursion makes that hard.
    // Let's just use local state here. Collisions are rare.
    const [showAddMenu, setShowAddMenu] = useState(false);

    const member = members.find(m => m.id === memberId);
    if (!member) return null;

    // Get children (sorted by birth date usually, but here just filter)
    const children = members.filter(m => m.fatherId === memberId || m.motherId === memberId);

    // Get spouse
    const spouse = member.spouseId ? members.find(m => m.id === member.spouseId) : null;

    // Consistency: Always show structure as if editable (User Request: "same ui for both")
    const showAddOptions = true;

    // Handle Adding Child (Intelligent Parent Linking)
    const handleAddChild = () => {
        const props: any = {};
        if (member.gender === 'male') {
            props.fatherId = member.id;
            if (spouse) props.motherId = spouse.id;
        } else {
            props.motherId = member.id;
            if (spouse) props.fatherId = spouse.id;
        }
        openModal('add', props);
        setShowAddMenu(false);
    };

    const handleAddSpouse = () => {
        openModal('add', {
            spouseId: memberId,
            gender: member.gender === 'male' ? 'female' : 'male'
        });
        setShowAddMenu(false);
    };

    return (
        <div className="flex flex-col items-center">
            {/* Parent + Spouse Row */}
            <div className="flex items-center relative z-10 mb-12">
                <MemberCard member={member} editMode={editMode} onViewProfile={onViewProfile} />

                {/* Connector to Spouse or Add Spouse/Child Button */}
                {(spouse || showAddOptions) && (
                    <div className="flex items-center -ml-2 -mr-2 z-0 relative">
                        {/* Line part 1 */}
                        <div className="w-8 h-1 bg-gradient-to-r from-blue-400 to-purple-400" />

                        {/* Center Connector / Button */}
                        <div className="relative z-10">
                            {spouse ? (
                                <button
                                    onClick={handleAddChild}
                                    className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg flex items-center justify-center text-white border-2 border-white hover:scale-110 transition-transform cursor-pointer"
                                    title="Add Child to Couple"
                                >
                                    <Plus size={16} className="text-white" />
                                </button>
                            ) : (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowAddMenu(!showAddMenu)}
                                        className="w-10 h-10 rounded-full bg-pink-500 hover:bg-pink-600 text-white border-2 border-white shadow-md flex items-center justify-center transition-all hover:scale-110 z-20 relative"
                                        title="Add Family Member"
                                    >
                                        <Plus size={20} />
                                    </button>

                                    {/* Action Menu */}
                                    {showAddMenu && (
                                        <>
                                            {/* Backdrop to close */}
                                            <div className="fixed inset-0 z-10" onClick={() => setShowAddMenu(false)} />

                                            {/* Menu */}
                                            <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 flex flex-col gap-1 w-48 z-30 animate-in fade-in zoom-in duration-200">
                                                <div className="text-xs font-semibold text-gray-400 px-2 py-1 uppercase tracking-wider">Add to {member.firstName}</div>

                                                <button
                                                    onClick={handleAddSpouse}
                                                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-pink-50 text-slate-700 hover:text-pink-600 transition-colors text-left"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-500">
                                                        <Heart size={14} />
                                                    </div>
                                                    <div>
                                                        <span className="block text-sm font-bold">Add Spouse</span>
                                                        <span className="block text-[10px] text-gray-400">Connects beside</span>
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={handleAddChild}
                                                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-colors text-left"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                                                        <User size={14} />
                                                    </div>
                                                    <div>
                                                        <span className="block text-sm font-bold">Add Child</span>
                                                        <span className="block text-[10px] text-gray-400">Connects below</span>
                                                    </div>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Line part 2 */}
                        <div className="w-8 h-1 bg-gradient-to-r from-purple-400 to-blue-400" />
                    </div>
                )}

                {spouse && (
                    <MemberCard member={spouse} editMode={editMode} onViewProfile={onViewProfile} />
                )}
            </div>

            {/* Children Connector Logic */}
            {(children.length > 0 || showAddOptions) && (
                <div className="flex flex-col items-center w-full relative">
                    {/* Vertical Line from Parents */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 h-12 w-0.5 bg-gradient-to-b from-purple-400 to-blue-400" />

                    {/* Top Horizontal Bar for Children */}
                    {/* Only show if multiple items (children + add button) */}
                    {(children.length + (showAddOptions ? 1 : 0)) > 1 && (
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-300 rounded-full mx-auto"
                            style={{
                                width: `calc(100% - ${children.length === 0 ? '0px' : '160px'})`, // Approximate width adjustment
                                // A better way is to rely on the padding of the container specific to the layout
                            }}
                        >
                        </div>
                    )}
                </div>
            )}

            {/* Children Row */}
            <div className="flex items-start justify-center gap-8 pt-8 relative">
                {/* Horizontal Connector Line (Spanning all children) */}
                {(children.length > 0 || showAddOptions) && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-0.5 bg-transparent pointer-events-none">
                        {/* We will draw lines on individual items to connect to this phantom center line */}
                    </div>
                )}

                {children.map((child, index) => {
                    const isFirst = index === 0;
                    const isLast = index === children.length - 1 && !showAddOptions;

                    return (
                        <div key={child.id} className="flex flex-col items-center relative">
                            {/* Connectors */}
                            <div className="absolute top-[-2rem] left-0 right-0 h-[2rem] pointer-events-none">
                                {/* Vertical line down to child */}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-blue-300" />

                                {/* Horizontal line to connect to siblings */}
                                {/* Right half */}
                                {(!isLast || showAddOptions) && (
                                    <div className="absolute top-0 right-0 w-1/2 h-0.5 bg-blue-300" />
                                )}
                                {/* Left half */}
                                {!isFirst && (
                                    <div className="absolute top-0 left-0 w-1/2 h-0.5 bg-blue-300" />
                                )}
                            </div>

                            <TreeNode memberId={child.id} editMode={editMode} onViewProfile={onViewProfile} />
                        </div>
                    );
                })}

                {/* Add Child Ghost Card - Kept for flexibility, but maybe user wants ONLY the plus button? 
                   User said "when we select child it ads the child profile below". 
                   Let's keep the Ghost Card as a "Quick Add" for specific child slot, but the Plus button is the main requested feature.
                */}
                {showAddOptions && (
                    <div className="flex flex-col items-center relative">
                        <div className="absolute top-[-2rem] left-0 right-0 h-[2rem] pointer-events-none">
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-blue-300" />
                            {children.length > 0 && (
                                <div className="absolute top-0 left-0 w-1/2 h-0.5 bg-blue-300" />
                            )}
                        </div>

                        <button
                            onClick={() => openModal('add', {
                                [member.gender === 'female' ? 'motherId' : 'fatherId']: member.id,
                                [member.gender === 'female' ? 'fatherId' : 'motherId']: spouse?.id // Try to link both
                            })}
                            className="w-[140px] h-[160px] rounded-[2rem] border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50 flex flex-col items-center justify-center gap-3 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:scale-110 transition-transform">
                                <Plus size={24} />
                            </div>
                            <span className="text-sm font-semibold text-slate-400 group-hover:text-blue-500">Add Child</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Premium Squircle Member Card
const MemberCard = ({ member, editMode, onViewProfile }: { member: Member, editMode: boolean, onViewProfile?: (member: Member) => void }) => {
    const { openModal } = useFamily();
    const isMale = member.gender === 'male';
    const [photoUrl, setPhotoUrl] = useState<string | undefined>(member.photoUrl);

    // Lazy load photo if missing (due to list optimization)
    useEffect(() => {
        if (!member.photoUrl && !photoUrl) {
            // Fetch individual member to get photo
            fetch(`/api/members/${member.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.photoUrl) {
                        setPhotoUrl(data.photoUrl);
                    }
                })
                .catch(err => console.error("Failed to load photo", err));
        } else if (member.photoUrl) {
            setPhotoUrl(member.photoUrl);
        }
    }, [member.id, member.photoUrl]);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (editMode) {
            // Pass the full data (with photo if loaded)
            openModal('edit', { ...member, photoUrl: photoUrl || member.photoUrl });
        } else if (onViewProfile) {
            onViewProfile({ ...member, photoUrl: photoUrl || member.photoUrl });
        }
    };

    return (
        <div className="relative group">
            {/* Card Body */}
            <div
                onClick={handleClick}
                className={`
                    w-[140px] h-[160px] bg-white rounded-[2.5rem]
                    shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)]
                    hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)]
                    flex flex-col items-center pt-2
                    transition-all duration-300 hover:-translate-y-2
                    cursor-pointer border border-slate-100
                    ${!member.isAlive ? 'grayscale' : ''}
                `}
            >
                {/* Avatar with Gradient Ring */}
                <div className="relative mb-3">
                    <div className={`
                        w-20 h-20 rounded-full p-[3px] 
                        bg-gradient-to-br ${isMale ? 'from-blue-400 to-cyan-300' : 'from-pink-400 to-rose-300'}
                        box-content shadow-lg
                    `}>
                        <div className="w-full h-full rounded-full border-4 border-white bg-slate-100 overflow-hidden relative">
                            {photoUrl ? (
                                <img src={photoUrl} alt={member.firstName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                                    <User size={32} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="text-center px-2 w-full">
                    <h3 className="text-slate-800 font-bold text-sm truncate leading-tight mb-1">
                        {member.firstName}
                    </h3>
                    {member.lastName && (
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold truncate">
                            {member.lastName}
                        </p>
                    )}
                </div>

                {/* Edit Overlay Button */}
                {editMode && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-slate-900 text-white p-1.5 rounded-full shadow-md">
                            <Edit size={10} />
                        </div>
                    </div>
                )}
            </div>

            {/* View Details Floating Button (Outside Card) */}
            {!editMode && onViewProfile && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewProfile({ ...member, photoUrl: photoUrl || member.photoUrl });
                    }}
                    className="absolute bottom-4 -right-4 w-8 h-8 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-blue-700 z-20"
                >
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping absolute" />
                    <User size={14} />
                    {/* The eye icon in the image is often for view, let's use a meaningful icon */}
                </button>
            )}
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
                <p className="text-sm">Start by adding a member below</p>
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



            <div className="relative z-10 w-full h-full">
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
            </div>

            {/* Mode Indicator - Removed for consistent UI */}

        </div>
    );
};

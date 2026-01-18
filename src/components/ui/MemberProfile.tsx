import { X, User, Phone, MapPin, Calendar, Users as UsersIcon, Heart } from 'lucide-react';
import { Member } from '../../types';
import { useFamily } from '../../context/FamilyContext';
import { translations } from '../../utils/translations';

interface MemberProfileProps {
    member: Member;
    onClose: () => void;
}

export const MemberProfile = ({ member, onClose }: MemberProfileProps) => {
    const { members, settings } = useFamily();
    const t = translations[settings.language];

    // Find relationships
    const father = member.fatherId ? members.find(m => m.id === member.fatherId) : null;
    const mother = member.motherId ? members.find(m => m.id === member.motherId) : null;
    const spouse = member.spouseId ? members.find(m => m.id === member.spouseId) : null;
    const children = members.filter(m => m.fatherId === member.id || m.motherId === member.id);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80]"
                onClick={onClose}
            />

            {/* Profile Modal */}
            <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-[90] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-red-700 text-white p-4 flex items-center justify-between z-10">
                    <h2 className="text-lg font-bold">Member Profile</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Photo and Name */}
                    <div className="flex flex-col items-center text-center pb-4 border-b border-gray-200">
                        {member.photoUrl ? (
                            <img
                                src={member.photoUrl}
                                alt={member.firstName}
                                className="w-24 h-24 rounded-full object-cover mb-3 border-4 border-orange-200"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center mb-3 border-4 border-orange-200">
                                <User className="w-12 h-12 text-orange-600" />
                            </div>
                        )}
                        <h3 className="text-2xl font-bold text-gray-900">
                            {member.firstName} {member.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 capitalize">{member.gender}</p>
                        {!member.isAlive && (
                            <span className="mt-2 inline-flex items-center gap-1 bg-gray-800 text-white text-xs px-3 py-1 rounded-full">
                                <Heart size={12} fill="white" />
                                In Loving Memory
                            </span>
                        )}
                    </div>

                    {/* Personal Details */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            <User size={18} className="text-orange-600" />
                            Personal Details
                        </h4>

                        {member.dob && (
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <Calendar size={18} className="text-gray-600 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500">Date of Birth</p>
                                    <p className="font-medium text-gray-900">{member.dob}</p>
                                </div>
                            </div>
                        )}

                        {member.phone && (
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <Phone size={18} className="text-gray-600 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500">Phone</p>
                                    <p className="font-medium text-gray-900">{member.phone}</p>
                                </div>
                            </div>
                        )}

                        {member.location && (
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <MapPin size={18} className="text-gray-600 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500">Location</p>
                                    <p className="font-medium text-gray-900">{member.location}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Relationships */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            <UsersIcon size={18} className="text-orange-600" />
                            Family Relationships
                        </h4>

                        {father && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-xs text-blue-600 font-medium mb-1">Father</p>
                                <p className="font-medium text-gray-900">{father.firstName} {father.lastName}</p>
                            </div>
                        )}

                        {mother && (
                            <div className="p-3 bg-pink-50 rounded-lg">
                                <p className="text-xs text-pink-600 font-medium mb-1">Mother</p>
                                <p className="font-medium text-gray-900">{mother.firstName} {mother.lastName}</p>
                            </div>
                        )}

                        {spouse && (
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <p className="text-xs text-purple-600 font-medium mb-1">Spouse</p>
                                <p className="font-medium text-gray-900">{spouse.firstName} {spouse.lastName}</p>
                            </div>
                        )}

                        {children.length > 0 && (
                            <div className="p-3 bg-green-50 rounded-lg">
                                <p className="text-xs text-green-600 font-medium mb-2">Children ({children.length})</p>
                                <div className="space-y-1">
                                    {children.map(child => (
                                        <p key={child.id} className="text-sm text-gray-900">
                                            • {child.firstName} {child.lastName}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    {member.notes && (
                        <div className="space-y-2">
                            <h4 className="font-bold text-gray-900">Notes</h4>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{member.notes}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

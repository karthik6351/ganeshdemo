import React, { useEffect, useState } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { translations } from '../../utils/translations';
import { Member, Gender } from '../../types';
import { X, Save, Upload } from 'lucide-react';

export const MemberModal = () => {
    const { modalState, closeModal, addMember, updateMember, settings } = useFamily();
    const t = translations[settings.language];

    const [formData, setFormData] = useState<Partial<Member>>({
        firstName: '',
        lastName: '',
        gender: 'male',
        isAlive: true,
        branchId: 'main'
    });

    useEffect(() => {
        if (modalState.isOpen) {
            if (modalState.mode === 'edit' && modalState.data) {
                setFormData(modalState.data);
            } else {
                // Reset for add mode
                setFormData({
                    firstName: '',
                    lastName: '',
                    gender: 'male',
                    isAlive: true,
                    branchId: 'main',
                    fatherId: modalState.parentId, // Pre-fill if adding child
                    motherId: modalState.parentId ? undefined : undefined, // Logic handled in submit or context
                    spouseId: modalState.spouseId
                });
            }
        }
    }, [modalState]);

    if (!modalState.isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (modalState.mode === 'add') {
            addMember(formData as Omit<Member, 'id'>);
        } else if (modalState.mode === 'edit' && modalState.data?.id) {
            updateMember(modalState.data.id, formData);
        }
        closeModal();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">
                        {modalState.mode === 'add' ? t.addMember : t.edit}
                    </h2>
                    <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Photo Upload (Mock) */}
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 relative overflow-hidden group">
                            {formData.photoUrl ? (
                                <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <Upload className="text-gray-400" />
                            )}
                            <input
                                type="text"
                                placeholder="Photo URL"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    const url = prompt("Enter Photo URL:");
                                    if (url) setFormData({ ...formData, photoUrl: url });
                                }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.member} Name *</label>
                            <input
                                required
                                type="text"
                                value={formData.firstName || ''}
                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="First Name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input
                                type="text"
                                value={formData.lastName || ''}
                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="Last Name"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.male}/{t.female}</label>
                            <select
                                value={formData.gender}
                                onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            >
                                <option value="male">{t.male}</option>
                                <option value="female">{t.female}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={formData.isAlive ? 'alive' : 'dead'}
                                onChange={e => setFormData({ ...formData, isAlive: e.target.value === 'alive' })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            >
                                <option value="alive">{t.alive}</option>
                                <option value="dead">{t.deceased}</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.dob}</label>
                        <input
                            type="date"
                            value={formData.dob || ''}
                            onChange={e => setFormData({ ...formData, dob: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.phone}</label>
                        <input
                            type="tel"
                            value={formData.phone || ''}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="+91 9999999999"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.location}</label>
                        <input
                            type="text"
                            value={formData.location || ''}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="City, Country"
                        />
                    </div>

                    <div className="flex justify-end pt-4 space-x-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            {t.cancel}
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg shadow-md hover:from-orange-600 hover:to-red-700 flex items-center space-x-2"
                        >
                            <Save size={18} />
                            <span>{t.save}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

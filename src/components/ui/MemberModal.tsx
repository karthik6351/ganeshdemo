import React, { useEffect, useState } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { translations } from '../../utils/translations';
import { compressImage } from '../../utils/imageUtils';
import { Member, Gender } from '../../types';
import { X, Save, Upload } from 'lucide-react';

export const MemberModal = () => {
    const { modalState, closeModal, addMember, updateMember, settings } = useFamily();
    const t = translations[settings.language];
    const [isLoadingImage, setIsLoadingImage] = useState(false);

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
                // Reset for add mode - preserve relationship data from modalState.data
                setFormData({
                    firstName: '',
                    lastName: '',
                    gender: 'male',
                    isAlive: true,
                    branchId: 'main',
                    ...modalState.data  // This preserves fatherId, motherId, or spouseId from openModal() call
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
                    // Photo Upload
                    <div className="flex justify-center mb-6">
                        <div
                            className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 relative overflow-hidden group"
                            onClick={() => {
                                // Trigger the hidden file input
                                document.getElementById('photo-upload-input')?.click();
                            }}
                        >
                            {formData.photoUrl || isLoadingImage ? (
                                <>
                                    {formData.photoUrl && <img src={formData.photoUrl} alt="Preview" className={`w-full h-full object-cover ${isLoadingImage ? 'opacity-50' : ''}`} />}
                                    {isLoadingImage && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Upload className="text-gray-400" />
                            )}
                        </div>
                        {/* Hidden file input */}
                        <input
                            id="photo-upload-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setIsLoadingImage(true);
                                    try {
                                        let resultUrl = '';
                                        // Check file size (limit to 3MB for safe Base64 encoding within 4.5MB response limit)
                                        if (file.size > 3 * 1024 * 1024) {
                                            // Compress
                                            resultUrl = await compressImage(file, 3.0);
                                        } else {
                                            // Read normally
                                            resultUrl = await new Promise((resolve) => {
                                                const reader = new FileReader();
                                                reader.onloadend = () => resolve(reader.result as string);
                                                reader.readAsDataURL(file);
                                            });
                                        }
                                        setFormData({ ...formData, photoUrl: resultUrl });
                                    } catch (error) {
                                        console.error("Image processing error:", error);
                                        alert("Error processing image. Please try another one.");
                                    } finally {
                                        setIsLoadingImage(false);
                                    }
                                }
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
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

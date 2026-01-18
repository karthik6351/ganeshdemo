import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormRegister, useForm } from 'react-hook-form'; // Assuming react-hook-form is standard, but I didn't install it. I'll use controlled inputs.
import { Member } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useFamilyStore } from '../../store/familyStore';

interface MemberFormProps {
    initialData?: Partial<Member>;
    onSubmit: (data: Omit<Member, 'id' | 'relationships'>) => void;
    onCancel: () => void;
}

export const MemberForm: React.FC<MemberFormProps> = ({ initialData, onSubmit, onCancel }) => {
    const { t } = useTranslation();
    const { branches } = useFamilyStore();

    const [formData, setFormData] = useState<Partial<Member>>({
        firstName: initialData?.firstName || '',
        lastName: initialData?.lastName || '',
        gender: initialData?.gender || 'male',
        dob: initialData?.dob || '',
        isLiving: initialData?.isLiving ?? true,
        branchId: initialData?.branchId || Object.keys(branches)[0] || 'main',
        ...initialData
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validate
        if (!formData.firstName || !formData.gender) return;

        onSubmit(formData as any);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <Input
                    label={t('labels.name') + " (First)"}
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
                <Input
                    label={t('labels.name') + " (Last)"}
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('labels.gender')}</label>
                    <select
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <Input
                    type="date"
                    label={t('labels.dob')}
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                />
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="isLiving"
                    checked={formData.isLiving}
                    onChange={(e) => setFormData({ ...formData, isLiving: e.target.checked })}
                    className="rounded text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="isLiving" className="text-sm text-gray-700">{t('labels.living')}</label>
            </div>

            {/* Basic Branch Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <select
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                >
                    {Object.values(branches).map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    {t('actions.cancel')}
                </Button>
                <Button type="submit">
                    {t('actions.save')}
                </Button>
            </div>
        </form>
    );
};

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TreeCanvas } from '../components/tree/TreeCanvas';
import { Button } from '../components/ui/Button';
import { Plus } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { MemberForm } from '../components/forms/MemberForm';
import { useFamilyStore } from '../store/familyStore';

export const TreePage = () => {
    const { t } = useTranslation();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const { addMember } = useFamilyStore();

    const handleAddMember = (data: any) => {
        addMember(data);
        setIsAddModalOpen(false);
    };

    return (
        <div className="h-[calc(100vh-100px)] relative flex flex-col">
            <div className="absolute top-4 left-4 z-10">
                <Button onClick={() => setIsAddModalOpen(true)} className="shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('actions.add_member')}
                </Button>
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-inner border border-gray-200 overflow-hidden">
                <TreeCanvas />
            </div>

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={t('actions.add_member')}
            >
                <MemberForm
                    onSubmit={handleAddMember}
                    onCancel={() => setIsAddModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

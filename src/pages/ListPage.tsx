import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFamilyStore } from '../store/familyStore';
import { MemberSearch } from '../components/MemberSearch';
import { Card, CardContent } from '../components/ui/Card';
import { User, Edit, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { MemberForm } from '../components/forms/MemberForm';

export const ListPage = () => {
    const { t } = useTranslation();
    const { members, deleteMember, updateMember } = useFamilyStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    const filteredMembers = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return Object.values(members).filter(member =>
            member.firstName?.toLowerCase().includes(query) ||
            member.lastName?.toLowerCase().includes(query)
        );
    }, [members, searchQuery]);

    const handleUpdate = (data: any) => {
        if (editingId) {
            updateMember(editingId, data);
            setEditingId(null);
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm(t('Are you sure you want to delete this member?'))) {
            deleteMember(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">{t('nav.list')}</h2>
                <div className="w-72">
                    <MemberSearch value={searchQuery} onChange={setSearchQuery} />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredMembers.map(member => (
                    <Card key={member.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="relative shrink-0">
                                {member.photoUrl ? (
                                    <img src={member.photoUrl} alt={member.firstName} className="w-16 h-16 rounded-full object-cover shadow-sm bg-gray-100" />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 shadow-sm border-2 border-white">
                                        <User size={32} />
                                    </div>
                                )}
                                {!member.isLiving && (
                                    <span className="absolute bottom-0 right-0 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded-full border border-white">RIP</span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                    {member.firstName} {member.lastName}
                                </h3>
                                <p className="text-sm text-gray-500 capitalize">{member.gender}</p>
                                <div className="flex gap-2 mt-2">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditingId(member.id)}>
                                        <Edit className="w-4 h-4 text-blue-600" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDelete(member.id)}>
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {filteredMembers.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No members found.
                    </div>
                )}
            </div>

            <Modal
                isOpen={!!editingId}
                onClose={() => setEditingId(null)}
                title={t('actions.edit')}
            >
                {editingId && (
                    <MemberForm
                        initialData={members[editingId]}
                        onSubmit={handleUpdate}
                        onCancel={() => setEditingId(null)}
                    />
                )}
            </Modal>
        </div>
    );
};

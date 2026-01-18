import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { Input } from './ui/Input';

interface MemberSearchProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export const MemberSearch: React.FC<MemberSearchProps> = ({ value, onChange, className }) => {
    const { t } = useTranslation();

    return (
        <div className={`relative ${className}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
                type="search"
                placeholder={t('actions.search') + "..."}
                className="pl-10"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};

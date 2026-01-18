import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
    if (!isOpen) return null;

    const maxWidths = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-2xl',
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 md:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, y: '100%', scale: 1 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: '100%', scale: 1 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className={cn(
                        "relative w-full bg-white overflow-hidden flex flex-col",
                        // Mobile: Full screen with rounded top corners
                        "h-[95vh] rounded-t-3xl sm:rounded-xl",
                        // Desktop: Normal modal
                        "sm:h-auto sm:max-h-[90vh] sm:shadow-2xl",
                        maxWidths[size]
                    )}
                    style={{
                        paddingBottom: 'env(safe-area-inset-bottom)',
                    }}
                >
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
                        {/* Mobile drag handle */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-300 rounded-full sm:hidden" />

                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mt-2 sm:mt-0">{title}</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="p-2 h-10 w-10 sm:h-8 sm:w-8 rounded-full touch-manipulation flex-shrink-0"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin overscroll-contain">
                        {children}
                    </div>

                    {footer && (
                        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                            {footer}
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

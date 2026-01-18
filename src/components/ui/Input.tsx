import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, id, ...props }, ref) => {
        const inputId = id || props.name;

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        id={inputId}
                        ref={ref}
                        className={cn(
                            "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm sm:text-base px-3 py-2.5 sm:py-2 border transition-colors",
                            "placeholder:text-gray-400",
                            "min-h-[44px] sm:min-h-[40px]", // Touch-friendly height
                            "touch-manipulation", // Optimize for touch
                            error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "",
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && <p className="mt-1 text-xs sm:text-sm text-red-600">{error}</p>}
                {helperText && !error && <p className="mt-1 text-xs sm:text-sm text-gray-500">{helperText}</p>}
            </div>
        );
    }
);

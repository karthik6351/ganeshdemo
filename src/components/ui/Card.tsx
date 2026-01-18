import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden", className)} {...props}>
        {children}
    </div>
);

export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("px-6 py-4 border-b border-gray-50 bg-gray-50/50", className)} {...props}>
        {children}
    </div>
);

export const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn("text-lg font-semibold text-gray-900", className)} {...props}>
        {children}
    </h3>
);

export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("p-6", className)} {...props}>
        {children}
    </div>
);

export const CardFooter = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center", className)} {...props}>
        {children}
    </div>
);

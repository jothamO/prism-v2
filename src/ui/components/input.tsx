// =====================================================
// PRISM V2 - Input Components
// Text input, select, and search with iBank styling
// =====================================================

import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes } from 'react';
import { cn } from '@/shared/utils';

// Text Input
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, leftIcon, rightIcon, ...props }, ref) => {
        return (
            <div className="space-y-1.5">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            'w-full h-12 rounded-xl border bg-[hsl(240,6%,97%)]',
                            'text-gray-900 placeholder:text-gray-400',
                            'focus:outline-none focus:ring-2 focus:ring-[hsl(248,80%,36%)] focus:border-transparent',
                            'dark:bg-[hsl(240,27%,20%)] dark:text-white dark:border-[hsl(240,24%,30%)]',
                            leftIcon ? 'pl-10' : 'pl-4',
                            rightIcon ? 'pr-10' : 'pr-4',
                            error && 'border-[hsl(346,96%,63%)] focus:ring-[hsl(346,96%,63%)]',
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="text-sm text-[hsl(346,96%,63%)]">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

// Select
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, ...props }, ref) => {
        return (
            <div className="space-y-1.5">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    className={cn(
                        'w-full h-12 rounded-xl border bg-[hsl(240,6%,97%)] px-4',
                        'text-gray-900 focus:outline-none focus:ring-2 focus:ring-[hsl(248,80%,36%)]',
                        'dark:bg-[hsl(240,27%,20%)] dark:text-white dark:border-[hsl(240,24%,30%)]',
                        'appearance-none cursor-pointer',
                        error && 'border-[hsl(346,96%,63%)]',
                        className
                    )}
                    {...props}
                >
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && <p className="text-sm text-[hsl(346,96%,63%)]">{error}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';

// Search Input
interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    onSearch?: (value: string) => void;
}

export function SearchInput({ className, onSearch, ...props }: SearchInputProps) {
    return (
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <input
                type="search"
                className={cn(
                    'w-full h-12 pl-10 pr-4 rounded-xl border bg-[hsl(240,6%,97%)]',
                    'text-gray-900 placeholder:text-gray-400',
                    'focus:outline-none focus:ring-2 focus:ring-[hsl(248,80%,36%)]',
                    'dark:bg-[hsl(240,27%,20%)] dark:text-white dark:border-[hsl(240,24%,30%)]',
                    className
                )}
                onChange={(e) => onSearch?.(e.target.value)}
                {...props}
            />
        </div>
    );
}

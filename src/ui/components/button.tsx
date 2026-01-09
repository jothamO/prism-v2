// =====================================================
// PRISM V2 - Button Component
// iBank-inspired button with variants
// =====================================================

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    fullWidth?: boolean;
    loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', fullWidth, loading, disabled, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={cn(
                    // Base styles
                    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                    'disabled:pointer-events-none disabled:opacity-50',

                    // Variants
                    variant === 'primary' && [
                        'bg-[hsl(248,80%,36%)] text-white',
                        'hover:bg-[hsl(248,80%,32%)] hover:shadow-md',
                        'focus-visible:ring-[hsl(248,80%,36%)]',
                    ],
                    variant === 'secondary' && [
                        'bg-[hsl(248,36%,53%)] text-white',
                        'hover:bg-[hsl(248,36%,48%)]',
                    ],
                    variant === 'outline' && [
                        'border-2 border-[hsl(248,80%,36%)] text-[hsl(248,80%,36%)]',
                        'hover:bg-[hsl(248,80%,36%)] hover:text-white',
                    ],
                    variant === 'ghost' && [
                        'text-[hsl(248,80%,36%)]',
                        'hover:bg-[hsl(248,80%,36%)]/10',
                    ],
                    variant === 'destructive' && [
                        'bg-[hsl(346,96%,63%)] text-white',
                        'hover:bg-[hsl(346,96%,58%)]',
                    ],

                    // Sizes
                    size === 'sm' && 'h-9 px-4 text-sm',
                    size === 'md' && 'h-11 px-6 text-base',
                    size === 'lg' && 'h-14 px-8 text-lg',
                    size === 'icon' && 'h-11 w-11 p-0',

                    // Full width
                    fullWidth && 'w-full',

                    className
                )}
                {...props}
            >
                {loading ? (
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                ) : null}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

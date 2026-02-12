import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
    isLoading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        'bg-accent text-white hover:bg-accent-600 active:bg-accent-600 disabled:bg-accent-200 hover:scale-105 shadow-none',
    secondary:
        'bg-muted text-primary-900 hover:bg-primary-100 active:bg-primary-200 disabled:opacity-50 hover:scale-105',
    ghost:
        'bg-transparent text-foreground hover:bg-muted active:bg-primary-100',
    danger:
        'bg-error text-white hover:scale-105 active:bg-red-600',
    outline:
        'bg-transparent border border-border text-foreground hover:bg-muted active:bg-primary-100',
}

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-md',
    md: 'h-14 px-6 py-2 text-base gap-2 rounded-md', // Matching "h-14 to h-16" guideline roughly
    lg: 'h-16 px-8 py-3 text-lg gap-2.5 rounded-md',
    xl: 'h-20 px-10 py-4 text-xl gap-3 rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={`
          inline-flex items-center justify-center font-bold tracking-tight
          transition-all duration-200
          focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2
          disabled:cursor-not-allowed disabled:transform-none
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
                {...props}
            >
                {isLoading && (
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                )}
                {children}
            </button>
        )
    }
)

Button.displayName = 'Button'

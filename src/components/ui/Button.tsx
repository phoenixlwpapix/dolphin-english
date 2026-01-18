import { type ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
    isLoading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 disabled:bg-primary-300 hover:scale-105 shadow-none',
    secondary:
        'bg-muted text-foreground hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 hover:scale-105',
    ghost:
        'bg-transparent text-foreground hover:bg-muted active:bg-gray-200',
    danger:
        'bg-error text-white hover:scale-105 active:bg-red-600',
}

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-md',
    md: 'h-14 px-6 py-2 text-base gap-2 rounded-md', // Matching "h-14 to h-16" guideline roughly
    lg: 'h-16 px-8 py-3 text-lg gap-2.5 rounded-md',
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
          focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2
          disabled:cursor-not-allowed disabled:transform-none
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
                {...props}
            >
                {isLoading && (
                    <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                )}
                {children}
            </button>
        )
    }
)

Button.displayName = 'Button'

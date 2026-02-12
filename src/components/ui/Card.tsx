import { type HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'outlined'
    padding?: 'none' | 'sm' | 'md' | 'lg'
    interactive?: boolean
}

const variantClasses = {
    default: 'bg-surface border border-border',
    elevated: 'bg-surface border border-border shadow-md',
    outlined: 'bg-transparent border-2 border-border',
}

const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6', // Generous padding
    lg: 'p-8',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className = '', variant = 'default', padding = 'md', interactive = false, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={`
          rounded-lg
          ${variantClasses[variant]}
          ${paddingClasses[padding]}
          ${interactive ? 'group cursor-pointer hover:border-accent transition-all duration-200' : ''}
          ${className}
        `}
                {...props}
            >
                {children}
            </div>
        )
    }
)

Card.displayName = 'Card'

// Card sub-components
export function CardHeader({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`mb-4 ${className}`} {...props}>
            {children}
        </div>
    )
}

export function CardTitle({ className = '', children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3 className={`text-lg font-semibold text-foreground ${className}`} {...props}>
            {children}
        </h3>
    )
}

export function CardDescription({ className = '', children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p className={`text-sm text-muted-foreground mt-1 ${className}`} {...props}>
            {children}
        </p>
    )
}

export function CardContent({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={className} {...props}>
            {children}
        </div>
    )
}

export function CardFooter({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`mt-4 pt-4 border-t border-border flex items-center gap-2 ${className}`} {...props}>
            {children}
        </div>
    )
}

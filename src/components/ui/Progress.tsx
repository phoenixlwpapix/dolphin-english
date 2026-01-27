import { Check } from 'lucide-react'

interface ProgressBarProps {
    value: number // 0-100
    size?: 'sm' | 'md' | 'lg'
    showLabel?: boolean
    variant?: 'default' | 'success' | 'warning'
    className?: string
}

const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
}

const variantClasses = {
    default: 'bg-primary-500',
    success: 'bg-success',
    warning: 'bg-warning',
}

export function ProgressBar({
    value,
    size = 'md',
    showLabel = false,
    variant = 'default',
    className = '',
}: ProgressBarProps) {
    const clampedValue = Math.min(100, Math.max(0, value))

    return (
        <div className={`w-full ${className}`}>
            {showLabel && (
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{Math.round(clampedValue)}%</span>
                </div>
            )}
            <div className={`w-full bg-surface rounded-full overflow-hidden ${sizeClasses[size]}`}>
                <div
                    className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full transition-all duration-300 ease-out`}
                    style={{ width: `${clampedValue}%` }}
                    role="progressbar"
                    aria-valuenow={clampedValue}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            </div>
        </div>
    )
}

// Module Progress Steps
interface ModuleStepsProps {
    currentModule: number
    completedModules: number[]
    totalModules?: number
    onModuleClick?: (module: number) => void
    moduleNames: string[]
    moduleTimes?: number[]
}

export function ModuleSteps({
    currentModule,
    completedModules,
    totalModules = 6,
    onModuleClick,
    moduleNames,
    moduleTimes,
    orientation = 'horizontal',
}: ModuleStepsProps & { orientation?: 'horizontal' | 'vertical' }) {
    const isVertical = orientation === 'vertical'

    // Calculate the highest module the user has ever reached
    const maxCompleted = completedModules.length > 0 ? Math.max(...completedModules) : 0
    const maxReachedModule = Math.max(currentModule, maxCompleted)

    return (
        <div className={`flex w-full ${isVertical ? 'flex-col gap-4' : 'items-center justify-between'}`}>
            {Array.from({ length: totalModules }, (_, i) => i + 1).map((moduleNum) => {
                const isCompleted = completedModules.includes(moduleNum)
                const isCurrent = moduleNum === currentModule
                const isAccessible = moduleNum <= maxReachedModule

                return (
                    <div
                        key={moduleNum}
                        className={`${!isVertical ? 'module-step' : ''} flex ${isVertical ? 'flex-row items-center gap-3 w-full' : 'flex-col items-center flex-1'}`}
                    >
                        <button
                            onClick={() => isAccessible && onModuleClick?.(moduleNum)}
                            disabled={!isAccessible}
                            className={`
                ${isVertical ? 'w-10 h-10 text-base' : 'w-12 h-12 text-lg'} 
                rounded-lg flex items-center justify-center
                font-bold transition-all duration-200
                ${isCompleted
                                    ? 'bg-secondary text-white completed hover:scale-105'
                                    : isCurrent
                                        ? 'bg-primary text-white scale-110'
                                        : isAccessible
                                            ? 'bg-surface text-foreground border-4 border-muted hover:border-primary-300 hover:scale-105'
                                            : 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
                                }
              `}
                            aria-label={`${moduleNames[moduleNum - 1] || `Module ${moduleNum}`}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
                        >
                            {isCompleted ? (
                                <Check className="w-5 h-5" />
                            ) : (
                                moduleNum
                            )}
                        </button>
                        <span
                            className={`
                                ${isVertical ? 'text-left text-sm' : 'mt-2 text-xs text-center max-w-[80px] truncate'} 
                                ${isCurrent ? 'text-primary-600 font-medium' : 'text-muted-foreground'}
                            `}
                        >
                            {moduleNames[moduleNum - 1]}
                        </span>
                        {isVertical && moduleTimes && (
                            <span className="ml-auto text-xs text-muted-foreground font-medium whitespace-nowrap">
                                {moduleTimes[moduleNum - 1]} min
                            </span>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

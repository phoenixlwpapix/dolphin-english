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
                <div className="flex justify-between text-sm text-muted mb-1">
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
}

export function ModuleSteps({
    currentModule,
    completedModules,
    totalModules = 6,
    onModuleClick,
    moduleNames,
}: ModuleStepsProps) {
    return (
        <div className="flex items-center justify-between w-full">
            {Array.from({ length: totalModules }, (_, i) => i + 1).map((moduleNum) => {
                const isCompleted = completedModules.includes(moduleNum)
                const isCurrent = moduleNum === currentModule
                const isAccessible = moduleNum <= currentModule || isCompleted

                return (
                    <div key={moduleNum} className="module-step flex flex-col items-center flex-1">
                        <button
                            onClick={() => isAccessible && onModuleClick?.(moduleNum)}
                            disabled={!isAccessible}
                            className={`
                w-10 h-10 rounded-full flex items-center justify-center
                font-semibold text-sm transition-all duration-200
                ${isCompleted
                                    ? 'bg-success text-white completed'
                                    : isCurrent
                                        ? 'bg-primary-500 text-white ring-4 ring-primary-200'
                                        : isAccessible
                                            ? 'bg-surface text-foreground border border-border hover:border-primary-300'
                                            : 'bg-surface text-muted border border-border cursor-not-allowed opacity-50'
                                }
              `}
                            aria-label={`${moduleNames[moduleNum - 1] || `Module ${moduleNum}`}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
                        >
                            {isCompleted ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                moduleNum
                            )}
                        </button>
                        <span
                            className={`mt-2 text-xs text-center max-w-[80px] truncate ${isCurrent ? 'text-primary-600 font-medium' : 'text-muted'
                                }`}
                        >
                            {moduleNames[moduleNum - 1]}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

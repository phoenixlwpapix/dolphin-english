// Pure utility functions for progress calculations
// Database operations are now handled by Convex in convex/progress.ts

const TOTAL_MODULES = 6

export function getProgressPercentage(completedModules: number[] | undefined): number {
    if (!completedModules) return 0
    return Math.round((completedModules.length / TOTAL_MODULES) * 100)
}

export function isModuleAccessible(
    progress: { currentModule: number; completedModules: number[] } | null | undefined,
    moduleNumber: number
): boolean {
    if (!progress) return moduleNumber === 1
    // Can access if it's the current module or already completed
    return moduleNumber <= progress.currentModule || progress.completedModules.includes(moduleNumber)
}

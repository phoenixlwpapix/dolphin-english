export const TOTAL_MODULES = 6

export const MODULE_TIMES = [2, 6, 12, 5, 5, 2] // in minutes

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const

export type DifficultyLevel = typeof CEFR_LEVELS[number]

export const DIFFICULTY_CONFIG: Record<DifficultyLevel, { color: string; border: string; accent: string; label: string }> = {
    A1: { color: 'text-lime-600 bg-lime-50 dark:bg-lime-900/20 dark:text-lime-400', border: 'border-lime-400 dark:border-lime-500', accent: 'bg-lime-400', label: 'Beginner' },
    A2: { color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400', border: 'border-emerald-400 dark:border-emerald-500', accent: 'bg-emerald-400', label: 'Elementary' },
    B1: { color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400', border: 'border-cyan-400 dark:border-cyan-500', accent: 'bg-cyan-400', label: 'Intermediate' },
    B2: { color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400', border: 'border-blue-400 dark:border-blue-500', accent: 'bg-blue-400', label: 'Upper Intermediate' },
    C1: { color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400', border: 'border-purple-400 dark:border-purple-500', accent: 'bg-purple-400', label: 'Advanced' },
    C2: { color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400', border: 'border-rose-400 dark:border-rose-500', accent: 'bg-rose-400', label: 'Proficient' },
}

export const PATH_GRADIENTS = [
    "bg-cyan-500",
    "bg-emerald-500",
    "bg-violet-500",
    "bg-rose-500",
    "bg-amber-500",
    "bg-indigo-500",
    "bg-lime-500",
    "bg-fuchsia-500",
] as const

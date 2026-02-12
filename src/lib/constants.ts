export const TOTAL_MODULES = 6

export const MODULE_TIMES = [2, 6, 12, 5, 5, 2] // in minutes

export const DIFFICULTY_CONFIG = {
    A1: { color: 'text-lime-600 bg-lime-50 dark:bg-lime-900/20 dark:text-lime-400', border: 'border-lime-400 dark:border-lime-500', accent: 'bg-lime-400', label: 'Beginner' },
    'A1+': { color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400', border: 'border-green-400 dark:border-green-500', accent: 'bg-green-400', label: 'Upper Beginner' },
    A2: { color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400', border: 'border-emerald-400 dark:border-emerald-500', accent: 'bg-emerald-400', label: 'Elementary' },
    'A2+': { color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400', border: 'border-teal-400 dark:border-teal-500', accent: 'bg-teal-400', label: 'Upper Elementary' },
    B1: { color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400', border: 'border-cyan-400 dark:border-cyan-500', accent: 'bg-cyan-400', label: 'Intermediate' },
    'B1+': { color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400', border: 'border-blue-400 dark:border-blue-500', accent: 'bg-blue-400', label: 'Upper Intermediate' },
    B2: { color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400', border: 'border-indigo-400 dark:border-indigo-500', accent: 'bg-indigo-400', label: 'Upper Intermediate+' },
    'B2+': { color: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400', border: 'border-violet-400 dark:border-violet-500', accent: 'bg-violet-400', label: 'Pre-Advanced' },
    C1: { color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400', border: 'border-purple-400 dark:border-purple-500', accent: 'bg-purple-400', label: 'Advanced' },
    'C1+': { color: 'text-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-900/20 dark:text-fuchsia-400', border: 'border-fuchsia-400 dark:border-fuchsia-500', accent: 'bg-fuchsia-400', label: 'Upper Advanced' },
    C2: { color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400', border: 'border-rose-400 dark:border-rose-500', accent: 'bg-rose-400', label: 'Proficient' },
} as const

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

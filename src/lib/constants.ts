export const TOTAL_MODULES = 6

export const MODULE_TIMES = [2, 6, 12, 5, 5, 2] // in minutes

export const DIFFICULTY_CONFIG = {
    A1: { color: 'text-lime-600 bg-lime-50 dark:bg-lime-900/20 dark:text-lime-400', border: 'border-lime-400 dark:border-lime-500', accent: 'from-lime-400 to-lime-500', label: 'Beginner' },
    'A1+': { color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400', border: 'border-green-400 dark:border-green-500', accent: 'from-green-400 to-green-500', label: 'Upper Beginner' },
    A2: { color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400', border: 'border-emerald-400 dark:border-emerald-500', accent: 'from-emerald-400 to-emerald-500', label: 'Elementary' },
    'A2+': { color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400', border: 'border-teal-400 dark:border-teal-500', accent: 'from-teal-400 to-teal-500', label: 'Upper Elementary' },
    B1: { color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400', border: 'border-cyan-400 dark:border-cyan-500', accent: 'from-cyan-400 to-cyan-500', label: 'Intermediate' },
    'B1+': { color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400', border: 'border-blue-400 dark:border-blue-500', accent: 'from-blue-400 to-blue-500', label: 'Upper Intermediate' },
    B2: { color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400', border: 'border-indigo-400 dark:border-indigo-500', accent: 'from-indigo-400 to-indigo-500', label: 'Upper Intermediate+' },
    'B2+': { color: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400', border: 'border-violet-400 dark:border-violet-500', accent: 'from-violet-400 to-violet-500', label: 'Pre-Advanced' },
    C1: { color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400', border: 'border-purple-400 dark:border-purple-500', accent: 'from-purple-400 to-purple-500', label: 'Advanced' },
    'C1+': { color: 'text-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-900/20 dark:text-fuchsia-400', border: 'border-fuchsia-400 dark:border-fuchsia-500', accent: 'from-fuchsia-400 to-fuchsia-500', label: 'Upper Advanced' },
    C2: { color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400', border: 'border-rose-400 dark:border-rose-500', accent: 'from-rose-400 to-rose-500', label: 'Proficient' },
} as const

export const PATH_GRADIENTS = [
    "from-cyan-500 to-blue-600",
    "from-emerald-500 to-teal-600",
    "from-violet-500 to-purple-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
    "from-indigo-500 to-blue-700",
    "from-lime-500 to-green-600",
    "from-fuchsia-500 to-pink-700",
] as const

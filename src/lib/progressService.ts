import { db, type Progress, type QuizResult } from '@/db'

const TOTAL_MODULES = 6

export async function getProgress(courseId: number): Promise<Progress | undefined> {
    return db.progress.where('courseId').equals(courseId).first()
}

export async function createProgress(courseId: number): Promise<number> {
    const id = await db.progress.add({
        courseId,
        currentModule: 1,
        completedModules: [],
        quizResults: [],
        vocabularyClicks: [],
        lastAccessedAt: new Date(),
    })
    return id as number
}

export async function updateCurrentModule(
    courseId: number,
    moduleNumber: number
): Promise<void> {
    const progress = await getProgress(courseId)
    if (progress?.id) {
        await db.progress.update(progress.id, {
            currentModule: moduleNumber,
            lastAccessedAt: new Date(),
        })
    }
}

export async function completeModule(
    courseId: number,
    moduleNumber: number
): Promise<void> {
    const progress = await getProgress(courseId)
    if (progress?.id) {
        const completedModules = [...progress.completedModules]
        if (!completedModules.includes(moduleNumber)) {
            completedModules.push(moduleNumber)
        }

        // Determine next module
        const nextModule = moduleNumber < TOTAL_MODULES ? moduleNumber + 1 : moduleNumber

        await db.progress.update(progress.id, {
            completedModules,
            currentModule: nextModule,
            lastAccessedAt: new Date(),
        })
    }
}

export async function saveQuizResults(
    courseId: number,
    results: QuizResult[]
): Promise<void> {
    const progress = await getProgress(courseId)
    if (progress?.id) {
        await db.progress.update(progress.id, {
            quizResults: results,
            lastAccessedAt: new Date(),
        })
    }
}

export async function recordVocabularyClick(
    courseId: number,
    word: string
): Promise<void> {
    const progress = await getProgress(courseId)
    if (progress?.id) {
        const clicks = [...progress.vocabularyClicks]
        if (!clicks.includes(word)) {
            clicks.push(word)
        }
        await db.progress.update(progress.id, {
            vocabularyClicks: clicks,
            lastAccessedAt: new Date(),
        })
    }
}

export async function resetProgress(courseId: number): Promise<void> {
    const progress = await getProgress(courseId)
    if (progress?.id) {
        await db.progress.update(progress.id, {
            currentModule: 1,
            completedModules: [],
            quizResults: [],
            vocabularyClicks: [],
            lastAccessedAt: new Date(),
        })
    }
}

export function getProgressPercentage(progress: Progress | undefined): number {
    if (!progress) return 0
    return Math.round((progress.completedModules.length / TOTAL_MODULES) * 100)
}

export function isModuleAccessible(progress: Progress | undefined, moduleNumber: number): boolean {
    if (!progress) return moduleNumber === 1
    // Can access if it's the current module or already completed
    return moduleNumber <= progress.currentModule || progress.completedModules.includes(moduleNumber)
}

import { query } from "./_generated/server"
import { auth } from "./auth"

const TOTAL_MODULES = 6

const CEFR_ORDER = [
    "A1", "A1+", "A2", "A2+", "B1", "B1+",
    "B2", "B2+", "C1", "C1+", "C2",
]

export const getAnalytics = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx)
        if (!userId) return null

        const userCourses = await ctx.db
            .query("userCourses")
            .withIndex("by_userId", (q) => q.eq("userId", userId.toString()))
            .collect()

        const empty = {
            summary: {
                totalWordsLearned: 0,
                coursesCompleted: 0,
                coursesInProgress: 0,
                totalVocabularyClicked: 0,
            },
            quizAccuracyByType: {
                "main-idea": { correct: 0, total: 0 },
                "detail": { correct: 0, total: 0 },
                "vocabulary": { correct: 0, total: 0 },
            },
            vocabularyByLevel: [] as Array<{ level: string; clicked: number; total: number }>,
            activityData: [] as Array<{ date: string; count: number }>,
            weeklyActivity: [] as Array<{ weekLabel: string; count: number }>,
        }

        if (userCourses.length === 0) return empty

        // Fetch all courses and progress in parallel
        const coursesWithProgress = await Promise.all(
            userCourses.map(async (uc) => {
                const course = await ctx.db.get(uc.courseId)
                const progress = await ctx.db
                    .query("progress")
                    .withIndex("by_courseId", (q) => q.eq("courseId", uc.courseId))
                    .first()
                return { course, progress, addedAt: uc.addedAt }
            })
        )

        // Aggregation accumulators
        let totalWordsLearned = 0
        let coursesCompleted = 0
        let coursesInProgress = 0
        let totalVocabularyClicked = 0

        const quizAccuracy: Record<string, { correct: number; total: number }> = {
            "main-idea": { correct: 0, total: 0 },
            "detail": { correct: 0, total: 0 },
            "vocabulary": { correct: 0, total: 0 },
        }

        const vocabByLevel: Record<string, { clicked: number; total: number }> = {}
        const allTimestamps: number[] = []

        for (const { course, progress, addedAt } of coursesWithProgress) {
            if (!course) continue

            const isCompleted = progress?.completedModules?.length === TOTAL_MODULES
            const hasProgress = progress && progress.completedModules.length > 0

            if (isCompleted) {
                coursesCompleted++
                totalWordsLearned += course.wordCount
            } else if (hasProgress) {
                coursesInProgress++
            }

            // Vocabulary clicks
            if (progress?.vocabularyClicks) {
                totalVocabularyClicked += progress.vocabularyClicks.length
            }

            // Quiz results — cross-reference with course quiz questions for type
            if (progress?.quizResults && course.analyzedData?.quizQuestions) {
                const questionMap = new Map(
                    course.analyzedData.quizQuestions.map((q) => [q.id, q.type])
                )
                for (const result of progress.quizResults) {
                    const qType = questionMap.get(result.questionId)
                    if (qType && quizAccuracy[qType]) {
                        quizAccuracy[qType].total++
                        if (result.isCorrect) {
                            quizAccuracy[qType].correct++
                        }
                    }
                }
            }

            // Vocabulary by CEFR level
            const level = course.difficulty
            if (!vocabByLevel[level]) {
                vocabByLevel[level] = { clicked: 0, total: 0 }
            }
            vocabByLevel[level].total += course.analyzedData?.vocabulary?.length ?? 0
            vocabByLevel[level].clicked += progress?.vocabularyClicks?.length ?? 0

            // Activity timestamps from moduleCompletions
            if (progress?.moduleCompletions) {
                for (const mc of progress.moduleCompletions) {
                    allTimestamps.push(mc.completedAt)
                }
            }

            // Include enrollment as an activity event
            allTimestamps.push(addedAt)
        }

        // Build activity data (day-level counts for heatmap)
        const dayCounts: Record<string, number> = {}
        for (const ts of allTimestamps) {
            const d = new Date(ts)
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
            dayCounts[key] = (dayCounts[key] ?? 0) + 1
        }
        const activityData = Object.entries(dayCounts)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date))

        // Build weekly activity (last 12 weeks)
        const now = Date.now()
        const weeklyActivity: Array<{ weekLabel: string; count: number }> = []
        for (let i = 11; i >= 0; i--) {
            const weekStart = now - (i + 1) * 7 * 24 * 60 * 60 * 1000
            const weekEnd = now - i * 7 * 24 * 60 * 60 * 1000
            const count = allTimestamps.filter((ts) => ts >= weekStart && ts < weekEnd).length
            const startDate = new Date(weekStart)
            const label = `${startDate.getMonth() + 1}/${startDate.getDate()}`
            weeklyActivity.push({ weekLabel: label, count })
        }

        // Convert vocabByLevel to sorted array
        const vocabularyByLevel = Object.entries(vocabByLevel)
            .map(([level, data]) => ({ level, ...data }))
            .sort((a, b) => CEFR_ORDER.indexOf(a.level) - CEFR_ORDER.indexOf(b.level))

        return {
            summary: {
                totalWordsLearned,
                coursesCompleted,
                coursesInProgress,
                totalVocabularyClicked,
            },
            quizAccuracyByType: quizAccuracy,
            vocabularyByLevel,
            activityData,
            weeklyActivity,
        }
    },
})

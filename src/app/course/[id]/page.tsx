'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Header } from '@/components/layout'
import { Button, Card, ModuleSteps } from '@/components/ui'
import { useI18n } from '@/lib/i18n'
import type { Id } from '../../../../convex/_generated/dataModel'

// Module components
import {
    LearningObjectives,
    FullListening,
    ParagraphAnalysis,
    VocabularyLearning,
    ComprehensionQuiz,
    ContentReproduction
} from '@/components/modules'

const MODULE_TIMES = [2, 6, 12, 5, 5, 2] // in minutes
const TOTAL_MODULES = 6

export default function CoursePage() {
    const params = useParams()
    const router = useRouter()
    const { t } = useI18n()
    const courseId = params.id as Id<"courses">

    const course = useQuery(api.courses.get, { id: courseId })
    const progress = useQuery(api.progress.get, { courseId })

    const completeModuleMutation = useMutation(api.progress.completeModule)
    const resetProgressMutation = useMutation(api.progress.reset)
    const updateCurrentModuleMutation = useMutation(api.progress.updateCurrentModule)

    const moduleNames = [
        t.modules.objectives,
        t.modules.listening,
        t.modules.analysis,
        t.modules.vocabulary,
        t.modules.quiz,
        t.modules.reproduction,
    ]

    const isLoading = course === undefined || progress === undefined

    async function handleModuleComplete(moduleNumber: number) {
        await completeModuleMutation({ courseId, moduleNumber })
    }

    async function handleRestart() {
        await resetProgressMutation({ courseId })
    }

    function handleModuleClick(moduleNumber: number) {
        if (progress && moduleNumber <= progress.currentModule) {
            updateCurrentModuleMutation({ courseId, moduleNumber })
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
        )
    }

    if (!course || !course.analyzedData) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <Card className="py-16 text-center">
                        <h2 className="text-xl font-semibold text-foreground mb-2">Course not ready</h2>
                        <p className="text-muted-foreground mb-4">The course could not be loaded or is still being analyzed.</p>
                        <Button onClick={() => router.push('/')}>{t.common.back}</Button>
                    </Card>
                </main>
            </div>
        )
    }

    const currentModule = progress?.currentModule ?? 1
    const isComplete = progress?.completedModules.length === TOTAL_MODULES

    return (
        <div className="min-h-screen bg-background">
            <Header>
                <Button variant="ghost" onClick={() => router.push('/')}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    {t.common.back}
                </Button>
            </Header>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Course header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground mb-2">{course.title}</h1>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                                    {course.difficulty}
                                </span>
                                <span>{course.wordCount} words</span>
                                <span>
                                    {t.course.totalTime}: {MODULE_TIMES.reduce((a, b) => a + b, 0)} {t.course.minutes}
                                </span>
                            </div>
                        </div>
                        {isComplete && (
                            <Button variant="secondary" size="sm" onClick={handleRestart}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {t.common.restart}
                            </Button>
                        )}
                    </div>

                    {/* Module progress */}
                    <Card padding="lg" className="mb-8">
                        <ModuleSteps
                            currentModule={currentModule}
                            completedModules={progress?.completedModules ?? []}
                            moduleNames={moduleNames}
                            onModuleClick={handleModuleClick}
                        />
                    </Card>
                </div>

                {/* Current module content */}
                <div className="mb-8">
                    {currentModule === 1 && (
                        <LearningObjectives
                            objectives={course.analyzedData.learningObjectives}
                            onComplete={() => handleModuleComplete(1)}
                        />
                    )}
                    {currentModule === 2 && (
                        <FullListening
                            content={course.content}
                            onComplete={() => handleModuleComplete(2)}
                        />
                    )}
                    {currentModule === 3 && (
                        <ParagraphAnalysis
                            paragraphs={course.analyzedData.paragraphs}
                            onComplete={() => handleModuleComplete(3)}
                        />
                    )}
                    {currentModule === 4 && (
                        <VocabularyLearning
                            vocabulary={course.analyzedData.vocabulary}
                            courseId={courseId}
                            onComplete={() => handleModuleComplete(4)}
                        />
                    )}
                    {currentModule === 5 && (
                        <ComprehensionQuiz
                            questions={course.analyzedData.quizQuestions}
                            courseId={courseId}
                            onComplete={() => handleModuleComplete(5)}
                        />
                    )}
                    {currentModule === 6 && (
                        <ContentReproduction
                            paragraphs={course.analyzedData.paragraphs}
                            onComplete={() => handleModuleComplete(6)}
                        />
                    )}
                </div>
            </main>
        </div>
    )
}

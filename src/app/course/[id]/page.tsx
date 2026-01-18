'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Header } from '@/components/layout'
import { Button, Card, ModuleSteps, ConfirmModal } from '@/components/ui'
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

    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean
        type: 'restart' | 'delete' | null
    }>({ isOpen: false, type: null })

    const [isActionLoading, setIsActionLoading] = useState(false)

    const course = useQuery(api.courses.get, { id: courseId })
    const progress = useQuery(api.progress.get, { courseId })

    const completeModuleMutation = useMutation(api.progress.completeModule)
    const resetProgressMutation = useMutation(api.progress.reset)
    const updateCurrentModuleMutation = useMutation(api.progress.updateCurrentModule)
    const deleteCourseMutation = useMutation(api.courses.remove)

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

    function handleRestart() {
        setConfirmState({ isOpen: true, type: 'restart' })
    }

    function handleDelete() {
        setConfirmState({ isOpen: true, type: 'delete' })
    }

    async function handleConfirm() {
        if (!confirmState.type) return

        setIsActionLoading(true)
        try {
            if (confirmState.type === 'restart') {
                await resetProgressMutation({ courseId })
                setConfirmState({ isOpen: false, type: null })
            } else if (confirmState.type === 'delete') {
                await deleteCourseMutation({ id: courseId })
                router.push('/')
            }
        } catch (error) {
            console.error('Action failed:', error)
        } finally {
            setIsActionLoading(false)
        }
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
        <div className="min-h-screen bg-background pb-20">
            <Header />

            <main className="container mx-auto px-4 py-8 mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Sidebar (Desktop) */}
                    <div className="hidden lg:block lg:col-span-3">
                        <div className="sticky top-24 space-y-6">
                            <Button variant="ghost" size="sm" className="-ml-3 mb-2" onClick={() => router.push('/')}>
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                {t.common.back}
                            </Button>

                            <Card padding="lg" className="space-y-6">
                                <div>
                                    <h1 className="text-xl font-bold text-foreground mb-3 leading-tight">{course.title}</h1>
                                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
                                        <span className={`px-2 py-0.5 rounded-full ${course.difficulty === 'A2' ? 'bg-green-100 text-green-700' :
                                            course.difficulty === 'A2+' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {course.difficulty}
                                        </span>
                                        <span className="flex items-center">
                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {MODULE_TIMES.reduce((a, b) => a + b, 0)} {t.course.minutes}
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {course.wordCount} words
                                    </div>
                                </div>

                                <div className="border-t border-border/50 pt-6">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 pl-1">
                                        Course Progress
                                    </h3>
                                    <ModuleSteps
                                        currentModule={currentModule}
                                        completedModules={progress?.completedModules ?? []}
                                        moduleNames={moduleNames}
                                        onModuleClick={handleModuleClick}
                                        orientation="vertical"
                                    />
                                </div>

                                <div className="border-t border-border/50 pt-6 space-y-3">
                                    {isComplete && (
                                        <Button variant="secondary" className="w-full justify-center" onClick={handleRestart}>
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            {t.common.restart}
                                        </Button>
                                    )}

                                    <Button
                                        variant="danger"
                                        className="w-full justify-center"
                                        onClick={handleDelete}
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        {t.common.deleteCourse}
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="col-span-1 lg:col-span-9">
                        {/* Mobile Header (Hidden on Desktop) */}
                        <div className="lg:hidden mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <Button variant="ghost" size="sm" className="-ml-2" onClick={() => router.push('/')}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </Button>
                                <h1 className="text-lg font-bold text-foreground text-center flex-1 mx-2 truncate">{course.title}</h1>
                                <div className="flex items-center gap-1">
                                    {isComplete && (
                                        <Button variant="ghost" size="sm" onClick={handleRestart}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                        </Button>
                                    )}
                                    <Button variant="danger" size="sm" onClick={handleDelete}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </Button>
                                </div>
                            </div>

                            <Card padding="md" className="mb-6">
                                <ModuleSteps
                                    currentModule={currentModule}
                                    completedModules={progress?.completedModules ?? []}
                                    moduleNames={moduleNames}
                                    onModuleClick={handleModuleClick}
                                    orientation="horizontal"
                                />
                            </Card>
                        </div>

                        {/* Active Module Content */}
                        <div className="w-full">
                            {currentModule === 1 && (
                                <LearningObjectives
                                    objectives={course.analyzedData.learningObjectives}
                                    onComplete={() => handleModuleComplete(1)}
                                />
                            )}
                            {currentModule === 2 && (
                                <FullListening
                                    content={course.content}
                                    vocabulary={course.analyzedData.vocabulary}
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
                    </div>
                </div>
            </main>

            <ConfirmModal
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState({ ...confirmState, isOpen: false })}
                onConfirm={handleConfirm}
                title={confirmState.type === 'restart' ? t.common.restart : t.common.delete}
                description={
                    confirmState.type === 'restart'
                        ? `${t.common.restart}? ${t.common.confirm}?`
                        : `${t.common.delete}? ${t.common.confirm}?`
                }
                confirmText={t.common.confirm}
                cancelText={t.common.cancel}
                variant={confirmState.type === 'delete' ? 'destructive' : 'default'}
                isLoading={isActionLoading}
            />
        </div>
    )
}

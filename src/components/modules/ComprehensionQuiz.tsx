'use client'

import { useState, useCallback } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import {
    Card,
    CardContent,
    Button,
    CheckIcon,
    WarningIcon,
    ChevronRightIcon,
    ClipboardListIcon,
    CheckFilledIcon,
    XFilledIcon,
} from '@/components/ui'
import { useI18n } from '@/lib/i18n'
import type { QuizQuestion } from '@/lib/schemas'
import type { Id } from '../../../convex/_generated/dataModel'

/** Minimum passing percentage for quiz */
const PASSING_PERCENTAGE = 0.6

interface QuizResult {
    questionId: string
    selectedAnswer: number
    isCorrect: boolean
}

interface ComprehensionQuizProps {
    questions: QuizQuestion[]
    courseId: Id<"courses">
    onComplete: () => void
}

export function ComprehensionQuiz({ questions, courseId, onComplete }: ComprehensionQuizProps) {
    const { t } = useI18n()
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [isChecked, setIsChecked] = useState(false)
    const [showReference, setShowReference] = useState(false)
    const [results, setResults] = useState<QuizResult[]>([])
    const [isComplete, setIsComplete] = useState(false)

    const saveQuizResultsMutation = useMutation(api.progress.saveQuizResults)

    const question = questions[currentQuestion]
    const isCorrect = selectedAnswer === question.correctAnswer
    const isLastQuestion = currentQuestion === questions.length - 1

    const handleCheck = useCallback(() => {
        if (selectedAnswer === null) return
        setIsChecked(true)

        const result: QuizResult = {
            questionId: question.id,
            selectedAnswer,
            isCorrect: selectedAnswer === question.correctAnswer,
        }
        setResults([...results, result])
    }, [selectedAnswer, question, results])

    const handleNext = useCallback(async () => {
        if (isLastQuestion) {
            const finalResults = [...results]
            await saveQuizResultsMutation({ courseId, results: finalResults })
            setIsComplete(true)
        } else {
            setCurrentQuestion(currentQuestion + 1)
            setSelectedAnswer(null)
            setIsChecked(false)
            setShowReference(false)
        }
    }, [isLastQuestion, results, courseId, currentQuestion, saveQuizResultsMutation])

    const score = results.filter((r) => r.isCorrect).length
    const passingScore = Math.ceil(questions.length * PASSING_PERCENTAGE)

    if (isComplete) {
        const passed = score >= passingScore

        return (
            <Card>
                <CardContent className="text-center py-12">
                    <div
                        className={`
              w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center
              ${passed ? 'bg-success/20' : 'bg-warning/20'}
            `}
                    >
                        {passed ? (
                            <CheckIcon className="w-10 h-10 text-success" />
                        ) : (
                            <WarningIcon className="w-10 h-10 text-warning" />
                        )}
                    </div>

                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        {passed ? t.quiz.passed : t.quiz.tryAgain}
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6">
                        {t.quiz.score}: {score} / {questions.length}
                    </p>

                    <Button onClick={onComplete} size="lg">
                        {t.common.next}
                        <ChevronRightIcon className="w-5 h-5" />
                    </Button>
                </CardContent>
            </Card>
        )
    }

    const typeLabels: Record<string, string> = {
        'main-idea': t.quiz.questionTypes.mainIdea,
        'detail': t.quiz.questionTypes.detail,
        'vocabulary': t.quiz.questionTypes.vocabulary,
    }

    return (
        <Card>
            <CardContent>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <ClipboardListIcon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">{t.quiz.title}</h2>
                        <p className="text-sm text-muted-foreground">{t.course.module} 5 · 5 {t.course.minutes}</p>
                    </div>
                </div>

                {/* Progress */}
                <div className="flex items-center justify-between mb-6 text-sm text-muted-foreground">
                    <span>
                        {t.quiz.question} {currentQuestion + 1} {t.quiz.of} {questions.length}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-surface text-xs">{typeLabels[question.type]}</span>
                </div>

                {/* Question */}
                <div className="mb-6">
                    <h3 className="text-xl font-medium text-foreground mb-4">{question.question}</h3>

                    <div className="space-y-2">
                        {question.options.map((option, index) => {
                            let optionStyle = 'border-border bg-surface hover:border-primary-300'
                            if (isChecked) {
                                if (index === question.correctAnswer) {
                                    optionStyle = 'border-success bg-success/10'
                                } else if (index === selectedAnswer && !isCorrect) {
                                    optionStyle = 'border-error bg-error/10'
                                }
                            } else if (selectedAnswer === index) {
                                optionStyle = 'border-primary-500 bg-primary-50'
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => !isChecked && setSelectedAnswer(index)}
                                    disabled={isChecked}
                                    className={`
                    w-full p-4 rounded-lg border text-left transition-all
                    ${optionStyle}
                    ${isChecked ? 'cursor-default' : 'cursor-pointer'}
                  `}
                                >
                                    <span className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-sm font-medium shrink-0">
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                        <span className="text-foreground text-lg">{option}</span>
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Feedback */}
                {isChecked && (
                    <div className={`p-4 rounded-lg mb-6 ${isCorrect ? 'bg-success/10' : 'bg-error/10'}`}>
                        <div className="flex items-center gap-2 font-medium">
                            {isCorrect ? (
                                <>
                                    <CheckFilledIcon className="w-5 h-5 text-success" />
                                    <span className="text-success">{t.quiz.correct}</span>
                                </>
                            ) : (
                                <>
                                    <XFilledIcon className="w-5 h-5 text-error" />
                                    <span className="text-error">{t.quiz.incorrect}</span>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => setShowReference(!showReference)}
                            className="mt-2 text-sm text-primary-600 hover:underline"
                        >
                            {t.quiz.seeReference}
                        </button>

                        {showReference && (
                            <div className="mt-3 p-3 bg-background rounded border border-border">
                                <p className="text-base text-muted-foreground italic">&ldquo;{question.sourceReference}&rdquo;</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    {!isChecked ? (
                        <Button onClick={handleCheck} disabled={selectedAnswer === null}>
                            {t.quiz.checkAnswer}
                        </Button>
                    ) : (
                        <Button onClick={handleNext}>
                            {isLastQuestion ? t.common.complete : t.common.next}
                            <ChevronRightIcon className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

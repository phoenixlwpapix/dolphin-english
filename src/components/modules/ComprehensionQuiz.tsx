'use client'

import { useState, useCallback } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Card, CardContent, Button } from '@/components/ui'
import { useI18n } from '@/lib/i18n'
import type { QuizQuestion } from '@/lib/schemas'
import type { Id } from '../../../convex/_generated/dataModel'

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
    const passingScore = Math.ceil(questions.length * 0.6) // 60% to pass

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
                            <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-10 h-10 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
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
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    const typeLabels = {
        'main-idea': '主旨理解',
        'detail': '细节定位',
        'vocabulary': '词义理解',
    }

    return (
        <Card>
            <CardContent>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
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
                    <h3 className="text-lg font-medium text-foreground mb-4">{question.question}</h3>

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
                                        <span className="text-foreground">{option}</span>
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
                                    <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-success">{t.quiz.correct}</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 text-error" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
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
                                <p className="text-sm text-muted-foreground italic">&ldquo;{question.sourceReference}&rdquo;</p>
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
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

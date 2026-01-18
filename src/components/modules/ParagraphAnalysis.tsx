'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, Button } from '@/components/ui'
import { useI18n } from '@/lib/i18n'
import { tts, TTS_SPEEDS } from '@/lib/tts'
import type { ParagraphAnalysis as ParagraphType } from '@/lib/schemas'

interface ParagraphAnalysisProps {
    paragraphs: ParagraphType[]
    onComplete: () => void
}

export function ParagraphAnalysis({ paragraphs, onComplete }: ParagraphAnalysisProps) {
    const { t } = useI18n()
    const [currentParagraph, setCurrentParagraph] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [completedParagraphs, setCompletedParagraphs] = useState<number[]>([])

    const paragraph = paragraphs[currentParagraph]
    const isLastParagraph = currentParagraph === paragraphs.length - 1
    const allCompleted = completedParagraphs.length === paragraphs.length

    const handlePlayParagraph = useCallback(() => {
        setIsPlaying(true)
        tts.speak(
            paragraph.text,
            { rate: TTS_SPEEDS.normal },
            (event) => {
                if (event === 'end') {
                    setIsPlaying(false)
                }
            }
        )
    }, [paragraph.text])

    const handleStopPlayback = useCallback(() => {
        tts.stop()
        setIsPlaying(false)
    }, [])

    function markComplete() {
        if (!completedParagraphs.includes(currentParagraph)) {
            setCompletedParagraphs([...completedParagraphs, currentParagraph])
        }
    }

    function handleNext() {
        markComplete()
        if (!isLastParagraph) {
            setCurrentParagraph(currentParagraph + 1)
        }
    }

    function handlePrevious() {
        if (currentParagraph > 0) {
            setCurrentParagraph(currentParagraph - 1)
        }
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            tts.stop()
        }
    }, [])

    // Stop playback when changing paragraphs
    useEffect(() => {
        handleStopPlayback()
    }, [currentParagraph, handleStopPlayback])

    return (
        <Card>
            <CardContent>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">{t.analysis.title}</h2>
                        <p className="text-sm text-muted-foreground">{t.course.module} 3 · 12 {t.course.minutes}</p>
                    </div>
                </div>

                {/* Paragraph navigation */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                    {paragraphs.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentParagraph(index)}
                            className={`
                px-3 py-1 rounded-full text-sm font-medium transition-colors shrink-0
                ${currentParagraph === index
                                    ? 'bg-primary-500 text-white'
                                    : completedParagraphs.includes(index)
                                        ? 'bg-success/20 text-success'
                                        : 'bg-surface text-muted-foreground hover:text-foreground'
                                }
              `}
                        >
                            {t.analysis.paragraph} {index + 1}
                        </button>
                    ))}
                </div>

                {/* Paragraph content */}
                <div className="space-y-6">
                    {/* Original text */}
                    <div className="bg-surface rounded-lg p-4">
                        <p className="text-foreground leading-relaxed text-xl">{paragraph.text}</p>

                        {/* Read along button */}
                        <div className="mt-4 flex gap-2">
                            {!isPlaying ? (
                                <Button variant="secondary" size="sm" onClick={handlePlayParagraph}>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                    {t.analysis.practice}
                                </Button>
                            ) : (
                                <Button variant="secondary" size="sm" onClick={handleStopPlayback}>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 6h12v12H6z" />
                                    </svg>
                                    Stop
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Summary */}
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            {t.analysis.summary}
                        </h3>
                        <p className="text-foreground bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3 border-l-4 border-primary-500 text-lg">
                            {paragraph.summary}
                        </p>
                    </div>

                    {/* Language points */}
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                            {t.analysis.languagePoints}
                        </h3>
                        <div className="space-y-3">
                            {paragraph.languagePoints.map((point, index) => (
                                <div key={index} className="bg-surface rounded-lg p-4 border border-border">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold shrink-0">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-foreground text-lg">{point.point}</h4>
                                            <p className="text-base text-muted-foreground mt-1">{point.explanation}</p>
                                            <p className="text-base text-primary-600 mt-2 italic">
                                                &ldquo;{point.example}&rdquo;
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-4 border-t border-border">
                    <Button
                        variant="ghost"
                        onClick={handlePrevious}
                        disabled={currentParagraph === 0}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {t.common.previous}
                    </Button>

                    {isLastParagraph ? (
                        <Button onClick={() => { markComplete(); onComplete(); }} disabled={!allCompleted && completedParagraphs.length < paragraphs.length - 1}>
                            {t.common.complete}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </Button>
                    ) : (
                        <Button onClick={handleNext}>
                            {t.common.next}
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

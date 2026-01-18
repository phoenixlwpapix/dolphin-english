'use client'

import { useState, useCallback } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Card, CardContent, Button } from '@/components/ui'
import { useI18n } from '@/lib/i18n'
import { tts } from '@/lib/tts'
import type { VocabularyItem } from '@/lib/schemas'
import type { Id } from '../../../convex/_generated/dataModel'

interface VocabularyLearningProps {
    vocabulary: VocabularyItem[]
    courseId: Id<"courses">
    onComplete: () => void
}

export function VocabularyLearning({ vocabulary, courseId, onComplete }: VocabularyLearningProps) {
    const { t } = useI18n()
    const [viewedWords, setViewedWords] = useState<Set<string>>(new Set())
    const [expandedWord, setExpandedWord] = useState<string | null>(null)

    const recordVocabularyClickMutation = useMutation(api.progress.recordVocabularyClick)

    const categoryLabels = {
        essential: { label: t.vocabulary.essential, color: 'bg-error/20 text-error' },
        transferable: { label: t.vocabulary.transferable, color: 'bg-success/20 text-success' },
        extended: { label: t.vocabulary.extended, color: 'bg-info/20 text-info' },
    }

    const essentialWords = vocabulary.filter((v) => v.category === 'essential')
    const transferableWords = vocabulary.filter((v) => v.category === 'transferable')
    const extendedWords = vocabulary.filter((v) => v.category === 'extended')

    const allEssentialViewed = essentialWords.every((w) => viewedWords.has(w.word))

    const handleWordClick = useCallback(async (word: string) => {
        if (!viewedWords.has(word)) {
            setViewedWords((prev) => new Set([...prev, word]))
            await recordVocabularyClickMutation({ courseId, word })
        }
        setExpandedWord(expandedWord === word ? null : word)
    }, [viewedWords, expandedWord, courseId, recordVocabularyClickMutation])

    const handlePlayPronunciation = useCallback((word: string, e: React.MouseEvent) => {
        e.stopPropagation()
        tts.speak(word, { rate: 0.8 })
    }, [])

    function renderVocabularyGroup(words: VocabularyItem[], category: VocabularyItem['category']) {
        if (words.length === 0) return null
        const { label, color } = categoryLabels[category]

        return (
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${color}`}>{label}</span>
                    <span className="text-xs text-muted-foreground">({words.length})</span>
                </h3>
                <div className="space-y-2">
                    {words.map((vocab) => (
                        <VocabularyCard
                            key={vocab.word}
                            vocab={vocab}
                            isExpanded={expandedWord === vocab.word}
                            isViewed={viewedWords.has(vocab.word)}
                            onClick={() => handleWordClick(vocab.word)}
                            onPlayPronunciation={(e) => handlePlayPronunciation(vocab.word, e)}
                            t={t}
                        />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <Card>
            <CardContent>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">{t.vocabulary.title}</h2>
                        <p className="text-sm text-muted-foreground">{t.course.module} 4 · 5 {t.course.minutes}</p>
                    </div>
                </div>

                {/* Progress hint */}
                <div className="mb-6 text-sm text-muted-foreground">
                    {viewedWords.size} / {vocabulary.length} words reviewed
                </div>

                {renderVocabularyGroup(essentialWords, 'essential')}
                {renderVocabularyGroup(transferableWords, 'transferable')}
                {renderVocabularyGroup(extendedWords, 'extended')}

                <div className="flex justify-end mt-6 pt-4 border-t border-border">
                    <Button onClick={onComplete} disabled={!allEssentialViewed}>
                        {t.common.next}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

interface VocabularyCardProps {
    vocab: VocabularyItem
    isExpanded: boolean
    isViewed: boolean
    onClick: () => void
    onPlayPronunciation: (e: React.MouseEvent) => void
    t: ReturnType<typeof useI18n>['t']
}

function VocabularyCard({ vocab, isExpanded, isViewed, onClick, onPlayPronunciation, t }: VocabularyCardProps) {
    return (
        <div
            onClick={onClick}
            className={`
        rounded-lg border transition-all cursor-pointer
        ${isExpanded ? 'border-primary-300 bg-primary-50/50 dark:bg-primary-900/10' : 'border-border bg-surface hover:border-primary-200'}
        ${isViewed ? 'opacity-90' : ''}
      `}
        >
            <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground">{vocab.word}</span>
                    <span className="text-sm text-muted-foreground">{vocab.pronunciation}</span>
                    {isViewed && (
                        <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>
                <button
                    onClick={onPlayPronunciation}
                    className="p-2 rounded-full hover:bg-primary-100 transition-colors"
                    aria-label={t.vocabulary.playPronunciation}
                >
                    <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                </button>
            </div>

            {isExpanded && (
                <div className="px-3 pb-3 pt-0 border-t border-border/50 space-y-2">
                    <div>
                        <span className="text-xs text-muted-foreground uppercase">{t.vocabulary.definition}</span>
                        <p className="text-foreground">{vocab.definition}</p>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground uppercase">{t.vocabulary.example}</span>
                        <p className="text-primary-600 italic">&ldquo;{vocab.originalSentence}&rdquo;</p>
                    </div>
                </div>
            )}
        </div>
    )
}

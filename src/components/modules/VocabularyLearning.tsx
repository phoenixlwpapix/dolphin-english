'use client'

import { useState, useCallback } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import {
    Card,
    CardContent,
    Button,
    BookOpenIcon,
    ChevronRightIcon,
    CheckFilledIcon,
    VolumeHighIcon,
} from '@/components/ui'
import { useI18n } from '@/lib/i18n'
import { tts } from '@/lib/tts'
import type { VocabularyItem } from '@/lib/schemas'
import type { Id } from '../../../convex/_generated/dataModel'
import { ArticleReference } from '@/components/course'

/** Speech rate for vocabulary pronunciation */
const PRONUNCIATION_RATE = 0.8

interface VocabularyLearningProps {
    vocabulary: VocabularyItem[]
    courseId: Id<"courses">
    articleContent: string
    onComplete: () => void
}

export function VocabularyLearning({ vocabulary, courseId, articleContent, onComplete }: VocabularyLearningProps) {
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
        tts.speak(word, { rate: PRONUNCIATION_RATE })
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
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <BookOpenIcon className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">{t.vocabulary.title}</h2>
                            <p className="text-sm text-muted-foreground">{t.course.module} 4 · 5 {t.course.minutes}</p>
                        </div>
                    </div>
                    <ArticleReference content={articleContent} />
                </div>

                {/* Progress hint */}
                <div className="mb-6 text-sm text-muted-foreground">
                    {viewedWords.size} / {vocabulary.length} {t.vocabulary.wordsReviewed}
                </div>

                {renderVocabularyGroup(essentialWords, 'essential')}
                {renderVocabularyGroup(transferableWords, 'transferable')}
                {renderVocabularyGroup(extendedWords, 'extended')}

                <div className="flex justify-end mt-6 pt-4 border-t border-border">
                    <Button onClick={onComplete} disabled={!allEssentialViewed}>
                        {t.common.next}
                        <ChevronRightIcon className="w-4 h-4" />
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
                    <span className="font-bold text-foreground text-lg">{vocab.word}</span>
                    <span className="text-base text-muted-foreground">{vocab.pronunciation}</span>
                    {isViewed && (
                        <CheckFilledIcon className="w-4 h-4 text-success" />
                    )}
                </div>
                <button
                    onClick={onPlayPronunciation}
                    className="p-2 rounded-full hover:bg-primary-100 transition-colors"
                    aria-label={t.vocabulary.playPronunciation}
                >
                    <VolumeHighIcon className="w-5 h-5 text-primary-600" />
                </button>
            </div>

            {isExpanded && (
                <div className="px-3 pb-3 pt-0 border-t border-border/50 space-y-2">
                    <div>
                        <span className="text-sm text-muted-foreground uppercase">{t.vocabulary.definition}</span>
                        <p className="text-foreground text-base">{vocab.definition}</p>
                        {vocab.definitionCN && (
                            <p className="text-muted-foreground text-sm mt-1">{vocab.definitionCN}</p>
                        )}
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground uppercase">{t.vocabulary.example}</span>
                        <p className="text-primary-600 italic text-base">&ldquo;{vocab.originalSentence}&rdquo;</p>
                    </div>
                </div>
            )}
        </div>
    )
}

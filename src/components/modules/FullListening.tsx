'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, Button } from '@/components/ui'
import { useI18n } from '@/lib/i18n'
import { tts, TTS_SPEEDS, type TTSSpeed } from '@/lib/tts'
import type { VocabularyItem } from '@/lib/schemas'

interface FullListeningProps {
    content: string
    vocabulary?: VocabularyItem[]
    onComplete: () => void
}

export function FullListening({ content, vocabulary = [], onComplete }: FullListeningProps) {
    const { t } = useI18n()
    const [isPlaying, setIsPlaying] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [speed, setSpeed] = useState<TTSSpeed>('normal')
    const [activeSentenceIndex, setActiveSentenceIndex] = useState(-1)
    const [hasListened, setHasListened] = useState(false)
    const contentRef = useRef<HTMLDivElement>(null)
    const activeSentenceRef = useRef<HTMLSpanElement>(null)

    // Pre-calculate sentences and paragraphs layout
    const { paragraphs, sentences } = useMemo(() => {
        const sentenceRegex = /[^.!?\n]+(?:[.!?]+["']?|$)/g
        const parts = content.split(/(\n+)/)

        const resultParagraphs: { sentences: any[], index: number }[] = []
        const resultSentences: any[] = []
        let globalOffset = 0
        let sIndex = 0

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i]
            if (/^\n+$/.test(part)) {
                globalOffset += part.length
                continue
            }
            if (!part) continue

            const matches = Array.from(part.matchAll(sentenceRegex))
            const paraSentences = []

            if (matches.length > 0) {
                for (const m of matches) {
                    const text = m[0]
                    const start = globalOffset + m.index!
                    const end = start + text.length

                    const s = {
                        text,
                        start,
                        end,
                        index: sIndex
                    }
                    paraSentences.push(s)
                    resultSentences.push(s)
                    sIndex++
                }
            } else if (part.trim()) {
                const s = {
                    text: part,
                    start: globalOffset,
                    end: globalOffset + part.length,
                    index: sIndex
                }
                paraSentences.push(s)
                resultSentences.push(s)
                sIndex++
            }

            if (paraSentences.length > 0) {
                resultParagraphs.push({
                    sentences: paraSentences,
                    index: resultParagraphs.length
                })
            }
            globalOffset += part.length
        }
        return { paragraphs: resultParagraphs, sentences: resultSentences }
    }, [content])

    // Scroll active sentence into view
    useEffect(() => {
        if (activeSentenceIndex !== -1 && activeSentenceRef.current) {
            activeSentenceRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
        }
    }, [activeSentenceIndex])

    const handlePlay = useCallback(() => {
        if (isPaused) {
            tts.resume()
            setIsPaused(false)
            setIsPlaying(true)
            return
        }

        setIsPlaying(true)
        setActiveSentenceIndex(0)

        tts.speak(
            content,
            {
                rate: TTS_SPEEDS[speed],
                onBoundary: (charIndex) => {
                    const match = sentences.find(s => charIndex >= s.start && charIndex < s.end)
                    if (match) {
                        setActiveSentenceIndex(match.index)
                    }
                },
            },
            (event) => {
                if (event === 'end') {
                    setIsPlaying(false)
                    setIsPaused(false)
                    setActiveSentenceIndex(-1)
                    setHasListened(true)
                }
            }
        )
    }, [content, sentences, speed, isPaused])

    const handlePause = useCallback(() => {
        tts.pause()
        setIsPaused(true)
        setIsPlaying(false)
    }, [])

    const handleStop = useCallback(() => {
        tts.stop()
        setIsPlaying(false)
        setIsPaused(false)
        setActiveSentenceIndex(-1)
    }, [])

    useEffect(() => {
        return () => {
            tts.stop()
        }
    }, [])

    useEffect(() => {
        tts.preloadVoices()
    }, [])

    const speedLabels: Record<TTSSpeed, string> = {
        slow: t.listening.slow,
        normal: t.listening.normal,
        fast: t.listening.fast,
    }

    const renderTextWithVocabulary = (text: string) => {
        if (!vocabulary || vocabulary.length === 0) return text

        // Sort vocabulary by length descending to match longest phrases first
        const sortedVocab = [...vocabulary].sort((a, b) => b.word.length - a.word.length)

        let parts: (string | JSX.Element)[] = [text]

        sortedVocab.forEach(vocab => {
            const newParts: (string | JSX.Element)[] = []
            parts.forEach(part => {
                if (typeof part !== 'string') {
                    newParts.push(part)
                    return
                }

                // Case-insensitive match, but preserve original casing
                const regex = new RegExp(`\\b(${vocab.word})\\b`, 'gi')
                const split = part.split(regex)

                for (let i = 0; i < split.length; i++) {
                    const segment = split[i]
                    if (i % 2 === 1) { // This is a match
                        newParts.push(
                            <span key={`${vocab.word}-${i}`} className="relative group inline-block cursor-help">
                                <span className="font-semibold text-primary-600 border-b-2 border-primary-200 group-hover:bg-primary-50 transition-colors">
                                    {segment}
                                </span>
                                {/* Tooltip */}
                                <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg shadow-xl w-48 text-center z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                    {vocab.definitionCN || vocab.definition}
                                    {/* Arrow */}
                                    <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></span>
                                </span>
                            </span>
                        )
                    } else if (segment) {
                        newParts.push(segment)
                    }
                }
            })
            parts = newParts
        })

        return parts
    }

    return (
        <Card>
            <CardContent>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">{t.listening.title}</h2>
                        <p className="text-sm text-muted-foreground">{t.course.module} 2 · 6 {t.course.minutes}</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                    {!isPlaying ? (
                        <Button onClick={handlePlay}>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            {isPaused ? t.listening.resume : t.listening.playAll}
                        </Button>
                    ) : (
                        <Button onClick={handlePause} variant="secondary">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            </svg>
                            {t.listening.pause}
                        </Button>
                    )}

                    {(isPlaying || isPaused) && (
                        <Button variant="ghost" onClick={handleStop}>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 6h12v12H6z" />
                            </svg>
                        </Button>
                    )}

                    {/* Speed selector */}
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-sm text-muted-foreground">{t.listening.speed}:</span>
                        <div className="flex rounded-lg overflow-hidden border border-border">
                            {(['slow', 'normal', 'fast'] as TTSSpeed[]).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setSpeed(s)}
                                    disabled={isPlaying}
                                    className={`
                                        px-3 py-1 text-sm transition-colors
                                        ${speed === s
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-surface text-muted-foreground hover:text-foreground'
                                        }
                                        ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                >
                                    {speedLabels[s]}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Article content with natural paragraph breaks and sentence highlighting */}
                <div
                    ref={contentRef}
                    className="bg-surface rounded-lg p-6 text-2xl leading-relaxed text-foreground min-h-[60vh]"
                >
                    {paragraphs.length > 0 ? paragraphs.map((paragraph) => (
                        <p key={paragraph.index} className="mb-6 last:mb-0">
                            {paragraph.sentences.map((s) => {
                                const isActive = s.index === activeSentenceIndex
                                return (
                                    <span
                                        key={s.index}
                                        ref={isActive ? activeSentenceRef : null}
                                        className={`transition-colors duration-200 decoration-clone ${isActive
                                                ? 'bg-primary-100 text-primary-900 rounded px-1 -mx-1 py-0.5'
                                                : ''
                                            }`}
                                    >
                                        {renderTextWithVocabulary(s.text)}
                                    </span>
                                )
                            })}
                        </p>
                    )) : (
                        <p className="text-muted-foreground italic">No content to display</p>
                    )}
                </div>

                {/* Complete button */}
                <div className="flex justify-end mt-6">
                    <Button onClick={onComplete} disabled={!hasListened} variant={hasListened ? 'primary' : 'secondary'}>
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

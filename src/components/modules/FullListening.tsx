'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
    Card,
    CardContent,
    Button,
    PlayIcon,
    PauseIcon,
    StopIcon,
    ChevronRightIcon,
    SpeakerIcon,
} from '@/components/ui'
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
        interface SentenceData {
            text: string
            start: number
            end: number
            index: number
        }
        interface ParagraphData {
            sentences: SentenceData[]
            index: number
        }

        const sentenceRegex = /[^.!?\n]+(?:[.!?]+["']?|$)/g
        const parts = content.split(/(\n+)/)

        const resultParagraphs: ParagraphData[] = []
        const resultSentences: SentenceData[] = []
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

    const totalLength = useMemo(() => {
        return sentences.reduce((acc, s) => acc + s.text.length, 0)
    }, [sentences])

    const handlePlay = useCallback(async () => {
        if (isPaused) {
            tts.resume()
            setIsPaused(false)
            setIsPlaying(true)
            return
        }

        setIsPlaying(true)
        setActiveSentenceIndex(0)

        let sentenceTimeMap: { start: number; end: number; index: number }[] = []

        await tts.speak(
            content,
            {
                rate: TTS_SPEEDS[speed],
            },
            (event, data) => {
                if (event === 'start' && data && typeof data === 'object' && 'duration' in data) {
                    // Calculate sentence timings based on length proportion
                    const duration = (data as { duration: number }).duration
                    let currentTime = 0

                    sentenceTimeMap = sentences.map(s => {
                        const proportion = s.text.length / totalLength
                        const sentenceDuration = proportion * duration
                        const timing = {
                            start: currentTime,
                            end: currentTime + sentenceDuration,
                            index: s.index
                        }
                        currentTime += sentenceDuration
                        return timing
                    })
                }

                if (event === 'progress' && data && typeof data === 'object' && 'currentTime' in data) {
                    const currentTime = (data as { currentTime: number }).currentTime
                    const match = sentenceTimeMap.find(s => currentTime >= s.start && currentTime < s.end)
                    if (match && match.index !== activeSentenceIndex) {
                        setActiveSentenceIndex(match.index)
                    }
                }

                if (event === 'end') {
                    setIsPlaying(false)
                    setIsPaused(false)
                    setActiveSentenceIndex(-1)
                    setHasListened(true)
                }
            }
        )
    }, [content, speed, isPaused, sentences, totalLength])

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



    const speedLabels: Record<TTSSpeed, string> = {
        slow: t.listening.slow,
        normal: t.listening.normal,
        fast: t.listening.fast,
    }

    const renderTextWithVocabulary = (text: string) => {
        if (!vocabulary || vocabulary.length === 0) return text

        // Sort vocabulary by length descending to match longest phrases first
        const sortedVocab = [...vocabulary].sort((a, b) => b.word.length - a.word.length)

        let parts: React.ReactNode[] = [text]

        sortedVocab.forEach(vocab => {
            const newParts: React.ReactNode[] = []
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
                                <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-5 py-3 !bg-white !text-slate-900 text-sm font-medium rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-100 ring-1 ring-slate-900/5 w-max max-w-[300px] z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out transform translate-y-2 group-hover:translate-y-0">
                                    {vocab.definitionCN || vocab.definition}
                                    {/* Arrow */}
                                    <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-[8px] border-transparent !border-t-white"></span>
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
                        <SpeakerIcon className="w-5 h-5 text-primary-600" />
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
                            <PlayIcon className="w-5 h-5" />
                            {isPaused ? t.listening.resume : t.listening.playAll}
                        </Button>
                    ) : (
                        <Button onClick={handlePause} variant="secondary">
                            <PauseIcon className="w-5 h-5" />
                            {t.listening.pause}
                        </Button>
                    )}

                    {(isPlaying || isPaused) && (
                        <Button variant="ghost" onClick={handleStop}>
                            <StopIcon className="w-5 h-5" />
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
                        <p className="text-muted-foreground italic">{t.reproduction.noContent}</p>
                    )}
                </div>

                {/* Complete button */}
                <div className="flex justify-end mt-6">
                    <Button onClick={onComplete} disabled={!hasListened} variant={hasListened ? 'primary' : 'secondary'}>
                        {t.common.next}
                        <ChevronRightIcon className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

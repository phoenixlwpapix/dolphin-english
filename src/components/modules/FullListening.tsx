'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Card, CardContent, Button } from '@/components/ui'
import { useI18n } from '@/lib/i18n'
import { tts, TTS_SPEEDS, type TTSSpeed } from '@/lib/tts'

interface FullListeningProps {
    content: string
    onComplete: () => void
}

export function FullListening({ content, onComplete }: FullListeningProps) {
    const { t } = useI18n()
    const [isPlaying, setIsPlaying] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [speed, setSpeed] = useState<TTSSpeed>('normal')
    const [highlightIndex, setHighlightIndex] = useState(-1)
    const [hasListened, setHasListened] = useState(false)
    const contentRef = useRef<HTMLDivElement>(null)

    // Split content into words for highlighting
    const words = content.split(/(\s+)/).filter(Boolean)

    const handlePlay = useCallback(() => {
        if (isPaused) {
            tts.resume()
            setIsPaused(false)
            setIsPlaying(true)
            return
        }

        setIsPlaying(true)
        setHighlightIndex(0)

        tts.speak(
            content,
            {
                rate: TTS_SPEEDS[speed],
                onBoundary: (charIndex) => {
                    // Find which word we're at based on character index
                    let currentChar = 0
                    for (let i = 0; i < words.length; i++) {
                        currentChar += words[i].length
                        if (currentChar > charIndex) {
                            setHighlightIndex(i)
                            break
                        }
                    }
                },
            },
            (event) => {
                if (event === 'end') {
                    setIsPlaying(false)
                    setIsPaused(false)
                    setHighlightIndex(-1)
                    setHasListened(true)
                }
            }
        )
    }, [content, words, speed, isPaused])

    const handlePause = useCallback(() => {
        tts.pause()
        setIsPaused(true)
        setIsPlaying(false)
    }, [])

    const handleStop = useCallback(() => {
        tts.stop()
        setIsPlaying(false)
        setIsPaused(false)
        setHighlightIndex(-1)
    }, [])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            tts.stop()
        }
    }, [])

    // Preload voices
    useEffect(() => {
        tts.preloadVoices()
    }, [])

    const speedLabels: Record<TTSSpeed, string> = {
        slow: t.listening.slow,
        normal: t.listening.normal,
        fast: t.listening.fast,
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
                        <p className="text-sm text-muted">{t.course.module} 2 · 6 {t.course.minutes}</p>
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
                        <span className="text-sm text-muted">{t.listening.speed}:</span>
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
                                            : 'bg-surface text-muted hover:text-foreground'
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

                {/* Article content with highlighting */}
                <div
                    ref={contentRef}
                    className="bg-surface rounded-lg p-6 leading-relaxed text-foreground text-lg max-h-96 overflow-y-auto"
                >
                    {words.map((word, index) => (
                        <span
                            key={index}
                            className={index === highlightIndex ? 'tts-highlight' : ''}
                        >
                            {word}
                        </span>
                    ))}
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

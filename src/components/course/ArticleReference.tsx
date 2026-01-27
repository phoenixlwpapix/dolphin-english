'use client'

import { useState, useEffect, useCallback } from 'react'
import { Modal, Button, BookOpenIcon } from '@/components/ui'
import { useI18n } from '@/lib/i18n'

interface ArticleReferenceProps {
    content: string
    highlightText?: string
}

export function ArticleReference({ content, highlightText }: ArticleReferenceProps) {
    const [isOpen, setIsOpen] = useState(false)
    const { t } = useI18n()

    // Keyboard shortcut: Press 'A' to toggle
    const handleKeyPress = useCallback((e: KeyboardEvent) => {
        // Only trigger if not typing in an input/textarea
        if (e.key === 'a' || e.key === 'A') {
            const target = e.target as HTMLElement
            if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                e.preventDefault()
                setIsOpen(prev => !prev)
            }
        }
    }, [])

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress)
        return () => document.removeEventListener('keydown', handleKeyPress)
    }, [handleKeyPress])

    // Split content into paragraphs
    const paragraphs = content.split('\n\n').filter(p => p.trim())

    // Function to highlight text if highlightText is provided
    const renderParagraph = (paragraph: string, index: number) => {
        if (!highlightText) {
            return <p key={index} className="mb-4 leading-relaxed">{paragraph}</p>
        }

        // Check if this paragraph contains the highlight text
        const lowerPara = paragraph.toLowerCase()
        const lowerHighlight = highlightText.toLowerCase()

        if (lowerPara.includes(lowerHighlight)) {
            // Split and highlight the matching text
            const parts = paragraph.split(new RegExp(`(${highlightText})`, 'gi'))
            return (
                <p key={index} className="mb-4 leading-relaxed">
                    {parts.map((part, i) =>
                        part.toLowerCase() === lowerHighlight ? (
                            <mark key={i} className="bg-yellow-200 dark:bg-yellow-800/40 px-1 rounded">
                                {part}
                            </mark>
                        ) : (
                            part
                        )
                    )}
                </p>
            )
        }

        return <p key={index} className="mb-4 leading-relaxed">{paragraph}</p>
    }

    return (
        <>
            {/* Inline Button for Title Bar */}
            <Button
                onClick={() => setIsOpen(true)}
                variant="secondary"
                size="sm"
                aria-label={t.course.viewArticle}
            >
                <BookOpenIcon className="w-4 h-4 mr-1.5" />
                {t.course.viewArticle}
            </Button>

            {/* Article Modal */}
            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={t.course.articleReference}
                size="xl"
            >
                <div className="prose prose-lg max-w-none dark:prose-invert">
                    <div className="text-foreground text-xl leading-relaxed">
                        {paragraphs.map((para, index) => renderParagraph(para, index))}
                    </div>
                </div>
                {highlightText && (
                    <div className="mt-6 pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                            💡 {t.course.highlightedText}
                        </p>
                    </div>
                )}
            </Modal>
        </>
    )
}

'use client'

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useI18n } from '@/lib/i18n'

interface CreateCourseModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (courseId: number) => void
}

type InputMode = 'text' | 'image'

export function CreateCourseModal({ isOpen, onClose, onSuccess }: CreateCourseModalProps) {
    const { t } = useI18n()
    const [mode, setMode] = useState<InputMode>('text')
    const [text, setText] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const wordCount = text.trim().split(/\s+/).filter(Boolean).length

    function getWordCountStatus(): { color: string; message: string } {
        if (wordCount === 0) return { color: 'text-muted', message: t.create.recommended }
        if (wordCount < 350) return { color: 'text-warning', message: t.create.tooShort }
        if (wordCount > 600) return { color: 'text-warning', message: t.create.tooLong }
        return { color: 'text-success', message: t.create.recommended }
    }

    async function handleImageFile(file: File) {
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file')
            return
        }

        setImageFile(file)
        setError(null)

        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
    }

    function handleDrop(e: DragEvent<HTMLDivElement>) {
        e.preventDefault()
        e.stopPropagation()
        const file = e.dataTransfer.files[0]
        if (file) handleImageFile(file)
    }

    function handleDragOver(e: DragEvent<HTMLDivElement>) {
        e.preventDefault()
        e.stopPropagation()
    }

    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) handleImageFile(file)
    }

    async function handleSubmit() {
        setIsAnalyzing(true)
        setError(null)

        try {
            let articleText = text

            // If image mode, first extract text via OCR
            if (mode === 'image' && imageFile) {
                const formData = new FormData()
                formData.append('image', imageFile)

                const ocrResponse = await fetch('/api/ocr', {
                    method: 'POST',
                    body: formData,
                })

                if (!ocrResponse.ok) {
                    throw new Error('OCR failed')
                }

                const ocrData = await ocrResponse.json()
                articleText = ocrData.text
            }

            if (!articleText.trim()) {
                throw new Error('No text to analyze')
            }

            // Analyze the article
            const analyzeResponse = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: articleText }),
            })

            if (!analyzeResponse.ok) {
                throw new Error('Analysis failed')
            }

            const result = await analyzeResponse.json()
            onSuccess(result.courseId)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setIsAnalyzing(false)
        }
    }

    function resetForm() {
        setText('')
        setImageFile(null)
        setImagePreview(null)
        setError(null)
        setIsAnalyzing(false)
    }

    function handleClose() {
        resetForm()
        onClose()
    }

    const canSubmit =
        (mode === 'text' && wordCount >= 100) || (mode === 'image' && imageFile !== null)

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={t.create.title} size="lg">
            {/* Mode Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setMode('text')}
                    className={`
            flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors
            ${mode === 'text'
                            ? 'bg-primary-500 text-white'
                            : 'bg-surface text-muted hover:text-foreground'
                        }
          `}
                >
                    <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        {t.create.textTab}
                    </span>
                </button>
                <button
                    onClick={() => setMode('image')}
                    className={`
            flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors
            ${mode === 'image'
                            ? 'bg-primary-500 text-white'
                            : 'bg-surface text-muted hover:text-foreground'
                        }
          `}
                >
                    <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        {t.create.imageTab}
                    </span>
                </button>
            </div>

            {/* Content Area */}
            {mode === 'text' ? (
                <div className="space-y-3">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={t.create.textPlaceholder}
                        className="
              w-full h-64 p-4 rounded-lg border border-border bg-surface
              text-foreground placeholder:text-muted resize-none
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            "
                        disabled={isAnalyzing}
                    />

                    {/* Word count */}
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted">
                            {t.create.wordCount}: <span className="font-medium text-foreground">{wordCount}</span>
                        </span>
                        <span className={getWordCountStatus().color}>{getWordCountStatus().message}</span>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Drop zone */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
              h-64 rounded-lg border-2 border-dashed transition-colors cursor-pointer
              flex flex-col items-center justify-center gap-3
              ${imagePreview
                                ? 'border-primary-300 bg-primary-50'
                                : 'border-border bg-surface hover:border-primary-300 hover:bg-primary-50/50'
                            }
            `}
                    >
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="max-h-full max-w-full object-contain rounded"
                            />
                        ) : (
                            <>
                                <svg
                                    className="w-12 h-12 text-muted"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                <span className="text-muted">{t.create.imageDropzone}</span>
                            </>
                        )}
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {imagePreview && (
                        <Button variant="ghost" size="sm" onClick={() => {
                            setImageFile(null)
                            setImagePreview(null)
                        }}>
                            {t.common.delete}
                        </Button>
                    )}
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mt-4 p-3 rounded-lg bg-error/10 text-error text-sm">{error}</div>
            )}

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
                <Button variant="ghost" onClick={handleClose} disabled={isAnalyzing}>
                    {t.common.cancel}
                </Button>
                <Button onClick={handleSubmit} disabled={!canSubmit} isLoading={isAnalyzing}>
                    {isAnalyzing ? t.create.analyzing : t.create.startLearning}
                </Button>
            </div>
        </Modal>
    )
}

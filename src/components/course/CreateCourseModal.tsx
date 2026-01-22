'use client'

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from "../../../convex/_generated/api";
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useI18n } from '@/lib/i18n'
import { FileText, Image, Upload } from 'lucide-react'

interface CreateCourseModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (courseId: string) => void
}

type InputMode = 'text' | 'image'

export function CreateCourseModal({ isOpen, onClose, onSuccess }: CreateCourseModalProps) {
    const { t, language } = useI18n()
    const currentUser = useQuery(api.users.getCurrentUser)
    const isAdmin = currentUser?.role === 'admin'
    const createCourse = useMutation(api.courses.create)
    const createProgress = useMutation(api.progress.create)

    const [mode, setMode] = useState<InputMode>('text')
    const [text, setText] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isPublic, setIsPublic] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const wordCount = text.trim().split(/\s+/).filter(Boolean).length

    function getWordCountStatus(): { color: string; message: string } {
        if (wordCount === 0) return { color: 'text-muted-foreground', message: t.create.recommended }
        if (wordCount < 200) return { color: 'text-warning', message: t.create.tooShort }
        if (wordCount > 800) return { color: 'text-warning', message: t.create.tooLong }
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
                body: JSON.stringify({ text: articleText, language, isPublic }),
            })

            if (!analyzeResponse.ok) {
                throw new Error('Analysis failed')
            }

            const result = await analyzeResponse.json()

            // Create course in Convex
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const courseId = await createCourse({
                content: result.content,
                title: result.title,
                difficulty: result.difficulty,
                wordCount: result.wordCount,
                analyzedData: result.analyzedData,
                isPublic: result.isPublic,
            })

            // Initialize progress
            await createProgress({ courseId })

            onSuccess(courseId)
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
        setIsPublic(false)
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
                            : 'bg-surface text-muted-foreground hover:text-foreground'
                        }
          `}
                >
                    <span className="flex items-center justify-center gap-2">
                        <FileText className="w-4 h-4" />
                        {t.create.textTab}
                    </span>
                </button>
                <button
                    onClick={() => setMode('image')}
                    className={`
            flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors
            ${mode === 'image'
                            ? 'bg-primary-500 text-white'
                            : 'bg-surface text-muted-foreground hover:text-foreground'
                        }
          `}
                >
                    <span className="flex items-center justify-center gap-2">
                        <Image className="w-4 h-4" />
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
              w-full h-64 p-4 rounded-lg bg-muted border-none
              text-foreground placeholder:text-muted-foreground resize-none
              focus:bg-background focus:outline-none focus:ring-0 focus:border-2 focus:border-primary
            "
                        disabled={isAnalyzing}
                    />

                    {/* Word count */}
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
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
                                <Upload className="w-12 h-12 text-muted-foreground" />
                                <span className="text-muted-foreground">{t.create.imageDropzone}</span>
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

            {/* Admin Options */}
            {isAdmin && (
                <div className="mt-4 flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">
                        {t.create.publicCourse}
                    </span>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={isPublic}
                        onClick={() => setIsPublic(!isPublic)}
                        className={`
                            relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                            transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
                            ${isPublic ? 'bg-green-500' : 'bg-gray-200'}
                        `}
                    >
                        <span className="sr-only">{t.create.publicCourse}</span>
                        <span
                            aria-hidden="true"
                            className={`
                                pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 
                                transition duration-200 ease-in-out
                                ${isPublic ? 'translate-x-5' : 'translate-x-0'}
                            `}
                        />
                    </button>
                </div>
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

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
            <div className="flex bg-muted/50 p-1 rounded-xl mb-6 border border-border/50">
                <button
                    onClick={() => setMode('text')}
                    className={`
                        flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200
                        ${mode === 'text'
                            ? 'bg-background text-primary shadow-sm ring-1 ring-border/50'
                            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
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
                        flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200
                        ${mode === 'image'
                            ? 'bg-background text-primary shadow-sm ring-1 ring-border/50'
                            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
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
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={t.create.textPlaceholder}
                        className="
                            w-full h-64 p-4 rounded-xl bg-background/50 border border-border
                            text-foreground placeholder:text-muted-foreground resize-none
                            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50
                            transition-all duration-200
                        "
                        disabled={isAnalyzing}
                    />

                    {/* Word count */}
                    <div className="flex justify-between items-center text-sm px-1">
                        <span className="text-muted-foreground">
                            {t.create.wordCount}: <span className="font-medium text-foreground">{wordCount}</span>
                        </span>
                        <span className={`flex items-center gap-1.5 font-medium ${getWordCountStatus().color}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {getWordCountStatus().message}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    {/* Drop zone */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            h-64 rounded-xl border-2 border-dashed transition-all cursor-pointer
                            flex flex-col items-center justify-center gap-4
                            ${imagePreview
                                ? 'border-primary/50 bg-primary/5'
                                : 'border-border bg-background/50 hover:border-primary/50 hover:bg-primary/5'
                            }
                        `}
                    >
                        {imagePreview ? (
                            <div className="relative w-full h-full p-2 group">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-full object-contain rounded-lg"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                    <p className="text-white font-medium">{t.create.clickToChange}</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <div className="text-center">
                                    <p className="text-foreground font-medium mb-1">{t.create.clickOrDrop}</p>
                                    <p className="text-sm text-muted-foreground">{t.create.imageDropzone}</p>
                                </div>
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
                        <div className="flex justify-end">
                            <Button variant="ghost" size="sm" onClick={(e) => {
                                e.stopPropagation();
                                setImageFile(null)
                                setImagePreview(null)
                            }}>
                                {t.common.delete}
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-2">
                    {error}
                </div>
            )}

            {/* Admin Options */}
            {isAdmin && (
                <div className="mt-6 flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                    <div className="relative flex items-center">
                        <button
                            type="button"
                            role="switch"
                            aria-checked={isPublic}
                            onClick={() => setIsPublic(!isPublic)}
                            className={`
                                relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                                transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
                                ${isPublic ? 'bg-accent' : 'bg-input'}
                            `}
                        >
                            <span className="sr-only">{t.create.publicCourse}</span>
                            <span
                                aria-hidden="true"
                                className={`
                                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 
                                    transition duration-200 ease-in-out
                                    ${isPublic ? 'translate-x-5' : 'translate-x-0'}
                                `}
                            />
                        </button>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                        {t.create.publicCourse}
                    </span>
                </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-border/50">
                <Button variant="ghost" onClick={handleClose} disabled={isAnalyzing}>
                    {t.common.cancel}
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    isLoading={isAnalyzing}
                    className="shadow-lg shadow-primary/20"
                >
                    {isAnalyzing ? t.create.analyzing : t.create.startLearning}
                </Button>
            </div>
        </Modal>
    )
}

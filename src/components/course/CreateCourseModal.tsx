'use client'

import { useState, useRef, useEffect, type ChangeEvent, type DragEvent } from 'react'
import Image from 'next/image'
import { useQuery, useMutation } from 'convex/react'
import { api } from "../../../convex/_generated/api";
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useI18n } from '@/lib/i18n'
import { FileTextIcon, ImageIcon, UploadIcon, SparklesIcon, BrainIcon } from '@/components/ui/Icons'
import { CEFR_LEVELS, DIFFICULTY_CONFIG, type DifficultyLevel } from '@/lib/constants'
import type { CourseAnalysis } from '@/lib/schemas/article'

interface CreateCourseModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (courseId: string) => void
}

type InputMode = 'text' | 'image'

interface AnalyzeResponse {
    content: string
    title: string
    difficulty: DifficultyLevel
    wordCount: number
    analyzedData: CourseAnalysis
    isPublic?: boolean
}

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
    const [difficulty, setDifficulty] = useState<'auto' | DifficultyLevel>('auto')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const wordCount = text.trim().split(/\s+/).filter(Boolean).length

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
                body: JSON.stringify({ text: articleText, language, isPublic, difficulty: difficulty === 'auto' ? null : difficulty }),
            })

            if (!analyzeResponse.ok) {
                throw new Error('Analysis failed')
            }

            const result = await analyzeResponse.json() as AnalyzeResponse

            // Create course in Convex
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
        setDifficulty('auto')
    }

    function handleClose() {
        resetForm()
        onClose()
    }

    const canSubmit = (mode === 'text' && wordCount >= 50) || (mode === 'image' && imageFile !== null)

    return (
        <Modal
            isOpen={isOpen}
            onClose={isAnalyzing ? () => {} : handleClose}
            title={isAnalyzing ? undefined : t.create.title}
            size="lg"
            showCloseButton={!isAnalyzing}
        >
            {isAnalyzing ? (
                <CourseCreationLoader mode={mode} language={language} />
            ) : (
                <>
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
                                <FileTextIcon className="w-4 h-4" />
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
                                <ImageIcon className="w-4 h-4" />
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

                            {/* Word count + Difficulty */}
                            <div className="flex justify-between items-center text-sm px-1">
                                <span className="text-muted-foreground">
                                    {t.create.wordCount}: <span className="font-medium text-foreground">{wordCount}</span>
                                </span>
                                <DifficultySelect
                                    value={difficulty}
                                    onChange={setDifficulty}
                                    disabled={isAnalyzing}
                                    label={t.create.difficultyLabel}
                                    autoLabel={t.create.difficultyAuto}
                                />
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
                                        <Image
                                            src={imagePreview}
                                            alt="Preview"
                                            fill
                                            unoptimized
                                            sizes="(max-width: 768px) 100vw, 640px"
                                            className="object-contain rounded-lg p-2"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                            <p className="text-white font-medium">{t.create.clickToChange}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                            <UploadIcon className="w-8 h-8 text-muted-foreground" />
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

                            <div className="flex justify-between items-center px-1">
                                {imagePreview ? (
                                    <Button variant="ghost" size="sm" onClick={(e) => {
                                        e.stopPropagation();
                                        setImageFile(null)
                                        setImagePreview(null)
                                    }}>
                                        {t.common.delete}
                                    </Button>
                                ) : <span />}
                                <DifficultySelect
                                    value={difficulty}
                                    onChange={setDifficulty}
                                    disabled={isAnalyzing}
                                    label={t.create.difficultyLabel}
                                    autoLabel={t.create.difficultyAuto}
                                />
                            </div>
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
                </>
            )}
        </Modal>
    )
}

interface DifficultySelectProps {
    value: 'auto' | DifficultyLevel
    onChange: (v: 'auto' | DifficultyLevel) => void
    disabled: boolean
    label: string
    autoLabel: string
}

function DifficultySelect({ value, onChange, disabled, label, autoLabel }: DifficultySelectProps) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">{label}:</span>
            <div className="relative flex items-center">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value as 'auto' | DifficultyLevel)}
                    disabled={disabled}
                    className="text-sm font-medium bg-background border border-border rounded-lg pl-1 pr-6 py-0.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none"
                >
                    <option value="auto">{autoLabel}</option>
                    {CEFR_LEVELS.map(level => (
                        <option key={level} value={level}>{level} — {DIFFICULTY_CONFIG[level].label}</option>
                    ))}
                </select>
                <span className="pointer-events-none absolute right-1.5 text-muted-foreground text-xs">▾</span>
            </div>
        </div>
    )
}

function CourseCreationLoader({ mode, language }: { mode: 'text' | 'image'; language: string }) {
    const { t } = useI18n()
    const [step, setStep] = useState(0)
    const [tipIndex, setTipIndex] = useState(0)

    const stepsZH = [
        mode === 'image' ? '正在使用 OCR 提取图片中的文字...' : '正在准备提交课文内容...',
        '正在连接 AI 引擎 (Gemini 3.5 Flash)...',
        '深度解析中：分段切片与双语互译...',
        '词汇精练中：提取核心词汇与背景要点...',
        '智能出题中：生成阅读理解及双语详细解析...',
        '正在收尾：写入云端数据库并初始化学习进度...',
    ]

    const stepsEN = [
        mode === 'image' ? 'Extracting text from image via OCR...' : 'Preparing text content...',
        'Connecting to AI engine (Gemini 3.5 Flash)...',
        'Analyzing paragraphs & generating bilingual translations...',
        'Extracting key vocabulary & language points...',
        'Generating comprehension quiz & bilingual explanations...',
        'Finalizing: Saving to cloud & initializing progress...',
    ]

    const tipsZH = [
        '💡 学习小贴士：在课文阅读中，点击任意生词可直接查看双语释义，并能一键加入词汇本复习。',
        '💡 学习小贴士：AI 会将词汇自动分类为“核心词汇”、“可迁移词汇”与“拓展词汇”，方便你分级突破。',
        '💡 学习小贴士：每个课程完成后，花 5 分钟在“词汇练习”中进行一次 AI 测验，核心词汇记忆度翻倍！',
        '💡 学习小贴士：Dolphin English 采用手写笔记本美学设计，你可以随时切换中英双语或专注纯英模式。',
        '💡 学习小贴士：每天学满 30 分钟，即可在“学习分析”仪表盘中成功点亮当天的日历格子。',
    ]

    const tipsEN = [
        '💡 Tip: Click any unfamiliar word in the text to see definitions and save it to your vocabulary book.',
        '💡 Tip: Vocabulary is classified into Essential, Transferable, and Extended categories to help you focus.',
        '💡 Tip: Taking a 5-minute AI Quiz after each course can double your long-term word retention!',
        '💡 Tip: You can toggle between bilingual display and English-only mode in the settings panel.',
        '💡 Tip: Complete 30 minutes of study daily to light up your activity heatmap in the Analytics tab.',
    ]

    const steps = language === 'zh' ? stepsZH : stepsEN
    const tips = language === 'zh' ? tipsZH : tipsEN

    // Advance steps
    useEffect(() => {
        const interval = setInterval(() => {
            setStep(prev => (prev < steps.length - 1 ? prev + 1 : prev))
        }, 6000)
        return () => clearInterval(interval)
    }, [steps.length])

    // Cycle tips
    useEffect(() => {
        const interval = setInterval(() => {
            setTipIndex(prev => (prev + 1) % tips.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [tips.length])

    // Simulated progress percentage
    const progress = Math.min(99, Math.round(((step + 1) / steps.length) * 100))

    return (
        <div className="py-12 px-6 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
            {/* Pulsing Glowing Circle */}
            <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Outermost rippling ring (primary color) */}
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping [animation-duration:2s]" />
                {/* Secondary rippling ring (accent color) */}
                <div className="absolute inset-2 rounded-full bg-accent/15 animate-ping [animation-duration:3s] [animation-delay:0.5s]" />
                {/* Rotating dashed border ring */}
                <div className="absolute inset-2 rounded-full border-2 border-dashed border-primary/50 animate-spin [animation-duration:10s]" />
                {/* Central solid primary circle with icon */}
                <div className="relative w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 text-white animate-float">
                    <SparklesIcon className="w-8 h-8 text-white animate-pulse" />
                </div>
            </div>

            {/* Title & Status */}
            <div className="text-center space-y-2.5 max-w-md">
                <h3 className="text-xl font-bold text-foreground tracking-tight">
                    {language === 'zh' ? '正在创建 AI 课程' : 'Creating AI Course'}
                </h3>
                <p className="text-sm text-primary font-semibold h-5 flex items-center justify-center text-center">
                    {steps[step]}
                </p>
            </div>

            {/* Shimmering Progress Bar */}
            <div className="w-full max-w-xs space-y-2">
                <div className="h-2 bg-muted rounded-full overflow-hidden relative">
                    <div 
                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    <span className="text-primary font-bold">{progress}%</span>
                    <span className="text-accent font-bold">Gemini 3.5 Flash</span>
                </div>
            </div>

            {/* Reassuring tips card with primary tint */}
            <div className="w-full max-w-sm p-4 bg-primary/5 border border-primary/10 rounded-2xl text-center min-h-[72px] flex items-center justify-center transition-all duration-500 animate-in fade-in duration-500">
                <p className="text-xs text-primary/80 leading-relaxed font-medium">
                    {tips[tipIndex]}
                </p>
            </div>
        </div>
    )
}

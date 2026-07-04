"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Modal, Button } from "@/components/ui";
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon } from "@/components/ui/Icons";
import { useI18n } from "@/lib/i18n";
import { PATH_GRADIENTS, DIFFICULTY_CONFIG, CEFR_LEVELS } from "@/lib/constants";

export interface EditPathData {
    id: Id<"learningPaths">;
    titleEn: string;
    titleZh: string;
    descriptionEn: string;
    descriptionZh: string;
    difficulty: string;
    courseIds: Id<"courses">[];
    coverGradient?: string;
}

interface CreatePathModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editData?: EditPathData;
}

export function CreatePathModal({ isOpen, onClose, onSuccess, editData }: CreatePathModalProps) {
    const { t, language } = useI18n();
    const publicCourses = useQuery(api.courses.listPublic);
    const createPath = useMutation(api.learningPaths.create);
    const updatePath = useMutation(api.learningPaths.update);

    const isEditMode = !!editData;

    const [titleEn, setTitleEn] = useState("");
    const [titleZh, setTitleZh] = useState("");
    const [descriptionEn, setDescriptionEn] = useState("");
    const [descriptionZh, setDescriptionZh] = useState("");
    const [difficulty, setDifficulty] = useState<string>("B1");
    const [selectedCourseIds, setSelectedCourseIds] = useState<Id<"courses">[]>([]);
    const [coverGradient, setCoverGradient] = useState<string>(PATH_GRADIENTS[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Filter out already selected courses from the available list
    const availableCourses = publicCourses
        ? publicCourses.filter(course => !selectedCourseIds.includes(course._id as Id<"courses">))
        : [];

    // Filter available courses by search query
    const filteredAvailableCourses = availableCourses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Populate form when editData changes
    useEffect(() => {
        if (editData && isOpen) {
            setTitleEn(editData.titleEn);
            setTitleZh(editData.titleZh);
            setDescriptionEn(editData.descriptionEn);
            setDescriptionZh(editData.descriptionZh);
            setDifficulty(editData.difficulty);
            setSelectedCourseIds(editData.courseIds);
            setCoverGradient(editData.coverGradient ?? PATH_GRADIENTS[0]);
            setSearchQuery("");
            setError(null);
        }
    }, [editData, isOpen]);

    const resetForm = () => {
        setTitleEn("");
        setTitleZh("");
        setDescriptionEn("");
        setDescriptionZh("");
        setDifficulty("B1");
        setSelectedCourseIds([]);
        setCoverGradient(PATH_GRADIENTS[0]);
        setSearchQuery("");
        setError(null);
    };

    const handleClose = () => {
        if (!isEditMode) resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        if (!titleEn.trim() || !titleZh.trim()) {
            setError(language === "zh" ? "请填写英文和中文标题" : "Please fill in both English and Chinese titles");
            return;
        }
        if (selectedCourseIds.length === 0) {
            setError(language === "zh" ? "请至少选择一门课程" : "Please select at least one course");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            if (isEditMode) {
                await updatePath({
                    id: editData.id,
                    titleEn: titleEn.trim(),
                    titleZh: titleZh.trim(),
                    descriptionEn: descriptionEn.trim(),
                    descriptionZh: descriptionZh.trim(),
                    difficulty: difficulty as typeof CEFR_LEVELS[number],
                    courseIds: selectedCourseIds,
                    coverGradient,
                });
            } else {
                await createPath({
                    titleEn: titleEn.trim(),
                    titleZh: titleZh.trim(),
                    descriptionEn: descriptionEn.trim(),
                    descriptionZh: descriptionZh.trim(),
                    difficulty: difficulty as typeof CEFR_LEVELS[number],
                    courseIds: selectedCourseIds,
                    coverGradient,
                });
                resetForm();
            }
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleCourse = (courseId: Id<"courses">) => {
        setSelectedCourseIds(prev =>
            prev.includes(courseId)
                ? prev.filter(id => id !== courseId)
                : [...prev, courseId]
        );
    };

    const moveCourse = (index: number, direction: -1 | 1) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= selectedCourseIds.length) return;
        const newIds = [...selectedCourseIds];
        [newIds[index], newIds[newIndex]] = [newIds[newIndex], newIds[index]];
        setSelectedCourseIds(newIds);
    };

    const modalTitle = isEditMode
        ? (language === "zh" ? "编辑路径" : "Edit Path")
        : t.paths.createPath;

    const submitLabel = isEditMode
        ? t.common.save
        : t.paths.createPath;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={modalTitle} size="xl">
            <div className="space-y-5 max-h-[70vh] overflow-y-auto px-3">
                {/* Bilingual titles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            {t.paths.titleEn}
                        </label>
                        <input
                            type="text"
                            value={titleEn}
                            onChange={(e) => setTitleEn(e.target.value)}
                            placeholder="e.g. Business English Path"
                            className="w-full px-3 py-2.5 text-sm bg-background border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            {t.paths.titleZh}
                        </label>
                        <input
                            type="text"
                            value={titleZh}
                            onChange={(e) => setTitleZh(e.target.value)}
                            placeholder="例如：商务英语路径"
                            className="w-full px-3 py-2.5 text-sm bg-background border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                        />
                    </div>
                </div>

                {/* Bilingual descriptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            {t.paths.descriptionEn}
                        </label>
                        <textarea
                            value={descriptionEn}
                            onChange={(e) => setDescriptionEn(e.target.value)}
                            placeholder="Description in English..."
                            rows={3}
                            className="w-full px-3 py-2.5 text-sm bg-background border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            {t.paths.descriptionZh}
                        </label>
                        <textarea
                            value={descriptionZh}
                            onChange={(e) => setDescriptionZh(e.target.value)}
                            placeholder="中文描述..."
                            rows={3}
                            className="w-full px-3 py-2.5 text-sm bg-background border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground resize-none"
                        />
                    </div>
                </div>

                {/* Difficulty selector */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        {t.home.difficulty}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                        {CEFR_LEVELS.map((level) => {
                            const config = DIFFICULTY_CONFIG[level];
                            return (
                                <button
                                    key={level}
                                    onClick={() => setDifficulty(level)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                        difficulty === level
                                            ? `${config.color} ring-2 ring-current/30 shadow-sm`
                                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                    }`}
                                >
                                    {level}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Gradient picker */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        {t.paths.coverGradient}
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {PATH_GRADIENTS.map((gradient) => (
                            <button
                                key={gradient}
                                onClick={() => setCoverGradient(gradient)}
                                className={`w-8 h-8 rounded-full ${gradient} flex items-center justify-center transition-all ${
                                    coverGradient === gradient
                                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                                        : "hover:scale-105"
                                }`}
                            >
                                {coverGradient === gradient && (
                                    <CheckIcon className="w-4 h-4 text-white drop-shadow-sm" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Course selector */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        {t.paths.selectCourses}
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-border/50 rounded-2xl p-3 bg-muted/10">
                        {/* Left Column: Available Courses */}
                        <div className="flex flex-col h-[280px]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {language === "zh" ? "候选课程" : "Available Courses"}
                                </span>
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                                    {availableCourses.length}
                                </span>
                            </div>

                            {/* Search Box */}
                            <div className="mb-2">
                                <input
                                    type="text"
                                    placeholder={language === "zh" ? "搜索候选课程..." : "Search available..."}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-2.5 py-1.5 text-xs bg-background border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
                                />
                            </div>

                            {/* Scrollable List */}
                            <div className="flex-1 overflow-y-auto space-y-1 bg-background border border-border/30 rounded-xl p-2">
                                {publicCourses === undefined ? (
                                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground py-4">
                                        {t.common.loading}
                                    </div>
                                ) : filteredAvailableCourses.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground py-8 text-center px-4">
                                        {searchQuery
                                            ? (language === "zh" ? "无匹配课程" : "No matching courses")
                                            : (language === "zh" ? "无可选课程" : "No courses available")
                                        }
                                    </div>
                                ) : (
                                    filteredAvailableCourses.map((course) => {
                                        const diffKey = course.difficulty as keyof typeof DIFFICULTY_CONFIG;
                                        const diffConfig = DIFFICULTY_CONFIG[diffKey];
                                        return (
                                            <button
                                                key={course._id}
                                                onClick={() => toggleCourse(course._id as Id<"courses">)}
                                                className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-primary-50 dark:hover:bg-primary-950/20 rounded-lg text-left transition-colors border border-transparent hover:border-primary-100 dark:hover:border-primary-900/30 group"
                                            >
                                                <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-950 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                                    <span className="text-sm font-bold leading-none">+</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-foreground font-medium truncate">{course.title}</p>
                                                    <p className="text-[10px] text-muted-foreground">{course.wordCount} {t.create.wordCount}</p>
                                                </div>
                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${diffConfig?.color ?? "text-gray-500"}`}>
                                                    {course.difficulty}
                                                </span>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Right Column: Selected Courses & Order */}
                        <div className="flex flex-col h-[280px]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {language === "zh" ? "已选顺序" : "Selected Order"}
                                </span>
                                <span className="text-xs text-white bg-primary px-2 py-0.5 rounded-full font-medium">
                                    {selectedCourseIds.length}
                                </span>
                            </div>

                            {/* Scrollable list */}
                            <div className="flex-1 overflow-y-auto space-y-1 bg-background border border-border/30 rounded-xl p-2">
                                {selectedCourseIds.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {language === "zh"
                                                ? "在左侧点击课程，即可排列其学习顺序"
                                                : "Click courses on the left to arrange them here"
                                            }
                                        </p>
                                    </div>
                                ) : (
                                    selectedCourseIds.map((courseId, index) => {
                                        const course = publicCourses?.find(c => c._id === courseId);
                                        if (!course) return null;
                                        const diffKey = course.difficulty as keyof typeof DIFFICULTY_CONFIG;
                                        const diffConfig = DIFFICULTY_CONFIG[diffKey];
                                        return (
                                            <div
                                                key={courseId}
                                                className="flex items-center gap-1.5 px-2 py-1.5 bg-primary/5 border border-primary-100/30 dark:border-primary-900/10 rounded-lg hover:bg-primary-100/10 transition-colors"
                                            >
                                                {/* Index badge */}
                                                <span className="text-xs font-extrabold text-primary w-4 text-center shrink-0">{index + 1}</span>

                                                {/* Course Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-foreground font-medium truncate">{course.title}</p>
                                                    <p className="text-[10px] text-muted-foreground">{course.wordCount} {t.create.wordCount}</p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-0.5 shrink-0">
                                                    <button
                                                        onClick={() => moveCourse(index, -1)}
                                                        disabled={index === 0}
                                                        className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-20 transition-all hover:text-foreground"
                                                        title={language === "zh" ? "上移" : "Move Up"}
                                                    >
                                                        <ChevronLeftIcon className="w-3 h-3 rotate-90" />
                                                    </button>
                                                    <button
                                                        onClick={() => moveCourse(index, 1)}
                                                        disabled={index === selectedCourseIds.length - 1}
                                                        className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-20 transition-all hover:text-foreground"
                                                        title={language === "zh" ? "下移" : "Move Down"}
                                                    >
                                                        <ChevronRightIcon className="w-3 h-3 rotate-90" />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleCourse(courseId)}
                                                        className="p-1 rounded hover:bg-error/10 text-muted-foreground hover:text-error transition-all"
                                                        title={language === "zh" ? "移除" : "Remove"}
                                                    >
                                                        <span className="text-base font-bold leading-none block w-3 h-3 text-center">×</span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-xl">
                        {error}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-border/50">
                <Button variant="secondary" onClick={handleClose}>
                    {t.common.cancel}
                </Button>
                <Button onClick={handleSubmit} isLoading={isSubmitting}>
                    {submitLabel}
                </Button>
            </div>
        </Modal>
    );
}

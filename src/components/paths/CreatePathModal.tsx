"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Modal, Button } from "@/components/ui";
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon } from "@/components/ui/Icons";
import { useI18n } from "@/lib/i18n";
import { PATH_GRADIENTS, DIFFICULTY_CONFIG } from "@/lib/constants";

const CEFR_LEVELS = ["A1", "A1+", "A2", "A2+", "B1", "B1+", "B2", "B2+", "C1", "C1+", "C2"] as const;

interface CreatePathModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreatePathModal({ isOpen, onClose, onSuccess }: CreatePathModalProps) {
    const { t, language } = useI18n();
    const publicCourses = useQuery(api.courses.listPublic);
    const createPath = useMutation(api.learningPaths.create);

    const [titleEn, setTitleEn] = useState("");
    const [titleZh, setTitleZh] = useState("");
    const [descriptionEn, setDescriptionEn] = useState("");
    const [descriptionZh, setDescriptionZh] = useState("");
    const [difficulty, setDifficulty] = useState<string>("B1");
    const [selectedCourseIds, setSelectedCourseIds] = useState<Id<"courses">[]>([]);
    const [coverGradient, setCoverGradient] = useState<string>(PATH_GRADIENTS[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resetForm = () => {
        setTitleEn("");
        setTitleZh("");
        setDescriptionEn("");
        setDescriptionZh("");
        setDifficulty("B1");
        setSelectedCourseIds([]);
        setCoverGradient(PATH_GRADIENTS[0]);
        setError(null);
    };

    const handleClose = () => {
        resetForm();
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
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create path");
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

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={t.paths.createPath} size="xl">
            <div className="space-y-5 max-h-[70vh] overflow-y-auto px-1">
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
                                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} transition-all ${
                                    coverGradient === gradient
                                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                                        : "hover:scale-105"
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Course selector */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        {t.paths.selectCourses}
                        {selectedCourseIds.length > 0 && (
                            <span className="ml-2 text-primary text-xs">({selectedCourseIds.length})</span>
                        )}
                    </label>

                    {/* Selected courses with reorder */}
                    {selectedCourseIds.length > 0 && (
                        <div className="mb-3 space-y-1.5 p-3 bg-primary/5 rounded-xl border border-primary/10">
                            <p className="text-xs text-muted-foreground font-medium mb-2">{t.paths.reorderCourses}</p>
                            {selectedCourseIds.map((courseId, index) => {
                                const course = publicCourses?.find(c => c._id === courseId);
                                if (!course) return null;
                                return (
                                    <div key={courseId} className="flex items-center gap-2 bg-background rounded-lg px-3 py-2">
                                        <span className="text-xs font-bold text-primary w-5 shrink-0">{index + 1}</span>
                                        <span className="text-sm text-foreground flex-1 truncate">{course.title}</span>
                                        <div className="flex items-center gap-0.5 shrink-0">
                                            <button
                                                onClick={() => moveCourse(index, -1)}
                                                disabled={index === 0}
                                                className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                                            >
                                                <ChevronLeftIcon className="w-3.5 h-3.5 rotate-90" />
                                            </button>
                                            <button
                                                onClick={() => moveCourse(index, 1)}
                                                disabled={index === selectedCourseIds.length - 1}
                                                className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                                            >
                                                <ChevronRightIcon className="w-3.5 h-3.5 rotate-90" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Course list */}
                    <div className="max-h-48 overflow-y-auto space-y-1 border border-border/50 rounded-xl p-2">
                        {publicCourses === undefined ? (
                            <div className="py-4 text-center text-sm text-muted-foreground">
                                {t.common.loading}
                            </div>
                        ) : publicCourses.length === 0 ? (
                            <div className="py-4 text-center text-sm text-muted-foreground">
                                {language === "zh" ? "暂无公开课程" : "No public courses available"}
                            </div>
                        ) : (
                            publicCourses.map((course) => {
                                const isSelected = selectedCourseIds.includes(course._id as Id<"courses">);
                                const diffKey = course.difficulty as keyof typeof DIFFICULTY_CONFIG;
                                const diffConfig = DIFFICULTY_CONFIG[diffKey];
                                return (
                                    <button
                                        key={course._id}
                                        onClick={() => toggleCourse(course._id as Id<"courses">)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                                            isSelected
                                                ? "bg-primary/10 border border-primary/20"
                                                : "hover:bg-muted/50"
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                            isSelected
                                                ? "bg-primary border-primary text-white"
                                                : "border-border/50"
                                        }`}>
                                            {isSelected && <CheckIcon className="w-3 h-3" />}
                                        </div>
                                        <span className="text-sm text-foreground flex-1 truncate">{course.title}</span>
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${diffConfig?.color ?? "text-gray-500"}`}>
                                            {course.difficulty}
                                        </span>
                                    </button>
                                );
                            })
                        )}
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
                    {t.paths.createPath}
                </Button>
            </div>
        </Modal>
    );
}

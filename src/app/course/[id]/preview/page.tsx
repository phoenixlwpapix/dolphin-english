"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Header } from "@/components/layout";
import {
    Button,
    Card,
    CardContent,
    ChevronLeftIcon,
    ClockIcon,
    CheckCircleIcon,
    BookOpenIcon,
    TrashIcon,
    ConfirmModal,
} from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { DIFFICULTY_CONFIG, MODULE_TIMES } from "@/lib/constants";
import { useState } from "react";

export default function CoursePreviewPage() {
    const params = useParams();
    const router = useRouter();
    const { t, language } = useI18n();
    const courseId = params.id as Id<"courses">;
    const [isJoining, setIsJoining] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const preview = useQuery(api.courses.getPreview, { id: courseId });
    const isJoined = useQuery(api.userCourses.isJoined, { courseId });
    const currentUser = useQuery(api.users.getCurrentUser);
    const addCourse = useMutation(api.userCourses.addCourse);
    const deleteCourse = useMutation(api.courses.remove);

    const isLoading = preview === undefined;

    // Check if current user is the author (admin who created this course)
    const isAuthor = currentUser && preview?.authorId === currentUser._id.toString();

    const handleJoinCourse = async () => {
        setIsJoining(true);
        try {
            await addCourse({ courseId });
            // Navigate to the course learning page after joining
            router.push(`/course/${courseId}`);
        } catch {
            setIsJoining(false);
        }
    };

    const handleGoToLearning = () => {
        router.push(`/course/${courseId}`);
    };

    const handleDeleteCourse = async () => {
        setIsDeleting(true);
        try {
            await deleteCourse({ id: courseId });
            router.push("/");
        } catch (error) {
            console.error("Failed to delete course:", error);
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
        );
    }

    if (!preview) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <Card className="py-16 text-center">
                        <CardContent>
                            <h2 className="text-xl font-semibold text-foreground mb-2">
                                {t.common.error}
                            </h2>
                            <p className="text-muted-foreground mb-4">
                                {language === "zh" ? "课程不存在或已被删除" : "Course not found or has been deleted"}
                            </p>
                            <Button onClick={() => router.push("/")}>
                                {t.common.back}
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    // Get difficulty config, with fallback for unknown levels
    const difficultyKey = preview.difficulty as keyof typeof DIFFICULTY_CONFIG;
    const difficultyConfig = DIFFICULTY_CONFIG[difficultyKey];
    const badgeStyle = difficultyConfig
        ? `${difficultyConfig.color} border border-current/20`
        : "text-gray-700 bg-gray-50 border-gray-200";

    const totalMinutes = MODULE_TIMES.reduce((a, b) => a + b, 0);

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-8 mt-4">
                <div className="max-w-3xl mx-auto">
                    {/* Back button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 mb-6"
                        onClick={() => router.push("/")}
                    >
                        <ChevronLeftIcon className="w-5 h-5 mr-1" />
                        {t.common.back}
                    </Button>

                    <Card className="overflow-hidden">
                        {/* Header section with gradient */}
                        <div className="bg-primary-50 dark:bg-primary-900/20 p-6 md:p-8 border-b border-border">
                            {/* Title row with admin action */}
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight mb-3">
                                        {preview.title}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span
                                            className={`px-3 py-1.5 rounded-md text-sm font-bold tracking-wide border ${badgeStyle}`}
                                        >
                                            {preview.difficulty}
                                        </span>
                                        {isJoined && (
                                            <span className="px-3 py-1.5 rounded-md text-sm font-medium bg-success/10 text-success border border-success/20 flex items-center gap-1.5">
                                                <CheckCircleIcon className="w-4 h-4" />
                                                {t.course.joined}
                                            </span>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <BookOpenIcon className="w-4 h-4" />
                                            <span>{preview.wordCount} {t.create.wordCount}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <ClockIcon className="w-4 h-4" />
                                            <span>{totalMinutes} {t.course.minutes}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Admin delete button - subtle icon in corner */}
                                {isAuthor && (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                        title={t.common.deleteCourse}
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <CardContent className="p-6 md:p-8 space-y-8">
                            {/* Learning Objectives */}
                            {preview.learningObjectives.length > 0 && (
                                <section>
                                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                        <CheckCircleIcon className="w-5 h-5 text-primary" />
                                        {t.modules.objectives}
                                    </h2>
                                    <ul className="space-y-3">
                                        {preview.learningObjectives.map((objective, index) => (
                                            <li
                                                key={index}
                                                className="flex items-start gap-3 text-foreground"
                                            >
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                                                    {index + 1}
                                                </span>
                                                <span className="leading-relaxed">
                                                    {language === "zh" ? objective.zh : objective.en}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {/* Content Preview */}
                            <section>
                                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                    <BookOpenIcon className="w-5 h-5 text-primary" />
                                    {t.course.articlePreview}
                                </h2>
                                <div className="bg-muted/30 rounded-lg p-4 md:p-6">
                                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                                        {preview.contentPreview}
                                    </p>
                                </div>
                            </section>

                            {/* Action buttons */}
                            <div className="pt-6 border-t border-border/50">
                                <div className="flex justify-center">
                                    {!currentUser ? (
                                        <p className="text-muted-foreground">
                                            {t.course.pleaseSignIn}
                                        </p>
                                    ) : isJoined ? (
                                        <Button size="lg" onClick={handleGoToLearning}>
                                            {t.course.startLearning}
                                        </Button>
                                    ) : (
                                        <Button
                                            size="lg"
                                            onClick={handleJoinCourse}
                                            isLoading={isJoining}
                                        >
                                            {t.course.joinCourse}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* Delete confirmation modal */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteCourse}
                title={t.common.deleteCourse}
                description={language === "zh"
                    ? "确定要删除这个公开课程吗？此操作将从所有用户的课程列表中移除该课程。"
                    : "Are you sure you want to delete this public course? This will remove it from all users' course lists."
                }
                confirmText={t.common.confirm}
                cancelText={t.common.cancel}
                variant="destructive"
                isLoading={isDeleting}
            />
        </div>
    );
}

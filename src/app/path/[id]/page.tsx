"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Header } from "@/components/layout";
import {
    Button,
    Card,
    CardContent,
    ChevronLeftIcon,
    CheckCircleIcon,
    ConfirmModal,
} from "@/components/ui";
import { RouteIcon, BookOpenIcon, EditIcon, LogOutIcon } from "@/components/ui/Icons";
import { useI18n } from "@/lib/i18n";
import type { Id } from "../../../../convex/_generated/dataModel";
import { DIFFICULTY_CONFIG, TOTAL_MODULES } from "@/lib/constants";
import { CreatePathModal } from "@/components/paths";
import type { EditPathData } from "@/components/paths/CreatePathModal";

export default function PathDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { t, language } = useI18n();
    const pathId = params.id as Id<"learningPaths">;
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const pathData = useQuery(api.learningPaths.get, { id: pathId });
    const currentUser = useQuery(api.users.getCurrentUser);
    const leavePath = useMutation(api.learningPaths.leavePath);

    const isLoading = pathData === undefined;

    const handleLeavePath = async () => {
        setIsLeaving(true);
        try {
            await leavePath({ pathId });
            router.push("/");
        } catch (error) {
            console.error("Failed to leave path:", error);
            setIsLeaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
        );
    }

    if (!pathData) {
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
                                {language === "zh" ? "学习路径不存在或已被删除" : "Learning path not found or has been deleted"}
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

    const title = language === "zh" ? pathData.titleZh : pathData.titleEn;
    const description = language === "zh" ? pathData.descriptionZh : pathData.descriptionEn;
    const difficultyKey = pathData.difficulty as keyof typeof DIFFICULTY_CONFIG;
    const difficultyConfig = DIFFICULTY_CONFIG[difficultyKey];
    const badgeStyle = difficultyConfig
        ? `${difficultyConfig.color} border border-current/20`
        : "text-gray-700 bg-gray-50 border-gray-200";

    const isAdmin = currentUser?.role === "admin";
    const isAuthor = pathData.authorId === currentUser?._id?.toString();
    const canEdit = isAdmin && isAuthor;

    const editData: EditPathData | undefined = canEdit ? {
        id: pathId,
        titleEn: pathData.titleEn,
        titleZh: pathData.titleZh,
        descriptionEn: pathData.descriptionEn,
        descriptionZh: pathData.descriptionZh,
        difficulty: pathData.difficulty,
        courseIds: pathData.courses.map((c) => c._id as Id<"courses">),
        coverGradient: pathData.coverGradient,
    } : undefined;

    const borderColor = difficultyConfig?.border ?? "border-gray-300";
    const overallProgress = pathData.totalCourses > 0
        ? Math.round((pathData.completedCourses / pathData.totalCourses) * 100)
        : 0;

    // Find the first incomplete course index
    const currentCourseIndex = pathData.courses.findIndex(
        (c) => !c.progress || c.progress.completedModules?.length !== TOTAL_MODULES
    );

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-8 mt-4">
                <div className="max-w-3xl mx-auto">
                    {/* Path header card */}
                    <Card padding="none" className={`overflow-hidden rounded-2xl border-t-4 ${borderColor} mb-8`}>
                        <div className="p-6 md:p-8">
                            {/* Back button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="-ml-3 mb-4 group text-muted-foreground hover:text-foreground font-medium transition-colors"
                                onClick={() => router.push("/")}
                            >
                                <ChevronLeftIcon className="w-5 h-5 mr-1.5 transition-transform duration-200 group-hover:-translate-x-1" />
                                {t.common.back}
                            </Button>

                            {/* Top: label + badge */}
                            <div className="flex items-center gap-2 mb-3">
                                <RouteIcon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {t.paths.pathDetail}
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight mb-2">
                                {title}
                            </h1>

                            {/* Description */}
                            {description && (
                                <p className="text-muted-foreground text-sm mb-5 max-w-xl leading-relaxed">
                                    {description}
                                </p>
                            )}

                            {/* Meta row */}
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide ${badgeStyle}`}>
                                    {pathData.difficulty}
                                </span>
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <BookOpenIcon className="w-4 h-4" />
                                    <span>{pathData.completedCourses}/{pathData.totalCourses} {t.paths.courses}</span>
                                </div>
                                {canEdit && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setShowEditModal(true)}
                                        className="ml-auto"
                                    >
                                        <EditIcon className="w-4 h-4 mr-1.5" />
                                        {language === "zh" ? "编辑路径" : "Edit Path"}
                                    </Button>
                                )}
                            </div>

                            {/* Overall progress bar */}
                            <div className="p-5 bg-muted/50 rounded-2xl border border-border/30">
                                <div className="flex items-center justify-between text-xs mb-2.5">
                                    <span className="text-muted-foreground font-semibold">{t.paths.overallProgress}</span>
                                    <span className={`font-bold ${overallProgress === 100 ? "text-success" : "text-accent"}`}>{overallProgress}%</span>
                                </div>
                                <div className="h-2.5 bg-background rounded-full overflow-hidden relative">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ${overallProgress === 100 ? "bg-success" : "bg-accent"}`}
                                        style={{ width: `${overallProgress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Course timeline */}
                    <div className="space-y-6">
                        {pathData.courses.map((course, index) => {
                            const completedModules = course.progress?.completedModules?.length ?? 0;
                            const courseProgress = Math.round((completedModules / TOTAL_MODULES) * 100);
                            const isCompleted = completedModules === TOTAL_MODULES;
                            const isCurrent = index === currentCourseIndex;
                            const cDiffKey = course.difficulty as keyof typeof DIFFICULTY_CONFIG;
                            const cDiffConfig = DIFFICULTY_CONFIG[cDiffKey];

                            // Progress ring
                            const radius = 16;
                            const circumference = 2 * Math.PI * radius;
                            const strokeDashoffset = circumference - (courseProgress / 100) * circumference;

                            return (
                                <div key={course._id} className="relative flex gap-6 items-start">
                                    {/* Timeline node and connector */}
                                    <div className="flex flex-col items-center shrink-0 w-8 self-stretch relative">
                                        {/* Node */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all ${
                                            isCompleted
                                                ? "bg-success text-white shadow-md shadow-success/20 ring-4 ring-success/15"
                                                : isCurrent
                                                    ? "bg-primary text-white shadow-lg shadow-primary/25 ring-4 ring-primary/15"
                                                    : "bg-surface text-muted-foreground border-2 border-border shadow-sm ring-4 ring-muted/5"
                                        }`}>
                                            {isCompleted ? (
                                                <CheckCircleIcon className="w-4 h-4" />
                                            ) : (
                                                index + 1
                                            )}
                                        </div>
                                        {/* Timeline connector */}
                                        {index < pathData.courses.length - 1 && (
                                            <div className={`absolute left-[15px] top-[32px] bottom-[-24px] w-0.5 z-0 ${isCompleted ? "bg-success/50" : "bg-border"}`} />
                                        )}
                                    </div>

                                    {/* Course Card */}
                                    <a
                                        href={`/course/${course._id}`}
                                        className={`flex-1 block group p-5 rounded-2xl border transition-all duration-300 ${
                                            isCurrent
                                                ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                                                : isCompleted
                                                    ? "border-border/60 bg-surface/40 opacity-85 hover:opacity-100 hover:border-success/40"
                                                    : "border-border bg-surface hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5"
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 min-w-0">
                                                {isCurrent && (
                                                    <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider mb-1 block">
                                                        {t.paths.currentCourse}
                                                    </span>
                                                )}
                                                <h3 className={`text-base font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2 ${
                                                    isCurrent ? "text-foreground font-extrabold" : isCompleted ? "text-muted-foreground font-medium" : "text-foreground font-semibold"
                                                }`}>
                                                    {course.title}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${cDiffConfig?.color ?? "text-gray-500"}`}>
                                                        {course.difficulty}
                                                    </span>
                                                    <span>{course.wordCount} {t.create.wordCount}</span>
                                                </div>
                                            </div>

                                            {/* Progress ring */}
                                            <div className="relative w-11 h-11 shrink-0">
                                                <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
                                                    <circle
                                                        cx="20" cy="20" r={radius}
                                                        fill="none" strokeWidth="3"
                                                        className="stroke-muted/30"
                                                    />
                                                    <circle
                                                        cx="20" cy="20" r={radius}
                                                        fill="none" strokeWidth="3"
                                                        strokeLinecap="round"
                                                        className={`${isCompleted ? "stroke-success" : courseProgress > 0 ? "stroke-primary" : "stroke-border"} transition-all duration-700`}
                                                        style={{
                                                            strokeDasharray: circumference,
                                                            strokeDashoffset: strokeDashoffset,
                                                        }}
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className={`text-[9px] font-bold ${
                                                        isCompleted ? "text-success" : courseProgress > 0 ? "text-primary" : "text-muted-foreground"
                                                    }`}>
                                                        {courseProgress}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            );
                        })}
                    </div>

                    {/* Leave path */}
                    {currentUser && (
                        <div className="mt-12 flex justify-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowLeaveConfirm(true)}
                                className="text-muted-foreground hover:text-error hover:bg-error/5 rounded-xl px-4 py-2 cursor-pointer transition-all flex items-center gap-2"
                            >
                                <LogOutIcon className="w-4 h-4" />
                                {t.paths.leavePath}
                            </Button>
                        </div>
                    )}
                </div>
            </main>

            <ConfirmModal
                isOpen={showLeaveConfirm}
                onClose={() => setShowLeaveConfirm(false)}
                onConfirm={handleLeavePath}
                title={t.paths.leavePath}
                description={language === "zh"
                    ? "离开学习路径后，你仍然保留已加入的课程和学习进度。"
                    : "After leaving the learning path, your enrolled courses and progress will be preserved."
                }
                confirmText={t.common.confirm}
                cancelText={t.common.cancel}
                isLoading={isLeaving}
            />

            {canEdit && editData && (
                <CreatePathModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={() => setShowEditModal(false)}
                    editData={editData}
                />
            )}
        </div>
    );
}

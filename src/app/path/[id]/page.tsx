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
import { RouteIcon, BookOpenIcon } from "@/components/ui/Icons";
import { useI18n } from "@/lib/i18n";
import type { Id } from "../../../../convex/_generated/dataModel";
import { DIFFICULTY_CONFIG, TOTAL_MODULES, PATH_GRADIENTS } from "@/lib/constants";

export default function PathDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { t, language } = useI18n();
    const pathId = params.id as Id<"learningPaths">;
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

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

    const gradient = pathData.coverGradient || PATH_GRADIENTS[0];
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

                    {/* Path header card */}
                    <Card className="overflow-hidden mb-8">
                        <div className={`bg-gradient-to-br ${gradient} p-6 md:p-8 relative`}>
                            <div className="absolute inset-0 bg-black/10" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1.5">
                                        <RouteIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-white/80 text-sm font-medium">
                                        {t.paths.pathDetail}
                                    </span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-3">
                                    {title}
                                </h1>
                                {description && (
                                    <p className="text-white/70 text-sm mb-4 max-w-xl">
                                        {description}
                                    </p>
                                )}
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <span className={`px-3 py-1.5 rounded-md text-sm font-bold tracking-wide border bg-white/90 dark:bg-gray-900/90 ${badgeStyle}`}>
                                        {pathData.difficulty}
                                    </span>
                                    <div className="flex items-center gap-2 text-sm text-white/80">
                                        <BookOpenIcon className="w-4 h-4" />
                                        <span>{pathData.completedCourses}/{pathData.totalCourses} {t.paths.courses}</span>
                                    </div>
                                </div>

                                {/* Overall progress bar */}
                                <div>
                                    <div className="flex items-center justify-between text-xs text-white/80 mb-1.5">
                                        <span>{t.paths.overallProgress}</span>
                                        <span className="font-bold text-white">{overallProgress}%</span>
                                    </div>
                                    <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${overallProgress === 100 ? "bg-green-400" : "bg-white"}`}
                                            style={{ width: `${overallProgress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Course timeline */}
                    <div className="space-y-0">
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
                                <div key={course._id} className="relative">
                                    {/* Timeline connector */}
                                    {index < pathData.courses.length - 1 && (
                                        <div className={`absolute left-[23px] top-[56px] bottom-0 w-0.5 ${isCompleted ? "bg-success/40" : "bg-border/50"}`} />
                                    )}

                                    <a
                                        href={`/course/${course._id}`}
                                        className={`block group relative pl-14 pr-4 py-4 rounded-2xl mb-2 transition-all ${
                                            isCurrent
                                                ? "bg-primary/5 border border-primary/20 shadow-sm"
                                                : "hover:bg-muted/30"
                                        }`}
                                    >
                                        {/* Timeline node */}
                                        <div className={`absolute left-3 top-5 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold ${
                                            isCompleted
                                                ? "bg-success text-white"
                                                : isCurrent
                                                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                                                    : "bg-muted text-muted-foreground border border-border"
                                        }`}>
                                            {isCompleted ? (
                                                <CheckCircleIcon className="w-3.5 h-3.5" />
                                            ) : (
                                                index + 1
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 min-w-0">
                                                {isCurrent && (
                                                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1 block">
                                                        {t.paths.currentCourse}
                                                    </span>
                                                )}
                                                <h3 className={`font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2 ${
                                                    isCurrent ? "text-foreground" : isCompleted ? "text-muted-foreground" : "text-foreground"
                                                }`}>
                                                    {course.title}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
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
                        <div className="mt-8 flex justify-center">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowLeaveConfirm(true)}
                                className="text-muted-foreground hover:text-destructive"
                            >
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
        </div>
    );
}

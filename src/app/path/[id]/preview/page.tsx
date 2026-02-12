"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Header } from "@/components/layout";
import {
    Button,
    Card,
    CardContent,
    ChevronLeftIcon,
    CheckCircleIcon,
    TrashIcon,
    ConfirmModal,
} from "@/components/ui";
import { RouteIcon, BookOpenIcon } from "@/components/ui/Icons";
import { useI18n } from "@/lib/i18n";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { DIFFICULTY_CONFIG } from "@/lib/constants";

export default function PathPreviewPage() {
    const params = useParams();
    const router = useRouter();
    const { t, language } = useI18n();
    const pathId = params.id as Id<"learningPaths">;
    const [isJoining, setIsJoining] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const pathData = useQuery(api.learningPaths.get, { id: pathId });
    const isJoined = useQuery(api.learningPaths.isJoined, { pathId });
    const currentUser = useQuery(api.users.getCurrentUser);
    const joinPath = useMutation(api.learningPaths.joinPath);
    const removePath = useMutation(api.learningPaths.remove);

    const isLoading = pathData === undefined;
    const isAuthor = currentUser && pathData?.authorId === currentUser._id.toString();

    const handleJoinPath = async () => {
        setIsJoining(true);
        try {
            await joinPath({ pathId });
            router.push(`/path/${pathId}`);
        } catch {
            setIsJoining(false);
        }
    };

    const handleDeletePath = async () => {
        setIsDeleting(true);
        try {
            await removePath({ id: pathId });
            router.push("/");
        } catch (error) {
            console.error("Failed to delete path:", error);
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

    const borderColor = difficultyConfig?.border ?? "border-gray-300";

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

                    <Card padding="none" className={`overflow-hidden rounded-2xl border-t-4 ${borderColor}`}>
                        <div className="px-5 py-5 md:px-6 md:py-6">
                            {/* Top row: label + delete */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <RouteIcon className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {t.sidebar.learningPaths}
                                    </span>
                                </div>
                                {isAuthor && (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                        title={t.paths.deletePath}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Title */}
                            <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight mb-3">
                                {title}
                            </h1>

                            {/* Meta row */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide ${badgeStyle}`}>
                                    {pathData.difficulty}
                                </span>
                                {isJoined && (
                                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-success/10 text-success border border-success/20 flex items-center gap-1">
                                        <CheckCircleIcon className="w-3.5 h-3.5" />
                                        {t.paths.joined}
                                    </span>
                                )}
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <BookOpenIcon className="w-3.5 h-3.5" />
                                    <span>{pathData.totalCourses} {t.paths.courses}</span>
                                </div>
                            </div>
                        </div>

                        <CardContent className="px-5 py-4 md:px-6 md:py-5 border-t border-border space-y-5">
                            {/* Description */}
                            {description && (
                                <section>
                                    <h2 className="text-sm font-semibold text-foreground mb-1.5">
                                        {t.paths.description}
                                    </h2>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {description}
                                    </p>
                                </section>
                            )}

                            {/* Course list */}
                            <section>
                                <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                                    <BookOpenIcon className="w-4 h-4 text-muted-foreground" />
                                    {t.paths.courses} ({pathData.totalCourses})
                                </h2>
                                <div className="space-y-2">
                                    {pathData.courses.map((course, index) => {
                                        const cDiffKey = course.difficulty as keyof typeof DIFFICULTY_CONFIG;
                                        const cDiffConfig = DIFFICULTY_CONFIG[cDiffKey];
                                        return (
                                            <div
                                                key={course._id}
                                                className="flex items-center gap-3 px-3 py-2.5 bg-muted/30 rounded-lg border border-border"
                                            >
                                                <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center shrink-0">
                                                    {index + 1}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-foreground font-medium truncate">
                                                        {course.title}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        {course.wordCount} {t.create.wordCount}
                                                    </p>
                                                </div>
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${cDiffConfig?.color ?? "text-gray-500"}`}>
                                                    {course.difficulty}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Action buttons */}
                            <div className="pt-4 border-t border-border">
                                <div className="flex justify-center">
                                    {!currentUser ? (
                                        <p className="text-sm text-muted-foreground">
                                            {language === "zh" ? "请先登录" : "Please sign in first"}
                                        </p>
                                    ) : isJoined ? (
                                        <Button onClick={() => router.push(`/path/${pathId}`)}>
                                            {t.paths.continuePath}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleJoinPath}
                                            isLoading={isJoining}
                                        >
                                            {t.paths.joinPath}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeletePath}
                title={t.paths.deletePath}
                description={t.paths.deletePathConfirm}
                confirmText={t.common.confirm}
                cancelText={t.common.cancel}
                variant="destructive"
                isLoading={isDeleting}
            />
        </div>
    );
}

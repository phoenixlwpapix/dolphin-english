"use client";

import {
    Card,
    CardContent,
    GlobeIcon,
    CheckCircleIcon,
    ChartBarIcon,
    CalendarIcon,
    ClockIcon,
} from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { TOTAL_MODULES, DIFFICULTY_CONFIG } from "@/lib/constants";

export interface CourseWithProgress {
    _id: string;
    title: string;
    difficulty: string;
    wordCount: number;
    _creationTime: number;
    isPublic?: boolean;
    addedAt?: number;
    progress: {
        currentModule: number;
        completedModules: number[];
        _creationTime: number;
        lastStudiedAt?: number;
    } | null | undefined;
}

interface CourseCardProps {
    course: CourseWithProgress;
    isPublicTab?: boolean;
    isJoined?: boolean;
    inPath?: boolean;
}

export function getProgressPercentage(completedModules: number[] | undefined): number {
    if (!completedModules) return 0;
    return Math.round((completedModules.length / TOTAL_MODULES) * 100);
}

function formatDate(timestamp: number): string {
    return new Intl.DateTimeFormat("zh-CN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(timestamp));
}

export function CourseCard({ course, isPublicTab = false, isJoined = false, inPath = false }: CourseCardProps) {
    const { t } = useI18n();
    const progressPercent = getProgressPercentage(course.progress?.completedModules);
    const hasProgress = course.progress != null;

    const difficultyKey = course.difficulty as keyof typeof DIFFICULTY_CONFIG;
    const difficultyConfig = DIFFICULTY_CONFIG[difficultyKey];

    const badgeStyle = difficultyConfig
        ? `${difficultyConfig.color} border border-current/20`
        : "text-gray-700 bg-gray-50 border-gray-200";
    const borderStyle = difficultyConfig?.border ?? "border-gray-300";
    const accentBg = difficultyConfig?.accent ?? "bg-gray-400";

    const progressColor =
        progressPercent === 100 ? "stroke-success"
            : progressPercent > 0 ? "stroke-accent"
                : "stroke-border";

    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

    const courseUrl = isPublicTab ? `/course/${course._id}/preview` : `/course/${course._id}`;

    return (
        <a href={courseUrl} className="block group h-full">
            <Card
                className={`h-full flex flex-col bg-card transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-accent/5 overflow-hidden rounded-2xl ${
                    inPath
                        ? `border-2 ${borderStyle}`
                        : `border-l-4 ${borderStyle} border-t-0 border-r-0 border-b-0`
                }`}
            >
                <CardContent className="flex-1 flex flex-col p-6 relative">
                    <div className={`absolute top-0 right-0 w-32 h-32 ${accentBg} opacity-[0.03] rounded-bl-full -z-0 group-hover:opacity-[0.08] transition-opacity duration-500`} />

                    <div className="relative z-10 flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-xl font-bold text-foreground leading-snug group-hover:text-accent transition-colors line-clamp-2">
                            {course.title}
                        </h3>
                        <span className={`shrink-0 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase ${badgeStyle} mt-1`}>
                            {course.difficulty}
                        </span>
                    </div>

                    {!isPublicTab && course.isPublic && (
                        <div className="relative z-10 mb-4">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border bg-blue-50/50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30" title={t.common.public}>
                                <GlobeIcon className="w-3 h-3" />
                                <span>{t.common.public}</span>
                            </div>
                        </div>
                    )}

                    {isPublicTab && isJoined && (
                        <div className="relative z-10 mb-4">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border bg-success/10 text-success border-success/20">
                                <CheckCircleIcon className="w-3 h-3" />
                                <span>{t.course.joined}</span>
                            </div>
                        </div>
                    )}

                    <div className="flex-1" />

                    <div className="relative z-10 flex items-end justify-between gap-4 pt-6 border-t border-border/50 mt-2">
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                                <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                                    <ChartBarIcon className="w-3.5 h-3.5" />
                                    <span>{course.wordCount} {t.create.wordCount}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                                    <CalendarIcon className="w-3.5 h-3.5" />
                                    <span>{formatDate(course._creationTime).split(" ")[0]}</span>
                                </div>
                            </div>

                            {!isPublicTab && hasProgress && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground pl-1">
                                    <ClockIcon className="w-3.5 h-3.5 text-accent" />
                                    <span>
                                        {t.home.lastStudied}:{" "}
                                        {formatDate(course.progress!.lastStudiedAt ?? course.progress!._creationTime)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {!isPublicTab && (
                            <div className="relative w-14 h-14 shrink-0 -mb-1 -mr-1">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
                                    <circle cx="22" cy="22" r={radius} fill="none" strokeWidth="4" className="stroke-muted/30" />
                                    <circle
                                        cx="22" cy="22" r={radius} fill="none" strokeWidth="4" strokeLinecap="round"
                                        className={`${progressColor} transition-all duration-1000 ease-out`}
                                        style={{ strokeDasharray: circumference, strokeDashoffset }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className={`text-[10px] font-bold ${
                                        progressPercent === 100 ? "text-success"
                                            : progressPercent > 0 ? "text-accent"
                                                : "text-muted-foreground"
                                    }`}>
                                        {progressPercent}%
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </a>
    );
}

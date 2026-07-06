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

    const borderStyle = difficultyConfig?.border ?? "border-gray-300";
    const accentBg = difficultyConfig?.accent ?? "bg-gray-400";

    const courseUrl = isPublicTab ? `/course/${course._id}/preview` : `/course/${course._id}`;

    return (
        <a href={courseUrl} className="block group h-full">
            <Card
                className={`h-full flex flex-col bg-card border border-border/80 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-lg group-hover:shadow-primary-500/[0.03] dark:group-hover:shadow-accent-500/[0.03] overflow-hidden rounded-2xl ${
                    inPath ? `border-2 ${borderStyle}` : ""
                }`}
            >
                <CardContent className="flex-1 flex flex-col p-6 relative justify-between">
                    <div>
                        {/* Header: CEFR indicator with dot & Start action */}
                        <div className="flex items-center justify-between mb-3 text-xs font-semibold text-muted-foreground relative z-10">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-muted/65 text-muted-foreground font-semibold tracking-wider text-[10px] uppercase">
                                <span className={`w-1.5 h-1.5 rounded-full ${accentBg}`} />
                                {course.difficulty} · {difficultyConfig?.label}
                            </span>
                            
                            <span className="text-[11px] font-bold text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-0.5">
                                {t.create.startLearning}
                                <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-foreground leading-snug group-hover:text-accent transition-colors line-clamp-2 mb-4 relative z-10">
                            {course.title}
                        </h3>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                            {!isPublicTab && course.isPublic && (
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border bg-blue-50/50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30" title={t.common.public}>
                                    <GlobeIcon className="w-3.5 h-3.5" />
                                    <span>{t.common.public}</span>
                                </div>
                            )}

                            {isPublicTab && isJoined && (
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border bg-success/10 text-success border-success/20">
                                    <CheckCircleIcon className="w-3.5 h-3.5" />
                                    <span>{t.course.joined}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1" />

                    {/* Integrated Progress & Metadata */}
                    <div className="space-y-4 pt-4 border-t border-border/50 relative z-10">
                        {/* Progress bar */}
                        {!isPublicTab && hasProgress && (
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        {progressPercent === 100 ? (
                                            <span className="text-success flex items-center gap-0.5">
                                                <CheckCircleIcon className="w-3.5 h-3.5" />
                                                {t.common.complete}
                                            </span>
                                        ) : (
                                            <span>{t.home.progress}: {progressPercent}%</span>
                                        )}
                                    </span>
                                    {course.progress?.lastStudiedAt && (
                                        <span className="text-[10px] text-muted-foreground/80 font-normal flex items-center gap-1">
                                            <ClockIcon className="w-3.5 h-3.5 text-accent" />
                                            {formatDate(course.progress.lastStudiedAt).split(" ")[0]}
                                        </span>
                                    )}
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            progressPercent === 100 ? "bg-success" : "bg-accent"
                                        }`}
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Dot separated metadata line */}
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/80">
                            <ChartBarIcon className="w-4 h-4 text-muted-foreground/60" />
                            <span>{course.wordCount} {t.create.wordCount}</span>
                            <span className="text-muted-foreground/30">•</span>
                            <CalendarIcon className="w-4 h-4 text-muted-foreground/60" />
                            <span>{formatDate(course._creationTime).split(" ")[0]}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </a>
    );
}

"use client";

import { useState } from "react";
import {
    Button,
    BookOpenIcon,
    CheckCircleIcon,
    RouteIcon,
    ChevronDownIcon,
    PlusIcon,
    SearchIcon,
} from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { DIFFICULTY_CONFIG } from "@/lib/constants";
import { CourseCard, type CourseWithProgress } from "./CourseCard";

type MyPath = {
    _id: string;
    titleEn: string;
    titleZh: string;
    difficulty: string;
    courseIds: string[];
    completedCourses: number;
    totalCourses: number;
};

interface MyCoursesViewProps {
    myPaths: MyPath[] | undefined;
    pathCoursesMap: Map<string, CourseWithProgress[]>;
    inProgressCourses: CourseWithProgress[];
    completedCourses: CourseWithProgress[];
    standaloneCourses: CourseWithProgress[];
    isLoading: boolean;
    hasFilters: boolean;
    onCreateCourse: () => void;
    onClearFilters: () => void;
}

export function MyCoursesView({
    myPaths,
    pathCoursesMap,
    inProgressCourses,
    completedCourses,
    standaloneCourses,
    isLoading,
    hasFilters,
    onCreateCourse,
    onClearFilters,
}: MyCoursesViewProps) {
    const { t, language } = useI18n();
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

    const togglePathExpanded = (pathId: string) => {
        setExpandedPaths(prev => {
            const next = new Set(prev);
            if (next.has(pathId)) next.delete(pathId);
            else next.add(pathId);
            return next;
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                <div className="w-12 h-12 rounded-full border-4 border-accent/20 border-t-accent animate-spin mb-4" />
                <p className="text-muted-foreground text-sm">{t.home.loadingCourses}</p>
            </div>
        );
    }

    const isEmpty = standaloneCourses.length === 0 && (!myPaths || myPaths.length === 0);

    if (isEmpty) {
        return hasFilters ? (
            <div className="flex flex-col items-center justify-center py-32 bg-surface rounded-3xl border border-dashed border-border animate-slide-up">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                    <SearchIcon className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-medium text-foreground mb-2">
                    {t.home.noResults || "No matching courses found"}
                </h3>
                <p className="text-sm text-muted-foreground mb-8 text-center max-w-xs mx-auto">
                    {t.home.tryAdjusting}
                </p>
                <Button variant="secondary" onClick={onClearFilters} className="rounded-xl px-6">
                    {t.home.clearFilters || "Clear filters"}
                </Button>
            </div>
        ) : (
            <div className="text-center py-32 bg-surface rounded-3xl border border-dashed border-border animate-slide-up">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary-100 flex items-center justify-center animate-pulse-soft">
                    <BookOpenIcon className="w-10 h-10 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">{t.home.noCourses}</h3>
                <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">{t.home.noCoursesDesc}</p>
                <Button
                    size="lg"
                    onClick={onCreateCourse}
                    className="rounded-2xl px-8 shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-shadow"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    {t.home.newCourse}
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* My Paths */}
            {myPaths && myPaths.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-border/50" />
                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                            <RouteIcon className="w-4 h-4 text-accent" />
                            {t.home.myPaths} ({myPaths.length})
                        </span>
                        <div className="h-px flex-1 bg-border/50" />
                    </div>
                    <div className="space-y-3">
                        {myPaths.map((path) => {
                            const title = language === "zh" ? path.titleZh : path.titleEn;
                            const isExpanded = expandedPaths.has(path._id);
                            const courses = pathCoursesMap.get(path._id) ?? [];
                            const progressPercent = path.totalCourses > 0
                                ? Math.round((path.completedCourses / path.totalCourses) * 100)
                                : 0;
                            const diffConfig = DIFFICULTY_CONFIG[path.difficulty as keyof typeof DIFFICULTY_CONFIG];
                            const borderStyle = diffConfig?.border ?? "border-gray-300";
                            const badgeStyle = diffConfig
                                ? `${diffConfig.color} border border-current/20`
                                : "text-gray-700 bg-gray-50 border-gray-200";

                            return (
                                <div key={path._id} className="animate-slide-up">
                                    <div className={`bg-card border-l-4 ${borderStyle} border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-accent/5`}>
                                        <button
                                            onClick={() => togglePathExpanded(path._id)}
                                            className="w-full flex items-center gap-4 p-5 text-left hover:bg-muted/30 transition-colors"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2.5 mb-1.5">
                                                    <h3 className="text-lg font-bold text-foreground truncate">{title}</h3>
                                                    <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${badgeStyle}`}>
                                                        {path.difficulty}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border bg-success/10 text-success border-success/20">
                                                        <CheckCircleIcon className="w-3 h-3" />
                                                        {t.paths.joined}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <BookOpenIcon className="w-3.5 h-3.5" />
                                                        {path.completedCourses}/{path.totalCourses}
                                                    </span>
                                                    <span className={`font-bold ${progressPercent === 100 ? "text-success" : "text-accent"}`}>
                                                        {progressPercent}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-24 shrink-0">
                                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ${progressPercent === 100 ? "bg-success" : "bg-accent"}`}
                                                        style={{ width: `${progressPercent}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <ChevronDownIcon className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                                        </button>

                                        {isExpanded && (
                                            <div className="px-5 pb-5 border-t border-border/50">
                                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-4">
                                                    {courses.map((course, index) => (
                                                        <div key={course._id} className="animate-slide-up" style={{ animationDelay: `${index * 30}ms` }}>
                                                            <CourseCard course={course} inPath />
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-3 text-center">
                                                    <a href={`/path/${path._id}`} className="text-xs text-accent hover:underline font-medium">
                                                        {t.paths.pathDetail} →
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Standalone section divider */}
            {myPaths && myPaths.length > 0 && standaloneCourses.length > 0 && (
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border/50" />
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                        <BookOpenIcon className="w-4 h-4 text-accent" />
                        {t.home.standaloneCourses} ({standaloneCourses.length})
                    </span>
                    <div className="h-px flex-1 bg-border/50" />
                </div>
            )}

            {/* In-progress courses */}
            {inProgressCourses.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {inProgressCourses.map((course, index) => (
                        <div key={course._id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                            <CourseCard course={course} />
                        </div>
                    ))}
                </div>
            )}

            {/* Completed courses */}
            {completedCourses.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-border/50" />
                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                            <CheckCircleIcon className="w-4 h-4 text-success" />
                            {t.home.completedCourses} ({completedCourses.length})
                        </span>
                        <div className="h-px flex-1 bg-border/50" />
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {completedCourses.map((course, index) => (
                            <div key={course._id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                                <CourseCard course={course} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

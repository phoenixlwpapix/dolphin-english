"use client";

import {
    Button,
    BookOpenIcon,
    RouteIcon,
    SearchIcon,
    PlusIcon,
} from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { PathCard } from "@/components/paths";
import { CourseCard, type CourseWithProgress } from "./CourseCard";

type PublicPath = {
    _id: string;
    titleEn: string;
    titleZh: string;
    difficulty: string;
    courseIds: string[];
    descriptionEn: string;
    descriptionZh: string;
    coverGradient?: string;
    _creationTime: number;
};

interface ExploreViewProps {
    filteredExplorePaths: PublicPath[];
    standaloneExploreCourses: CourseWithProgress[];
    joinedPathIds: Set<string>;
    joinedCourseIds: Set<string>;
    isLoading: boolean;
    hasFilters: boolean;
    onCreateCourse: () => void;
    onClearFilters: () => void;
}

export function ExploreView({
    filteredExplorePaths,
    standaloneExploreCourses,
    joinedPathIds,
    joinedCourseIds,
    isLoading,
    hasFilters,
    onCreateCourse,
    onClearFilters,
}: ExploreViewProps) {
    const { t } = useI18n();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                <div className="w-12 h-12 rounded-full border-4 border-accent/20 border-t-accent animate-spin mb-4" />
                <p className="text-muted-foreground text-sm">{t.home.loadingCourses}</p>
            </div>
        );
    }

    const isEmpty = filteredExplorePaths.length === 0 && standaloneExploreCourses.length === 0;

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
            {/* Learning paths */}
            {filteredExplorePaths.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-border/50" />
                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                            <RouteIcon className="w-4 h-4 text-accent" />
                            {t.sidebar.learningPaths} ({filteredExplorePaths.length})
                        </span>
                        <div className="h-px flex-1 bg-border/50" />
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredExplorePaths.map((path, index) => (
                            <div key={path._id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                                <PathCard path={path} isJoined={joinedPathIds.has(path._id)} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Standalone courses divider */}
            {filteredExplorePaths.length > 0 && standaloneExploreCourses.length > 0 && (
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border/50" />
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                        <BookOpenIcon className="w-4 h-4 text-accent" />
                        {t.home.standaloneCourses} ({standaloneExploreCourses.length})
                    </span>
                    <div className="h-px flex-1 bg-border/50" />
                </div>
            )}

            {/* Standalone courses */}
            {standaloneExploreCourses.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {standaloneExploreCourses.map((course, index) => (
                        <div key={course._id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                            <CourseCard
                                course={course}
                                isPublicTab
                                isJoined={joinedCourseIds.has(course._id)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

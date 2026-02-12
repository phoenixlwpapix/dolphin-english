"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../convex/_generated/api";
import { Sidebar, type SidebarTab } from "@/components/layout";
import {
    Card,
    CardContent,
    BookOpenIcon,
    CalendarIcon,
    ChartBarIcon,
    ClockIcon,
    SearchIcon,
    SortIcon,
    Button,
    PlusIcon,
    UserIcon,
    LogOutIcon,
    SettingsIcon,
    GlobeIcon,
    LibraryIcon,
    BarChart3Icon,
    CheckCircleIcon,
    RouteIcon,
} from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { TOTAL_MODULES, DIFFICULTY_CONFIG } from "@/lib/constants";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { PathsView } from "@/components/paths";

type DifficultyLevel = "A2" | "A2+" | "B1" | string;
type SortOrder = "lastStudied" | "addedDate";

function getProgressPercentage(completedModules: number[] | undefined): number {
    if (!completedModules) return 0;
    return Math.round((completedModules.length / TOTAL_MODULES) * 100);
}

interface DashboardProps {
    onCreateCourse: () => void;
    onCreatePath?: () => void;
}

export function Dashboard({ onCreateCourse, onCreatePath }: DashboardProps) {
    const { t } = useI18n();
    const { signOut } = useAuthActions();
    const currentUser = useQuery(api.users.getCurrentUser);
    const coursesData = useQuery(api.courses.list);
    const publicCourses = useQuery(api.courses.listPublic);
    const myCourses = useQuery(api.userCourses.listMyCourses);
    const [activeTab, setActiveTab] = useState<SidebarTab>("my");
    const [isSigningOut, setIsSigningOut] = useState(false);

    // Search, filter, and sort state
    const [searchQuery, setSearchQuery] = useState("");
    const [difficultyFilter, setDifficultyFilter] =
        useState<DifficultyLevel | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>("lastStudied");
    const [isSortOpen, setIsSortOpen] = useState(false);
    const sortRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
                setIsSortOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const isLoading = activeTab === "my" ? myCourses === undefined : publicCourses === undefined;

    // Get the correct data source based on active tab
    const currentCourses = useMemo(() => {
        if (activeTab === "my") {
            return myCourses ?? [];
        } else if (activeTab === "public") {
            return publicCourses?.map(course => ({
                ...course,
                progress: null,
            })) ?? [];
        }
        return [];
    }, [activeTab, myCourses, publicCourses]);

    // Filtered and sorted courses
    const filteredCourses = useMemo(() => {
        if (currentCourses.length === 0) return [];

        let result = [...currentCourses];

        // Search by title
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter((course) =>
                course.title.toLowerCase().includes(query),
            );
        }

        // Filter by difficulty
        if (difficultyFilter) {
            result = result.filter(
                (course) => course.difficulty === difficultyFilter,
            );
        }

        // Sort
        result.sort((a, b) => {
            if (sortOrder === "lastStudied") {
                // Use progress update time if available, otherwise creation time
                const aTime = a.progress?._creationTime ?? 0;
                const bTime = b.progress?._creationTime ?? 0;
                // Put courses with no progress at the end
                if (aTime === 0 && bTime === 0)
                    return b._creationTime - a._creationTime;
                if (aTime === 0) return 1;
                if (bTime === 0) return -1;
                return bTime - aTime;
            } else {
                // Sort by added time (when user added the course)
                const aAddedTime = (a as { addedAt?: number }).addedAt ?? a._creationTime;
                const bAddedTime = (b as { addedAt?: number }).addedAt ?? b._creationTime;
                return bAddedTime - aAddedTime;
            }
        });

        return result;
    }, [currentCourses, searchQuery, difficultyFilter, sortOrder]);

    // Split into in-progress and completed for "my" tab
    const { inProgressCourses, completedCourses } = useMemo(() => {
        if (activeTab !== "my") return { inProgressCourses: filteredCourses, completedCourses: [] };
        const inProgress: typeof filteredCourses = [];
        const completed: typeof filteredCourses = [];
        for (const course of filteredCourses) {
            if (course.progress?.completedModules?.length === TOTAL_MODULES) {
                completed.push(course);
            } else {
                inProgress.push(course);
            }
        }
        return { inProgressCourses: inProgress, completedCourses: completed };
    }, [filteredCourses, activeTab]);

    function formatDate(timestamp: number): string {
        return new Intl.DateTimeFormat("zh-CN", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(timestamp));
    }

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try {
            await signOut();
        } finally {
            setIsSigningOut(false);
        }
    };

    // CEFR levels in order for sorting
    const CEFR_ORDER = [
        "A1",
        "A1+",
        "A2",
        "A2+",
        "B1",
        "B1+",
        "B2",
        "B2+",
        "C1",
        "C1+",
        "C2",
    ];

    // Dynamically get unique difficulty levels from courses
    const difficulties = useMemo(() => {
        if (!coursesData) return [];
        const uniqueLevels = [
            ...new Set(coursesData.map((course) => course.difficulty)),
        ];
        return uniqueLevels.sort((a, b) => {
            const indexA = CEFR_ORDER.indexOf(a);
            const indexB = CEFR_ORDER.indexOf(b);
            // If not in CEFR_ORDER, put at the end
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    }, [coursesData]);

    return (
        <div className="flex bg-background min-h-[calc(100vh-80px)]">
            <Sidebar className="hidden md:block sticky top-20 h-[calc(100vh-80px)]" activeTab={activeTab} onTabChange={setActiveTab} />

            <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl animate-slide-up">
                {/* Mobile Tab Switcher */}
                <div className="md:hidden flex items-center gap-2 mb-6">
                    <div className="flex-1 flex items-center gap-1 p-1 bg-muted/50 rounded-xl">
                        <button
                            onClick={() => setActiveTab("my")}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                activeTab === "my"
                                    ? "bg-accent text-white shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <BookOpenIcon className="w-4 h-4" />
                            {t.sidebar.myCourses}
                        </button>
                        <button
                            onClick={() => setActiveTab("public")}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                activeTab === "public"
                                    ? "bg-accent text-white shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <LibraryIcon className="w-4 h-4" />
                            {t.sidebar.publicCourses}
                        </button>
                    </div>
                    <button
                        onClick={() => setActiveTab("paths")}
                        className={`p-2.5 rounded-xl transition-all ${
                            activeTab === "paths"
                                ? "bg-accent/10 text-accent"
                                : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                        aria-label={t.sidebar.learningPaths}
                    >
                        <RouteIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setActiveTab("analytics")}
                        className={`p-2.5 rounded-xl transition-all ${
                            activeTab === "analytics"
                                ? "bg-accent/10 text-accent"
                                : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                        aria-label={t.sidebar.analytics}
                    >
                        <BarChart3Icon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setActiveTab("settings")}
                        className={`p-2.5 rounded-xl transition-all ${
                            activeTab === "settings"
                                ? "bg-accent/10 text-accent"
                                : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                        aria-label={t.sidebar.settings}
                    >
                        <SettingsIcon className="w-5 h-5" />
                    </button>
                </div>

                {activeTab === "analytics" ? (
                    // Analytics View
                    <AnalyticsDashboard />
                ) : activeTab === "paths" ? (
                    // Paths View
                    <PathsView
                        onCreatePath={onCreatePath}
                        isAdmin={currentUser?.role === "admin"}
                    />
                ) : activeTab === "settings" ? (
                    // Settings View
                    <div className="max-w-2xl mx-auto space-y-8 animate-slide-up">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-primary-100 p-2 rounded-xl text-primary-700">
                                <SettingsIcon className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">
                                {t.sidebar.settings}
                            </h2>
                        </div>

                        <Card className="border-border shadow-lg shadow-black/5 overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-6 bg-primary-50 dark:bg-primary-900/20">
                                    <h3 className="text-lg font-semibold text-foreground mb-1">
                                        {t.auth?.signInTitle || "Account"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">{t.home.accountSettings}</p>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border">
                                        <div className="w-12 h-12 rounded-full bg-primary-700 flex items-center justify-center text-white shadow-lg">
                                            {currentUser?.email?.charAt(0).toUpperCase() || <UserIcon className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">{t.auth?.email}</p>
                                            <p className="text-foreground font-medium text-lg">{currentUser?.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-border">
                                        <Button
                                            variant="secondary"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                                            onClick={handleSignOut}
                                            isLoading={isSigningOut}
                                        >
                                            <LogOutIcon className="w-4 h-4 mr-2" />
                                            {t.auth?.signOut || "Sign Out"}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    // Course List View
                    <>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-primary-100 text-primary-700">
                                    {activeTab === "my" ? (
                                        <BookOpenIcon className="w-6 h-6" />
                                    ) : (
                                        <LibraryIcon className="w-6 h-6" />
                                    )}
                                </div>
                                <div className="flex items-baseline gap-3">
                                    <h2 className="text-2xl font-bold text-foreground">
                                        {activeTab === "my" ? t.sidebar.myCourses : t.sidebar.publicCourses}
                                    </h2>
                                    {!isLoading && (
                                        <span className="px-2.5 py-0.5 text-xs font-semibold text-accent bg-accent/10 rounded-full">
                                            {activeTab === "my" ? (myCourses?.length ?? 0) : (publicCourses?.length ?? 0)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Search, Filter, Sort Controls */}
                        <div className="bg-surface mb-8 p-4 rounded-2xl border border-border shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:gap-4 flex-wrap">
                            {/* Search */}
                            <div className="relative flex-1 min-w-[200px]">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder={t.home.searchPlaceholder || "Search..."}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 text-foreground placeholder:text-muted-foreground transition-all"
                                />
                            </div>

                            {/* Difficulty Filter */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                                <button
                                    onClick={() => setDifficultyFilter(null)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${difficultyFilter === null
                                        ? "bg-accent text-white shadow-md shadow-accent/25"
                                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`}
                                >
                                    {t.home.allDifficulties || "All"}
                                </button>
                                {difficulties.map((diff) => (
                                    <button
                                        key={diff}
                                        onClick={() =>
                                            setDifficultyFilter(difficultyFilter === diff ? null : diff)
                                        }
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${difficultyFilter === diff
                                            ? "bg-accent text-white shadow-md shadow-accent/25"
                                            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                                            }`}
                                    >
                                        {diff}
                                    </button>
                                ))}
                            </div>

                            {/* Sort - only show for my courses */}
                            {activeTab === "my" && (
                                <div className="md:ml-auto flex items-center gap-2">
                                    <div className="relative" ref={sortRef}>
                                        <button
                                            onClick={() => setIsSortOpen(!isSortOpen)}
                                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground bg-muted border border-border rounded-xl hover:border-accent/50 transition-all hover:bg-muted"
                                        >
                                            <SortIcon className="w-4 h-4 text-muted-foreground" />
                                            <span>
                                                {sortOrder === "lastStudied"
                                                    ? t.home.sortByLastStudied || "Last Studied"
                                                    : t.home.sortByAddedDate || "Added Date"}
                                            </span>
                                        </button>

                                        {isSortOpen && (
                                            <div className="absolute right-0 top-full pt-2 w-48 z-20">
                                                <div className="bg-surface border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                    <div className="p-1">
                                                        <button
                                                            onClick={() => {
                                                                setSortOrder("lastStudied");
                                                                setIsSortOpen(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-2.5 text-sm rounded-lg hover:bg-accent/10 transition-colors ${sortOrder === "lastStudied"
                                                                ? "text-accent font-medium bg-accent/5"
                                                                : "text-foreground"
                                                                }`}
                                                        >
                                                            {t.home.sortByLastStudied || "Last Studied"}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSortOrder("addedDate");
                                                                setIsSortOpen(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-2.5 text-sm rounded-lg hover:bg-accent/10 transition-colors ${sortOrder === "addedDate"
                                                                ? "text-accent font-medium bg-accent/5"
                                                                : "text-foreground"
                                                                }`}
                                                        >
                                                            {t.home.sortByAddedDate || "Added Date"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                                <div className="w-12 h-12 rounded-full border-4 border-accent/20 border-t-accent animate-spin mb-4" />
                                <p className="text-muted-foreground text-sm">{t.home.loadingCourses}</p>
                            </div>
                        ) : filteredCourses.length === 0 ? (
                            // Empty state
                            searchQuery || difficultyFilter ? (
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
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setDifficultyFilter(null);
                                        }}
                                        className="rounded-xl px-6"
                                    >
                                        {t.home.clearFilters || "Clear filters"}
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-32 bg-surface rounded-3xl border border-dashed border-border animate-slide-up">
                                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary-100 flex items-center justify-center animate-pulse-soft">
                                        <BookOpenIcon className="w-10 h-10 text-accent" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-foreground mb-3">
                                        {t.home.noCourses}
                                    </h3>
                                    <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
                                        {t.home.noCoursesDesc}
                                    </p>
                                    <Button
                                        size="lg"
                                        onClick={onCreateCourse}
                                        className="rounded-2xl px-8 shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-shadow"
                                    >
                                        <PlusIcon className="w-5 h-5 mr-2" />
                                        {t.home.newCourse}
                                    </Button>
                                </div>
                            )
                        ) : (
                            // Course grid with stagger animation
                            <div className="space-y-8">
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                                    {inProgressCourses.map((course, index) => (
                                        <div key={course._id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                                            <CourseCard
                                                course={course}
                                                t={t}
                                                formatDate={formatDate}
                                                isPublicTab={activeTab === "public"}
                                            />
                                        </div>
                                    ))}
                                </div>

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
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                                            {completedCourses.map((course, index) => (
                                                <div key={course._id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                                                    <CourseCard
                                                        course={course}
                                                        t={t}
                                                        formatDate={formatDate}
                                                        isPublicTab={activeTab === "public"}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

interface CourseWithProgress {
    _id: string;
    title: string;
    difficulty: "A2" | "A2+" | "B1" | string;
    wordCount: number;
    _creationTime: number;
    isPublic?: boolean;
    addedAt?: number;
    progress: {
        currentModule: number;
        completedModules: number[];
        _creationTime: number;
    } | null;
}

interface CourseCardProps {
    course: CourseWithProgress;
    t: ReturnType<typeof useI18n>["t"];
    formatDate: (timestamp: number) => string;
    isPublicTab?: boolean;
}

function CourseCard({ course, t, formatDate, isPublicTab = false }: CourseCardProps) {
    const progressPercent = getProgressPercentage(
        course.progress?.completedModules,
    );
    const hasProgress = course.progress !== null;

    // Get difficulty config, with fallback for unknown levels
    const difficultyKey = course.difficulty as keyof typeof DIFFICULTY_CONFIG;
    const difficultyConfig = DIFFICULTY_CONFIG[difficultyKey];

    // Badge style from DIFFICULTY_CONFIG
    const badgeStyle = difficultyConfig
        ? `${difficultyConfig.color} border border-current/20`
        : "text-gray-700 bg-gray-50 border-gray-200";

    // Border and accent colors for card decoration
    const borderStyle = difficultyConfig?.border ?? "border-gray-300";
    const accentBg = difficultyConfig?.accent ?? "bg-gray-400";

    // Progress ring color
    const progressColor =
        progressPercent === 100
            ? "stroke-success"
            : progressPercent > 0
                ? "stroke-accent"
                : "stroke-border";

    // SVG circle properties for progress ring
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset =
        circumference - (progressPercent / 100) * circumference;

    // Determine the link URL based on tab type
    const courseUrl = isPublicTab
        ? `/course/${course._id}/preview`
        : `/course/${course._id}`;

    return (
        <a href={courseUrl} className="block group h-full">
            <Card
                className={`h-full flex flex-col bg-card border-l-4 ${borderStyle} border-t-0 border-r-0 border-b-0 hover:border-l-4 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-accent/5 overflow-hidden rounded-2xl`}
            >
                <CardContent className="flex-1 flex flex-col p-6 relative">
                    {/* Decorative gradient blob */}
                    <div className={`absolute top-0 right-0 w-32 h-32 ${accentBg} opacity-[0.03] rounded-bl-full -z-0 group-hover:opacity-[0.08] transition-opacity duration-500`} />

                    {/* Top Section: Title and Difficulty Badge */}
                    <div className="relative z-10 flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-xl font-bold text-foreground leading-snug group-hover:text-accent transition-colors line-clamp-2">
                            {course.title}
                        </h3>
                        <span
                            className={`shrink-0 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase ${badgeStyle} mt-1`}
                        >
                            {course.difficulty}
                        </span>
                    </div>

                    {/* Public Tag - if applicable */}
                    {!isPublicTab && course.isPublic && (
                        <div className="relative z-10 mb-4">
                            <div
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border bg-blue-50/50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30"
                                title={t.common.public}
                            >
                                <GlobeIcon className="w-3 h-3" />
                                <span>{t.common.public}</span>
                            </div>
                        </div>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Content section with stats and progress */}
                    <div className="relative z-10 flex items-end justify-between gap-4 pt-6 border-t border-border/50 mt-2">
                        {/* Left: Stats */}
                        <div className="flex-1 space-y-3">
                            {/* Stats row */}
                            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                                <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                                    <ChartBarIcon className="w-3.5 h-3.5" />
                                    <span>
                                        {course.wordCount} {t.create.wordCount}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                                    <CalendarIcon className="w-3.5 h-3.5" />
                                    <span>{formatDate(course._creationTime).split(" ")[0]}</span>
                                </div>
                            </div>

                            {/* Last studied time - only show for my courses */}
                            {!isPublicTab && hasProgress && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground pl-1">
                                    <ClockIcon className="w-3.5 h-3.5 text-accent" />
                                    <span>
                                        {t.home.lastStudied}:{" "}
                                        {formatDate(course.progress!._creationTime)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Right: Circular progress indicator - only show for my courses */}
                        {!isPublicTab && (
                            <div className="relative w-14 h-14 shrink-0 -mb-1 -mr-1">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
                                    {/* Background circle */}
                                    <circle
                                        cx="22"
                                        cy="22"
                                        r={radius}
                                        fill="none"
                                        strokeWidth="4"
                                        className="stroke-muted/30"
                                    />
                                    {/* Progress circle */}
                                    <circle
                                        cx="22"
                                        cy="22"
                                        r={radius}
                                        fill="none"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        className={`${progressColor} transition-all duration-1000 ease-out`}
                                        style={{
                                            strokeDasharray: circumference,
                                            strokeDashoffset: strokeDashoffset,
                                        }}
                                    />
                                </svg>
                                {/* Percentage text */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span
                                        className={`text-[10px] font-bold ${progressPercent === 100
                                            ? "text-success"
                                            : progressPercent > 0
                                                ? "text-accent"
                                                : "text-muted-foreground"
                                            }`}
                                    >
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

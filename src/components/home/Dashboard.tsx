import { useState, useMemo } from "react";
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
    LockIcon,
    LibraryIcon,
} from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { TOTAL_MODULES, DIFFICULTY_CONFIG } from "@/lib/constants";

type DifficultyLevel = "A2" | "A2+" | "B1" | string;
type SortOrder = "lastStudied" | "creationDate";

function getProgressPercentage(completedModules: number[] | undefined): number {
    if (!completedModules) return 0;
    return Math.round((completedModules.length / TOTAL_MODULES) * 100);
}

interface DashboardProps {
    onCreateCourse: () => void;
}

export function Dashboard({ onCreateCourse }: DashboardProps) {
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
                return b._creationTime - a._creationTime;
            }
        });

        return result;
    }, [currentCourses, searchQuery, difficultyFilter, sortOrder]);

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

            <main className="flex-1 container mx-auto px-4 py-8">
                {activeTab === "settings" ? (
                    // Settings View
                    <div className="max-w-2xl mx-auto space-y-8">
                        <div className="flex items-center gap-2 mb-6">
                            <SettingsIcon className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-bold text-foreground">
                                {t.sidebar.settings}
                            </h2>
                        </div>

                        <Card variant="outlined">
                            <CardContent className="p-6 space-y-6">
                                <h3 className="text-lg font-semibold text-foreground">
                                    {t.auth?.signInTitle || "Account"}
                                </h3>

                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                            {currentUser?.email?.charAt(0).toUpperCase() || <UserIcon className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">{t.auth?.email}</p>
                                            <p className="text-foreground font-medium">{currentUser?.email}</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-border">
                                        <Button
                                            variant="secondary"
                                            className="w-full sm:w-auto text-destructive hover:text-destructive hover:bg-destructive/10"
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
                        <div className="flex items-center gap-2 mb-6">
                            {activeTab === "my" ? (
                                <BookOpenIcon className="w-6 h-6 text-primary" />
                            ) : (
                                <LibraryIcon className="w-6 h-6 text-primary" />
                            )}
                            <h2 className="text-2xl font-bold text-foreground">
                                {activeTab === "my" ? t.sidebar.myCourses : t.sidebar.publicCourses}
                            </h2>
                            {!isLoading && (
                                <span className="px-2 py-0.5 text-sm font-medium text-muted-foreground bg-muted/50 rounded-full">
                                    {activeTab === "my" ? (myCourses?.length ?? 0) : (publicCourses?.length ?? 0)}
                                </span>
                            )}
                        </div>

                        {/* Search, Filter, Sort Controls */}
                        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
                            {/* Search */}
                            <div className="relative flex-1 md:max-w-xs">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder={t.home.searchPlaceholder || "Search..."}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                                />
                            </div>

                            {/* Difficulty Filter */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                                <button
                                    onClick={() => setDifficultyFilter(null)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${difficultyFilter === null
                                        ? "bg-primary text-white shadow-sm"
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
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${difficultyFilter === diff
                                            ? "bg-primary text-white shadow-sm"
                                            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                                            }`}
                                    >
                                        {diff}
                                    </button>
                                ))}
                            </div>

                            {/* Sort - aligned to right on desktop */}
                            <div className="md:ml-auto flex items-center gap-2">
                                <div className="relative group">
                                    <button className="flex items-center gap-2 px-3 py-2 text-sm text-foreground bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
                                        <SortIcon className="w-4 h-4 text-muted-foreground" />
                                        <span>
                                            {sortOrder === "lastStudied"
                                                ? t.home.sortByLastStudied || "Last Studied"
                                                : t.home.sortByCreationDate || "Created Date"}
                                        </span>
                                    </button>

                                    <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-lg shadow-lg overflow-hidden hidden group-hover:block z-10">
                                        <button
                                            onClick={() => setSortOrder("lastStudied")}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors ${sortOrder === "lastStudied"
                                                ? "text-primary font-medium"
                                                : "text-foreground"
                                                }`}
                                        >
                                            {t.home.sortByLastStudied || "Last Studied"}
                                        </button>
                                        <button
                                            onClick={() => setSortOrder("creationDate")}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors ${sortOrder === "creationDate"
                                                ? "text-primary font-medium"
                                                : "text-foreground"
                                                }`}
                                        >
                                            {t.home.sortByCreationDate || "Created Date"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
                            </div>
                        ) : filteredCourses.length === 0 ? (
                            // Empty state
                            searchQuery || difficultyFilter ? (
                                <div className="flex flex-col items-center justify-center py-20 animate-in fade-in-50">
                                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-muted/30 flex items-center justify-center">
                                        <SearchIcon className="w-8 h-8 text-muted-foreground/50" />
                                    </div>
                                    <h3 className="text-lg font-medium text-foreground mb-2">
                                        {t.home.noResults || "No matching courses found"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-6 text-center max-w-xs mx-auto">
                                        {t.home.noCoursesDesc}
                                    </p>
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setDifficultyFilter(null);
                                        }}
                                    >
                                        {t.home.clearFilters || "Clear filters"}
                                    </Button>
                                </div>
                            ) : (
                                <Card variant="outlined" className="py-16 text-center">
                                    <CardContent>
                                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-100 flex items-center justify-center">
                                            <BookOpenIcon className="w-10 h-10 text-primary-500" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-foreground mb-2">
                                            {t.home.noCourses}
                                        </h3>
                                        <p className="text-muted-foreground mb-6">
                                            {t.home.noCoursesDesc}
                                        </p>
                                        <Button size="lg" onClick={onCreateCourse}>
                                            <PlusIcon className="w-5 h-5" />
                                            {t.home.newCourse}
                                        </Button>
                                    </CardContent>
                                </Card>
                            )
                        ) : (
                            // Course grid
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {filteredCourses.map((course) => (
                                    <CourseCard
                                        key={course._id}
                                        course={course}
                                        t={t}
                                        formatDate={formatDate}
                                        isPublicTab={activeTab === "public"}
                                    />
                                ))}
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

    // Border color mapping based on difficulty
    const borderColorMap: Record<string, string> = {
        A1: "border-l-lime-500",
        "A1+": "border-l-green-500",
        A2: "border-l-emerald-500",
        "A2+": "border-l-teal-500",
        B1: "border-l-cyan-500",
        "B1+": "border-l-blue-500",
        B2: "border-l-indigo-500",
        "B2+": "border-l-violet-500",
        C1: "border-l-purple-500",
        "C1+": "border-l-fuchsia-500",
        C2: "border-l-rose-500",
    };
    const borderColor = borderColorMap[course.difficulty] || "border-l-gray-400";

    // Badge style from DIFFICULTY_CONFIG (with border added)
    const badgeStyle = difficultyConfig
        ? `${difficultyConfig.color} border border-current/20`
        : "text-gray-700 bg-gray-50 border-gray-200";

    // Progress ring color
    const progressColor =
        progressPercent === 100
            ? "stroke-success"
            : progressPercent > 0
                ? "stroke-primary"
                : "stroke-border";

    // SVG circle properties for progress ring
    const radius = 16;
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
                interactive
                className={`h-full flex flex-col border-l-4 ${borderColor} ring-1 ring-border/50 transition-all duration-300 ease-out group-hover:ring-2 group-hover:ring-primary/30 group-hover:-translate-y-1 overflow-hidden`}
            >
                <CardContent className="flex-1 flex flex-col p-6">
                    {/* Title section */}
                    <div className="flex items-start justify-between gap-4 mb-6">
                        <h3 className="text-lg md:text-xl font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors flex-1">
                            {course.title}
                        </h3>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                            <span
                                className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide border ${badgeStyle}`}
                            >
                                {course.difficulty}
                            </span>
                            {!isPublicTab && course.isPublic && (
                                <div
                                    className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border bg-blue-50/50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30"
                                    title={t.common.public}
                                >
                                    <GlobeIcon className="w-3 h-3" />
                                    <span>{t.common.public}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Spacer to push content down if needed, or just let it flow */}
                    <div className="flex-1" />

                    {/* Content section with stats and progress */}
                    <div className="flex items-end justify-between gap-4 pt-4 border-t border-border/50">
                        {/* Left: Stats */}
                        <div className="flex-1 space-y-3">
                            {/* Stats row */}
                            <div className="flex items-center gap-5 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <ChartBarIcon className="w-4 h-4" />
                                    <span>
                                        {course.wordCount} {t.create.wordCount}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4" />
                                    <span>{formatDate(course._creationTime).split(" ")[0]}</span>
                                </div>
                            </div>

                            {/* Last studied time - only show for my courses */}
                            {!isPublicTab && hasProgress && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <ClockIcon className="w-4 h-4 text-accent" />
                                    <span>
                                        {t.home.lastStudied}:{" "}
                                        {formatDate(course.progress!._creationTime)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Right: Circular progress indicator - only show for my courses */}
                        {!isPublicTab && (
                            <div className="relative w-12 h-12 shrink-0">
                                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
                                    {/* Background circle */}
                                    <circle
                                        cx="20"
                                        cy="20"
                                        r={radius}
                                        fill="none"
                                        strokeWidth="3"
                                        className="stroke-muted/30"
                                    />
                                    {/* Progress circle */}
                                    <circle
                                        cx="20"
                                        cy="20"
                                        r={radius}
                                        fill="none"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        className={`${progressColor} transition-all duration-500`}
                                        style={{
                                            strokeDasharray: circumference,
                                            strokeDashoffset: strokeDashoffset,
                                        }}
                                    />
                                </svg>
                                {/* Percentage text */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span
                                        className={`text-[11px] font-bold ${progressPercent === 100
                                            ? "text-success"
                                            : progressPercent > 0
                                                ? "text-primary"
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

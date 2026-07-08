"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../convex/_generated/api";
import { type NavTab } from "@/components/layout";
import {
    Card,
    CardContent,
    BookOpenIcon,
    LibraryIcon,
    SettingsIcon,
    UserIcon,
    LogOutIcon,
    Button,
    PlusIcon,
} from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { TOTAL_MODULES, CEFR_LEVELS } from "@/lib/constants";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { VocabularyPractice } from "@/components/vocabulary";
import { AdminView } from "@/components/admin";
import { FilterBar } from "./FilterBar";
import { MyCoursesView } from "./MyCoursesView";
import { ExploreView } from "./ExploreView";

type SortOrder = "lastStudied" | "addedDate";

interface DashboardProps {
    activeTab: NavTab;
    onCreateCourse: () => void;
    onCreatePath?: () => void;
    onEditPath?: (pathId: string) => void;
}

export function Dashboard({ activeTab, onCreateCourse, onCreatePath, onEditPath }: DashboardProps) {
    const { t } = useI18n();
    const { signOut } = useAuthActions();
    const currentUser = useQuery(api.users.getCurrentUser);
    const publicCourses = useQuery(api.courses.listPublic);
    const myCourses = useQuery(api.userCourses.listMyCourses);
    const myPaths = useQuery(api.learningPaths.listMyPaths);
    const publicPathsList = useQuery(api.learningPaths.listPublic);
    const myPathsList = useQuery(api.learningPaths.listMyPaths);

    const [isSigningOut, setIsSigningOut] = useState(false);

    // Filter / sort state
    const [searchQuery, setSearchQuery] = useState("");
    const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>("lastStudied");

    const handleClearFilters = () => {
        setSearchQuery("");
        setDifficultyFilter(null);
    };

    // Joined course / path sets (for "joined" badges on explore tab)
    const joinedCourseIds = useMemo(() => {
        if (!myCourses) return new Set<string>();
        return new Set(myCourses.map((c) => c._id));
    }, [myCourses]);

    const pathCourseIds = useMemo(() => {
        if (!myPaths) return new Set<string>();
        const ids = new Set<string>();
        for (const path of myPaths) {
            for (const courseId of path.courseIds) ids.add(courseId.toString());
        }
        return ids;
    }, [myPaths]);

    const explorePathCourseIds = useMemo(() => {
        if (!publicPathsList) return new Set<string>();
        const ids = new Set<string>();
        for (const path of publicPathsList) {
            for (const courseId of path.courseIds) ids.add(courseId.toString());
        }
        return ids;
    }, [publicPathsList]);

    const joinedPathIds = useMemo(() => {
        if (!myPathsList) return new Set<string>();
        return new Set(myPathsList.map((p) => p._id));
    }, [myPathsList]);

    // Difficulty levels for filter bar (derived from all courses)
    const difficulties = useMemo(() => {
        const allCourses = [...(myCourses ?? []), ...(publicCourses ?? [])];
        const unique = [...new Set(allCourses.map((c) => c.difficulty))];
        return unique.sort((a, b) => {
            const ia = CEFR_LEVELS.indexOf(a);
            const ib = CEFR_LEVELS.indexOf(b);
            if (ia === -1) return 1;
            if (ib === -1) return -1;
            return ia - ib;
        });
    }, [myCourses, publicCourses]);

    // Base course list per tab
    const currentCourses = useMemo(() => {
        if (activeTab === "my") return myCourses ?? [];
        if (activeTab === "explore") return publicCourses?.map((c) => ({ ...c, progress: null })) ?? [];
        return [];
    }, [activeTab, myCourses, publicCourses]);

    // Filtered + sorted courses
    const filteredCourses = useMemo(() => {
        let result = [...currentCourses];
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter((c) => c.title.toLowerCase().includes(q));
        }
        if (difficultyFilter) {
            result = result.filter((c) => c.difficulty === difficultyFilter);
        }
        result.sort((a, b) => {
            if (sortOrder === "lastStudied") {
                const aTime = a.progress?.lastStudiedAt ?? a.progress?._creationTime ?? 0;
                const bTime = b.progress?.lastStudiedAt ?? b.progress?._creationTime ?? 0;
                if (aTime === 0 && bTime === 0) return b._creationTime - a._creationTime;
                if (aTime === 0) return 1;
                if (bTime === 0) return -1;
                return bTime - aTime;
            } else {
                const aTime = (a as { addedAt?: number }).addedAt ?? a._creationTime;
                const bTime = (b as { addedAt?: number }).addedAt ?? b._creationTime;
                return bTime - aTime;
            }
        });
        return result;
    }, [currentCourses, searchQuery, difficultyFilter, sortOrder]);

    // Explore tab: filter paths
    const filteredExplorePaths = useMemo(() => {
        if (!publicPathsList) return [];
        let result = [...publicPathsList];
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const titleMap = new Map((publicCourses ?? []).map((c) => [c._id as string, c.title.toLowerCase()]));
            result = result.filter((p) =>
                p.titleEn.toLowerCase().includes(q) ||
                p.titleZh.toLowerCase().includes(q) ||
                p.courseIds.some((id) => titleMap.get(id as string)?.includes(q))
            );
        }
        if (difficultyFilter) result = result.filter((p) => p.difficulty === difficultyFilter);
        return result;
    }, [publicPathsList, publicCourses, searchQuery, difficultyFilter]);

    // Explore tab: standalone courses (not in any path)
    const standaloneExploreCourses = useMemo(
        () => filteredCourses.filter((c) => !explorePathCourseIds.has(c._id)),
        [filteredCourses, explorePathCourseIds]
    );

    // My tab: split standalone courses by progress state
    const { inProgressCourses, completedCourses, standaloneCourses } = useMemo(() => {
        const standalone = filteredCourses.filter((c) => !pathCourseIds.has(c._id));
        const inProgress: typeof standalone = [];
        const completed: typeof standalone = [];
        for (const c of standalone) {
            if (c.progress?.completedModules?.length === TOTAL_MODULES) completed.push(c);
            else inProgress.push(c);
        }
        return { inProgressCourses: inProgress, completedCourses: completed, standaloneCourses: standalone };
    }, [filteredCourses, pathCourseIds]);

    // My tab: map path → its filtered courses (for expanded accordion)
    const pathCoursesMap = useMemo(() => {
        if (!myPaths || !myCourses) return new Map<string, typeof filteredCourses>();
        const courseMap = new Map(filteredCourses.map((c) => [c._id as string, c]));
        const map = new Map<string, typeof filteredCourses>();
        for (const path of myPaths) {
            const courses = path.courseIds
                .map((id) => courseMap.get(id as string))
                .filter((c): c is NonNullable<typeof c> => c != null);
            map.set(path._id, courses);
        }
        return map;
    }, [myPaths, myCourses, filteredCourses]);

    const isLoading = activeTab === "my" ? myCourses === undefined : publicCourses === undefined;
    const hasFilters = searchQuery.trim().length > 0 || difficultyFilter !== null;

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try { await signOut(); } finally { setIsSigningOut(false); }
    };

    const isCourseListTab = activeTab === "my" || activeTab === "explore";

    return (
        <div className="relative isolate min-h-[calc(100vh-64px)] overflow-hidden bg-background">
            <div
                aria-hidden="true"
                className="pointer-events-none fixed -right-24 bottom-4 z-0 hidden h-[min(62vh,640px)] w-[min(48vw,700px)] opacity-10 sm:block dark:opacity-[0.06]"
            >
                <Image
                    src="/dolphin-1-mascot.png"
                    alt=""
                    fill
                    sizes="760px"
                    className="object-contain object-right-top"
                    priority={false}
                />
            </div>

            <main className="relative z-10 container mx-auto px-4 py-8 max-w-7xl animate-slide-up">

                {/* Tab content routing */}
                {activeTab === "admin" && currentUser?.role === "admin" ? (
                    <AdminView
                        onCreateCourse={onCreateCourse}
                        onCreatePath={onCreatePath ?? (() => {})}
                        onEditPath={onEditPath ?? (() => {})}
                    />
                ) : activeTab === "vocab" ? (
                    <VocabularyPractice />
                ) : activeTab === "analytics" ? (
                    <AnalyticsDashboard />
                ) : activeTab === "settings" ? (
                    <SettingsView
                        currentUser={currentUser}
                        onSignOut={handleSignOut}
                        isSigningOut={isSigningOut}
                    />
                ) : (
                    <>
                        {/* Course list header */}
                        <div className="relative mb-8 overflow-hidden rounded-xl border border-border bg-surface px-4 py-4 shadow-sm sm:px-5">
                            <div className="relative z-10 flex items-center justify-between gap-4">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="shrink-0 p-2 rounded-xl bg-primary-100 text-primary-700">
                                        {activeTab === "my" ? <BookOpenIcon className="w-6 h-6" /> : <LibraryIcon className="w-6 h-6" />}
                                    </div>
                                    <div className="flex min-w-0 items-baseline gap-3">
                                        <h2 className="truncate text-2xl font-bold text-foreground">
                                            {activeTab === "my" ? t.sidebar.myCourses : t.sidebar.explore}
                                        </h2>
                                        {!isLoading && (
                                            <span className="shrink-0 px-2.5 py-0.5 text-xs font-semibold text-accent bg-accent/10 rounded-full">
                                                {activeTab === "my" ? (myCourses?.length ?? 0) : (publicCourses?.length ?? 0)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {activeTab === "my" && (
                                    <Button onClick={onCreateCourse} className="shrink-0 rounded-xl flex items-center gap-1.5 shadow-md">
                                        <PlusIcon className="w-4 h-4" />
                                        {t.home.newCourse}
                                    </Button>
                                )}
                            </div>
                        </div>

                        <FilterBar
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            difficultyFilter={difficultyFilter}
                            onDifficultyChange={setDifficultyFilter}
                            difficulties={difficulties}
                            sortOrder={sortOrder}
                            onSortChange={setSortOrder}
                            showSort={activeTab === "my"}
                        />

                        {isCourseListTab && activeTab === "my" ? (
                            <MyCoursesView
                                myPaths={myPaths as MyPath[] | undefined}
                                pathCoursesMap={pathCoursesMap}
                                inProgressCourses={inProgressCourses}
                                completedCourses={completedCourses}
                                standaloneCourses={standaloneCourses}
                                isLoading={isLoading}
                                hasFilters={hasFilters}
                                onCreateCourse={onCreateCourse}
                                onClearFilters={handleClearFilters}
                            />
                        ) : (
                            <ExploreView
                                filteredExplorePaths={filteredExplorePaths as ExplorePathItem[]}
                                standaloneExploreCourses={standaloneExploreCourses}
                                joinedPathIds={joinedPathIds}
                                joinedCourseIds={joinedCourseIds}
                                isLoading={isLoading}
                                hasFilters={hasFilters}
                                onCreateCourse={onCreateCourse}
                                onClearFilters={handleClearFilters}
                            />
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

// ── Local types for prop casting ────────────────────────────────────────────

type MyPath = {
    _id: string;
    titleEn: string;
    titleZh: string;
    descriptionEn: string;
    descriptionZh: string;
    difficulty: string;
    courseIds: string[];
    coverGradient?: string;
    _creationTime: number;
    completedCourses: number;
    totalCourses: number;
    addedAt: number;
};

type ExplorePathItem = {
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

// ── Settings view ────────────────────────────────────────────────────────────

interface SettingsViewProps {
    currentUser: { email?: string; role?: string } | null | undefined;
    onSignOut: () => void;
    isSigningOut: boolean;
}

function SettingsView({ currentUser, onSignOut, isSigningOut }: SettingsViewProps) {
    const { t } = useI18n();
    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary-100 p-2 rounded-xl text-primary-700">
                    <SettingsIcon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">{t.sidebar.settings}</h2>
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
                                onClick={onSignOut}
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
    );
}

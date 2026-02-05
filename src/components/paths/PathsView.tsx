"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useI18n } from "@/lib/i18n";
import { DIFFICULTY_CONFIG } from "@/lib/constants";
import { SearchIcon, RouteIcon, PlusIcon, Button } from "@/components/ui";
import { PathCard } from "./PathCard";

const CEFR_ORDER = [
    "A1", "A1+", "A2", "A2+", "B1", "B1+", "B2", "B2+", "C1", "C1+", "C2",
];

interface PathsViewProps {
    onCreatePath?: () => void;
    isAdmin?: boolean;
}

export function PathsView({ onCreatePath, isAdmin }: PathsViewProps) {
    const { t } = useI18n();
    const publicPaths = useQuery(api.learningPaths.listPublic);
    const myPaths = useQuery(api.learningPaths.listMyPaths);
    const [searchQuery, setSearchQuery] = useState("");
    const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);

    const isLoading = publicPaths === undefined;

    // Build set of joined path IDs for quick lookup
    const joinedPathIds = useMemo(() => {
        if (!myPaths) return new Set<string>();
        return new Set(myPaths.map(p => p._id));
    }, [myPaths]);

    // Get unique difficulty levels from paths
    const difficulties = useMemo(() => {
        if (!publicPaths) return [];
        const uniqueLevels = [...new Set(publicPaths.map(p => p.difficulty))];
        return uniqueLevels.sort((a, b) => {
            const indexA = CEFR_ORDER.indexOf(a);
            const indexB = CEFR_ORDER.indexOf(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    }, [publicPaths]);

    // Filter paths
    const filteredPaths = useMemo(() => {
        if (!publicPaths) return [];
        let result = [...publicPaths];

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.titleEn.toLowerCase().includes(query) ||
                p.titleZh.toLowerCase().includes(query)
            );
        }

        if (difficultyFilter) {
            result = result.filter(p => p.difficulty === difficultyFilter);
        }

        return result;
    }, [publicPaths, searchQuery, difficultyFilter]);

    // Merge progress data from myPaths into publicPaths for joined paths
    const pathsWithProgress = useMemo(() => {
        return filteredPaths.map(p => {
            const myPath = myPaths?.find(mp => mp._id === p._id);
            if (myPath) {
                return { ...p, completedCourses: myPath.completedCourses, totalCourses: myPath.totalCourses };
            }
            return p;
        });
    }, [filteredPaths, myPaths]);

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <RouteIcon className="w-6 h-6" />
                    </div>
                    <div className="flex items-baseline gap-3">
                        <h2 className="text-2xl font-bold text-foreground">
                            {t.sidebar.learningPaths}
                        </h2>
                        {!isLoading && (
                            <span className="px-2.5 py-0.5 text-xs font-semibold text-primary bg-primary/10 rounded-full">
                                {publicPaths?.length ?? 0}
                            </span>
                        )}
                    </div>
                </div>
                {isAdmin && onCreatePath && (
                    <Button onClick={onCreatePath} size="sm">
                        <PlusIcon className="w-4 h-4 mr-1.5" />
                        {t.paths.createPath}
                    </Button>
                )}
            </div>

            {/* Search + Filter */}
            <div className="glass-card mb-8 p-4 rounded-2xl border border-border/50 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:gap-4 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={t.home.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-background/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    <button
                        onClick={() => setDifficultyFilter(null)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                            difficultyFilter === null
                                ? "bg-gradient-to-r from-primary to-primary-600 text-white shadow-md shadow-primary/25"
                                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                    >
                        {t.home.allDifficulties}
                    </button>
                    {difficulties.map((diff) => (
                        <button
                            key={diff}
                            onClick={() => setDifficultyFilter(difficultyFilter === diff ? null : diff)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                                difficultyFilter === diff
                                    ? "bg-gradient-to-r from-primary to-primary-600 text-white shadow-md shadow-primary/25"
                                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                        >
                            {diff}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                    <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
                    <p className="text-muted-foreground text-sm">{t.home.loadingCourses}</p>
                </div>
            ) : filteredPaths.length === 0 ? (
                searchQuery || difficultyFilter ? (
                    <div className="flex flex-col items-center justify-center py-32 glass-card rounded-3xl border border-dashed border-border animate-slide-up">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                            <SearchIcon className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-xl font-medium text-foreground mb-2">
                            {t.home.noResults}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-8 text-center max-w-xs mx-auto">
                            {t.home.tryAdjusting}
                        </p>
                        <Button
                            variant="secondary"
                            onClick={() => { setSearchQuery(""); setDifficultyFilter(null); }}
                            className="rounded-xl px-6"
                        >
                            {t.home.clearFilters}
                        </Button>
                    </div>
                ) : (
                    <div className="text-center py-32 glass-card rounded-3xl border border-dashed border-border animate-slide-up">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center animate-pulse-soft">
                            <RouteIcon className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-3">
                            {t.paths.noPaths}
                        </h3>
                        <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
                            {t.paths.noPathsDesc}
                        </p>
                    </div>
                )
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {pathsWithProgress.map((path, index) => (
                        <div key={path._id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                            <PathCard
                                path={path}
                                isJoined={joinedPathIds.has(path._id)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { SearchIcon, SortIcon } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

type SortOrder = "lastStudied" | "addedDate";

interface FilterBarProps {
    searchQuery: string;
    onSearchChange: (q: string) => void;
    difficultyFilter: string | null;
    onDifficultyChange: (d: string | null) => void;
    difficulties: string[];
    sortOrder: SortOrder;
    onSortChange: (s: SortOrder) => void;
    showSort: boolean;
}

export function FilterBar({
    searchQuery,
    onSearchChange,
    difficultyFilter,
    onDifficultyChange,
    difficulties,
    sortOrder,
    onSortChange,
    showSort,
}: FilterBarProps) {
    const { t } = useI18n();
    const [isSortOpen, setIsSortOpen] = useState(false);
    const sortRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
                setIsSortOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="bg-surface mb-8 p-4 rounded-2xl border border-border shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:gap-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder={t.home.searchPlaceholder || "Search..."}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 text-foreground placeholder:text-muted-foreground transition-all"
                />
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                <button
                    onClick={() => onDifficultyChange(null)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                        difficultyFilter === null
                            ? "bg-accent text-white shadow-md shadow-accent/25"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                    {t.home.allDifficulties || "All"}
                </button>
                {difficulties.map((diff) => (
                    <button
                        key={diff}
                        onClick={() => onDifficultyChange(difficultyFilter === diff ? null : diff)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                            difficultyFilter === diff
                                ? "bg-accent text-white shadow-md shadow-accent/25"
                                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                    >
                        {diff}
                    </button>
                ))}
            </div>

            {/* Sort — only for "my" tab */}
            {showSort && (
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
                                            onClick={() => { onSortChange("lastStudied"); setIsSortOpen(false); }}
                                            className={`w-full text-left px-4 py-2.5 text-sm rounded-lg hover:bg-accent/10 transition-colors ${
                                                sortOrder === "lastStudied" ? "text-accent font-medium bg-accent/5" : "text-foreground"
                                            }`}
                                        >
                                            {t.home.sortByLastStudied || "Last Studied"}
                                        </button>
                                        <button
                                            onClick={() => { onSortChange("addedDate"); setIsSortOpen(false); }}
                                            className={`w-full text-left px-4 py-2.5 text-sm rounded-lg hover:bg-accent/10 transition-colors ${
                                                sortOrder === "addedDate" ? "text-accent font-medium bg-accent/5" : "text-foreground"
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
    );
}

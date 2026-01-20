"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useI18n } from "@/lib/i18n";

export type SidebarTab = "public" | "my";

interface SidebarProps {
    className?: string;
    activeTab: SidebarTab;
    onTabChange: (tab: SidebarTab) => void;
}

export function Sidebar({ className = "", activeTab, onTabChange }: SidebarProps) {
    const { t } = useI18n();
    const currentUser = useQuery(api.users.getCurrentUser);
    const publicCourses = useQuery(api.courses.listPublic);
    const myCourses = useQuery(api.userCourses.listMyCourses);

    const publicCount = publicCourses?.length ?? 0;
    const myCount = myCourses?.length ?? 0;

    return (
        <aside
            className={`w-64 border-r border-border bg-card h-[calc(100vh-5rem)] overflow-y-auto ${className}`}
        >
            <div className="p-4 space-y-2">
                {/* Public Courses Tab */}
                <button
                    onClick={() => onTabChange("public")}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all ${activeTab === "public"
                            ? "bg-primary text-white font-medium shadow-sm"
                            : "text-foreground hover:bg-muted"
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{t.sidebar.publicCourses}</span>
                    </div>
                    {publicCount > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === "public" ? "bg-white/20" : "bg-muted"
                            }`}>
                            {publicCount}
                        </span>
                    )}
                </button>

                {/* My Courses Tab (only show if logged in) */}
                {currentUser && (
                    <button
                        onClick={() => onTabChange("my")}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all ${activeTab === "my"
                                ? "bg-primary text-white font-medium shadow-sm"
                                : "text-foreground hover:bg-muted"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span>{t.sidebar.myCourses}</span>
                        </div>
                        {myCount > 0 && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === "my" ? "bg-white/20" : "bg-muted"
                                }`}>
                                {myCount}
                            </span>
                        )}
                    </button>
                )}
            </div>
        </aside>
    );
}

"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useI18n } from "@/lib/i18n";
import { SettingsIcon } from "@/components/ui/Icons";
import { Library, BookOpen } from "lucide-react";

export type SidebarTab = "public" | "my" | "settings";

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
            className={`w-64 border-r border-border bg-card h-[calc(100vh-5rem)] flex flex-col ${className}`}
        >
            <div className="p-4 space-y-2 flex-1 overflow-y-auto">
                {/* Public Courses Tab */}
                <button
                    onClick={() => onTabChange("public")}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all ${activeTab === "public"
                        ? "bg-primary text-white font-medium shadow-sm"
                        : "text-foreground hover:bg-muted"
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <Library className="w-5 h-5" />
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
                            <BookOpen className="w-5 h-5" />
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

            {/* Settings Tab (Bottom) */}
            {currentUser && (
                <div className="p-4 border-t border-border">
                    <button
                        onClick={() => onTabChange("settings")}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all ${activeTab === "settings"
                            ? "bg-primary text-white font-medium shadow-sm"
                            : "text-foreground hover:bg-muted"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <SettingsIcon className="w-5 h-5" />
                            <span>{t.sidebar.settings || "设置"}</span>
                        </div>
                    </button>
                </div>
            )}
        </aside>
    );
}

"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useI18n } from "@/lib/i18n";
import {
    SettingsIcon,
    BarChart3Icon,
    LibraryIcon,
    BookOpenIcon,
    RouteIcon,
    BookAIcon,
    ShieldIcon,
} from "@/components/ui/Icons";

export type SidebarTab = "explore" | "my" | "settings" | "analytics" | "vocab" | "admin";

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
    const publicPaths = useQuery(api.learningPaths.listPublic);

    const isAdmin = currentUser?.role === "admin";
    const publicCount = publicCourses?.length ?? 0;
    const myCount = myCourses?.length ?? 0;
    const pathCount = publicPaths?.length ?? 0;

    const navItems = [
        {
            id: "my" as const,
            icon: BookOpenIcon,
            label: t.sidebar.myCourses,
            count: myCount,
            show: !!currentUser,
        },
        {
            id: "vocab" as const,
            icon: BookAIcon,
            label: t.sidebar.vocabPractice,
            count: undefined as number | undefined,
            show: !!currentUser,
        },
        {
            id: "analytics" as const,
            icon: BarChart3Icon,
            label: t.sidebar.analytics,
            count: undefined as number | undefined,
            show: !!currentUser,
        },
        {
            id: "explore" as const,
            icon: LibraryIcon,
            label: t.sidebar.explore,
            count: publicCount + pathCount > 0 ? publicCount + pathCount : undefined,
            show: true,
        },
    ];

    return (
        <aside
            className={`w-64 border-r border-border bg-surface h-[calc(100vh-5rem)] flex flex-col ${className}`}
        >
            <div className="p-4 space-y-2 flex-1 overflow-y-auto">

                {navItems.filter(item => item.show).map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 group ${isActive
                                ? "bg-accent text-white shadow-lg shadow-accent/25"
                                : "text-foreground hover:bg-muted"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`transition-transform duration-200 ${!isActive && "group-hover:scale-110"}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="font-medium">{item.label}</span>
                            </div>
                            {typeof item.count === "number" && item.count > 0 && (
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${isActive
                                    ? "bg-white/20 text-white"
                                    : "bg-accent/10 text-accent"
                                    }`}>
                                    {item.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Bottom actions */}
            {currentUser && (
                <div className="p-4 border-t border-border space-y-2">
                    {isAdmin && (
                        <button
                            onClick={() => onTabChange("admin")}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 group ${activeTab === "admin"
                                ? "bg-accent text-white shadow-lg shadow-accent/25"
                                : "text-foreground hover:bg-muted"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`transition-transform duration-200 ${activeTab !== "admin" && "group-hover:scale-110"}`}>
                                    <ShieldIcon className="w-5 h-5" />
                                </div>
                                <span className="font-medium">{t.sidebar.admin}</span>
                            </div>
                        </button>
                    )}
                    <button
                        onClick={() => onTabChange("settings")}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 group ${activeTab === "settings"
                            ? "bg-accent text-white shadow-lg shadow-accent/25"
                            : "text-foreground hover:bg-muted"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`transition-transform duration-200 ${activeTab !== "settings" && "group-hover:scale-110"}`}>
                                <SettingsIcon className="w-5 h-5" />
                            </div>
                            <span className="font-medium">{t.sidebar.settings || "设置"}</span>
                        </div>
                    </button>
                </div>
            )}
        </aside>
    );
}

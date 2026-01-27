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

    const navItems = [
        {
            id: "my" as const,
            icon: BookOpen,
            label: t.sidebar.myCourses,
            count: myCount,
            show: !!currentUser,
        },
        {
            id: "public" as const,
            icon: Library,
            label: t.sidebar.publicCourses,
            count: publicCount,
            show: true,
        },
    ];

    return (
        <aside
            className={`w-64 border-r border-border/50 bg-card/50 backdrop-blur-sm h-[calc(100vh-5rem)] flex flex-col ${className}`}
        >
            {/* Navigation */}
            <div className="p-4 space-y-2 flex-1 overflow-y-auto">
                <div className="mb-4">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4">
                        {t.sidebar.navigation}
                    </span>
                </div>

                {navItems.filter(item => item.show).map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 group ${isActive
                                ? "bg-gradient-to-r from-primary to-primary-600 text-white shadow-lg shadow-primary/25"
                                : "text-foreground hover:bg-muted/80"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`transition-transform duration-200 ${!isActive && "group-hover:scale-110"}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="font-medium">{item.label}</span>
                            </div>
                            {item.count > 0 && (
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${isActive
                                    ? "bg-white/20 text-white"
                                    : "bg-primary/10 text-primary"
                                    }`}>
                                    {item.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Settings Tab (Bottom) */}
            {currentUser && (
                <div className="p-4 border-t border-border/50">
                    <button
                        onClick={() => onTabChange("settings")}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 group ${activeTab === "settings"
                            ? "bg-gradient-to-r from-primary to-primary-600 text-white shadow-lg shadow-primary/25"
                            : "text-foreground hover:bg-muted/80"
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

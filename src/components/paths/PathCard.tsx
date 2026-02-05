"use client";

import { Card, CardContent } from "@/components/ui";
import { RouteIcon } from "@/components/ui/Icons";
import { useI18n } from "@/lib/i18n";
import { DIFFICULTY_CONFIG, TOTAL_MODULES, PATH_GRADIENTS } from "@/lib/constants";

interface PathCardProps {
    path: {
        _id: string;
        titleEn: string;
        titleZh: string;
        descriptionEn: string;
        descriptionZh: string;
        difficulty: string;
        courseIds: string[];
        coverGradient?: string;
        _creationTime: number;
        // Present when from listMyPaths
        completedCourses?: number;
        totalCourses?: number;
    };
    isJoined?: boolean;
}

export function PathCard({ path, isJoined = false }: PathCardProps) {
    const { language } = useI18n();

    const title = language === "zh" ? path.titleZh : path.titleEn;
    const description = language === "zh" ? path.descriptionZh : path.descriptionEn;
    const courseCount = path.totalCourses ?? path.courseIds.length;
    const completedCourses = path.completedCourses ?? 0;
    const progressPercent = courseCount > 0 ? Math.round((completedCourses / courseCount) * 100) : 0;

    const difficultyKey = path.difficulty as keyof typeof DIFFICULTY_CONFIG;
    const difficultyConfig = DIFFICULTY_CONFIG[difficultyKey];
    const badgeStyle = difficultyConfig
        ? `${difficultyConfig.color} border border-current/20`
        : "text-gray-700 bg-gray-50 border-gray-200";

    // Use path's gradient or fallback based on index
    const gradient = path.coverGradient || PATH_GRADIENTS[Math.abs(path._id.charCodeAt(0)) % PATH_GRADIENTS.length];

    const pathUrl = isJoined ? `/path/${path._id}` : `/path/${path._id}/preview`;

    return (
        <a href={pathUrl} className="block group h-full">
            <Card className="h-full flex flex-col overflow-hidden rounded-2xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-primary/5">
                {/* Gradient cover */}
                <div className={`h-24 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                    <div className="absolute bottom-3 left-4 flex items-center gap-2">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1.5">
                            <RouteIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white/90 text-xs font-medium">
                            {courseCount} {language === "zh" ? "门课程" : courseCount === 1 ? "course" : "courses"}
                        </span>
                    </div>
                    <span className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${badgeStyle} bg-white/90 dark:bg-gray-900/90`}>
                        {path.difficulty}
                    </span>
                </div>

                <CardContent className="flex-1 flex flex-col p-5">
                    <h3 className="text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {description}
                    </p>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Progress bar — only show if joined */}
                    {isJoined && (
                        <div className="pt-4 border-t border-border/50">
                            <div className="flex items-center justify-between text-xs mb-2">
                                <span className="text-muted-foreground font-medium">
                                    {completedCourses}/{courseCount}
                                </span>
                                <span className={`font-bold ${progressPercent === 100 ? "text-success" : "text-primary"}`}>
                                    {progressPercent}%
                                </span>
                            </div>
                            <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${progressPercent === 100 ? "bg-success" : "bg-primary"}`}
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </a>
    );
}

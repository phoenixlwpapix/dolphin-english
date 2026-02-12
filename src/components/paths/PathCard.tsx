"use client";

import { Card, CardContent } from "@/components/ui";
import { RouteIcon, BookOpenIcon } from "@/components/ui/Icons";
import { useI18n } from "@/lib/i18n";
import { DIFFICULTY_CONFIG, TOTAL_MODULES } from "@/lib/constants";

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
    const borderStyle = difficultyConfig?.border ?? "border-gray-300";

    const pathUrl = isJoined ? `/path/${path._id}` : `/path/${path._id}/preview`;

    return (
        <a href={pathUrl} className="block group h-full">
            <Card
                padding="none"
                className={`h-full flex flex-col overflow-hidden rounded-2xl border-l-4 ${borderStyle} border-t-0 border-r-0 border-b-0 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-accent/5`}
            >
                <CardContent className="flex-1 flex flex-col p-5">
                    {/* Top row: badge + course count */}
                    <div className="flex items-center justify-between mb-3">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase ${badgeStyle}`}>
                            {path.difficulty}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <BookOpenIcon className="w-3.5 h-3.5" />
                            <span className="font-medium">
                                {courseCount} {language === "zh" ? "门课程" : courseCount === 1 ? "course" : "courses"}
                            </span>
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-foreground leading-snug group-hover:text-accent transition-colors line-clamp-2 mb-1.5">
                        {title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {description}
                    </p>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Footer: path icon + progress */}
                    {isJoined ? (
                        <div className="pt-4 mt-3 border-t border-border">
                            <div className="flex items-center justify-between text-xs mb-2">
                                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                                    <RouteIcon className="w-3.5 h-3.5" />
                                    {completedCourses}/{courseCount}
                                </span>
                                <span className={`font-bold ${progressPercent === 100 ? "text-success" : "text-accent"}`}>
                                    {progressPercent}%
                                </span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${progressPercent === 100 ? "bg-success" : "bg-accent"}`}
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="pt-4 mt-3 border-t border-border">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <RouteIcon className="w-3.5 h-3.5" />
                                <span>{language === "zh" ? "学习路径" : "Learning Path"}</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </a>
    );
}

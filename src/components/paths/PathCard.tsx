"use client";
"use client";

import { Card, CardContent } from "@/components/ui";
import { RouteIcon, BookOpenIcon, CheckCircleIcon } from "@/components/ui/Icons";
import { useI18n } from "@/lib/i18n";
import { DIFFICULTY_CONFIG } from "@/lib/constants";

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
    const { t, language } = useI18n();

    const title = language === "zh" ? path.titleZh : path.titleEn;
    const description = language === "zh" ? path.descriptionZh : path.descriptionEn;
    const courseCount = path.totalCourses ?? path.courseIds.length;
    const completedCourses = path.completedCourses ?? 0;
    const progressPercent = courseCount > 0 ? Math.round((completedCourses / courseCount) * 100) : 0;

    const difficultyKey = path.difficulty as keyof typeof DIFFICULTY_CONFIG;
    const difficultyConfig = DIFFICULTY_CONFIG[difficultyKey];
    const accentBg = difficultyConfig?.accent ?? "bg-gray-400";
    const difficultyTextColors = difficultyConfig?.color
        ?.split(' ')
        .filter(c => c.startsWith('text-') || c.startsWith('dark:text-'))
        .join(' ') ?? "text-muted-foreground";

    const pathUrl = isJoined ? `/path/${path._id}` : `/path/${path._id}/preview`;

    return (
        <a href={pathUrl} className="block group h-full">
            <Card
                padding="none"
                className="relative h-full flex flex-col overflow-hidden rounded-2xl border-[1.5px] border-border/60 bg-card transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-lg group-hover:shadow-primary-500/[0.03] dark:group-hover:shadow-accent-500/[0.03]"
            >
                <CardContent className="flex-1 flex flex-col p-6">
                    {/* Subtle collection indicator in the background */}
                    <div className={`absolute -top-4 -right-4 opacity-10 pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:opacity-20 ${difficultyTextColors}`}>
                        <RouteIcon className="w-32 h-32" />
                    </div>

                    {/* Top row: badge + joined tag + course count */}
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-muted/65 text-muted-foreground font-semibold tracking-wider text-[10px] uppercase">
                                <span className={`w-1.5 h-1.5 rounded-full ${accentBg}`} />
                                {path.difficulty} · {difficultyConfig?.label}
                            </span>
                            {isJoined && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold text-success bg-success/10 border border-success/20">
                                    <CheckCircleIcon className="w-3 h-3" />
                                    {t.paths.joined}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <BookOpenIcon className="w-3.5 h-3.5" />
                            <span className="font-semibold">
                                {courseCount} {language === "zh" ? "门课程" : courseCount === 1 ? "course" : "courses"}
                            </span>
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-foreground leading-snug group-hover:text-accent transition-colors line-clamp-2 mb-2 relative z-10">
                        {title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground/90 line-clamp-2 leading-relaxed relative z-10">
                        {description}
                    </p>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Footer: path icon + progress */}
                    {isJoined ? (
                        <div className="pt-5 mt-4 border-t border-border/50 relative z-10">
                            <div className="flex items-center justify-between text-xs mb-2">
                                <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
                                    <RouteIcon className="w-3.5 h-3.5 text-muted-foreground/60" />
                                    {t.paths.completedCourses}: {completedCourses}/{courseCount}
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
                        <div className="pt-4 mt-4 border-t border-border/50 relative z-10">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground/80">
                                <RouteIcon className="w-4 h-4 text-muted-foreground/60" />
                                <span>{language === "zh" ? "学习路径" : "Learning Path"}</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </a>
    );
}

"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useI18n } from "@/lib/i18n";
import { BarChart3Icon } from "@/components/ui/Icons";
import { SummaryCards } from "./SummaryCards";
import { QuizAccuracyChart } from "./QuizAccuracyChart";
import { VocabularyMasteryChart } from "./VocabularyMasteryChart";
import { ActivityHeatmap } from "./ActivityHeatmap";
import { StudyTimeTrends } from "./StudyTimeTrends";

export function AnalyticsDashboard() {
    const { t } = useI18n();
    const analytics = useQuery(api.analytics.getAnalytics);

    if (analytics === undefined) {
        return (
            <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
                <p className="text-muted-foreground text-sm">
                    {t.common.loading}
                </p>
            </div>
        );
    }

    if (!analytics) return null;

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-slide-up">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="glass-card p-2 rounded-xl text-primary">
                    <BarChart3Icon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                    {t.analytics.title}
                </h2>
            </div>

            {/* Summary Cards */}
            <SummaryCards summary={analytics.summary} />

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                <QuizAccuracyChart data={analytics.quizAccuracyByType} />
                <VocabularyMasteryChart data={analytics.vocabularyByLevel} />
            </div>

            {/* Activity Heatmap */}
            <ActivityHeatmap data={analytics.activityData} />

            {/* Study Trends */}
            <StudyTimeTrends data={analytics.weeklyActivity} />
        </div>
    );
}

"use client";

import { useI18n } from "@/lib/i18n";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { TargetIcon } from "@/components/ui/Icons";

interface QuizAccuracyChartProps {
    data: Record<string, { correct: number; total: number }>;
}

export function QuizAccuracyChart({ data }: QuizAccuracyChartProps) {
    const { t } = useI18n();

    const chartData = [
        {
            name: t.quiz.questionTypes.mainIdea,
            accuracy:
                data["main-idea"].total > 0
                    ? Math.round(
                          (data["main-idea"].correct / data["main-idea"].total) * 100
                      )
                    : 0,
            total: data["main-idea"].total,
        },
        {
            name: t.quiz.questionTypes.detail,
            accuracy:
                data["detail"].total > 0
                    ? Math.round(
                          (data["detail"].correct / data["detail"].total) * 100
                      )
                    : 0,
            total: data["detail"].total,
        },
        {
            name: t.quiz.questionTypes.vocabulary,
            accuracy:
                data["vocabulary"].total > 0
                    ? Math.round(
                          (data["vocabulary"].correct / data["vocabulary"].total) * 100
                      )
                    : 0,
            total: data["vocabulary"].total,
        },
    ];

    const hasData = chartData.some((d) => d.total > 0);

    return (
        <div className="glass-card rounded-2xl p-6 border border-border/50 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <TargetIcon className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                    {t.analytics.quizAccuracy}
                </h3>
            </div>
            {!hasData ? (
                <p className="text-sm text-muted-foreground text-center py-12">
                    {t.analytics.noData}
                </p>
            ) : (
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={chartData} barCategoryGap="30%">
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--color-border)"
                            opacity={0.5}
                        />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            domain={[0, 100]}
                            tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                            unit="%"
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                background: "var(--color-card)",
                                backdropFilter: "blur(8px)",
                                border: "1px solid var(--color-border)",
                                borderRadius: "12px",
                                fontSize: "13px",
                            }}
                            formatter={(value) => [
                                `${value}%`,
                                t.analytics.accuracy,
                            ]}
                        />
                        <Bar
                            dataKey="accuracy"
                            fill="var(--color-primary)"
                            radius={[6, 6, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

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
    Cell,
} from "recharts";
import { BookOpenIcon } from "@/components/ui/Icons";

const CEFR_COLORS: Record<string, string> = {
    A1: "#65a30d",
    "A1+": "#16a34a",
    A2: "#059669",
    "A2+": "#0d9488",
    B1: "#0891b2",
    "B1+": "#2563eb",
    B2: "#4f46e5",
    "B2+": "#7c3aed",
    C1: "#9333ea",
    "C1+": "#c026d3",
    C2: "#e11d48",
};

interface VocabularyMasteryChartProps {
    data: Array<{ level: string; clicked: number; total: number }>;
}

export function VocabularyMasteryChart({ data }: VocabularyMasteryChartProps) {
    const { t } = useI18n();

    const chartData = data.map((d) => ({
        level: d.level,
        ratio: d.total > 0 ? Math.round((d.clicked / d.total) * 100) : 0,
        clicked: d.clicked,
        total: d.total,
    }));

    return (
        <div className="glass-card rounded-2xl p-6 border border-border/50 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <BookOpenIcon className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                    {t.analytics.vocabularyMastery}
                </h3>
            </div>
            {chartData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-12">
                    {t.analytics.noData}
                </p>
            ) : (
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={chartData} barCategoryGap="20%">
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--color-border)"
                            opacity={0.5}
                        />
                        <XAxis
                            dataKey="level"
                            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
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
                            formatter={(value, _name, entry) => {
                                const payload = entry.payload as { clicked: number; total: number };
                                return [
                                    `${value}% (${payload.clicked}/${payload.total})`,
                                    t.analytics.accuracy,
                                ];
                            }}
                        />
                        <Bar dataKey="ratio" radius={[6, 6, 0, 0]}>
                            {chartData.map((entry) => (
                                <Cell
                                    key={entry.level}
                                    fill={CEFR_COLORS[entry.level] ?? "#94a3b8"}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

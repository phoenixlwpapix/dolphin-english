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
    A1: "#bae6fd",     // Sky 200 (soft light blue)
    "A1+": "#a5f3fc",   // Cyan 200 (soft light cyan)
    A2: "#7dd3fc",     // Sky 300 (light sky blue)
    "A2+": "#67e8f9",   // Cyan 300 (light cyan)
    B1: "#38bdf8",     // Sky 400 (bright sky blue)
    "B1+": "#22d3ee",   // Cyan 400 (bright cyan)
    B2: "#0ea5e9",     // Sky 500 (sky blue)
    "B2+": "#06b6d4",   // Cyan 500 (ocean cyan)
    C1: "#2563eb",     // Blue 600 (royal blue)
    "C1+": "#4f46e5",   // Indigo 600 (indigo)
    C2: "#7c3aed",     // Violet 600 (purple)
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
                <BookOpenIcon className="w-5 h-5 text-accent" />
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
                            cursor={false}
                            contentStyle={{
                                background: "var(--color-card)",
                                backdropFilter: "blur(8px)",
                                border: "1px solid var(--color-border)",
                                borderRadius: "12px",
                                fontSize: "13px",
                            }}
                            labelStyle={{ color: "var(--color-foreground)", fontWeight: "bold" }}
                            itemStyle={{ color: "var(--color-accent)" }}
                            formatter={(value, _name, entry) => {
                                const payload = entry.payload as { clicked: number; total: number };
                                return [
                                    `${value}% (${payload.clicked}/${payload.total})`,
                                    t.analytics.mastery,
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

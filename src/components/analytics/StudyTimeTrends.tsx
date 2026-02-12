"use client";

import { useI18n } from "@/lib/i18n";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { TrendingUpIcon } from "@/components/ui/Icons";

interface StudyTimeTrendsProps {
    data: Array<{ weekLabel: string; count: number }>;
}

export function StudyTimeTrends({ data }: StudyTimeTrendsProps) {
    const { t } = useI18n();

    const hasData = data.some((d) => d.count > 0);

    return (
        <div className="glass-card rounded-2xl p-6 border border-border/50 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUpIcon className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-semibold text-foreground">
                    {t.analytics.studyTrends}
                </h3>
            </div>
            {!hasData ? (
                <p className="text-sm text-muted-foreground text-center py-12">
                    {t.analytics.noData}
                </p>
            ) : (
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient
                                id="colorActivity"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-accent)"
                                    stopOpacity={0.3}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-accent)"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--color-border)"
                            opacity={0.5}
                        />
                        <XAxis
                            dataKey="weekLabel"
                            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            allowDecimals={false}
                            tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
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
                                value,
                                t.analytics.activities,
                            ]}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="var(--color-accent)"
                            fill="url(#colorActivity)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

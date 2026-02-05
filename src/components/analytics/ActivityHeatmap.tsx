"use client";

import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";

interface ActivityHeatmapProps {
    data: Array<{ date: string; count: number }>;
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
    const { t } = useI18n();

    const { grid, maxCount, monthLabels } = useMemo(() => {
        const countMap = new Map(data.map((d) => [d.date, d.count]));

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calculate start date: go back 25 weeks + remaining days to reach a Sunday
        const totalDays = 26 * 7;
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - totalDays + 1);
        // Adjust to previous Sunday
        const startDayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - startDayOfWeek);

        const cells: Array<{
            date: string;
            count: number;
            col: number;
            row: number;
        }> = [];
        let maxCount = 0;

        // Track month boundaries for labels
        const months: Array<{ label: string; col: number }> = [];
        let lastMonth = -1;

        const cursor = new Date(startDate);
        while (cursor <= today) {
            const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
            const dayOfWeek = cursor.getDay(); // 0=Sun
            const daysSinceStart = Math.floor(
                (cursor.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
            );
            const weekCol = Math.floor(daysSinceStart / 7);

            const count = countMap.get(key) ?? 0;
            if (count > maxCount) maxCount = count;
            cells.push({ date: key, count, col: weekCol, row: dayOfWeek });

            // Track month labels (first occurrence of each month)
            if (cursor.getMonth() !== lastMonth && dayOfWeek === 0) {
                const monthNames = [
                    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                ];
                months.push({
                    label: monthNames[cursor.getMonth()],
                    col: weekCol,
                });
                lastMonth = cursor.getMonth();
            }

            cursor.setDate(cursor.getDate() + 1);
        }

        return { grid: cells, maxCount, monthLabels: months };
    }, [data]);

    function getColor(count: number): string {
        if (count === 0) return "var(--color-muted)";
        if (maxCount === 0) return "var(--color-muted)";
        const intensity = count / maxCount;
        if (intensity <= 0.25) return "#86efac";
        if (intensity <= 0.5) return "#4ade80";
        if (intensity <= 0.75) return "#22c55e";
        return "#16a34a";
    }

    const cellSize = 13;
    const gap = 3;
    const labelHeight = 20;
    const maxCol = grid.length > 0 ? Math.max(...grid.map((c) => c.col)) : 0;
    const svgWidth = (maxCol + 1) * (cellSize + gap);
    const svgHeight = 7 * (cellSize + gap) + labelHeight;

    return (
        <div className="glass-card rounded-2xl p-6 border border-border/50 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">
                {t.analytics.activityHeatmap}
            </h3>
            <div className="overflow-x-auto pb-2">
                <svg
                    width={svgWidth}
                    height={svgHeight}
                    className="mx-auto"
                >
                    {/* Month labels */}
                    {monthLabels.map((m) => (
                        <text
                            key={`${m.label}-${m.col}`}
                            x={m.col * (cellSize + gap)}
                            y={12}
                            fontSize={10}
                            fill="var(--color-muted-foreground)"
                        >
                            {m.label}
                        </text>
                    ))}
                    {/* Grid cells */}
                    {grid.map((cell) => (
                        <rect
                            key={cell.date}
                            x={cell.col * (cellSize + gap)}
                            y={cell.row * (cellSize + gap) + labelHeight}
                            width={cellSize}
                            height={cellSize}
                            rx={3}
                            fill={getColor(cell.count)}
                            className="transition-colors duration-200"
                        >
                            <title>
                                {cell.date}: {cell.count}{" "}
                                {t.analytics.activities}
                            </title>
                        </rect>
                    ))}
                </svg>
            </div>
            {/* Legend */}
            <div className="flex items-center justify-end gap-1.5 mt-3 text-xs text-muted-foreground">
                <span>{t.analytics.less}</span>
                {[0, 1, 2, 3, 4].map((level) => (
                    <div
                        key={level}
                        className="w-3 h-3 rounded-sm"
                        style={{
                            background:
                                level === 0
                                    ? "var(--color-muted)"
                                    : level === 1
                                      ? "#86efac"
                                      : level === 2
                                        ? "#4ade80"
                                        : level === 3
                                          ? "#22c55e"
                                          : "#16a34a",
                        }}
                    />
                ))}
                <span>{t.analytics.more}</span>
            </div>
        </div>
    );
}

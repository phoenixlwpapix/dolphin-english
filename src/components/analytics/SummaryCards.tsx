"use client";

import { useI18n } from "@/lib/i18n";
import {
    BookOpenIcon,
    CheckCircleIcon,
    ClockIcon,
    ChartBarIcon,
} from "@/components/ui/Icons";
import type { LucideProps } from "lucide-react";

interface SummaryCardsProps {
    summary: {
        totalWordsLearned: number;
        coursesCompleted: number;
        coursesInProgress: number;
        totalVocabularyClicked: number;
    };
}

export function SummaryCards({ summary }: SummaryCardsProps) {
    const { t } = useI18n();

    const cards: Array<{
        label: string;
        value: number;
        icon: (props: LucideProps) => React.ReactNode;
        iconBg: string;
        iconColor: string;
    }> = [
        {
            label: t.analytics.totalWords,
            value: summary.totalWordsLearned,
            icon: ChartBarIcon,
            iconBg: "bg-blue-500/10",
            iconColor: "#3b82f6",
        },
        {
            label: t.analytics.coursesCompleted,
            value: summary.coursesCompleted,
            icon: CheckCircleIcon,
            iconBg: "bg-emerald-500/10",
            iconColor: "#10b981",
        },
        {
            label: t.analytics.coursesInProgress,
            value: summary.coursesInProgress,
            icon: ClockIcon,
            iconBg: "bg-amber-500/10",
            iconColor: "#f59e0b",
        },
        {
            label: t.analytics.vocabularyClicked,
            value: summary.totalVocabularyClicked,
            icon: BookOpenIcon,
            iconBg: "bg-violet-500/10",
            iconColor: "#8b5cf6",
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, i) => {
                const Icon = card.icon;
                return (
                    <div
                        key={card.label}
                        className="glass-card rounded-2xl p-5 border border-border/50 shadow-sm animate-slide-up"
                        style={{ animationDelay: `${i * 80}ms` }}
                    >
                        <div
                            className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center mb-3`}
                        >
                            <Icon
                                className="w-5 h-5"
                                style={{ color: card.iconColor }}
                            />
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                            {card.value.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {card.label}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}

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
        gradient: string;
        bgGradient: string;
    }> = [
        {
            label: t.analytics.totalWords,
            value: summary.totalWordsLearned,
            icon: ChartBarIcon,
            gradient: "from-blue-500 to-blue-600",
            bgGradient: "from-blue-500/10 to-blue-600/5",
        },
        {
            label: t.analytics.coursesCompleted,
            value: summary.coursesCompleted,
            icon: CheckCircleIcon,
            gradient: "from-emerald-500 to-emerald-600",
            bgGradient: "from-emerald-500/10 to-emerald-600/5",
        },
        {
            label: t.analytics.coursesInProgress,
            value: summary.coursesInProgress,
            icon: ClockIcon,
            gradient: "from-amber-500 to-amber-600",
            bgGradient: "from-amber-500/10 to-amber-600/5",
        },
        {
            label: t.analytics.vocabularyClicked,
            value: summary.totalVocabularyClicked,
            icon: BookOpenIcon,
            gradient: "from-violet-500 to-violet-600",
            bgGradient: "from-violet-500/10 to-violet-600/5",
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
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.bgGradient} flex items-center justify-center mb-3`}
                        >
                            <Icon
                                className={`w-5 h-5 text-transparent bg-gradient-to-br ${card.gradient} bg-clip-text`}
                                style={{ color: card.gradient.includes("blue") ? "#3b82f6" : card.gradient.includes("emerald") ? "#10b981" : card.gradient.includes("amber") ? "#f59e0b" : "#8b5cf6" }}
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

"use client";

import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui";
import {
    BookOpenIcon,
    ClockIcon,
    TrendingUpIcon,
    BrainCircuitIcon,
    RocketIcon,
    QuoteIcon
} from "lucide-react";
import Image from "next/image";

interface LandingPageProps {
    onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
    const { t } = useI18n();

    const features = [
        {
            key: "daily",
            icon: <ClockIcon className="w-8 h-8 text-primary" />,
            color: "bg-blue-50 dark:bg-blue-900/10",
        },
        {
            key: "real",
            icon: <BookOpenIcon className="w-8 h-8 text-purple-600" />,
            color: "bg-purple-50 dark:bg-purple-900/10",
        },
        {
            key: "level",
            icon: <TrendingUpIcon className="w-8 h-8 text-green-600" />,
            color: "bg-green-50 dark:bg-green-900/10",
        },
        {
            key: "ai",
            icon: <BrainCircuitIcon className="w-8 h-8 text-indigo-600" />,
            color: "bg-indigo-50 dark:bg-indigo-900/10",
        },
    ];

    return (
        <div className="flex flex-col min-h-[calc(100vh-80px)] bg-background">
            {/* Hero Section */}
            <section className="relative px-4 py-20 md:py-32 overflow-hidden">
                {/* Background blobs */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10" />

                <div className="container mx-auto text-center max-w-4xl relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                        <RocketIcon className="w-4 h-4" />
                        <span>v1.0 Public Beta</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold font-handwriting text-foreground mb-6 leading-tight tracking-tight">
                        {t.landing.heroTitle}
                    </h1>

                    <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                        {t.landing.heroSubtitle}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            size="xl"
                            className="w-full sm:w-auto text-lg px-8 py-6 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105"
                            onClick={onStart}
                        >
                            {t.landing.startLearning}
                        </Button>
                        <Button
                            variant="outline"
                            size="xl"
                            className="w-full sm:w-auto text-lg px-8 py-6 rounded-full border-2 hover:bg-muted/50"
                            onClick={() => {
                                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            {t.landing.learnMore}
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature) => (
                            <div
                                key={feature.key}
                                className="bg-card border border-border/50 p-8 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-1 duration-300"
                            >
                                <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-6`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-foreground">
                                    {t.landing.features[feature.key as keyof typeof t.landing.features].title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {t.landing.features[feature.key as keyof typeof t.landing.features].desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonial / Quote Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-3xl text-center">
                    <QuoteIcon className="w-12 h-12 text-primary/20 mx-auto mb-6" />
                    <blockquote className="text-2xl md:text-3xl font-medium text-foreground mb-8">
                        "To have another language is to possess a second soul."
                    </blockquote>
                    <cite className="text-lg text-muted-foreground font-style-normal">
                        — Charlemagne
                    </cite>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-20 bg-primary/5 border-t border-primary/10">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-8">
                        {t.landing.readyToStart}
                    </h2>
                    <Button
                        size="lg"
                        className="rounded-full px-10"
                        onClick={onStart}
                    >
                        {t.landing.startLearning}
                    </Button>
                </div>
            </section>
        </div>
    );
}

"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui";
import {
    BarChart3Icon,
    BookAIcon,
    BookOpenIcon,
    BrainCircuitIcon,
    CheckCircleIcon,
    ClockIcon,
    FileTextIcon,
    GithubIcon,
    LinkedinIcon,
    MessageSquareIcon,
    RocketIcon,
    RouteIcon,
    SparklesIcon,
    SpeakerIcon,
    TargetIcon,
    TrendingUpIcon,
    TwitterIcon,
    FacebookIcon,
} from "@/components/ui/Icons";

interface LandingPageProps {
    onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
    const { t } = useI18n();

    const proofPoints = [
        { value: "30", label: t.landing.proof.time },
        { value: "6", label: t.landing.stats.levels },
        { value: "A1-C2", label: t.landing.proof.range },
    ];

    const flow = [
        {
            icon: <FileTextIcon className="h-6 w-6" />,
            title: t.landing.flow.importTitle,
            desc: t.landing.flow.importDesc,
        },
        {
            icon: <BrainCircuitIcon className="h-6 w-6" />,
            title: t.landing.flow.analyzeTitle,
            desc: t.landing.flow.analyzeDesc,
        },
        {
            icon: <RouteIcon className="h-6 w-6" />,
            title: t.landing.flow.practiceTitle,
            desc: t.landing.flow.practiceDesc,
        },
    ];

    const modules = [
        { title: t.modules.objectives, desc: t.landing.moduleDescriptions.objectives, icon: <TargetIcon className="h-5 w-5" /> },
        { title: t.modules.listening, desc: t.landing.moduleDescriptions.listening, icon: <SpeakerIcon className="h-5 w-5" /> },
        { title: t.modules.analysis, desc: t.landing.moduleDescriptions.analysis, icon: <BookOpenIcon className="h-5 w-5" /> },
        { title: t.modules.vocabulary, desc: t.landing.moduleDescriptions.vocabulary, icon: <BookAIcon className="h-5 w-5" /> },
        { title: t.modules.quiz, desc: t.landing.moduleDescriptions.quiz, icon: <CheckCircleIcon className="h-5 w-5" /> },
        { title: t.modules.reproduction, desc: t.landing.moduleDescriptions.reproduction, icon: <MessageSquareIcon className="h-5 w-5" /> },
    ];

    const outcomes = [
        { key: "daily", icon: <ClockIcon className="h-6 w-6" /> },
        { key: "real", icon: <BookOpenIcon className="h-6 w-6" /> },
        { key: "level", icon: <TrendingUpIcon className="h-6 w-6" /> },
        { key: "ai", icon: <SparklesIcon className="h-6 w-6" /> },
    ] as const;

    return (
        <div className="min-h-[calc(100vh-80px)] overflow-hidden bg-background">
            <section className="relative overflow-hidden border-b border-border px-4 pb-14 pt-28 md:pb-16 md:pt-32">
                <div className="pointer-events-none absolute bottom-0 right-[-24vw] z-0 h-[360px] w-[640px] opacity-20 sm:right-[-16vw] sm:h-[440px] sm:w-[760px] sm:opacity-35 lg:right-[-6vw] lg:h-[560px] lg:w-[900px] lg:opacity-70 dark:opacity-20">
                    <Image
                        src="/dolphin-1-mascot.png"
                        alt="Dolphin English mascot"
                        fill
                        sizes="(min-width: 1024px) 900px, 760px"
                        className="object-contain object-right-bottom"
                        priority
                    />
                </div>
                <div className="absolute inset-0 z-0 bg-background/80 lg:bg-background/35" />

                <div className="container relative z-10 mx-auto max-w-7xl">
                    <div className="max-w-3xl">
                        <p className="mb-5 border-l-2 border-accent pl-4 text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                            {t.landing.version}
                        </p>
                        <h1 className="font-handwriting text-5xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl">
                            {t.landing.heroTitle}
                        </h1>
                        <p className="mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground md:text-2xl">
                            {t.landing.heroSubtitle}
                        </p>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                            {t.landing.heroNote}
                        </p>

                        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                            <Button
                                size="xl"
                                className="w-full rounded-xl bg-accent px-9 py-7 text-lg shadow-lg shadow-accent/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-600 hover:shadow-accent/30 sm:w-auto"
                                onClick={onStart}
                            >
                                <SparklesIcon className="mr-2 h-5 w-5" />
                                {t.landing.startLearning}
                            </Button>
                            <Button
                                variant="outline"
                                size="xl"
                                className="w-full rounded-xl border-2 border-border px-9 py-7 text-lg transition-colors hover:border-accent/50 hover:bg-accent/5 sm:w-auto"
                                onClick={() => {
                                    document.getElementById("flow")?.scrollIntoView({ behavior: "smooth" });
                                }}
                            >
                                {t.landing.learnMore}
                            </Button>
                        </div>

                        <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-4 border-y border-border py-5">
                            {proofPoints.map((item) => (
                                <div key={item.label}>
                                    <dt className="text-2xl font-bold text-foreground md:text-3xl">{item.value}</dt>
                                    <dd className="mt-1 text-sm text-muted-foreground">{item.label}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </section>

            <section id="flow" className="border-b border-border bg-surface px-4 py-20">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                                {t.landing.flowLabel}
                            </p>
                            <h2 className="mt-4 text-3xl font-bold leading-tight text-foreground md:text-5xl">
                                {t.landing.flowTitle}
                            </h2>
                            <p className="mt-5 text-lg leading-8 text-muted-foreground">
                                {t.landing.flowDesc}
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {flow.map((item, index) => (
                                <div key={item.title} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                                    <div className="mb-6 flex items-center justify-between">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                                            {item.icon}
                                        </div>
                                        <span className="text-sm font-semibold text-muted-foreground">
                                            0{index + 1}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-4 py-24">
                <div className="container mx-auto max-w-7xl">
                    <div className="max-w-3xl">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                            {t.landing.modulesLabel}
                        </p>
                        <h2 className="mt-4 text-3xl font-bold leading-tight text-foreground md:text-5xl">
                            {t.landing.modulesTitle}
                        </h2>
                        <p className="mt-5 text-lg leading-8 text-muted-foreground">
                            {t.landing.modulesDesc}
                        </p>
                    </div>

                    <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {modules.map((module, index) => (
                            <div key={module.title} className="rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-accent/40">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-accent">
                                        {module.icon}
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground">
                                            {String(index + 1).padStart(2, "0")}
                                        </p>
                                        <h3 className="mt-1 text-lg font-bold text-foreground">{module.title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{module.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="features" className="border-y border-border bg-surface px-4 py-24">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                                {t.landing.featuresTitle}
                            </p>
                            <h2 className="mt-4 text-3xl font-bold leading-tight text-foreground md:text-5xl">
                                {t.landing.whyChoose}
                            </h2>
                            <p className="mt-5 text-lg leading-8 text-muted-foreground">
                                {t.landing.whyChooseDesc}
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {outcomes.map((item) => {
                                const content = t.landing.features[item.key];
                                return (
                                    <div key={item.key} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                                        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                                            {item.icon}
                                        </div>
                                        <h3 className="text-lg font-bold text-foreground">{content.title}</h3>
                                        <p className="mt-3 text-sm leading-6 text-muted-foreground">{content.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-4 py-24">
                <div className="container mx-auto max-w-5xl text-center">
                    <BarChart3Icon className="mx-auto mb-6 h-10 w-10 text-accent" />
                    <blockquote className="text-2xl font-semibold leading-relaxed text-foreground md:text-4xl">
                        &ldquo;{t.landing.quote.text1}
                        <br />
                        {t.landing.quote.text2}&rdquo;
                    </blockquote>
                    <cite className="mt-6 block text-base not-italic text-muted-foreground">
                        Charlemagne
                    </cite>
                </div>
            </section>

            <section className="relative overflow-hidden border-y border-border bg-primary-50 px-4 py-24 dark:bg-muted">
                <Image
                    src="/dolphin-1-mascot.png"
                    alt=""
                    fill
                    sizes="520px"
                    className="pointer-events-none object-contain object-[right_bottom] opacity-10 dark:opacity-[0.06]"
                />
                <div className="container relative z-10 mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold leading-tight text-foreground md:text-5xl">
                        {t.landing.readyToStart}
                    </h2>
                    <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                        {t.landing.joinThousands}
                    </p>
                    <Button
                        size="xl"
                        className="mt-10 rounded-xl bg-accent px-12 py-7 text-lg shadow-lg shadow-accent/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-600 hover:shadow-accent/30"
                        onClick={onStart}
                    >
                        <RocketIcon className="mr-2 h-5 w-5" />
                        {t.landing.startLearning}
                    </Button>
                </div>
            </section>

            <LandingFooter />
        </div>
    );
}

function LandingFooter() {
    const { t, language } = useI18n();

    const titleFontClass =
        language === "zh"
            ? "font-[family-name:var(--font-zcool)]"
            : "font-handwriting";

    return (
        <footer className="border-t border-border bg-background pb-8 pt-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
                    <div className="col-span-2 lg:col-span-2">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="relative h-8 w-8">
                                <Image
                                    src="/dolphin-logo-2.png"
                                    alt="Dolphin English Logo"
                                    fill
                                    sizes="32px"
                                    className="object-contain"
                                />
                            </div>
                            <span className={`text-xl font-bold text-foreground ${titleFontClass}`}>
                                {t.app.title}
                            </span>
                        </div>
                        <p className="mb-6 max-w-sm text-muted-foreground">
                            {t.footer.slogan}
                        </p>
                        <div className="flex gap-3">
                            <a href="#" aria-label="Twitter" className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent">
                                <TwitterIcon className="h-4 w-4" />
                            </a>
                            <a href="#" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent">
                                <FacebookIcon className="h-4 w-4" />
                            </a>
                            <a href="#" aria-label="LinkedIn" className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent">
                                <LinkedinIcon className="h-4 w-4" />
                            </a>
                            <a href="#" aria-label="GitHub" className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent">
                                <GithubIcon className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-4 font-semibold text-foreground">{t.footer.product}</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="transition-colors hover:text-accent">{t.footer.features}</a></li>
                            <li><a href="/pricing" className="transition-colors hover:text-accent">{t.footer.pricing}</a></li>
                            <li><a href="#" className="transition-colors hover:text-accent">{t.landing.stats.ai}</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 font-semibold text-foreground">{t.footer.resources}</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="transition-colors hover:text-accent">{t.footer.blog}</a></li>
                            <li><a href="#" className="transition-colors hover:text-accent">{t.footer.community}</a></li>
                            <li><a href="#" className="transition-colors hover:text-accent">{t.footer.help}</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 font-semibold text-foreground">{t.footer.company}</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="transition-colors hover:text-accent">{t.footer.about}</a></li>
                            <li><a href="#" className="transition-colors hover:text-accent">{t.footer.careers}</a></li>
                            <li><a href="#" className="transition-colors hover:text-accent">{t.footer.legal}</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 text-sm text-muted-foreground md:flex-row">
                    <p>{t.footer.copyright}</p>
                    <div className="flex gap-6">
                        <a href="#" className="transition-colors hover:text-foreground">{t.footer.privacy}</a>
                        <a href="#" className="transition-colors hover:text-foreground">{t.footer.terms}</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

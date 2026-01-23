"use client";

import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui";
import {
    BookOpenIcon,
    ClockIcon,
    TrendingUpIcon,
    BrainCircuitIcon,
    RocketIcon,
    QuoteIcon,
    SparklesIcon,
    GlobeIcon,
    TargetIcon,
    ZapIcon,
    TwitterIcon,
    FacebookIcon,
    LinkedinIcon,
    GithubIcon
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
            icon: <ClockIcon className="w-7 h-7" />,
            gradient: "from-blue-500 to-cyan-400",
            bgGradient: "from-blue-50 to-cyan-50",
        },
        {
            key: "real",
            icon: <BookOpenIcon className="w-7 h-7" />,
            gradient: "from-violet-500 to-purple-400",
            bgGradient: "from-violet-50 to-purple-50",
        },
        {
            key: "level",
            icon: <TrendingUpIcon className="w-7 h-7" />,
            gradient: "from-emerald-500 to-teal-400",
            bgGradient: "from-emerald-50 to-teal-50",
        },
        {
            key: "ai",
            icon: <BrainCircuitIcon className="w-7 h-7" />,
            gradient: "from-amber-500 to-orange-400",
            bgGradient: "from-amber-50 to-orange-50",
        },
    ];

    const stats = [
        { value: "6", label: t.landing.stats.levels, icon: <TargetIcon className="w-5 h-5" /> },
        { value: "∞", label: t.landing.stats.ai, icon: <SparklesIcon className="w-5 h-5" /> },
        { value: "100%", label: t.landing.stats.free, icon: <ZapIcon className="w-5 h-5" /> },
    ];

    return (
        <div className="flex flex-col min-h-[calc(100vh-80px)] bg-background overflow-hidden">
            {/* Hero Section */}
            <section className="relative px-4 py-24 md:py-36 overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 hero-gradient opacity-60" />
                <div className="absolute top-10 left-[10%] w-72 h-72 bg-gradient-to-br from-primary/30 to-accent/20 rounded-full blur-3xl animate-pulse-soft" />
                <div className="absolute top-40 right-[5%] w-96 h-96 bg-gradient-to-br from-accent/20 to-primary/10 rounded-full blur-3xl animate-pulse-soft animation-delay-200" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-gradient-to-t from-primary/5 to-transparent rounded-full blur-3xl" />

                {/* Floating decorative elements */}
                <div className="absolute top-20 left-[15%] hidden lg:block animate-float opacity-60">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-500 shadow-lg shadow-blue-500/25 flex items-center justify-center text-white">
                        <GlobeIcon className="w-8 h-8" />
                    </div>
                </div>
                <div className="absolute top-32 right-[12%] hidden lg:block animate-float-slow opacity-60">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 shadow-lg shadow-purple-500/25 flex items-center justify-center text-white">
                        <BookOpenIcon className="w-7 h-7" />
                    </div>
                </div>
                <div className="absolute bottom-32 left-[8%] hidden lg:block animate-float animation-delay-300 opacity-60">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 flex items-center justify-center text-white">
                        <SparklesIcon className="w-6 h-6" />
                    </div>
                </div>

                <div className="container mx-auto text-center max-w-4xl relative z-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium mb-8 animate-slide-up">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <RocketIcon className="w-4 h-4 text-primary" />
                        <span className="text-foreground/80">{t.landing.version}</span>
                    </div>

                    {/* Main heading with gradient */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-handwriting mb-6 leading-tight tracking-tight animate-slide-up animation-delay-100">
                        <span className="gradient-text">{t.landing.heroTitle}</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-slide-up animation-delay-200">
                        {t.landing.heroSubtitle}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up animation-delay-300">
                        <Button
                            size="xl"
                            className="w-full sm:w-auto text-lg px-10 py-7 rounded-2xl bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5"
                            onClick={onStart}
                        >
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            {t.landing.startLearning}
                        </Button>
                        <Button
                            variant="outline"
                            size="xl"
                            className="w-full sm:w-auto text-lg px-10 py-7 rounded-2xl border-2 border-border/80 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                            onClick={() => {
                                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            {t.landing.learnMore}
                        </Button>
                    </div>

                    {/* Stats row */}
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 animate-slide-up animation-delay-400">
                        {stats.map((stat, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-primary">
                                    {stat.icon}
                                </div>
                                <div className="text-left">
                                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 relative">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />

                <div className="container mx-auto px-4 relative z-10">
                    {/* Section header */}
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                            {t.landing.featuresTitle}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            {t.landing.whyChoose}
                        </h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            {t.landing.whyChooseDesc}
                        </p>
                    </div>

                    {/* Feature cards grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={feature.key}
                                className="group relative bg-card border border-border/50 p-8 rounded-2xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Gradient background on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />

                                <div className="relative z-10">
                                    {/* Icon with gradient background */}
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                                        {feature.icon}
                                    </div>

                                    <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                                        {t.landing.features[feature.key as keyof typeof t.landing.features].title}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {t.landing.features[feature.key as keyof typeof t.landing.features].desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonial / Quote Section */}
            <section className="py-24 px-4 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-full blur-3xl" />

                <div className="container mx-auto max-w-3xl text-center relative z-10">
                    <div className="relative inline-block mb-8">
                        <QuoteIcon className="w-16 h-16 text-primary/20" />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-xl" />
                    </div>

                    <blockquote className="text-2xl md:text-4xl font-medium text-foreground mb-8 leading-relaxed">
                        <span className="gradient-text">"{t.landing.quote.text1}</span>
                        <br />
                        <span className="text-foreground/80">{t.landing.quote.text2}"</span>
                    </blockquote>

                    <div className="flex items-center justify-center gap-3">
                        <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-border" />
                        <cite className="text-lg text-muted-foreground font-medium not-italic">
                            Charlemagne
                        </cite>
                        <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-border" />
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-24 relative overflow-hidden">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(139,92,246,0.1),transparent_50%)]" />

                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="max-w-2xl mx-auto">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                            <ZapIcon className="w-4 h-4" />
                            {t.landing.startToday}
                        </span>

                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            <span className="gradient-text">{t.landing.readyToStart}</span>
                        </h2>

                        <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
                            {t.landing.joinThousands}
                        </p>

                        <Button
                            size="xl"
                            className="text-lg px-12 py-7 rounded-2xl bg-gradient-to-r from-primary to-accent hover:from-primary-600 hover:to-accent-600 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5"
                            onClick={onStart}
                        >
                            <RocketIcon className="w-5 h-5 mr-2" />
                            {t.landing.startLearning}
                        </Button>
                    </div>
                </div>
            </section>

            <LandingFooter />
        </div>
    );
}

function LandingFooter() {
    const { t, language } = useI18n();

    // Use different font based on language for title
    const titleFontClass =
        language === "zh"
            ? "font-[family-name:var(--font-zcool)]"
            : "font-handwriting";

    return (
        <footer className="bg-background border-t border-border/50 pt-16 pb-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
                    {/* Brand Column */}
                    <div className="col-span-2 lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="relative w-8 h-8">
                                <Image
                                    src="/logo.png"
                                    alt="Dolphin English Logo"
                                    fill
                                    sizes="32px"
                                    className="object-contain"
                                />
                            </div>
                            <span className={`text-xl font-bold gradient-text ${titleFontClass}`}>
                                {t.app.title}
                            </span>
                        </div>
                        <p className="text-muted-foreground mb-6 max-w-sm">
                            {t.footer.slogan}
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300">
                                <TwitterIcon className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300">
                                <FacebookIcon className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300">
                                <LinkedinIcon className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300">
                                <GithubIcon className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Links Column 1 */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">{t.footer.product}</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-primary transition-colors">{t.footer.features}</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">{t.footer.pricing}</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">{t.landing.stats.ai}</a></li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">{t.footer.resources}</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-primary transition-colors">{t.footer.blog}</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">{t.footer.community}</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">{t.footer.help}</a></li>
                        </ul>
                    </div>

                    {/* Links Column 3 */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">{t.footer.company}</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-primary transition-colors">{t.footer.about}</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">{t.footer.careers}</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">{t.footer.legal}</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground/60">
                    <p>{t.footer.copyright}</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-foreground transition-colors">{t.footer.privacy}</a>
                        <a href="#" className="hover:text-foreground transition-colors">{t.footer.terms}</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

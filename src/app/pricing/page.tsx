"use client";

import Image from "next/image";
import { useState } from "react";
import { Header } from "@/components/layout";
import { Button } from "@/components/ui";
import {
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  TargetIcon,
  ZapIcon,
} from "@/components/ui/Icons";
import { useI18n } from "@/lib/i18n";

export default function PricingPage() {
  const { t } = useI18n();
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  const packages = [
    t.pricing.packages.starter,
    t.pricing.packages.growth,
    t.pricing.packages.pro,
  ];

  const usage = [
    { icon: <BookOpenIcon className="h-5 w-5" />, ...t.pricing.usage.course },
    { icon: <SparklesIcon className="h-5 w-5" />, ...t.pricing.usage.quiz },
    { icon: <TargetIcon className="h-5 w-5" />, ...t.pricing.usage.sentences },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header
        variant="landing"
        isSignInOpen={isSignInOpen}
        onSignInOpenChange={setIsSignInOpen}
      />

      <main>
        <section className="relative overflow-hidden border-b border-border px-4 pb-16 pt-32 md:pb-20 md:pt-36">
          <div className="pointer-events-none absolute bottom-0 right-[-22vw] h-[360px] w-[640px] opacity-15 sm:right-[-12vw] sm:h-[440px] sm:w-[760px] sm:opacity-25 lg:right-[-4vw] lg:h-[540px] lg:w-[880px] lg:opacity-35 dark:opacity-10">
            <Image
              src="/dolphin-1-mascot.png"
              alt=""
              fill
              sizes="880px"
              className="object-contain object-right-bottom"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-background/80 lg:bg-background/55" />

          <div className="container relative z-10 mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="mb-5 border-l-2 border-accent pl-4 text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                {t.pricing.label}
              </p>
              <h1 className="text-4xl font-bold leading-tight text-foreground md:text-6xl">
                {t.pricing.title}
              </h1>
              <p className="mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground">
                {t.pricing.subtitle}
              </p>
              <div className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
                {t.pricing.highlights.map((item) => (
                  <div key={item.title} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                    <p className="text-2xl font-bold text-foreground">{item.value}</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-surface px-4 py-20">
          <div className="container mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                  {t.pricing.creditModelLabel}
                </p>
                <h2 className="mt-4 text-3xl font-bold leading-tight text-foreground md:text-5xl">
                  {t.pricing.creditModelTitle}
                </h2>
                <p className="mt-5 text-lg leading-8 text-muted-foreground">
                  {t.pricing.creditModelDesc}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {usage.map((item) => (
                  <div key={item.title} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                      {item.icon}
                    </div>
                    <p className="text-2xl font-bold text-accent">{item.cost}</p>
                    <h3 className="mt-3 text-lg font-bold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-24">
          <div className="container mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                {t.pricing.packagesLabel}
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-tight text-foreground md:text-5xl">
                {t.pricing.packagesTitle}
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                {t.pricing.packagesDesc}
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {packages.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-xl border bg-card p-7 shadow-sm ${
                    plan.featured ? "border-accent shadow-lg shadow-accent/10" : "border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{plan.desc}</p>
                    </div>
                    {plan.featured && (
                      <div className="rounded-lg bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                        {t.pricing.recommended}
                      </div>
                    )}
                  </div>

                  <div className="mt-8">
                    <p className="text-4xl font-bold text-foreground">{plan.price}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{plan.credits}</p>
                  </div>

                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                        <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    size="lg"
                    className={`mt-8 w-full rounded-xl ${
                      plan.featured
                        ? "bg-accent hover:bg-accent-600"
                        : "bg-primary-800 hover:bg-primary-700"
                    }`}
                    onClick={() => setIsSignInOpen(true)}
                  >
                    {t.pricing.buyCredits}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-surface px-4 py-20">
          <div className="container mx-auto max-w-7xl">
            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-6">
                <ZapIcon className="mb-5 h-8 w-8 text-accent" />
                <h3 className="text-xl font-bold text-foreground">{t.pricing.notes.rolloverTitle}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{t.pricing.notes.rolloverDesc}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <ClockIcon className="mb-5 h-8 w-8 text-accent" />
                <h3 className="text-xl font-bold text-foreground">{t.pricing.notes.transparentTitle}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{t.pricing.notes.transparentDesc}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <CheckCircleIcon className="mb-5 h-8 w-8 text-accent" />
                <h3 className="text-xl font-bold text-foreground">{t.pricing.notes.freeTitle}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{t.pricing.notes.freeDesc}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

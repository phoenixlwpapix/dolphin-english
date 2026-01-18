'use client'

import { type ReactNode } from 'react'
import { LanguageSwitcher } from '@/components/ui'
import { useI18n } from '@/lib/i18n'

interface HeaderProps {
    children?: ReactNode
}

export function Header({ children }: HeaderProps) {
    const { t } = useI18n()

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-foreground">{t.app.title}</h1>
                        <p className="text-xs text-muted">{t.app.subtitle}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {children}
                    <LanguageSwitcher />
                </div>
            </div>
        </header>
    )
}

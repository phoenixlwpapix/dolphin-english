'use client'

import { type ReactNode } from 'react'
import Image from 'next/image'
import { LanguageSwitcher } from '@/components/ui'
import { useI18n } from '@/lib/i18n'

interface HeaderProps {
    children?: ReactNode
}

export function Header({ children }: HeaderProps) {
    const { t } = useI18n()

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
            <div className="container mx-auto flex h-20 items-center justify-between px-4">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12">
                        <Image
                            src="/logo.png"
                            alt="Dolphin English Logo"
                            fill
                            sizes="48px"
                            className="object-contain"
                            priority
                        />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-primary font-handwriting">{t.app.title}</h1>
                        <p className="text-sm text-muted-foreground font-medium">{t.app.subtitle}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {children}
                    <LanguageSwitcher />
                </div>
            </div>
        </header>
    )
}

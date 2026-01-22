'use client'

import { useI18n } from '@/lib/i18n'
import { Languages } from 'lucide-react'

export function LanguageSwitcher() {
    const { language, toggleLanguage, t } = useI18n()

    return (
        <button
            onClick={toggleLanguage}
            className="
        flex items-center gap-2 px-3 py-1.5 rounded-lg
        bg-surface border border-border text-sm font-medium
        hover:bg-primary-50 hover:border-primary-300 transition-colors
      "
            aria-label={t.settings.language}
        >
            <Languages className="w-4 h-4" />
            <span>{language === 'zh' ? t.settings.english : t.settings.chinese}</span>
        </button>
    )
}

'use client'

import { useI18n } from '@/lib/i18n'
import { Languages } from 'lucide-react'

export function LanguageSwitcher() {
    const { language, toggleLanguage, t } = useI18n()

    return (
        <button
            onClick={toggleLanguage}
            className="
        flex items-center justify-center w-8 h-8 rounded-lg
        bg-surface border border-border
        hover:bg-primary-50 hover:border-primary-300 transition-colors
      "
            aria-label={t.settings.language}
            title={language === 'zh' ? t.settings.english : t.settings.chinese}
        >
            <Languages className="w-4 h-4" />
        </button>
    )
}

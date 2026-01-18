'use client'

import { useI18n } from '@/lib/i18n'

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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
            </svg>
            <span>{language === 'zh' ? t.settings.english : t.settings.chinese}</span>
        </button>
    )
}

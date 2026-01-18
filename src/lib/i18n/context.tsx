'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { zh } from './translations/zh'
import { en } from './translations/en'
import type { Translations } from './translations/zh'

type Language = 'zh' | 'en'

interface I18nContextType {
    language: Language
    t: Translations
    setLanguage: (lang: Language) => void
    toggleLanguage: () => void
}

const translations: Record<Language, Translations> = { zh, en }

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('zh')

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang)
        if (typeof window !== 'undefined') {
            localStorage.setItem('dolphin-language', lang)
        }
    }, [])

    const toggleLanguage = useCallback(() => {
        setLanguage(language === 'zh' ? 'en' : 'zh')
    }, [language, setLanguage])

    // Initialize from localStorage
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('dolphin-language') as Language | null
        if (saved && saved !== language) {
            setLanguageState(saved)
        }
    }

    return (
        <I18nContext.Provider
            value={{
                language,
                t: translations[language],
                setLanguage,
                toggleLanguage,
            }}
        >
            {children}
        </I18nContext.Provider>
    )
}

export function useI18n() {
    const context = useContext(I18nContext)
    if (!context) {
        throw new Error('useI18n must be used within I18nProvider')
    }
    return context
}

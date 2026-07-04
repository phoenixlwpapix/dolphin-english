'use client'

import { useEffect, useState } from 'react'
import { MoonIcon, SunIcon } from './Icons'

export function ThemeToggle() {
    const [dark, setDark] = useState(() => {
        if (typeof window === 'undefined') return false
        return localStorage.getItem('theme') === 'dark'
    })

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark)
        localStorage.setItem('theme', dark ? 'dark' : 'light')
    }, [dark])

    const toggle = () => {
        setDark((current) => !current)
    }

    return (
        <button
            onClick={toggle}
            suppressHydrationWarning
            className="
        flex items-center justify-center w-8 h-8 rounded-lg
        bg-surface border border-border
        hover:bg-primary-50 hover:border-primary-300 transition-colors
      "
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {dark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
        </button>
    )
}

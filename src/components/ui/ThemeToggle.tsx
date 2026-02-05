'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
    const [dark, setDark] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const stored = localStorage.getItem('theme')
        const isDark = stored === 'dark'
        setDark(isDark)
        document.documentElement.classList.toggle('dark', isDark)
    }, [])

    const toggle = () => {
        const next = !dark
        setDark(next)
        document.documentElement.classList.toggle('dark', next)
        localStorage.setItem('theme', next ? 'dark' : 'light')
    }

    if (!mounted) {
        return <div className="w-8 h-8 rounded-lg bg-surface border border-border" />
    }

    return (
        <button
            onClick={toggle}
            className="
        flex items-center justify-center w-8 h-8 rounded-lg
        bg-surface border border-border
        hover:bg-primary-50 hover:border-primary-300 transition-colors
      "
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
    )
}

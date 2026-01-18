'use client'

import { type ReactNode } from 'react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { I18nProvider } from '@/lib/i18n'

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ConvexProvider client={convex}>
            <I18nProvider>{children}</I18nProvider>
        </ConvexProvider>
    )
}

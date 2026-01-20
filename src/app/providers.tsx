'use client'

import { type ReactNode } from 'react'
import { ConvexReactClient } from 'convex/react'
import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { I18nProvider } from '@/lib/i18n'

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ConvexAuthProvider client={convex}>
            <I18nProvider>{children}</I18nProvider>
        </ConvexAuthProvider>
    )
}

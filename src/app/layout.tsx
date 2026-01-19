import type { Metadata } from 'next'
import { Outfit, Mali } from 'next/font/google'
import './globals.css'
import { Providers } from './Providers'

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

const mali = Mali({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-mali',
})

export const metadata: Metadata = {
  title: 'Dolphin English - 通过真实文章学习英语',
  description: '面向 A2-B1 学生的英语学习应用，通过真实文章完成 30 分钟系统学习课程',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${outfit.variable} ${mali.variable} font-sans antialiased bg-gray-50 text-gray-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

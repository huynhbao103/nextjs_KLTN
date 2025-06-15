import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/context/ThemeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Food Recommendation - Gợi ý món ăn thông minh',
  description: 'Sử dụng AI để gợi ý món ăn và quán ăn phù hợp với sở thích của bạn',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <ThemeProvider>
          <SessionProvider refetchInterval={0} refetchOnWindowFocus={true}>
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 
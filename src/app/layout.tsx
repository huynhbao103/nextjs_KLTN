import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/context/ThemeContext'
import { NotificationProvider } from '@/components/ui/notification'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TastyMind - AI Food Recommendation',
  description: 'Ứng dụng gợi ý món ăn thông minh với AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <SessionProvider 
          refetchInterval={0} 
          refetchOnWindowFocus={false}
          refetchWhenOffline={false}
        >
          <ThemeProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
} 
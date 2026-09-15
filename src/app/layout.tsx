import type { Metadata } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import { ThemeProvider } from '@/contexts/ThemeContext'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Onboarding Agent',
  description: 'M42 Onboarding Agent Portal',
  icons: {
    icon: '/favicon-square.png',
    shortcut: '/favicon-square.png',
    apple: '/favicon-square.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`} data-theme="light">
      <head>
        <link rel="icon" href="/favicon-square.png" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/favicon-square.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon-square.png" />
      </head>
      <body className="bg-bg-default text-text-primary antialiased min-h-screen">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}

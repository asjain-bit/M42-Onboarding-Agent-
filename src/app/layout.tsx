import type { Metadata } from 'next'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { GlobalTooltip } from '@/components/atoms/GlobalTooltip'
import './globals.css'

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
    <html lang="en" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;500;700&family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon-square.png" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/favicon-square.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon-square.png" />
      </head>
      <body className="bg-bg-default text-text-primary antialiased min-h-screen font-sans">
        <ThemeProvider>
          {children}
          <GlobalTooltip />
        </ThemeProvider>
      </body>
    </html>
  )
}

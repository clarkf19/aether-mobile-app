import type { Metadata } from 'next'
import { Sora, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { FacultyProvider } from '@/components/FacultyContext'
import './globals.css'

const _sora = Sora({ subsets: ["latin"] });
const _jetbrains = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Aether – Campus Operating System',
  description: 'Autonomous Campus Operating System for Students, Faculty, and Administration',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="antialiased" style={{ fontFamily: _sora.style.fontFamily }}>
        <FacultyProvider>
          <div className="relative w-screen h-screen overflow-hidden bg-background">
            {children}
          </div>
        </FacultyProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

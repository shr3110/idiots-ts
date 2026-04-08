import type { Metadata, Viewport } from 'next'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'

export const metadata: Metadata = {
  title: 'Idiots — Explore. Validate. Experiment.',
  description: 'A community-driven platform to share, rate, and discover the world\'s most audacious ideas.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Idiots',
    description: 'Explore. Validate. Experiment.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1F1D1B',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#2A2825',
                color: '#E8E4E0',
                border: '1px solid #3A3836',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.875rem',
              },
              success: { iconTheme: { primary: '#C9A84C', secondary: '#1F1D1B' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#1F1D1B' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}

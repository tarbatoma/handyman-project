import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  title: {
    default: 'MeșterHub — Găsește meseriași de încredere în București',
    template: '%s | MeșterHub',
  },
  description:
    'Marketplace de servicii locale în București. Găsești rapid zugrav, instalator, electrician și alți meseriași verificați, cu recenzii reale.',
  keywords: ['meseriași București', 'servicii locale', 'zugrav', 'instalator', 'electrician'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
}

export default function RootLayout({ children }) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}

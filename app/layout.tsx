import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import AppShell from '@/components/AppShell'

export const metadata: Metadata = {
  title: 'TuTerapia · Casos Internos',
  description: 'Gestión de casos internos - Tu Terapia',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-crema min-h-screen">
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  )
}

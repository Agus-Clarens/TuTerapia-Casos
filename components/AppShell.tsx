'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Sidebar from './Sidebar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.replace('/login')
    }
  }, [loading, user, pathname, router])

  if (pathname === '/login') return <>{children}</>

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-crema">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-verde-oscuro/20 border-t-verde-medio rounded-full animate-spin" />
          <p className="text-verde-oscuro/40 text-sm">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}

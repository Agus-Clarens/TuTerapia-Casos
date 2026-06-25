'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

const navItems = [
  {
    href: '/nuevo-caso',
    label: 'Nuevo Caso',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    href: '/casos',
    label: 'Todos los Casos',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    href: '/cx',
    label: 'CX',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    href: '/admin',
    label: 'Admin',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: '/talent',
    label: 'Talent',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: '/admin-talent',
    label: 'Admin + Talent',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    href: '/descuentos',
    label: 'Descuentos',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

const USER_MAP: Record<string, { name: string; sector: string }> = {
  'aclarens@tuterapia.com.ar': { name: 'Agus', sector: 'Admin' },
  'info@tuterapia.com.ar': { name: 'Sol', sector: 'CX' },
  'cbarros@tuterapia.com.uy': { name: 'Caro', sector: 'Talent' },
  'admin@tuterapia.com.ar': { name: 'Sofi', sector: 'Admin' },
  'people@tuterapia.com.uy': { name: 'Belu', sector: 'Talent' },
  'talent@tuterapia.com.ar': { name: 'Orne', sector: 'Talent' },
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()

  const email = user?.email || ''
  const userInfo = USER_MAP[email] || { name: email.split('@')[0], sector: '' }

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  return (
    <aside className="w-60 min-h-screen bg-verde-oscuro flex flex-col shadow-xl flex-shrink-0">
      {/* Logo */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="Tu Terapia"
          width={180}
          height={100}
          style={{ objectFit: 'contain', mixBlendMode: 'screen' }}
          priority
        />
      </div>

      {/* Subtítulo */}
      <p className="text-center pb-3 border-b border-white/10" style={{ color: '#75B781', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Gestión de Casos Internos
      </p>

      <nav className="flex-1 p-3 space-y-0.5 mt-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-sidebar-hover text-crema shadow-sm'
                  : 'text-white/60 hover:bg-sidebar-hover/50 hover:text-crema'
              }`}
            >
              <span className={`flex-shrink-0 ${isActive ? 'text-crema' : 'text-white/40'}`}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User info + logout */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ backgroundColor: '#75B781', color: '#264534' }}>
              {userInfo.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-white/80 text-xs font-medium truncate leading-tight">{userInfo.name}</p>
              {userInfo.sector && <p className="text-white/40 text-xs truncate leading-tight">{userInfo.sector}</p>}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex-shrink-0 p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors"
            title="Cerrar sesión"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}

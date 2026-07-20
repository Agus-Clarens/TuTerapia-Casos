'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

type NavItem = { href: string, label: string, primary?: boolean }
type NavGroup = { key: string, titulo: string, items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    key: 'casos',
    titulo: 'Gestión de Casos',
    items: [
      { href: '/nuevo-caso',              label: '+ Nuevo caso', primary: true },
      { href: '/casos',                   label: 'Todos los Casos' },
      { href: '/cx',                      label: 'CX' },
      { href: '/admin',                   label: 'Admin' },
      { href: '/talent',                  label: 'Talent' },
      { href: '/admin-talent',            label: 'Admin + Talent' },
      { href: '/business',                label: 'Business' },
      { href: '/facturas',                label: 'Facturas' },
      { href: '/admin/ajustes-modalidad', label: 'Ajustes en la liquidación' },
      { href: '/descuentos',              label: 'Descuentos' },
    ],
  },
  {
    key: 'pagos',
    titulo: 'Gestión de Pagos',
    items: [
      { href: '/pagos/nueva',            label: '+ Nueva solicitud', primary: true },
      { href: '/pagos/mis-solicitudes',  label: 'Mis solicitudes' },
      { href: '/pagos/bandeja',          label: 'Bandeja de pagos' },
    ],
  },
]

// Devuelve la key del grupo que contiene la ruta actual
function detectarGrupoActivo(pathname: string): string {
  for (const g of NAV_GROUPS) {
    if (g.items.some(it => pathname === it.href || pathname.startsWith(it.href + '/'))) {
      return g.key
    }
  }
  return NAV_GROUPS[0].key
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [abierto, setAbierto] = useState<string>(detectarGrupoActivo(pathname))

  useEffect(() => { setAbierto(detectarGrupoActivo(pathname)) }, [pathname])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: 240, height: '100vh',
      background: '#264534', display: 'flex', flexDirection: 'column',
      padding: '20px 0', zIndex: 40,
    }}>
      <div style={{ padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 8 }}>
        <Image src="/logo.png" alt="Tu Terapia" width={160} height={64}
          style={{ objectFit: 'contain', objectPosition: 'left', width: '100%', height: 'auto', mixBlendMode: 'screen', display: 'block' }} />
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2, paddingLeft: 44 }}>
          Gestiones Internas
        </div>
      </div>

      <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', minHeight: 0 }}>
        {NAV_GROUPS.map(({ key, titulo, items }) => {
          const isOpen = abierto === key
          return (
            <div key={key}>
              <button
                onClick={() => setAbierto(isOpen ? '' : key)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: 8,
                  background: isOpen ? 'rgba(255,255,255,0.06)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  color: '#fff', fontSize: 13, fontWeight: 700,
                  letterSpacing: 0.3, textAlign: 'left',
                }}>
                <span>{titulo}</span>
                <span style={{
                  fontSize: 10, color: 'rgba(255,255,255,0.55)',
                  transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.15s ease',
                }}>▶</span>
              </button>

              {isOpen && (
                <div style={{ marginTop: 2, marginBottom: 2, paddingLeft: 4 }}>
                  {items.map(({ href, label, primary }) => {
                    const active = pathname === href || pathname.startsWith(href + '/')
                    if (primary) {
                      return (
                        <Link key={href} href={href} style={{
                          display: 'block', textAlign: 'center',
                          padding: '8px 12px', borderRadius: 8, textDecoration: 'none',
                          fontSize: 13, fontWeight: 600, color: '#fff',
                          background: active ? '#005E5D' : '#007271',
                          margin: '4px 0 6px',
                        }}>
                          {label}
                        </Link>
                      )
                    }
                    return (
                      <Link key={href} href={href} style={{
                        display: 'flex', alignItems: 'center',
                        padding: '8px 12px 8px 20px', borderRadius: 8, textDecoration: 'none',
                        fontSize: 12.5, fontWeight: active ? 600 : 400,
                        color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                        background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                      }}>
                        {label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div style={{ padding: '12px 12px 8px', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 8, flexShrink: 0 }}>
        <button onClick={handleLogout} style={{
          width: '100%', padding: '8px 12px', borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.15)', background: 'transparent',
          color: 'rgba(255,255,255,0.45)', fontSize: 13, cursor: 'pointer',
        }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

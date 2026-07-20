'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const NAV_GROUPS = [
  {
    titulo: 'GESTIÓN DE CASOS',
    items: [
      { href: '/casos', label: 'Todos los Casos' },
      { href: '/cx', label: 'CX' },
      { href: '/admin', label: 'Admin' },
      { href: '/admin/ajustes-modalidad', label: 'Ajustes de modalidad' },
      { href: '/talent', label: 'Talent' },
      { href: '/admin-talent', label: 'Admin + Talent' },
      { href: '/business', label: 'Business' },
      { href: '/descuentos', label: 'Descuentos' },
    ],
  },
  {
    titulo: 'DOCUMENTOS',
    items: [
      { href: '/facturas', label: 'Facturas' },
    ],
  },
  {
    titulo: 'PAGOS',
    items: [
      { href: '/pagos/nueva', label: '+ Nueva solicitud' },
      { href: '/pagos/mis-solicitudes', label: 'Mis solicitudes' },
      { href: '/pagos/bandeja', label: 'Bandeja de pagos' },
    ],
  },
]

function Ilustracion() {
  return (
    <svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', opacity: 0.22 }}>
      {/* Persona 1 izq */}
      <circle cx="45" cy="30" r="12" fill="none" stroke="#75B781" strokeWidth="2.5"/>
      <path d="M28 52 Q45 42 62 52 L66 85 H24 Z" fill="none" stroke="#75B781" strokeWidth="2.5"/>
      <rect x="18" y="72" width="54" height="34" rx="5" fill="none" stroke="#75B781" strokeWidth="2"/>
      <line x1="12" y1="106" x2="78" y2="106" stroke="#75B781" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Burbuja 1 */}
      <rect x="62" y="14" width="36" height="24" rx="6" fill="none" stroke="#75B781" strokeWidth="2"/>
      <path d="M67 38 L64 45 L74 38" fill="none" stroke="#75B781" strokeWidth="2"/>
      <circle cx="74" cy="26" r="2.5" fill="#75B781"/>
      <circle cx="82" cy="26" r="2.5" fill="#75B781"/>
      <circle cx="90" cy="26" r="2.5" fill="#75B781"/>

      {/* Persona 2 der */}
      <circle cx="118" cy="38" r="12" fill="none" stroke="#75B781" strokeWidth="2.5"/>
      <path d="M101 60 Q118 50 135 60 L139 93 H97 Z" fill="none" stroke="#75B781" strokeWidth="2.5"/>
      <rect x="91" y="80" width="54" height="34" rx="5" fill="none" stroke="#75B781" strokeWidth="2"/>
      <line x1="85" y1="114" x2="151" y2="114" stroke="#75B781" strokeWidth="2.5" strokeLinecap="round"/>

      {/* Línea conectora */}
      <path d="M72 88 Q90 75 100 88" fill="none" stroke="#75B781" strokeWidth="1.5" strokeDasharray="4 3"/>

      {/* Frase */}
      <text x="80" y="138" textAnchor="middle" fontFamily="Georgia, serif" fontSize="8" fill="#75B781" fontStyle="italic">CX · Admin · Talent</text>
      <text x="80" y="152" textAnchor="middle" fontFamily="Georgia, serif" fontSize="7.5" fill="#75B781" fontStyle="italic">juntas llegamos más lejos</text>
    </svg>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

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
          style={{ objectFit: 'contain', width: '100%', height: 'auto', mixBlendMode: 'screen' }} />
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
          Gestión de Casos Internos
        </div>
      </div>

      <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', minHeight: 0 }}>
        {NAV_GROUPS.map(({ titulo, items }, gi) => (
          <div key={titulo} style={{ marginTop: gi === 0 ? 0 : 14 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
              color: 'rgba(255,255,255,0.35)',
              padding: '4px 12px 6px', textTransform: 'uppercase',
            }}>
              {titulo}
            </div>
            {items.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link key={href} href={href} style={{
                  display: 'flex', alignItems: 'center',
                  padding: '9px 12px', borderRadius: 8, textDecoration: 'none',
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                  background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                }}>
                  {label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div style={{ padding: '12px 12px 8px', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 8, flexShrink: 0 }}>
        <Link href="/nuevo-caso" style={{
          display: 'block', textAlign: 'center',
          padding: '11px 12px', borderRadius: 8, textDecoration: 'none',
          fontSize: 14, fontWeight: 600, color: '#fff', background: '#007271',
          marginBottom: 8,
        }}>
          + Nuevo caso
        </Link>
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

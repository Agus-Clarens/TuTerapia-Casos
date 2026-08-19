'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { nombreDeUsuario } from '../lib/sectores-usuario'

// Mapea el area de un caso a las rutas del menu donde debe contar
function rutasDeArea(area: string): string[] {
  const r: string[] = ['/casos']
  if (area === 'CX') r.push('/cx')
  if (area === 'Admin') r.push('/admin')
  if (area === 'Talent') r.push('/talent')
  if (area === 'Admin+Talent') r.push('/admin-talent')
  if (area === 'Business') r.push('/business')
  return r
}

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
  const [conteoPorRuta, setConteoPorRuta] = useState<Record<string, number>>({})

  useEffect(() => { setAbierto(detectarGrupoActivo(pathname)) }, [pathname])

  async function cargarConteos() {
    const { data: { session } } = await supabase.auth.getSession()
    const email = session?.user?.email || ''
    const miNombre = nombreDeUsuario(email)
    if (!miNombre) return

    const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const idsFinal = new Set<string>()

    // A) Casos donde participé alguna vez y otro hizo la última actualización reciente
    const { data: mias } = await supabase.from('caso_actualizaciones').select('caso_id').eq('autor', miNombre)
    const casosMios = Array.from(new Set((mias || []).map((m: any) => m.caso_id)))
    if (casosMios.length > 0) {
      const { data: recientes } = await supabase.from('caso_actualizaciones')
        .select('caso_id, autor, created_at').in('caso_id', casosMios)
        .gte('created_at', hace24h).order('created_at', { ascending: true })
      const ultimoPorCaso: Record<string, string> = {}
      for (const a of (recientes || [])) ultimoPorCaso[a.caso_id] = a.autor
      Object.entries(ultimoPorCaso).filter(([_, u]) => u !== miNombre).forEach(([id]) => idsFinal.add(id))
    }

    // B) Si soy de Talent, casos reactivados para Talent recientemente (aunque no haya comentado)
    const esTalent = /talent/i.test(miNombre)
    if (esTalent) {
      const { data: react } = await supabase.from('casos').select('id')
        .gte('reactivado_talent_at', hace24h).neq('estado', 'Cerrado')
      for (const c of (react || [])) idsFinal.add(c.id)
    }

    if (idsFinal.size === 0) {
      setConteoPorRuta({})
      if (typeof document !== 'undefined') document.title = 'Tu Terapia - Casos'
      return
    }

    // Traer esos casos con su area (no cerrados)
    const { data: casos } = await supabase.from('casos').select('id,area,estado').in('id', Array.from(idsFinal)).neq('estado', 'Cerrado')
    const conteo: Record<string, number> = {}
    for (const c of (casos || [])) {
      for (const ruta of rutasDeArea(c.area)) conteo[ruta] = (conteo[ruta] || 0) + 1
    }
    setConteoPorRuta(conteo)

    const total = (casos || []).length
    if (typeof document !== 'undefined') {
      document.title = total > 0 ? `(${total}) Tu Terapia - Casos` : 'Tu Terapia - Casos'
    }
  }

  useEffect(() => {
    cargarConteos()
    const interval = setInterval(cargarConteos, 60000)
    return () => clearInterval(interval)
  }, [pathname])

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
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 12px 8px 20px', borderRadius: 8, textDecoration: 'none',
                        fontSize: 12.5, fontWeight: active ? 600 : 400,
                        color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                        background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                      }}>
                        <span>{label}</span>
                        {conteoPorRuta[href] > 0 && (
                          <span style={{
                            background: '#EF4444', color: '#fff', fontSize: 11, fontWeight: 700,
                            minWidth: 18, height: 18, borderRadius: 9, display: 'flex',
                            alignItems: 'center', justifyContent: 'center', padding: '0 5px',
                            boxShadow: '0 0 0 2px rgba(239,68,68,0.3)',
                          }}>{conteoPorRuta[href]}</span>
                        )}
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

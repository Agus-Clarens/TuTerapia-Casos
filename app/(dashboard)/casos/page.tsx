'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { CasoCard, Caso } from '../../../components/CasoCard'
import { casoRelevanteParaUsuario } from '../../../lib/sectores-usuario'

const ord = (e: string) => ({'Nuevo':0,'En curso':1,'Cerrado':3} as Record<string,number>)[e] ?? 2

const SECTORES = ['Todos', 'CX', 'Admin', 'Talent', 'Admin+Talent', 'Business']

export default function Page() {
  return <Suspense fallback={<div style={{padding:24}}>Cargando...</div>}><PageInner /></Suspense>
}

function PageInner() {
  const [casos, setCasos] = useState<Caso[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<string>('Todos')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const soloActualizados = searchParams.get('actualizados') === '1'

  async function load() {
    const { data } = await supabase.from('casos').select('*').order('created_at', {ascending: false})
    if (data) setCasos(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
    supabase.auth.getSession().then(({ data: { session } }) => setUserEmail(session?.user?.email || ''))
  }, [])

  const esActualizadoReciente = (c: any) => {
    if (c.estado === 'Cerrado') return false
    if (!c.updated_at) return false
    const fueTocado = new Date(c.updated_at).getTime() - new Date(c.created_at).getTime() > 60000
    const esReciente = Date.now() - new Date(c.updated_at).getTime() < 24 * 60 * 60 * 1000
    return fueTocado && esReciente && casoRelevanteParaUsuario(userEmail || '', c.area, c.cargado_por)
  }

  // Mientras no cargó el email, no filtramos la vista de actualizados (para no mostrar de más)
  const esperandoEmail = soloActualizados && userEmail === null

  const base = soloActualizados ? casos.filter(esActualizadoReciente) : casos
  const filtrados = filtro === 'Todos' ? base : base.filter(c => c.area === filtro)
  const conteoPorSector: Record<string, number> = { Todos: base.length }
  SECTORES.slice(1).forEach(s => { conteoPorSector[s] = base.filter(c => c.area === s).length })

  return (
    <div style={{padding: 24}}>
      <h1 style={{fontSize: 22, fontWeight: 700, color: '#264534', marginBottom: 14}}>
        {soloActualizados ? 'Casos actualizados (últimas 24h)' : 'Todos los casos'}
      </h1>

      {soloActualizados && (
        <a href="/casos" style={{ display:'inline-block', fontSize:12, color:'#007271', fontWeight:600, marginBottom:14, textDecoration:'none' }}>
          ← Ver todos los casos
        </a>
      )}

      {/* Filtro por sector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {SECTORES.map(s => {
          const active = filtro === s
          const count = conteoPorSector[s] ?? 0
          return (
            <button key={s} onClick={() => setFiltro(s)}
              style={{
                padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: active ? '1.5px solid #264534' : '1.5px solid #E5E7EB',
                background: active ? '#264534' : '#fff',
                color: active ? '#fff' : '#6B7280',
              }}>
              {s} <span style={{ opacity: 0.6, marginLeft: 4 }}>({count})</span>
            </button>
          )
        })}
      </div>

      {(loading || esperandoEmail) ? <p>Cargando...</p> : filtrados.length === 0
        ? <p style={{color:'#9CA3AF'}}>{soloActualizados ? 'No hay casos actualizados recientemente.' : `No hay casos ${filtro !== 'Todos' ? `en ${filtro}` : ''}.`}</p>
        : [...filtrados].sort((a,b) => {
            const diffEstado = ord(a.estado)-ord(b.estado)
            if (diffEstado !== 0) return diffEstado
            const ta = new Date(a.updated_at || a.created_at).getTime()
            const tb = new Date(b.updated_at || b.created_at).getTime()
            return tb - ta
          }).map(c =>
            <CasoCard key={c.id} caso={c} onUpdate={load} sector="todos" showDelete={true} />
          )
      }
    </div>
  )
}

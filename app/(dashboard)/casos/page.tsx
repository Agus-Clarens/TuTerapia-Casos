'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { CasoCard, Caso } from '../../../components/CasoCard'
import { nombreDeUsuario } from '../../../lib/sectores-usuario'

const ord = (e: string) => ({'Nuevo':0,'En curso':1,'Cerrado':3} as Record<string,number>)[e] ?? 2

const SECTORES = ['Todos', 'CX', 'Admin', 'Talent', 'Admin+Talent', 'Business']

export default function Page() {
  return <Suspense fallback={<div style={{padding:24}}>Cargando...</div>}><PageInner /></Suspense>
}

function PageInner() {
  const [casos, setCasos] = useState<Caso[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<string>('Todos')
  const [busqueda, setBusqueda] = useState('')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [idsActualizados, setIdsActualizados] = useState<string[] | null>(null)
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

  // Calcular casos donde participé y la última actualización la hizo otra persona (últimas 24h)
  useEffect(() => {
    if (!soloActualizados || userEmail === null) return
    const miNombre = nombreDeUsuario(userEmail)
    if (!miNombre) { setIdsActualizados([]); return }
    ;(async () => {
      const { data: mias } = await supabase.from('caso_actualizaciones').select('caso_id').eq('autor', miNombre)
      if (!mias) { setIdsActualizados([]); return }
      const casosMios = Array.from(new Set(mias.map((m: any) => m.caso_id)))
      if (casosMios.length === 0) { setIdsActualizados([]); return }
      const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data: recientes } = await supabase.from('caso_actualizaciones')
        .select('caso_id, autor, created_at').in('caso_id', casosMios)
        .gte('created_at', hace24h).order('created_at', { ascending: true })
      if (!recientes || recientes.length === 0) { setIdsActualizados([]); return }
      const ultimoPorCaso: Record<string, string> = {}
      for (const a of recientes) ultimoPorCaso[a.caso_id] = a.autor
      const ids = Object.entries(ultimoPorCaso).filter(([_, u]) => u !== miNombre).map(([id]) => id)
      setIdsActualizados(ids)
    })()
  }, [soloActualizados, userEmail])

  const esperandoEmail = soloActualizados && (userEmail === null || idsActualizados === null)

  const base = soloActualizados ? casos.filter(c => (idsActualizados || []).includes(c.id) && c.estado !== 'Cerrado') : casos
  const porSector = filtro === 'Todos' ? base : base.filter(c => c.area === filtro)
  const q = busqueda.trim().toLowerCase()
  const filtrados = !q ? porSector : porSector.filter(c =>
    (c.pac_mail || '').toLowerCase().includes(q) ||
    (c.psi_mail || '').toLowerCase().includes(q) ||
    (c.pac_nombre || '').toLowerCase().includes(q) ||
    (c.psi_nombre || '').toLowerCase().includes(q) ||
    (c.nro_caso || '').toLowerCase().includes(q)
  )
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

      {/* Buscador por mail / nombre / nro de ticket */}
      <input
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        placeholder="🔍 Buscar por mail, nombre de paciente/psicólogo o N° de ticket..."
        style={{ width: '100%', maxWidth: 520, padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box', marginBottom: 16 }}
      />

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

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Caso } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import HiloCaso from '@/components/HiloCaso'
import { PAISES, CREADORES_POR_AREA } from '@/lib/tipos-caso'

function mergeDedup(a: Caso[], b: Caso[]): Caso[] {
  const seen = new Set<string>()
  return [...a, ...b].filter(c => {
    if (!c.id || seen.has(c.id)) return false
    seen.add(c.id); return true
  })
}

export default function CXPage() {
  const [casos, setCasos] = useState<Caso[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroPais, setFiltroPais] = useState('')
  const [search, setSearch] = useState('')
  const [latestUpdates, setLatestUpdates] = useState<Record<string, string>>({})
  const [seenMap, setSeenMap] = useState<Record<string, string>>({})
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    const map: Record<string, string> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!
      if (k.startsWith('lastSeen_')) map[k.replace('lastSeen_', '')] = localStorage.getItem(k)!
    }
    setSeenMap(map)
  }, [])

  const fetchCasos = useCallback(async () => {
    setLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applyFilters = (q: any) => {
      if (filtroEstado) q = q.eq('estado_general', filtroEstado)
      if (filtroPais) q = q.eq('pais', filtroPais)
      return q
    }
    const [r1, r2] = await Promise.all([
      applyFilters(supabase.from('casos').select('*').eq('area', 'CX')),
      applyFilters(supabase.from('casos').select('*').in('cargado_por', CREADORES_POR_AREA.CX)),
    ])
    let result = mergeDedup(r1.data || [], r2.data || []) as Caso[]
    if (search) {
      const s = search.toLowerCase()
      result = result.filter(c =>
        c.pac_nombre?.toLowerCase().includes(s) ||
        c.nro_caso?.toLowerCase().includes(s) ||
        c.tipo_caso?.toLowerCase().includes(s)
      )
    }
    result.sort((a, b) => (b.updated_at || b.created_at || '').localeCompare(a.updated_at || a.created_at || ''))
    setCasos(result)
    const ids = result.map(c => c.id!).filter(Boolean)
    if (ids.length > 0) {
      const { data: upd } = await supabase.from('caso_actualizaciones').select('caso_id, created_at').in('caso_id', ids).order('created_at', { ascending: false })
      if (upd) {
        const latest: Record<string, string> = {}
        upd.forEach((u: { caso_id: string; created_at: string }) => { if (!latest[u.caso_id]) latest[u.caso_id] = u.created_at })
        setLatestUpdates(latest)
      }
    }
    setLoading(false)
  }, [filtroEstado, filtroPais, search])

  useEffect(() => { fetchCasos() }, [fetchCasos])

  function toggleExpanded(id: string) {
    setExpanded(prev => {
      const n = new Set(prev)
      if (n.has(id)) {
        n.delete(id)
      } else {
        n.add(id)
        const now = new Date().toISOString()
        localStorage.setItem(`lastSeen_${id}`, now)
        setSeenMap(m => ({ ...m, [id]: now }))
      }
      return n
    })
  }

  function hasNewUpdate(id: string) {
    const lat = latestUpdates[id]
    if (!lat) return false
    return !seenMap[id] || lat > seenMap[id]
  }

  const counts = {
    Nuevo: casos.filter(c => c.estado_general === 'Nuevo').length,
    'En curso': casos.filter(c => c.estado_general === 'En curso').length,
    'Requiere atención': casos.filter(c => c.estado_general === 'Requiere atención').length,
    Resuelto: casos.filter(c => c.estado_general === 'Resuelto').length,
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-6 bg-verde-medio rounded-full" />
            <h1 className="text-2xl font-bold text-verde-oscuro">CX</h1>
          </div>
          <p className="text-gray-400 text-sm">{casos.length} casos · área CX + creados por Sol</p>
        </div>
        <Link href="/nuevo-caso" className="flex items-center gap-2 px-4 py-2 bg-verde-oscuro text-white text-sm font-medium rounded-xl hover:bg-verde-oscuro/90 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo caso
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {Object.entries(counts).map(([est, n]) => (
          <button key={est} onClick={() => setFiltroEstado(f => f === est ? '' : est)}
            className={`rounded-xl border p-3 text-left transition-all ${filtroEstado === est ? 'border-verde-oscuro bg-verde-oscuro/5' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
            <p className="text-2xl font-bold text-gray-800">{n}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight">{est}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex gap-3">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="flex-1" />
        <select value={filtroPais} onChange={e => setFiltroPais(e.target.value)}>
          <option value="">Todos los países</option>
          {PAISES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {(filtroEstado || filtroPais || search) && (
          <button onClick={() => { setFiltroEstado(''); setFiltroPais(''); setSearch('') }} className="text-xs text-gray-400 hover:text-gray-600 underline px-2">Limpiar</button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Cargando...</div>
      ) : casos.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">Sin casos</div>
      ) : (
        <div className="space-y-3">
          {casos.map(caso => {
            const isExpanded = expanded.has(caso.id!)
            const isNew = hasNewUpdate(caso.id!)
            return (
              <div key={caso.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${caso.estado_general === 'Cerrado' ? 'opacity-60 border-gray-100' : isNew ? 'border-orange-200' : 'border-gray-100 hover:border-gray-200'}`}>
                <div className="px-5 py-4 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="font-mono text-xs text-gray-400">{caso.nro_caso}</span>
                      <StatusBadge status={caso.estado_general} />
                      {caso.area !== 'CX' && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full border border-blue-200 font-medium">{caso.area === 'Admin+Talent' ? 'Admin + Talent' : caso.area}</span>
                      )}
                      <span className="text-xs text-gray-400">{caso.pais} · {caso.fecha}</span>
                    </div>
                    <p className="font-semibold text-gray-800 text-sm">{caso.tipo_caso}</p>
                    {caso.descripcion && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{caso.descripcion}</p>}
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                      <span><span className="text-gray-400">Pac:</span> <span className="font-medium text-gray-700">{caso.pac_nombre}</span>{caso.pac_mail && <span className="text-gray-400 ml-1">· {caso.pac_mail}</span>}</span>
                      {caso.psi_nombre && <span><span className="text-gray-400">Psi:</span> {caso.psi_nombre}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{caso.cargado_por}</span>
                </div>
                <div className="px-5 py-2.5 border-t border-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleExpanded(caso.id!)}>
                  <div className="flex items-center gap-2">
                    {isNew && !isExpanded ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full border border-orange-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                        Nueva actualización
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        {latestUpdates[caso.id!] ? <span className="font-medium text-verde-oscuro">Ver hilo</span> : 'Sin actualizaciones'}
                      </div>
                    )}
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
                {isExpanded && <HiloCaso caso={caso} onRefresh={fetchCasos} />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

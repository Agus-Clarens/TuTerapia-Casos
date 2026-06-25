'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Caso } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import HiloCaso from '@/components/HiloCaso'
import { PAISES } from '@/lib/tipos-caso'

export default function AdminPage() {
  const [casos, setCasos] = useState<Caso[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroPais, setFiltroPais] = useState('')
  const [search, setSearch] = useState('')
  const [updateCounts, setUpdateCounts] = useState<Record<string, number>>({})
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const fetchCasos = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('casos').select('*').in('area', ['Admin', 'Admin+Talent']).order('created_at', { ascending: false })
    if (filtroEstado) query = query.eq('estado_general', filtroEstado)
    if (filtroPais) query = query.eq('pais', filtroPais)
    const { data, error } = await query
    if (!error && data) {
      let result = data as Caso[]
      if (search) {
        const s = search.toLowerCase()
        result = result.filter(c =>
          c.pac_nombre?.toLowerCase().includes(s) ||
          c.psi_nombre?.toLowerCase().includes(s) ||
          c.nro_caso?.toLowerCase().includes(s) ||
          c.tipo_caso?.toLowerCase().includes(s)
        )
      }
      setCasos(result)
      const ids = result.map(c => c.id!).filter(Boolean)
      if (ids.length > 0) {
        const { data: upd } = await supabase.from('caso_actualizaciones').select('caso_id').in('caso_id', ids)
        if (upd) {
          const counts: Record<string, number> = {}
          upd.forEach((u: { caso_id: string }) => { counts[u.caso_id] = (counts[u.caso_id] || 0) + 1 })
          setUpdateCounts(counts)
        }
      }
    }
    setLoading(false)
  }, [filtroEstado, filtroPais, search])

  useEffect(() => { fetchCasos() }, [fetchCasos])

  function toggleExpanded(id: string) {
    setExpanded(prev => {
      const n = new Set(prev)
      if (n.has(id)) { n.delete(id) } else { n.add(id) }
      return n
    })
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
            <div className="w-2 h-6 bg-blue-500 rounded-full" />
            <h1 className="text-2xl font-bold text-verde-oscuro">Admin</h1>
          </div>
          <p className="text-gray-400 text-sm">{casos.length} casos · Admin y Admin + Talent</p>
        </div>
        <Link href="/nuevo-caso" className="flex items-center gap-2 px-4 py-2 bg-verde-oscuro text-white text-sm font-medium rounded-xl hover:bg-verde-oscuro/90 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo caso
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {Object.entries(counts).map(([est, n]) => (
          <button key={est} onClick={() => setFiltroEstado(f => f === est ? '' : est)}
            className={`rounded-xl border p-3 text-left transition-all ${filtroEstado === est ? 'border-blue-400 bg-blue-50' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
            <p className="text-2xl font-bold text-gray-800">{n}</p>
            <p className="text-xs text-gray-500 mt-0.5">{est}</p>
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
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">Sin casos Admin</div>
      ) : (
        <div className="space-y-3">
          {casos.map(caso => {
            const isExpanded = expanded.has(caso.id!)
            const updCount = updateCounts[caso.id!] || 0
            return (
              <div key={caso.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${caso.estado_general === 'Cerrado' ? 'opacity-60 border-gray-100' : 'border-gray-100 hover:border-gray-200'}`}>
                <div className="px-5 py-4 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="font-mono text-xs text-gray-400">{caso.nro_caso}</span>
                      <StatusBadge status={caso.estado_general} />
                      {caso.area === 'Admin+Talent' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full border border-purple-200">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          También involucra a Talent
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{caso.pais} · {caso.fecha}</span>
                    </div>
                    <p className="font-semibold text-gray-800 text-sm">{caso.tipo_caso}</p>
                    {caso.descripcion && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{caso.descripcion}</p>}
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                      <span><span className="text-gray-400">Pac:</span> <span className="font-medium text-gray-700">{caso.pac_nombre}</span>
                        {caso.pac_mail && <span className="text-gray-400 ml-1">· {caso.pac_mail}</span>}
                      </span>
                      {caso.psi_nombre && <span><span className="text-gray-400">Psi:</span> {caso.psi_nombre}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{caso.cargado_por}</span>
                </div>
                <div
                  className="px-5 py-2.5 border-t border-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpanded(caso.id!)}
                >
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {updCount > 0
                      ? <span className="font-semibold text-blue-600">{updCount} actualización{updCount > 1 ? 'es' : ''}</span>
                      : 'Sin actualizaciones'}
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
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

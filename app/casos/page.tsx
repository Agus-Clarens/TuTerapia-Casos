'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Caso } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import { PAISES, AREA_BADGE } from '@/lib/tipos-caso'

function getCardStyle(estado: string) {
  if (estado === 'Nuevo') return { backgroundColor: '#EEF4FF', borderLeft: '3px solid #213E6E' }
  if (estado === 'En curso') return { backgroundColor: '#FFFBEB', borderLeft: '3px solid #FCD07F' }
  if (estado === 'Requiere atención') return { backgroundColor: '#FFF0EE', borderLeft: '3px solid #F29683' }
  if (estado === 'Resuelto') return { backgroundColor: '#EDFFF4', borderLeft: '3px solid #75B781' }
  if (estado === 'Cerrado') return { backgroundColor: '#F5F4F2', borderLeft: '3px solid #938f80' }
  return { backgroundColor: '#ffffff', borderLeft: '3px solid #e5e7eb' }
}

export default function CasosPage() {
  const [casos, setCasos] = useState<Caso[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ area: '', estado: '', pais: '', search: '' })
  const [updateCounts, setUpdateCounts] = useState<Record<string, number>>({})

  const fetchCasos = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('casos').select('*').order('updated_at', { ascending: false })
    if (filters.area) query = query.eq('area', filters.area)
    if (filters.estado) query = query.eq('estado_general', filters.estado)
    if (filters.pais) query = query.eq('pais', filters.pais)
    const { data, error } = await query
    if (!error && data) {
      let result = data as Caso[]
      if (filters.search) {
        const s = filters.search.toLowerCase()
        result = result.filter(c =>
          c.pac_nombre?.toLowerCase().includes(s) ||
          c.psi_nombre?.toLowerCase().includes(s) ||
          c.nro_caso?.toLowerCase().includes(s) ||
          c.tipo_caso?.toLowerCase().includes(s) ||
          c.pac_mail?.toLowerCase().includes(s)
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
  }, [filters])

  useEffect(() => { fetchCasos() }, [fetchCasos])

  const counts = {
    Nuevo: casos.filter(c => c.estado_general === 'Nuevo').length,
    'En curso': casos.filter(c => c.estado_general === 'En curso').length,
    'Requiere atención': casos.filter(c => c.estado_general === 'Requiere atención').length,
    Resuelto: casos.filter(c => c.estado_general === 'Resuelto').length,
    Cerrado: casos.filter(c => c.estado_general === 'Cerrado').length,
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-verde-oscuro">Todos los Casos</h1>
          <p className="text-gray-400 text-sm mt-0.5">{casos.length} casos</p>
        </div>
        <Link href="/nuevo-caso" className="flex items-center gap-2 px-4 py-2 bg-teal text-white text-sm font-medium rounded-xl hover:bg-teal/90 transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo caso
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {Object.entries(counts).map(([estado, count]) => (
          <button
            key={estado}
            onClick={() => setFilters(f => ({ ...f, estado: f.estado === estado ? '' : estado }))}
            className={`rounded-xl border p-3 text-left transition-all ${
              filters.estado === estado ? 'border-verde-oscuro bg-verde-oscuro/5' : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            <p className="text-2xl font-bold text-gray-800">{count}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight">{estado}</p>
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          placeholder="Buscar por nombre, email, nro..."
          className="flex-1 min-w-[200px]"
        />
        <select value={filters.area} onChange={e => setFilters(f => ({ ...f, area: e.target.value }))} className="min-w-[130px]">
          <option value="">Todas las áreas</option>
          <option value="Admin">Admin</option>
          <option value="Talent">Talent</option>
          <option value="Admin+Talent">Admin + Talent</option>
          <option value="CX">CX</option>
        </select>
        <select value={filters.pais} onChange={e => setFilters(f => ({ ...f, pais: e.target.value }))} className="min-w-[130px]">
          <option value="">Todos los países</option>
          {PAISES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {(filters.area || filters.estado || filters.pais || filters.search) && (
          <button onClick={() => setFilters({ area: '', estado: '', pais: '', search: '' })} className="text-xs text-gray-400 hover:text-gray-600 underline px-2">
            Limpiar
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Cargando...</div>
      ) : casos.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          No hay casos que coincidan con los filtros
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {casos.map(caso => {
            const updCount = updateCounts[caso.id!] || 0
            return (
              <div key={caso.id} className={`rounded-2xl shadow-sm p-5 flex flex-col gap-3 transition-all ${caso.estado_general === 'Cerrado' ? 'opacity-60' : ''}`} style={getCardStyle(caso.estado_general)}>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs text-gray-400 font-medium">{caso.nro_caso}</span>
                  <StatusBadge status={caso.estado_general} />
                </div>

                <div>
                  <p className="font-semibold text-gray-800 text-sm leading-snug">{caso.tipo_caso}</p>
                  {caso.descripcion && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{caso.descripcion}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <svg className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium text-gray-700">{caso.pac_nombre}</span>
                    {caso.pac_mail && <><span className="text-gray-300">·</span><span className="text-gray-400 truncate">{caso.pac_mail}</span></>}
                  </div>
                  {caso.psi_nombre && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>{caso.psi_nombre}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${AREA_BADGE[caso.area] || 'bg-gray-100 text-gray-500'}`}>
                      {caso.area === 'Admin+Talent' ? 'Admin + Talent' : caso.area}
                    </span>
                    {updCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="font-semibold text-verde-oscuro">{updCount}</span>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {caso.pais} · {caso.fecha}
                  </div>
                </div>

                {caso.cargado_por && (
                  <p className="text-xs text-gray-400">Creado por {caso.cargado_por}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

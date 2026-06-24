'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Caso } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import { PAISES, ESTADOS_TALENT, ESTADOS_GENERAL } from '@/lib/tipos-caso'

export default function TalentPage() {
  const [casos, setCasos] = useState<Caso[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ pais: '', estado_talent: '', search: '' })
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchCasos = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('casos')
      .select('*')
      .or('area.eq.Talent,area.eq.Admin+Talent')
      .order('created_at', { ascending: false })

    if (filters.pais) query = query.eq('pais', filters.pais)
    if (filters.estado_talent) query = query.eq('estado_talent', filters.estado_talent)

    const { data, error } = await query
    if (!error && data) {
      let result = data as Caso[]
      if (filters.search) {
        const s = filters.search.toLowerCase()
        result = result.filter(c =>
          c.pac_nombre?.toLowerCase().includes(s) ||
          c.psi_nombre?.toLowerCase().includes(s) ||
          c.nro_caso?.toLowerCase().includes(s) ||
          c.tipo_caso?.toLowerCase().includes(s)
        )
      }
      setCasos(result)
    }
    setLoading(false)
  }, [filters])

  useEffect(() => { fetchCasos() }, [fetchCasos])

  async function updateEstadoTalent(id: string, estado: string) {
    setUpdating(id)
    await supabase.from('casos').update({ estado_talent: estado }).eq('id', id)
    await fetchCasos()
    setUpdating(null)
  }

  async function updateEstadoGeneral(id: string, estado: string) {
    setUpdating(id)
    await supabase.from('casos').update({ estado_general: estado }).eq('id', id)
    await fetchCasos()
    setUpdating(null)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-6 bg-purple-500 rounded-full" />
            <h1 className="text-2xl font-bold text-verde-oscuro">Vista Talent</h1>
          </div>
          <p className="text-gray-500 text-sm">{casos.length} casos • Área Talent y Admin+Talent</p>
        </div>
        <Link href="/nuevo-caso" className="flex items-center gap-2 px-4 py-2 bg-verde-oscuro text-white text-sm font-medium rounded-xl hover:bg-verde-oscuro/90 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo caso
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: casos.length, color: 'bg-gray-50 border-gray-200' },
          { label: 'Pendiente', value: casos.filter(c => c.estado_talent === 'Pendiente').length, color: 'bg-orange-50 border-orange-200' },
          { label: 'En proceso', value: casos.filter(c => c.estado_talent === 'En proceso').length, color: 'bg-blue-50 border-blue-200' },
          { label: 'Resuelto', value: casos.filter(c => c.estado_talent === 'Resuelto').length, color: 'bg-green-50 border-green-200' },
        ].map(stat => (
          <div key={stat.label} className={`rounded-xl border p-4 ${stat.color}`}>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 grid grid-cols-4 gap-3">
        <input type="text" value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} placeholder="Buscar..." className="col-span-2" />
        <select value={filters.pais} onChange={e => setFilters(p => ({ ...p, pais: e.target.value }))}>
          <option value="">Todos los países</option>
          {PAISES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filters.estado_talent} onChange={e => setFilters(p => ({ ...p, estado_talent: e.target.value }))}>
          <option value="">Estado Talent</option>
          {ESTADOS_TALENT.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Cargando...</div>
        ) : casos.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No hay casos Talent</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nro</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">País</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Paciente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Psicólogo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Área</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado Talent</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">General</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {casos.map(caso => (
                <>
                  <tr
                    key={caso.id}
                    className="hover:bg-crema/50 cursor-pointer transition-colors"
                    onClick={() => setExpandedId(expandedId === caso.id ? null : caso.id || null)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{caso.nro_caso}</td>
                    <td className="px-4 py-3 text-gray-600">{caso.fecha}</td>
                    <td className="px-4 py-3 text-gray-600">{caso.pais}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{caso.pac_nombre}</div>
                      <div className="text-xs text-gray-400">{caso.pac_mail}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{caso.psi_nombre}</div>
                      <div className="text-xs text-gray-400">{caso.psi_mail}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[160px]">
                      <span className="truncate block" title={caso.tipo_caso}>{caso.tipo_caso}</span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={caso.area} /></td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <select
                        value={caso.estado_talent || 'Pendiente'}
                        onChange={e => updateEstadoTalent(caso.id!, e.target.value)}
                        disabled={updating === caso.id}
                        className="text-xs py-1 px-2"
                      >
                        {ESTADOS_TALENT.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <select
                        value={caso.estado_general}
                        onChange={e => updateEstadoGeneral(caso.id!, e.target.value)}
                        disabled={updating === caso.id}
                        className="text-xs py-1 px-2"
                      >
                        {ESTADOS_GENERAL.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === caso.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </td>
                  </tr>
                  {expandedId === caso.id && (
                    <tr key={`${caso.id}-detail`} className="bg-crema/30">
                      <td colSpan={10} className="px-6 py-4">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Descripción</p>
                            <p className="text-gray-700">{caso.descripcion || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Acción Talent</p>
                            <p className="text-gray-700">{caso.accion_talent || '—'}</p>
                          </div>
                          {caso.requiere_descuento && (
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Descuento al psicólogo</p>
                              <p className="text-orange-600 font-semibold">{caso.monto_descuento ? `$${caso.monto_descuento}` : 'Sin monto cargado'}</p>
                            </div>
                          )}
                          {caso.observaciones && (
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Observaciones</p>
                              <p className="text-gray-700">{caso.observaciones}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Cargado por</p>
                            <p className="text-gray-700">{caso.cargado_por}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Caso } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import { PAISES, ESTADOS_GENERAL } from '@/lib/tipos-caso'

export default function CasosPage() {
  const [casos, setCasos] = useState<Caso[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    pais: '',
    area: '',
    estado_general: '',
    search: '',
  })
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchCasos = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('casos')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.pais) query = query.eq('pais', filters.pais)
    if (filters.area) query = query.eq('area', filters.area)
    if (filters.estado_general) query = query.eq('estado_general', filters.estado_general)

    const { data, error } = await query
    if (!error && data) {
      let result = data as Caso[]
      if (filters.search) {
        const s = filters.search.toLowerCase()
        result = result.filter(c =>
          c.pac_nombre?.toLowerCase().includes(s) ||
          c.psi_nombre?.toLowerCase().includes(s) ||
          c.pac_mail?.toLowerCase().includes(s) ||
          c.psi_mail?.toLowerCase().includes(s) ||
          c.nro_caso?.toLowerCase().includes(s) ||
          c.tipo_caso?.toLowerCase().includes(s)
        )
      }
      setCasos(result)
    }
    setLoading(false)
  }, [filters])

  useEffect(() => {
    fetchCasos()
  }, [fetchCasos])

  function handleFilter(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-verde-oscuro">Todos los Casos</h1>
          <p className="text-gray-500 text-sm mt-0.5">{casos.length} casos encontrados</p>
        </div>
        <Link
          href="/nuevo-caso"
          className="flex items-center gap-2 px-4 py-2 bg-verde-oscuro text-white text-sm font-medium rounded-xl hover:bg-verde-oscuro/90 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo caso
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 grid grid-cols-4 gap-3">
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleFilter}
          placeholder="Buscar por nombre, email, nro..."
          className="col-span-2"
        />
        <select name="pais" value={filters.pais} onChange={handleFilter}>
          <option value="">Todos los países</option>
          {PAISES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select name="area" value={filters.area} onChange={handleFilter}>
          <option value="">Todas las áreas</option>
          <option value="Admin">Admin</option>
          <option value="Talent">Talent</option>
          <option value="Admin+Talent">Admin+Talent</option>
          <option value="CX">CX</option>
        </select>
        <select name="estado_general" value={filters.estado_general} onChange={handleFilter} className="col-span-2">
          <option value="">Todos los estados</option>
          {ESTADOS_GENERAL.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <button
          onClick={() => setFilters({ pais: '', area: '', estado_general: '', search: '' })}
          className="col-span-2 text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2"
        >
          Limpiar filtros
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Cargando casos...</div>
        ) : casos.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No hay casos que coincidan con los filtros</div>
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
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
                    <td className="px-4 py-3 text-gray-600 max-w-[180px]">
                      <span className="truncate block" title={caso.tipo_caso}>{caso.tipo_caso}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={caso.area} type="area" />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={caso.estado_general} />
                    </td>
                    <td className="px-4 py-3">
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === caso.id ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </td>
                  </tr>
                  {expandedId === caso.id && (
                    <tr key={`${caso.id}-detail`} className="bg-crema/30">
                      <td colSpan={9} className="px-6 py-4">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Descripción</p>
                            <p className="text-gray-700">{caso.descripcion || '—'}</p>
                          </div>
                          {caso.accion_admin && (
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Acción Admin</p>
                              <p className="text-gray-700">{caso.accion_admin}</p>
                              <StatusBadge status={caso.estado_admin || ''} />
                            </div>
                          )}
                          {caso.accion_talent && (
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Acción Talent</p>
                              <p className="text-gray-700">{caso.accion_talent}</p>
                              <StatusBadge status={caso.estado_talent || ''} />
                            </div>
                          )}
                          {caso.requiere_descuento && (
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Descuento</p>
                              <p className="text-gray-700 font-medium">
                                {caso.monto_descuento ? `$${caso.monto_descuento}` : 'Sin monto'}
                              </p>
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

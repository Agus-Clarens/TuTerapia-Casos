'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Caso } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import { PAISES, ESTADOS_ADMIN, ESTADOS_TALENT, ESTADOS_GENERAL } from '@/lib/tipos-caso'

export default function AdminTalentPage() {
  const [casos, setCasos] = useState<Caso[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ pais: '', estado_general: '', search: '' })
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchCasos = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('casos')
      .select('*')
      .eq('area', 'Admin+Talent')
      .order('created_at', { ascending: false })

    if (filters.pais) query = query.eq('pais', filters.pais)
    if (filters.estado_general) query = query.eq('estado_general', filters.estado_general)

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

  async function updateField(id: string, field: string, value: string) {
    setUpdating(id)
    await supabase.from('casos').update({ [field]: value }).eq('id', id)
    await fetchCasos()
    setUpdating(null)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-6 bg-orange-500 rounded-full" />
            <h1 className="text-2xl font-bold text-verde-oscuro">Admin + Talent</h1>
          </div>
          <p className="text-gray-500 text-sm">{casos.length} casos · Requieren acción de ambas áreas</p>
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
        <div className="rounded-xl border bg-orange-50 border-orange-200 p-4">
          <p className="text-2xl font-bold text-gray-800">{casos.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total</p>
        </div>
        <div className="rounded-xl border bg-yellow-50 border-yellow-200 p-4">
          <p className="text-2xl font-bold text-gray-800">{casos.filter(c => c.estado_general === 'Abierto').length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Abiertos</p>
        </div>
        <div className="rounded-xl border bg-blue-50 border-blue-200 p-4">
          <p className="text-2xl font-bold text-gray-800">{casos.filter(c => c.estado_general === 'En proceso').length}</p>
          <p className="text-xs text-gray-500 mt-0.5">En proceso</p>
        </div>
        <div className="rounded-xl border bg-verde-medio/10 border-verde-medio/30 p-4">
          <p className="text-2xl font-bold text-gray-800">{casos.filter(c => c.requiere_descuento).length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Con descuento</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 grid grid-cols-4 gap-3">
        <input type="text" value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} placeholder="Buscar por nombre, nro, tipo..." className="col-span-2" />
        <select value={filters.pais} onChange={e => setFilters(p => ({ ...p, pais: e.target.value }))}>
          <option value="">Todos los países</option>
          {PAISES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filters.estado_general} onChange={e => setFilters(p => ({ ...p, estado_general: e.target.value }))}>
          <option value="">Todos los estados</option>
          <option value="Abierto">Abierto</option>
          <option value="En proceso">En proceso</option>
          <option value="Cerrado">Cerrado</option>
        </select>
      </div>

      {/* Cards de casos */}
      {loading ? (
        <div className="p-12 text-center text-gray-400">Cargando...</div>
      ) : casos.length === 0 ? (
        <div className="p-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
          No hay casos Admin + Talent
        </div>
      ) : (
        <div className="space-y-4">
          {casos.map(caso => (
            <div key={caso.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Header del caso */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div>
                    <span className="font-mono text-xs text-gray-400">{caso.nro_caso}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full border border-orange-200">
                        Admin + Talent
                      </span>
                      {caso.requiere_descuento && (
                        <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-medium rounded-full border border-red-200">
                          ⚠ Requiere descuento
                        </span>
                      )}
                      <StatusBadge status={caso.estado_general} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{caso.tipo_caso}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>{caso.fecha}</span>
                      <span>·</span>
                      <span>{caso.pais}</span>
                      <span>·</span>
                      <span>Pac: <strong>{caso.pac_nombre}</strong></span>
                      {caso.psi_nombre && (
                        <>
                          <span>·</span>
                          <span>Psi: <strong>{caso.psi_nombre}</strong></span>
                        </>
                      )}
                    </div>
                    {caso.descripcion && (
                      <p className="mt-2 text-xs text-gray-500 line-clamp-2">{caso.descripcion}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  <select
                    value={caso.estado_general}
                    onChange={e => updateField(caso.id!, 'estado_general', e.target.value)}
                    disabled={updating === caso.id}
                    className="text-xs py-1 px-2"
                  >
                    {ESTADOS_GENERAL.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>

              {/* Dos columnas: Admin y Talent */}
              <div className="grid grid-cols-2 divide-x divide-gray-100">
                {/* Admin */}
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Qué debe hacer Admin</span>
                  </div>
                  {caso.accion_admin ? (
                    <p className="text-sm text-gray-700 mb-3">{caso.accion_admin}</p>
                  ) : (
                    <p className="text-sm text-gray-400 italic mb-3">Sin acción cargada</p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Estado:</span>
                    <select
                      value={caso.estado_admin || 'Pendiente'}
                      onChange={e => updateField(caso.id!, 'estado_admin', e.target.value)}
                      disabled={updating === caso.id}
                      className="text-xs py-1 px-2"
                    >
                      {ESTADOS_ADMIN.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>

                {/* Talent */}
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Qué debe hacer Talent</span>
                  </div>
                  {caso.accion_talent ? (
                    <p className="text-sm text-gray-700 mb-3">{caso.accion_talent}</p>
                  ) : (
                    <p className="text-sm text-gray-400 italic mb-3">Sin acción cargada</p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Estado:</span>
                    <select
                      value={caso.estado_talent || 'Pendiente'}
                      onChange={e => updateField(caso.id!, 'estado_talent', e.target.value)}
                      disabled={updating === caso.id}
                      className="text-xs py-1 px-2"
                    >
                      {ESTADOS_TALENT.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Footer con descuento si aplica */}
              {caso.requiere_descuento && (
                <div className="px-6 py-3 bg-orange-50 border-t border-orange-100 flex items-center gap-4">
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-semibold text-orange-700">Descuento al psicólogo:</span>
                  <span className="text-sm font-bold text-orange-700">
                    {caso.monto_descuento ? `$${caso.monto_descuento}` : 'Monto pendiente de cargar'}
                  </span>
                  {caso.mes_liquidacion && (
                    <span className="text-xs text-orange-500">· Mes: {caso.mes_liquidacion}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

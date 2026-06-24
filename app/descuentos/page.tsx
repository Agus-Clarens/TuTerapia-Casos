'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { DescuentoPsicologo } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import { PAISES, ESTADOS_DESCUENTO } from '@/lib/tipos-caso'

export default function DescuentosPage() {
  const [descuentos, setDescuentos] = useState<DescuentoPsicologo[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ pais: '', estado: '', mes: '', search: '' })
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchDescuentos = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('descuentos_psicologo')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.pais) query = query.eq('pais', filters.pais)
    if (filters.estado) query = query.eq('estado', filters.estado)
    if (filters.mes) query = query.eq('mes', filters.mes)

    const { data, error } = await query
    if (!error && data) {
      let result = data as DescuentoPsicologo[]
      if (filters.search) {
        const s = filters.search.toLowerCase()
        result = result.filter(d =>
          d.psi_nombre?.toLowerCase().includes(s) ||
          d.pac_nombre?.toLowerCase().includes(s) ||
          d.psi_mail?.toLowerCase().includes(s) ||
          d.nro_caso?.toLowerCase().includes(s)
        )
      }
      setDescuentos(result)
    }
    setLoading(false)
  }, [filters])

  useEffect(() => { fetchDescuentos() }, [fetchDescuentos])

  async function updateEstado(id: string, estado: string) {
    setUpdating(id)
    await supabase.from('descuentos_psicologo').update({ estado }).eq('id', id)
    await fetchDescuentos()
    setUpdating(null)
  }

  const totalMonto = descuentos
    .filter(d => d.estado !== 'Rechazado')
    .reduce((acc, d) => acc + (d.monto || 0), 0)

  const pendientes = descuentos.filter(d => d.estado === 'Pendiente')
  const aplicados = descuentos.filter(d => d.estado === 'Aplicado')

  // Unique meses for filter
  const meses = Array.from(new Set(descuentos.map(d => d.mes).filter((m): m is string => Boolean(m)))).sort().reverse()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-6 bg-teal rounded-full" />
            <h1 className="text-2xl font-bold text-verde-oscuro">Descuentos a Psicólogos</h1>
          </div>
          <p className="text-gray-500 text-sm">{descuentos.length} registros totales</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border bg-orange-50 border-orange-200 p-4">
          <p className="text-2xl font-bold text-gray-800">{pendientes.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Pendientes</p>
          {pendientes.length > 0 && (
            <p className="text-xs text-orange-600 mt-1 font-medium">
              ${pendientes.reduce((a, d) => a + (d.monto || 0), 0).toFixed(2)}
            </p>
          )}
        </div>
        <div className="rounded-xl border bg-teal/10 border-teal/20 p-4">
          <p className="text-2xl font-bold text-gray-800">{aplicados.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Aplicados</p>
          {aplicados.length > 0 && (
            <p className="text-xs text-teal mt-1 font-medium">
              ${aplicados.reduce((a, d) => a + (d.monto || 0), 0).toFixed(2)}
            </p>
          )}
        </div>
        <div className="rounded-xl border bg-red-50 border-red-200 p-4">
          <p className="text-2xl font-bold text-gray-800">{descuentos.filter(d => d.estado === 'Rechazado').length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Rechazados</p>
        </div>
        <div className="rounded-xl border bg-verde-medio/10 border-verde-medio/30 p-4">
          <p className="text-2xl font-bold text-verde-oscuro">${totalMonto.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total a descontar</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 grid grid-cols-4 gap-3">
        <input type="text" value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} placeholder="Buscar psicólogo, paciente..." className="col-span-2" />
        <select value={filters.pais} onChange={e => setFilters(p => ({ ...p, pais: e.target.value }))}>
          <option value="">Todos los países</option>
          {PAISES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filters.estado} onChange={e => setFilters(p => ({ ...p, estado: e.target.value }))}>
          <option value="">Todos los estados</option>
          {ESTADOS_DESCUENTO.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <select value={filters.mes} onChange={e => setFilters(p => ({ ...p, mes: e.target.value }))} className="col-span-2">
          <option value="">Todos los meses</option>
          {meses.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <button
          onClick={() => setFilters({ pais: '', estado: '', mes: '', search: '' })}
          className="col-span-2 text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2"
        >
          Limpiar filtros
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Cargando...</div>
        ) : descuentos.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No hay descuentos registrados</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nro Caso</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mes</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">País</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Psicólogo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Paciente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Motivo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Monto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {descuentos.map(d => (
                <tr key={d.id} className="hover:bg-crema/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{d.nro_caso}</td>
                  <td className="px-4 py-3 text-gray-600">{d.fecha_caso}</td>
                  <td className="px-4 py-3 text-gray-600 font-medium">{d.mes}</td>
                  <td className="px-4 py-3 text-gray-600">{d.pais}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{d.psi_nombre}</div>
                    <div className="text-xs text-gray-400">{d.psi_mail}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-800">{d.pac_nombre}</div>
                    <div className="text-xs text-gray-400">{d.pac_mail}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[160px]">
                    <span className="truncate block" title={d.motivo}>{d.motivo}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${d.monto ? 'text-gray-800' : 'text-gray-400'}`}>
                      {d.monto ? `$${d.monto}` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={d.estado} type="descuento" />
                      {d.estado === 'Pendiente' && (
                        <div className="flex gap-1 ml-1">
                          <button
                            onClick={() => updateEstado(d.id!, 'Aplicado')}
                            disabled={updating === d.id}
                            className="px-2 py-1 bg-teal text-white text-xs rounded-md hover:bg-teal/90 disabled:opacity-50 transition-colors"
                          >
                            Aplicar
                          </button>
                          <button
                            onClick={() => updateEstado(d.id!, 'Rechazado')}
                            disabled={updating === d.id}
                            className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-md hover:bg-red-200 disabled:opacity-50 transition-colors"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

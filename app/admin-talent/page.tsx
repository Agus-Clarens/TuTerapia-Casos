'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Caso } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import { PAISES } from '@/lib/tipos-caso'

export default function AdminTalentPage() {
  const [casos, setCasos] = useState<Caso[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroPais, setFiltroPais] = useState('')
  const [search, setSearch] = useState('')
  const [adminActions, setAdminActions] = useState<Record<string, string>>({})
  const [talentActions, setTalentActions] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)

  const fetchCasos = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('casos').select('*').eq('area', 'Admin+Talent').order('created_at', { ascending: false })
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
      const ai: Record<string, string> = {}
      const ti: Record<string, string> = {}
      result.forEach(c => { ai[c.id!] = c.accion_admin || ''; ti[c.id!] = c.accion_talent || '' })
      setAdminActions(ai)
      setTalentActions(ti)
    }
    setLoading(false)
  }, [filtroEstado, filtroPais, search])

  useEffect(() => { fetchCasos() }, [fetchCasos])

  async function updateAdmin(id: string, estado: string) {
    setSaving(`admin-${id}`)
    await supabase.from('casos').update({
      estado_admin: estado,
      accion_admin: adminActions[id] || null,
    }).eq('id', id)
    await fetchCasos()
    setSaving(null)
  }

  async function updateTalent(id: string, estado: string) {
    setSaving(`talent-${id}`)
    await supabase.from('casos').update({
      estado_talent: estado,
      accion_talent: talentActions[id] || null,
    }).eq('id', id)
    // Si ambas áreas están resueltas, marcar estado_general como Resuelto
    const caso = casos.find(c => c.id === id)
    if (caso && caso.estado_admin === 'Resuelto' && estado === 'Resuelto') {
      await supabase.from('casos').update({ estado_general: 'Resuelto' }).eq('id', id)
    }
    await fetchCasos()
    setSaving(null)
  }

  const ESTADOS_AREA = ['Nuevo', 'En curso', 'Resuelto']

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-6 bg-orange-500 rounded-full" />
            <h1 className="text-2xl font-bold text-verde-oscuro">Admin + Talent</h1>
          </div>
          <p className="text-gray-400 text-sm">{casos.length} casos que requieren acción de ambas áreas</p>
        </div>
        <Link href="/nuevo-caso" className="flex items-center gap-2 px-4 py-2 bg-verde-oscuro text-white text-sm font-medium rounded-xl hover:bg-verde-oscuro/90 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo caso
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex gap-3">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="flex-1" />
        <select value={filtroPais} onChange={e => setFiltroPais(e.target.value)}>
          <option value="">Todos los países</option>
          {PAISES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {['Nuevo', 'En curso', 'Resuelto', 'Cerrado'].map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        {(filtroEstado || filtroPais || search) && (
          <button onClick={() => { setFiltroEstado(''); setFiltroPais(''); setSearch('') }} className="text-xs text-gray-400 hover:text-gray-600 underline px-2">Limpiar</button>
        )}
      </div>

      {/* Casos */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Cargando...</div>
      ) : casos.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">Sin casos Admin + Talent</div>
      ) : (
        <div className="space-y-4">
          {casos.map(caso => (
            <div key={caso.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-mono text-xs text-gray-400">{caso.nro_caso}</span>
                    <StatusBadge status={caso.estado_general} />
                    <span className="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full border border-orange-200">Admin + Talent</span>
                    {caso.requiere_descuento && (
                      <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-full border border-red-200">⚠ Descuento</span>
                    )}
                    <span className="text-xs text-gray-400">{caso.pais} · {caso.fecha}</span>
                  </div>
                  <p className="font-semibold text-gray-800">{caso.tipo_caso}</p>
                  {caso.descripcion && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{caso.descripcion}</p>}
                  <div className="mt-1.5 flex gap-4 text-xs text-gray-500">
                    <span><span className="text-gray-400">Pac:</span> {caso.pac_nombre}</span>
                    {caso.psi_nombre && <span><span className="text-gray-400">Psi:</span> {caso.psi_nombre}</span>}
                    {caso.cargado_por && <span><span className="text-gray-400">Por:</span> {caso.cargado_por}</span>}
                  </div>
                </div>
              </div>

              {/* Dos columnas */}
              <div className="grid grid-cols-2 divide-x divide-gray-100">
                {/* Admin */}
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Admin</span>
                    </div>
                    <select
                      value={caso.estado_admin || 'Nuevo'}
                      onChange={e => updateAdmin(caso.id!, e.target.value)}
                      disabled={saving === `admin-${caso.id}`}
                      className="text-xs py-1 px-2"
                    >
                      {ESTADOS_AREA.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Qué debe hacer Admin</label>
                  <textarea
                    value={adminActions[caso.id!] ?? ''}
                    onChange={e => setAdminActions(a => ({ ...a, [caso.id!]: e.target.value }))}
                    rows={3}
                    placeholder="Describí la acción de Admin..."
                    className="resize-none text-sm w-full"
                    disabled={saving === `admin-${caso.id}`}
                  />
                  <div className="mt-2 flex gap-2">
                    {(caso.estado_admin === 'Nuevo' || !caso.estado_admin) && (
                      <button onClick={() => updateAdmin(caso.id!, 'En curso')} disabled={saving === `admin-${caso.id}`}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50">
                        Tomar
                      </button>
                    )}
                    {caso.estado_admin === 'En curso' && (
                      <button onClick={() => updateAdmin(caso.id!, 'Resuelto')} disabled={saving === `admin-${caso.id}`}
                        className="px-3 py-1 bg-verde-medio text-verde-oscuro text-xs font-semibold rounded-lg hover:bg-verde-medio/90 disabled:opacity-50">
                        Resolver
                      </button>
                    )}
                    {caso.estado_admin === 'Resuelto' && (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Resuelto por Admin
                      </span>
                    )}
                  </div>
                </div>

                {/* Talent */}
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">Talent</span>
                    </div>
                    <select
                      value={caso.estado_talent || 'Nuevo'}
                      onChange={e => updateTalent(caso.id!, e.target.value)}
                      disabled={saving === `talent-${caso.id}`}
                      className="text-xs py-1 px-2"
                    >
                      {ESTADOS_AREA.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Qué debe hacer Talent</label>
                  <textarea
                    value={talentActions[caso.id!] ?? ''}
                    onChange={e => setTalentActions(a => ({ ...a, [caso.id!]: e.target.value }))}
                    rows={3}
                    placeholder="Describí la acción de Talent..."
                    className="resize-none text-sm w-full"
                    disabled={saving === `talent-${caso.id}`}
                  />
                  <div className="mt-2 flex gap-2">
                    {(caso.estado_talent === 'Nuevo' || !caso.estado_talent) && (
                      <button onClick={() => updateTalent(caso.id!, 'En curso')} disabled={saving === `talent-${caso.id}`}
                        className="px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 disabled:opacity-50">
                        Tomar
                      </button>
                    )}
                    {caso.estado_talent === 'En curso' && (
                      <button onClick={() => updateTalent(caso.id!, 'Resuelto')} disabled={saving === `talent-${caso.id}`}
                        className="px-3 py-1 bg-verde-medio text-verde-oscuro text-xs font-semibold rounded-lg hover:bg-verde-medio/90 disabled:opacity-50">
                        Resolver
                      </button>
                    )}
                    {caso.estado_talent === 'Resuelto' && (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Resuelto por Talent
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer descuento */}
              {caso.requiere_descuento && (
                <div className="px-6 py-3 bg-orange-50 border-t border-orange-100 flex items-center gap-3 text-xs">
                  <span className="font-semibold text-orange-700">Descuento al psicólogo:</span>
                  <span className="font-bold text-orange-700">{caso.monto_descuento ? `$${caso.monto_descuento}` : 'Monto pendiente'}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

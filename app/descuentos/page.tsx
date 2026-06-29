'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { DescuentoPsicologo } from '@/types'

const NOMBRES_MES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function formatMes(mes: string) {
  if (!mes) return '—'
  const [year, month] = mes.split('-')
  const idx = parseInt(month) - 1
  if (idx < 0 || idx > 11) return mes
  return `${NOMBRES_MES[idx]} ${year}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const buildMensaje = (d: any) => `Hola ${d.psi_nombre}! 👋\n\nTe escribimos para avisarte que en tu próxima liquidación se descontará una sesión ${d.tipo_sesion || 'Presencial'} correspondiente al paciente ${d.pac_nombre}.\n\n🗓️ Mes: ${d.mes}\n💰 Monto a descontar: $${d.monto}\n\nAnte cualquier consulta no dudes en escribirnos.\n\n¡Saludos, Sofía! 🌿\nEquipo Tu Terapia`

export default function DescuentosPage() {
  const [descuentos, setDescuentos] = useState<DescuentoPsicologo[]>([])
  const [loading, setLoading] = useState(true)
  const [mesFiltro, setMesFiltro] = useState('')
  const [mesesDisponibles, setMesesDisponibles] = useState<string[]>([])
  const [updating, setUpdating] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchDescuentos = useCallback(async () => {
    setLoading(true)

    const { data: todos } = await supabase
      .from('descuentos_psicologo')
      .select('mes')
      .order('mes', { ascending: false })
    if (todos) {
      const meses = Array.from(new Set(
        todos.map((d: { mes?: string }) => d.mes).filter((m): m is string => Boolean(m))
      )).sort().reverse()
      setMesesDisponibles(meses)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = supabase
      .from('descuentos_psicologo')
      .select('*')
      .order('mes', { ascending: false })
      .order('created_at', { ascending: false })

    if (mesFiltro) query = query.eq('mes', mesFiltro)

    const { data, error } = await query
    if (!error && data) setDescuentos(data as DescuentoPsicologo[])
    setLoading(false)
  }, [mesFiltro])

  useEffect(() => { fetchDescuentos() }, [fetchDescuentos])

  async function marcarAplicado(id: string) {
    setUpdating(id)
    await supabase.from('descuentos_psicologo').update({ estado: 'Aplicado' }).eq('id', id)
    await fetchDescuentos()
    setUpdating(null)
  }

  async function copiarMensaje(d: DescuentoPsicologo) {
    const msg = buildMensaje(d)
    try {
      await navigator.clipboard.writeText(msg)
    } catch {
      const el = document.createElement('textarea')
      el.value = msg
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopiedId(d.id!)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const pendientes = descuentos.filter(d => d.estado === 'Pendiente')
  const totalPendiente = pendientes.reduce((a, d) => a + Number(d.monto || 0), 0)
  const aplicados = descuentos.filter(d => d.estado === 'Aplicado')
  const totalAplicado = aplicados.reduce((a, d) => a + Number(d.monto || 0), 0)

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-6 rounded-full" style={{ backgroundColor: '#007271' }} />
          <h1 className="text-2xl font-bold text-verde-oscuro">Descuento sesiones psicólogos</h1>
        </div>
        <p className="text-gray-500 text-sm">Vista de liquidación mensual — Sofi</p>
      </div>

      {/* Filtro + resumen */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-600">Mes:</label>
            <select value={mesFiltro} onChange={e => setMesFiltro(e.target.value)} className="min-w-[160px]">
              <option value="">Todos los meses</option>
              {mesesDisponibles.map(m => (
                <option key={m} value={m}>{formatMes(m)}</option>
              ))}
            </select>
            {mesFiltro && (
              <button onClick={() => setMesFiltro('')} className="text-xs text-gray-400 hover:text-gray-600 underline">
                Limpiar
              </button>
            )}
          </div>

          <div className="flex items-center gap-5 ml-auto flex-wrap">
            <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-xl px-4 py-2.5">
              <div>
                <p className="text-xl font-bold text-orange-600">{pendientes.length}</p>
                <p className="text-xs text-gray-500">Pendientes</p>
              </div>
              <div className="w-px h-8 bg-orange-100" />
              <div>
                <p className="text-xl font-bold text-orange-700">
                  {totalPendiente > 0 ? `$${totalPendiente.toLocaleString('es-AR')}` : '—'}
                </p>
                <p className="text-xs text-gray-500">Total pendiente</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl px-4 py-2.5" style={{ backgroundColor: '#EDFFF4', border: '1px solid #75B78133' }}>
              <div>
                <p className="text-xl font-bold text-teal">{aplicados.length}</p>
                <p className="text-xs text-gray-500">Aplicados</p>
              </div>
              <div className="w-px h-8" style={{ backgroundColor: '#75B78133' }} />
              <div>
                <p className="text-xl font-bold" style={{ color: '#264534' }}>
                  {totalAplicado > 0 ? `$${totalAplicado.toLocaleString('es-AR')}` : '—'}
                </p>
                <p className="text-xs text-gray-500">Total aplicado</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Cargando...</div>
          ) : descuentos.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              {mesFiltro ? `No hay descuentos para ${formatMes(mesFiltro)}` : 'No hay descuentos registrados'}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Mes</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">N° Caso</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Nombre psicólogo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Mail psicólogo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Nombre paciente</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Motivo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Monto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Mensaje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {descuentos.map(d => (
                  <tr key={d.id} className={`transition-colors ${d.estado === 'Aplicado' ? 'bg-gray-50/50' : 'hover:bg-[#FEFAF5]/60'}`}>
                    <td className="px-4 py-3 font-medium text-gray-700 whitespace-nowrap">{formatMes(d.mes || '')}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{d.nro_caso}</td>
                    <td className="px-4 py-3">
                      <span className={d.estado === 'Aplicado' ? 'text-gray-400' : 'font-medium text-gray-800'}>
                        {d.psi_nombre || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{d.psi_mail || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{d.pac_nombre || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[180px]">
                      <span className="truncate block text-xs" title={d.motivo ?? ''}>{d.motivo}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`font-semibold ${d.monto ? (d.estado === 'Aplicado' ? 'text-gray-400' : 'text-gray-800') : 'text-gray-300'}`}>
                        {d.monto ? `$${Number(d.monto).toLocaleString('es-AR')}` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {d.estado === 'Pendiente' ? (
                        <button
                          onClick={() => marcarAplicado(d.id!)}
                          disabled={updating === d.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-teal text-white text-xs font-medium rounded-lg hover:bg-teal/90 disabled:opacity-50 transition-colors"
                        >
                          {updating === d.id ? (
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          Marcar aplicado
                        </button>
                      ) : d.estado === 'Aplicado' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal/10 text-teal text-xs font-medium rounded-lg">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Aplicado
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs rounded-lg">{d.estado}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => copiarMensaje(d)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                          copiedId === d.id
                            ? 'bg-[#EDFFF4] text-[#264534] border-[#75B781]'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-[#FFF0EE] hover:text-[#c0503a] hover:border-[#F29683]'
                        }`}
                      >
                        {copiedId === d.id ? (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            ¡Copiado!
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copiar mensaje
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

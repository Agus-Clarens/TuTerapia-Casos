'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { CREADO_POR, ESTADOS, AREA_BADGE, getAreaFromAutor } from '@/lib/tipos-caso'
import { Caso, CasoActualizacion } from '@/types'

interface Props {
  caso: Caso
  onRefresh: () => void
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `hace ${days}d`
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

const AREA_BUBBLE: Record<string, string> = {
  Admin: 'bg-blue-50 border-blue-100',
  Talent: 'bg-purple-50 border-purple-100',
  CX: 'bg-verde-medio/10 border-verde-medio/20',
  'Admin+Talent': 'bg-orange-50 border-orange-100',
  General: 'bg-gray-50 border-gray-100',
}

export default function HiloCaso({ caso, onRefresh }: Props) {
  const [updates, setUpdates] = useState<CasoActualizacion[]>([])
  const [loadingThread, setLoadingThread] = useState(true)
  const [autor, setAutor] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cambiarEstado, setCambiarEstado] = useState(false)
  const [nuevoEstado, setNuevoEstado] = useState(caso.estado_general)
  const [saving, setSaving] = useState(false)

  const fetchUpdates = useCallback(async () => {
    const { data } = await supabase
      .from('caso_actualizaciones')
      .select('*')
      .eq('caso_id', caso.id!)
      .order('created_at', { ascending: true })
    if (data) setUpdates(data as CasoActualizacion[])
    setLoadingThread(false)
  }, [caso.id])

  useEffect(() => {
    setNuevoEstado(caso.estado_general)
    fetchUpdates()
  }, [caso.id, caso.estado_general, fetchUpdates])

  async function submit() {
    if (!autor || !mensaje.trim()) return
    setSaving(true)
    const area = getAreaFromAutor(autor)

    await supabase.from('caso_actualizaciones').insert([{
      caso_id: caso.id!,
      autor,
      area,
      mensaje: mensaje.trim(),
    }])

    const caseUpdate: Record<string, string> = { updated_at: new Date().toISOString() }
    if (cambiarEstado && nuevoEstado !== caso.estado_general) {
      caseUpdate.estado_general = nuevoEstado
    }
    await supabase.from('casos').update(caseUpdate).eq('id', caso.id!)

    setMensaje('')
    setCambiarEstado(false)
    await fetchUpdates()
    onRefresh()
    setSaving(false)
  }

  const isClosed = caso.estado_general === 'Cerrado'

  return (
    <div className="border-t border-gray-100 px-5 pt-4 pb-5">
      {/* Thread */}
      {loadingThread ? (
        <div className="text-xs text-gray-400 py-2">Cargando hilo...</div>
      ) : updates.length === 0 ? (
        <p className="text-xs text-gray-400 italic py-2 mb-3">Sin actualizaciones todavía. Sé el primero en escribir.</p>
      ) : (
        <div className="space-y-3 mb-4">
          {updates.map(u => {
            const bubbleClass = AREA_BUBBLE[u.area] || AREA_BUBBLE.General
            const areaClass = AREA_BADGE[u.area] || AREA_BADGE.General
            const initial = u.autor.charAt(0).toUpperCase()
            return (
              <div key={u.id} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-verde-oscuro/10 flex items-center justify-center text-xs font-bold text-verde-oscuro flex-shrink-0 mt-0.5">
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-gray-700">{u.autor}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${areaClass}`}>{u.area}</span>
                    <span className="text-xs text-gray-400">{timeAgo(u.created_at!)}</span>
                  </div>
                  <p className={`text-sm text-gray-700 rounded-xl px-3 py-2 border ${bubbleClass} leading-relaxed`}>
                    {u.mensaje}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Form */}
      {!isClosed && (
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 space-y-2.5">
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={autor}
              onChange={e => setAutor(e.target.value)}
              className="text-sm flex-1 min-w-[160px]"
            >
              <option value="">¿Quién escribe?</option>
              {CREADO_POR.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={cambiarEstado}
                onChange={e => setCambiarEstado(e.target.checked)}
                className="w-3.5 h-3.5 accent-verde-oscuro"
              />
              <span className="text-xs text-gray-500">Cambiar estado</span>
            </label>
            {cambiarEstado && (
              <select
                value={nuevoEstado}
                onChange={e => setNuevoEstado(e.target.value)}
                className="text-xs"
              >
                {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            )}
          </div>
          <textarea
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            rows={2}
            placeholder="Escribir actualización..."
            className="resize-none text-sm w-full bg-white"
          />
          <div className="flex justify-end">
            <button
              onClick={submit}
              disabled={saving || !autor || !mensaje.trim()}
              className="px-4 py-1.5 bg-teal text-white text-xs font-semibold rounded-lg hover:bg-teal/90 disabled:opacity-40 transition-colors"
            >
              {saving ? 'Guardando...' : 'Agregar actualización'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

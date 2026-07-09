'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { STATUS_COLORS, calcularEstadoGlobal, CARGADO_POR } from '../lib/constants'

export interface Caso {
  id: string; nro_caso: string; fecha: string; cargado_por: string; pais: string
  pac_nombre: string; pac_mail: string; psi_nombre: string; psi_mail: string
  tipo_caso: string; area: string; descripcion: string; estado: string
  estado_admin: string; estado_talent: string; estado_cx: string
}
interface Act { id: string; autor: string; texto: string; created_at: string }

function SectorBadge({ label, estado }: { label: string; estado: string }) {
  const color = estado === 'Cerrado' ? '#75B781' : estado === 'En curso' ? '#F97316' : '#3B82F6'
  return (
    <span style={{ background: color, color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600, marginRight: 4, display: 'inline-block' }}>
      {label}: {estado || 'Pendiente'}
    </span>
  )
}

function accionColor(tag: string) {
  if (tag.includes('Cerrar')) return '#75B781'
  if (tag === 'En curso') return '#F97316'
  return '#3B82F6'
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  return `hace ${Math.floor(hrs / 24)}d`
}

export function CasoCard({
  caso, onUpdate, sector, showDelete
}: {
  caso: Caso
  onUpdate: () => void
  sector: 'admin' | 'talent' | 'cx' | 'todos'
  showDelete?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const [acts, setActs] = useState<Act[]>([])
  const [texto, setTexto] = useState('')
  const [autor, setAutor] = useState(CARGADO_POR[0])
  const [accion, setAccion] = useState('Actualización')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [actsLoaded, setActsLoaded] = useState(false)

  const isCerrado = caso.estado === 'Cerrado'
  const bg = STATUS_COLORS[caso.estado] || '#3B82F6'

  const accionesPorSector: Record<string, string[]> = {
    admin: ['Actualización', 'En curso', 'Cerrar para Admin'],
    talent: ['Actualización', 'En curso', 'Cerrar para Talent'],
    cx: ['Actualización'],
    todos: ['Actualización', 'En curso', 'Cerrar para Admin', 'Cerrar para Talent', 'Cerrar para CX'],
  }
  const acciones = accionesPorSector[sector] || ['Actualización']

  async function loadActs() {
    const { data } = await supabase.from('caso_actualizaciones').select('*').eq('caso_id', caso.id).order('created_at', { ascending: true })
    if (data) { setActs(data); setActsLoaded(true) }
  }

  async function handleAgregar() {
    if (!texto.trim()) return
    await supabase.from('caso_actualizaciones').insert({ caso_id: caso.id, autor, texto: `[${accion}] ${texto}` })
    const updates: Record<string, string> = {}
    if (accion === 'En curso') {
      if (sector === 'admin') updates.estado_admin = 'En curso'
      if (sector === 'talent') updates.estado_talent = 'En curso'
      if (sector === 'cx') updates.estado_cx = 'En curso'
    }
    if (accion === 'Cerrar para Admin') updates.estado_admin = 'Cerrado'
    if (accion === 'Cerrar para Talent') updates.estado_talent = 'Cerrado'
    if (accion === 'Cerrar para CX') updates.estado_cx = 'Cerrado'
    if (Object.keys(updates).length > 0) {
      const ea = updates.estado_admin ?? (caso.estado_admin || 'Pendiente')
      const et = updates.estado_talent ?? (caso.estado_talent || 'Pendiente')
      const ec = updates.estado_cx ?? (caso.estado_cx || 'Pendiente')
      updates.estado = calcularEstadoGlobal(caso.area, ea, et, ec)
      await supabase.from('casos').update(updates).eq('id', caso.id)
      onUpdate()
    }
    setTexto('')
    loadActs()
  }

  async function deleteCaso() {
    await supabase.from('descuentos_psicologo').delete().eq('caso_id', caso.id)
    await supabase.from('caso_actualizaciones').delete().eq('caso_id', caso.id)
    await supabase.from('casos').delete().eq('id', caso.id)
    onUpdate()
  }

  useEffect(() => { if (expanded && !actsLoaded) loadActs() }, [expanded])

  return (
    <div style={{ background: '#fff', borderRadius: 12, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', opacity: isCerrado ? 0.55 : 1, borderLeft: `4px solid ${bg}`, overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: expanded ? '1px solid #F3F4F6' : 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#264534', fontSize: 14 }}>{caso.nro_caso}</span>
            <span style={{ fontSize: 11, background: '#F3F4F6', borderRadius: 4, padding: '2px 7px', fontWeight: 500, color: '#374151' }}>{caso.area}</span>
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>{caso.fecha}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
            {caso.area.includes('Admin') && <SectorBadge label="Admin" estado={caso.estado_admin || 'Pendiente'} />}
            {caso.area.includes('Talent') && <SectorBadge label="Talent" estado={caso.estado_talent || 'Pendiente'} />}
            {caso.area === 'CX' && <SectorBadge label="CX" estado={caso.estado_cx || 'Pendiente'} />}
            {showDelete && (
              confirmDelete
                ? <><button onClick={deleteCaso} style={{ background: '#EF4444', color: '#fff', border: 'none', borderRadius: 5, padding: '3px 9px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>Confirmar</button><button onClick={() => setConfirmDelete(false)} style={{ background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 5, padding: '3px 9px', fontSize: 11, cursor: 'pointer' }}>Cancelar</button></>
                : <button onClick={() => setConfirmDelete(true)} style={{ background: 'transparent', color: '#D1D5DB', border: '1px solid #E5E7EB', borderRadius: 5, padding: '3px 9px', fontSize: 11, cursor: 'pointer' }}>Eliminar</button>
            )}
          </div>
        </div>

        {/* Info del caso */}
        <div style={{ marginTop: 10, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ fontWeight: 600, color: '#111827' }}>{caso.tipo_caso}</div>
          <div style={{ color: '#374151' }}>
            <span style={{ color: '#6B7280', fontSize: 11, fontWeight: 500 }}>PACIENTE </span>
            {caso.pac_nombre}{caso.pac_mail && <span style={{ color: '#9CA3AF' }}> · {caso.pac_mail}</span>}
          </div>
          {caso.psi_nombre && (
            <div style={{ color: '#374151' }}>
              <span style={{ color: '#6B7280', fontSize: 11, fontWeight: 500 }}>PSICÓLOGO </span>
              {caso.psi_nombre}{caso.psi_mail && <span style={{ color: '#9CA3AF' }}> · {caso.psi_mail}</span>}
            </div>
          )}
          <div style={{ color: '#374151' }}>
            <span style={{ color: '#6B7280', fontSize: 11, fontWeight: 500 }}>PAÍS </span>{caso.pais}
          </div>
          <div style={{ color: '#6B7280', fontStyle: 'italic', marginTop: 2 }}>{caso.descripcion}</div>
          <div style={{ color: '#9CA3AF', fontSize: 11, marginTop: 2 }}>Cargado por {caso.cargado_por}</div>
        </div>

        {/* Toggle hilo */}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ marginTop: 10, background: 'transparent', border: 'none', color: '#007271', fontSize: 12, cursor: 'pointer', fontWeight: 600, padding: 0 }}
        >
          {expanded ? '▲ Ocultar hilo' : `▼ Ver actualizaciones${actsLoaded && acts.length > 0 ? ` (${acts.length})` : ''}`}
        </button>
      </div>

      {/* Hilo expandido */}
      {expanded && (
        <div style={{ padding: '12px 16px', background: '#FAFAFA' }}>
          {acts.length === 0
            ? <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 12px' }}>Sin actualizaciones aún.</p>
            : <div style={{ marginBottom: 12 }}>
                {acts.map(a => {
                  const m = a.texto.match(/^\[([^\]]+)\] ([\s\S]+)$/)
                  const tag = m ? m[1] : 'Actualización'
                  const msg = m ? m[2] : a.texto
                  return (
                    <div key={a.id} style={{ marginBottom: 8, padding: '8px 12px', background: '#fff', borderRadius: 8, fontSize: 12, borderLeft: `3px solid ${accionColor(tag)}`, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, color: '#264534' }}>{a.autor}</span>
                        <span style={{ background: accionColor(tag), color: '#fff', borderRadius: 4, padding: '1px 7px', fontSize: 10, fontWeight: 600 }}>{tag}</span>
                        <span style={{ color: '#9CA3AF', fontSize: 11 }}>{timeAgo(a.created_at)}</span>
                      </div>
                      <p style={{ margin: 0, color: '#374151', lineHeight: 1.5 }}>{msg}</p>
                    </div>
                  )
                })}
              </div>
          }

          {!isCerrado && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: acts.length > 0 ? '1px solid #F3F4F6' : 'none', paddingTop: acts.length > 0 ? 12 : 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: 3 }}>Quién actúa</label>
                  <select value={autor} onChange={e => setAutor(e.target.value)} style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 6, padding: '7px 10px', fontSize: 12, background: '#fff' }}>
                    {CARGADO_POR.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: 3 }}>Acción</label>
                  <select value={accion} onChange={e => setAccion(e.target.value)} style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 6, padding: '7px 10px', fontSize: 12, background: '#fff' }}>
                    {acciones.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <textarea
                value={texto}
                onChange={e => setTexto(e.target.value)}
                placeholder="Describir la acción tomada..."
                rows={2}
                style={{ border: '1.5px solid #E5E7EB', borderRadius: 6, padding: '7px 10px', fontSize: 12, resize: 'vertical', fontFamily: 'inherit', background: '#fff' }}
              />
              <button
                onClick={handleAgregar}
                style={{ background: '#007271', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontSize: 12, cursor: 'pointer', fontWeight: 600, alignSelf: 'flex-start' }}
              >
                Agregar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CasoCard

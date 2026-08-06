'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const CARGADO_POR = ['Sol CX','Agus Admin','Sofi Admin','Orne Talent','Caro Talent','Belu Talent','Flor Business','Nico Director','Nacho Director']

// Todos los tipos existentes, agrupados por área, para el dropdown de reasignación
const TIPOS_POR_AREA_REASIGNAR: Record<string, string[]> = {
  'Admin': ['Link de pago','Devolucion dentro del plazo','Devolucion fuera del plazo sin falla','Envio de factura','Problema con factura','Cupon no aplicado','Pago duplicado','Transferencia sesiones','Contracargo MP','Cambiar modalidad','Cambiar modalidad de sesiones (psicologo ya confirmo)','Ajuste de modalidad de pago','Otro'],
  'Talent': ['Disponibilidad agenda','No confirma sesion','Cancelacion psicologo','Calendario incorrecto','Sesiones pendientes aprobacion','Psicologo fantasmeado','Pocas horas','Sin horas','Mejora perfil','Psicologo lleva pacientes por fuera de plataforma','Otro'],
  'Admin+Talent': ['Devolucion fuera plazo con falla','Sesion sin consentimiento','Sesion marcada realizada no ocurrio','Descontar sesion','Desvinculacion con pacientes activos','Cobra fuera plataforma','Horario incorrecto con dano','Otro'],
  'CX': ['Cargo mal los datos en la factura','Contactar retencion','Derivacion psicologo','Mala experiencia devolucion autonoma','Cancelacion por paciente','Problemas con el cupon','Contacto con la empresa','Otro'],
  'Business': ['Problemas con el cupon','Contacto con la empresa','Alianza nueva','Renovacion contrato','Reporte a empresa','Seguimiento de facturacion empresa','Otro'],
}

const STATUS_COLORS: any = { 'Nuevo': '#3B82F6', 'En curso': '#F97316', 'Cerrado': '#75B781' }

function calcularEstadoGlobal(area: string, ea: string, et: string, ec: string, eb?: string) {
  const a = ea||'Pendiente', t = et||'Pendiente', c = ec||'Pendiente', b = eb||'Pendiente'
  if (area === 'Admin') return a==='Cerrado'?'Cerrado':a==='En curso'?'En curso':'Nuevo'
  if (area === 'Talent') return t==='Cerrado'?'Cerrado':t==='En curso'?'En curso':'Nuevo'
  if (area === 'CX') return c==='Cerrado'?'Cerrado':c==='En curso'?'En curso':'Nuevo'
  if (area === 'Business') return b==='Cerrado'?'Cerrado':b==='En curso'?'En curso':'Nuevo'
  if (area === 'Admin+Talent') {
    if (a==='Cerrado'&&t==='Cerrado') return 'Cerrado'
    if (a==='En curso'||t==='En curso'||a==='Cerrado'||t==='Cerrado') return 'En curso'
    return 'Nuevo'
  }
  return 'Nuevo'
}

function Badge({ label, estado }: any) {
  const sinAbrir = !estado || estado==='Pendiente'
  const color = estado==='Cerrado'?'#75B781':estado==='En curso'?'#F97316':sinAbrir?'#9CA3AF':'#3B82F6'
  const texto = sinAbrir ? 'Sin abrir' : estado
  return <span style={{ background:color, color:'#fff', borderRadius:6, padding:'2px 8px', fontSize:11, fontWeight:600, marginRight:4 }}>{label}: {texto}</span>
}

function tagColor(tag: string) {
  if (tag.includes('Cerrar')) return '#75B781'
  if (tag==='Reabierto') return '#F59E0B'
  if (tag==='En curso') return '#F97316'
  return '#3B82F6'
}

function timeAgo(d: string) {
  const m = Math.floor((Date.now()-new Date(d).getTime())/60000)
  if (m<1) return 'ahora'; if (m<60) return `hace ${m}m`
  if (m<1440) return `hace ${Math.floor(m/60)}h`; return `hace ${Math.floor(m/1440)}d`
}

function sectorDeAutor(autor: string) {
  if (autor.includes('Admin')) return 'admin'
  if (autor.includes('Talent')) return 'talent'
  if (autor.includes('CX')) return 'cx'
  if (autor.includes('Business')) return 'business'
  if (autor.includes('Director')) return 'admin' // directores actúan como admin
  return null
}

function getAcciones(sector: string, area: string) {
  // Todos ven todo, cada sector ve sus propias acciones + todas las de actualización
  if (sector === 'todos') return ['Actualización','En curso','Cerrar para Admin','Cerrar para Talent','Cerrar para CX','Cerrar para Business']
  if (sector === 'admin') return ['Actualización','En curso','Cerrar para Admin']
  if (sector === 'talent') return ['Actualización','En curso','Cerrar para Talent']
  if (sector === 'cx') return ['Actualización','En curso','Cerrar para CX']
  if (sector === 'business') return ['Actualización','En curso','Cerrar para Business']
  return ['Actualización']
}


function autorColor(autor: string) {
  if (autor.includes('Agus')) return '#F472B6'      // rosa (distinto del naranja de estado)
  if (autor.includes('Sol')) return '#C084FC'        // lila
  if (autor.includes('Belu') || autor.includes('Orne') || autor.includes('Caro')) return '#FCD07F' // amarillo
  if (autor.includes('Sofi')) return '#86EFAC'       // verde claro
  if (autor.includes('Flor')) return '#5EEAD4'       // turquesa (Business)
  if (autor.includes('Nico') || autor.includes('Nacho')) return '#93C5FD' // azul claro
  return '#E5E7EB'
}


function estadoCard(estado: string) {
  if (estado === 'Nuevo') return { bg: '#EFF6FF', border: '#3B82F6' }
  if (estado === 'En curso') return { bg: '#FFF4EC', border: '#F97316' }
  if (estado === 'Cerrado') return { bg: '#F0FDF4', border: '#75B781' }
  return { bg: '#F9FAFB', border: '#9CA3AF' }
}



export function CasoCard({ caso, onUpdate, sector, showDelete }: any) {
  const [open, setOpen] = useState(false)
  const [acts, setActs] = useState<any[]>([])
  const [texto, setTexto] = useState('')
  const [autor, setAutor] = useState(CARGADO_POR[0])
  const [accion, setAccion] = useState('Actualización')
  const [del, setDel] = useState(false)
  const [reasignar, setReasignar] = useState(false)
  const [adjuntos, setAdjuntos] = useState<any[]>([])
  const [subiendo, setSubiendo] = useState(false)
  const [nuevaArea, setNuevaArea] = useState<string>(caso.area || 'Admin')
  const [nuevoTipo, setNuevoTipo] = useState<string>('')

  const cerrado = caso.estado==='Cerrado'
  const { bg: bgCard, border: bdCard } = estadoCard(caso.estado)
  const acciones = getAcciones(sector, caso.area)

  async function loadActs() {
    const { data } = await supabase.from('caso_actualizaciones').select('*').eq('caso_id',caso.id).order('created_at',{ascending:true})
    if (data) setActs(data)
    const { data: adj } = await supabase.from('caso_adjuntos').select('*').eq('caso_id',caso.id).order('created_at',{ascending:false})
    if (adj) setAdjuntos(adj)
  }

  async function subirAdjunto(e: any) {
    const file = e.target.files?.[0]
    if (!file) return
    setSubiendo(true)
    const safeName = file.name.replace(/[^\w.\-]+/g, '_')
    const path = `${caso.id}/${crypto.randomUUID()}-${safeName}`
    const { error: upErr } = await supabase.storage.from('casos-adjuntos').upload(path, file, { upsert:false })
    if (upErr) { alert('Error al subir: '+upErr.message); setSubiendo(false); return }
    await supabase.from('caso_adjuntos').insert({ caso_id: caso.id, autor, file_path: path, file_name: file.name })
    await supabase.from('caso_actualizaciones').insert({ caso_id:caso.id, autor, texto:`[Adjunto] ${autor} adjuntó "${file.name}"` })
    e.target.value = ''
    setSubiendo(false)
    loadActs()
  }

  async function descargarAdjunto(a: any) {
    const { data, error } = await supabase.storage.from('casos-adjuntos').createSignedUrl(a.file_path, 60)
    if (error || !data) { alert('No se pudo generar el link.'); return }
    window.open(data.signedUrl, '_blank')
  }

  async function eliminarAdjunto(a: any) {
    if (!confirm(`¿Eliminar el adjunto "${a.file_name}"?`)) return
    await supabase.storage.from('casos-adjuntos').remove([a.file_path])
    await supabase.from('caso_adjuntos').delete().eq('id', a.id)
    loadActs()
  }

  async function agregar() {
    if (!texto.trim() && accion === 'Actualización') return
    const textoFinal = texto.trim() || (accion === 'En curso' ? `Marcó en curso` : '')
    if (!textoFinal) return
    await supabase.from('caso_actualizaciones').insert({ caso_id:caso.id, autor, texto:`[${accion}] ${textoFinal}` })
    const u: any = {}
    // Cuando estamos en "todos", el sector real que actúa se infiere del autor,
    // no se marca en curso todos los sectores del área.
    const sectorEfectivo = sector === 'todos' ? sectorDeAutor(autor) : sector
    if (accion==='En curso' || accion==='Actualización') {
      if (sectorEfectivo==='admin' && caso.area.includes('Admin') && caso.estado_admin !== 'Cerrado') u.estado_admin='En curso'
      if (sectorEfectivo==='talent' && caso.area.includes('Talent') && caso.estado_talent !== 'Cerrado') u.estado_talent='En curso'
      if (sectorEfectivo==='cx' && caso.area==='CX' && caso.estado_cx !== 'Cerrado') u.estado_cx='En curso'
      if (sectorEfectivo==='business' && caso.area==='Business' && caso.estado_business !== 'Cerrado') u.estado_business='En curso'
    }
    if (accion==='Cerrar para Admin') u.estado_admin='Cerrado'
    if (accion==='Cerrar para Talent') u.estado_talent='Cerrado'
    if (accion==='Cerrar para CX') u.estado_cx='Cerrado'
    if (accion==='Cerrar para Business') u.estado_business='Cerrado'
    if (Object.keys(u).length>0) {
      u.estado = calcularEstadoGlobal(caso.area, u.estado_admin??caso.estado_admin, u.estado_talent??caso.estado_talent, u.estado_cx??caso.estado_cx, u.estado_business??caso.estado_business)
      u.updated_at = new Date().toISOString(); u.last_updated_by = autor
      await supabase.from('casos').update(u).eq('id',caso.id)
      onUpdate()
      if (u.estado === 'Cerrado' && caso.estado !== 'Cerrado') {
        fetch('/api/notify-slack', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ evento:'cerrado', nro_caso: caso.nro_caso, area: caso.area, tipo_caso: caso.tipo_caso, pac_nombre: caso.pac_nombre, cargado_por: autor, pais: caso.pais }) })
      }
    } else {
      await supabase.from('casos').update({ updated_at: new Date().toISOString(), last_updated_by: autor }).eq('id',caso.id)
      onUpdate()
    }
    setTexto(''); loadActs()
  }

  async function eliminar() {
    await supabase.from('descuentos_psicologo').delete().eq('caso_id',caso.id)
    await supabase.from('caso_actualizaciones').delete().eq('caso_id',caso.id)
    await supabase.from('casos').delete().eq('id',caso.id)
    onUpdate()
  }

  async function hacerReasignacion() {
    if (!nuevoTipo) return
    // Registrar la reasignación en el hilo
    const nota = `[Reasignación] ${autor} reasignó el caso: ${caso.area} · "${caso.tipo_caso}" → ${nuevaArea} · "${nuevoTipo}"`
    await supabase.from('caso_actualizaciones').insert({ caso_id: caso.id, autor, texto: nota })
    // Reset de estados: los sectores nuevos arrancan Pendiente, los que ya no aplican también
    const u: any = {
      area: nuevaArea,
      tipo_caso: nuevoTipo,
      estado_admin: nuevaArea.includes('Admin') ? (caso.estado_admin === 'Cerrado' ? 'Cerrado' : 'Pendiente') : 'Pendiente',
      estado_talent: nuevaArea.includes('Talent') ? (caso.estado_talent === 'Cerrado' ? 'Cerrado' : 'Pendiente') : 'Pendiente',
      estado_cx: nuevaArea === 'CX' ? (caso.estado_cx === 'Cerrado' ? 'Cerrado' : 'Pendiente') : 'Pendiente',
      estado_business: nuevaArea === 'Business' ? (caso.estado_business === 'Cerrado' ? 'Cerrado' : 'Pendiente') : 'Pendiente',
    }
    u.estado = calcularEstadoGlobal(nuevaArea, u.estado_admin, u.estado_talent, u.estado_cx, u.estado_business)
    u.updated_at = new Date().toISOString(); u.last_updated_by = autor
    await supabase.from('casos').update(u).eq('id', caso.id)
    setReasignar(false)
    setNuevoTipo('')
    onUpdate()
    loadActs()
  }

  async function reabrir() {
    const u: any = {}
    if (caso.area?.includes('Admin') && caso.estado_admin === 'Cerrado') u.estado_admin = 'En curso'
    if (caso.area?.includes('Talent') && caso.estado_talent === 'Cerrado') u.estado_talent = 'En curso'
    if (caso.area === 'CX' && caso.estado_cx === 'Cerrado') u.estado_cx = 'En curso'
    if (caso.area === 'Business' && caso.estado_business === 'Cerrado') u.estado_business = 'En curso'
    u.estado = calcularEstadoGlobal(caso.area, u.estado_admin??caso.estado_admin, u.estado_talent??caso.estado_talent, u.estado_cx??caso.estado_cx, u.estado_business??caso.estado_business)
    u.updated_at = new Date().toISOString(); u.last_updated_by = autor
    u.reabierto = true
    await supabase.from('caso_actualizaciones').insert({ caso_id: caso.id, autor, texto: `[Reabierto] ${autor} reabrió el caso` })
    await supabase.from('casos').update(u).eq('id', caso.id)
    fetch('/api/notify-slack', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ evento:'reabierto', nro_caso: caso.nro_caso, area: caso.area, tipo_caso: caso.tipo_caso, pac_nombre: caso.pac_nombre, cargado_por: autor, pais: caso.pais }) })
    onUpdate()
    loadActs()
  }

  useEffect(()=>{ if(open) loadActs() },[open])

  return (
    <div style={{ background:bgCard, borderRadius:12, marginBottom:12, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', opacity:cerrado?0.6:1, borderLeft:`5px solid ${bdCard}`, overflow:'hidden' }}>
      <div style={{ padding:'14px 16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <span style={{ fontWeight:700, color:'#264534', fontSize:14 }}>{caso.nro_caso}</span>
            <span style={{ fontSize:11, background:'#F3F4F6', borderRadius:4, padding:'2px 7px', color:'#374151' }}>{caso.area}</span>
            <span style={{ fontSize:11, color:'#9CA3AF' }}>{caso.fecha}</span>
            {caso.updated_at && (new Date(caso.updated_at).getTime() - new Date(caso.created_at).getTime() > 60000) && (
              <span style={{ fontSize:10, background:'#FEF3C7', color:'#92400E', borderRadius:5, padding:'2px 7px', fontWeight:600 }}>● Actualizado por {caso.last_updated_by||'?'} · {timeAgo(caso.updated_at)}</span>
            )}
            {caso.reabierto && (
              <span style={{ fontSize:10, background:'#FEE2E2', color:'#B91C1C', borderRadius:5, padding:'2px 7px', fontWeight:600 }}>↺ Reabierto</span>
            )}
            {(caso.area === 'Talent' || caso.area === 'Admin+Talent') && caso.talent_accion !== null && caso.talent_accion !== undefined && (
              caso.talent_accion
                ? <span style={{ fontSize:10, background:'#7C3AED', color:'#fff', borderRadius:5, padding:'2px 7px', fontWeight:700 }}>Accionar</span>
                : <span style={{ fontSize:10, background:'#FCE7F3', color:'#BE185D', borderRadius:5, padding:'2px 7px', fontWeight:700 }}>Aviso</span>
            )}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:4, flexWrap:'wrap' }}>
            {caso.area?.includes('Admin') && <Badge label="Admin" estado={caso.estado_admin||'Pendiente'} />}
            {caso.area?.includes('Talent') && <Badge label="Talent" estado={caso.estado_talent||'Pendiente'} />}
            {caso.area==='CX' && <Badge label="CX" estado={caso.estado_cx||'Pendiente'} />}
            {caso.area==='Business' && <Badge label="Business" estado={caso.estado_business||'Pendiente'} />}
            {showDelete && (del
              ? <><button onClick={eliminar} style={{ background:'#EF4444', color:'#fff', border:'none', borderRadius:5, padding:'3px 9px', fontSize:11, cursor:'pointer', fontWeight:600 }}>Confirmar</button><button onClick={()=>setDel(false)} style={{ background:'#F3F4F6', color:'#374151', border:'none', borderRadius:5, padding:'3px 9px', fontSize:11, cursor:'pointer' }}>Cancelar</button></>
              : <button onClick={()=>setDel(true)} style={{ background:'transparent', color:'#D1D5DB', border:'1px solid #E5E7EB', borderRadius:5, padding:'3px 9px', fontSize:11, cursor:'pointer' }}>Eliminar</button>
            )}
          </div>
        </div>
        <div style={{ marginTop:10, fontSize:13, display:'flex', flexDirection:'column', gap:3 }}>
          <div style={{ fontWeight:600, color:'#111827' }}>{caso.tipo_caso}</div>
          <div style={{ color:'#374151' }}><span style={{ color:'#9CA3AF', fontSize:11 }}>PACIENTE </span>{caso.pac_nombre}{caso.pac_mail&&<span style={{ color:'#9CA3AF' }}> · {caso.pac_mail}</span>}</div>
          {caso.psi_nombre&&<div style={{ color:'#374151' }}><span style={{ color:'#9CA3AF', fontSize:11 }}>PSICÓLOGO </span>{caso.psi_nombre}{caso.psi_mail&&<span style={{ color:'#9CA3AF' }}> · {caso.psi_mail}</span>}</div>}
          <div style={{ color:'#374151' }}><span style={{ color:'#9CA3AF', fontSize:11 }}>PAÍS </span>{caso.pais}</div>
          <div style={{ color:'#6B7280', fontStyle:'italic', marginTop:2 }}>{caso.descripcion}</div>
          <div style={{ color:'#9CA3AF', fontSize:11 }}>Cargado por {caso.cargado_por}</div>
        </div>
        <button onClick={()=>{ setOpen(!open); if(!open) loadActs() }} style={{ marginTop:10, background:'transparent', border:'none', color:'#007271', fontSize:12, cursor:'pointer', fontWeight:600, padding:0 }}>
          {open?'▲ Ocultar hilo':`▼ Ver actualizaciones${acts.length>0?` (${acts.length})`:''}`}
        </button>
      </div>
      {open && (
        <div style={{ padding:'0 16px 16px', background:'rgba(255,255,255,0.6)', borderTop:'1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ paddingTop:12 }}>
            {acts.length===0?<p style={{ fontSize:12, color:'#9CA3AF', margin:'0 0 12px' }}>Sin actualizaciones aún.</p>
              :<div style={{ marginBottom:12 }}>{acts.map((a:any)=>{
                const m=a.texto.match(/^\[([^\]]+)\] ([\s\S]+)$/)
                const tag=m?m[1]:'Actualización'; const msg=m?m[2]:a.texto
                return (
                  <div key={a.id} style={{ marginBottom:8, padding:'8px 12px', background:'#fff', borderRadius:8, fontSize:12, borderLeft:`3px solid ${tagColor(tag)}` }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginBottom:4 }}>
                      <span style={{ background:autorColor(a.autor), color:'#374151', borderRadius:6, padding:'2px 8px', fontSize:11, fontWeight:700 }}>{a.autor}</span>
                      <span style={{ background:tagColor(tag), color:'#fff', borderRadius:4, padding:'1px 7px', fontSize:10, fontWeight:600 }}>{tag}</span>
                      <span style={{ color:'#9CA3AF', fontSize:11 }}>{timeAgo(a.created_at)}</span>
                    </div>
                    <p style={{ margin:0, color:'#374151', lineHeight:1.5 }}>{msg}</p>
                  </div>
                )
              })}</div>
            }
            <div style={{ marginBottom:12, borderTop:acts.length>0?'1px solid #F3F4F6':'none', paddingTop:acts.length>0?12:0 }}>
              <div style={{ fontSize:11, color:'#6B7280', fontWeight:600, marginBottom:6 }}>📎 Adjuntos {adjuntos.length>0 && `(${adjuntos.length})`}</div>
              {adjuntos.length>0 && (
                <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:8 }}>
                  {adjuntos.map((a:any)=>(
                    <div key={a.id} style={{ display:'flex', alignItems:'center', gap:8, background:'#fff', borderRadius:8, padding:'6px 10px', fontSize:12 }}>
                      <span style={{ flex:1, color:'#374151', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.file_name}</span>
                      <span style={{ color:'#9CA3AF', fontSize:10 }}>{a.autor}</span>
                      <button onClick={()=>descargarAdjunto(a)} style={{ background:'#EFF6FF', color:'#1D4ED8', border:'none', borderRadius:5, padding:'4px 9px', fontSize:11, cursor:'pointer', fontWeight:600 }}>Ver</button>
                      <button onClick={()=>eliminarAdjunto(a)} style={{ background:'transparent', color:'#EF4444', border:'none', fontSize:11, cursor:'pointer' }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              <label style={{ display:'inline-block', background: subiendo?'#E5E7EB':'#F3F4F6', color:'#374151', borderRadius:6, padding:'7px 14px', fontSize:12, cursor: subiendo?'not-allowed':'pointer', fontWeight:600, border:'1px dashed #D1D5DB' }}>
                {subiendo?'Subiendo...':'📎 Adjuntar archivo / screenshot'}
                <input type="file" accept="image/*,.pdf" onChange={subirAdjunto} disabled={subiendo} style={{ display:'none' }} />
              </label>
            </div>
            {cerrado&&(
              <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', borderTop:acts.length>0?'1px solid #F3F4F6':'none', paddingTop:acts.length>0?12:0 }}>
                <select value={autor} onChange={e=>setAutor(e.target.value)} style={{ border:'1.5px solid #E5E7EB', borderRadius:6, padding:'7px 10px', fontSize:12, background:'#fff' }}>
                  {CARGADO_POR.map(p=><option key={p}>{p}</option>)}
                </select>
                <button onClick={reabrir} style={{ background:'#F59E0B', color:'#fff', border:'none', borderRadius:6, padding:'8px 16px', fontSize:12, cursor:'pointer', fontWeight:600 }}>↺ Reabrir caso</button>
              </div>
            )}
            {!cerrado&&(
              <div style={{ display:'flex', flexDirection:'column', gap:8, borderTop:acts.length>0?'1px solid #F3F4F6':'none', paddingTop:acts.length>0?12:0 }}>
                {/* Panel de reasignar sector */}
                {!reasignar ? (
                  <button onClick={()=>{ setReasignar(true); setNuevaArea(caso.area||'Admin'); setNuevoTipo('') }} style={{ background:'transparent', color:'#7C3AED', border:'1px dashed #C4B5FD', borderRadius:6, padding:'6px 12px', fontSize:11, cursor:'pointer', fontWeight:600, alignSelf:'flex-start' }}>
                    ↔ Reasignar a otro sector
                  </button>
                ) : (
                  <div style={{ background:'#FAF5FF', border:'1.5px solid #C4B5FD', borderRadius:8, padding:12, display:'flex', flexDirection:'column', gap:8 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:'#7C3AED' }}>Reasignar caso a otro sector</div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                      <div>
                        <label style={{ fontSize:11, color:'#6B7280', fontWeight:600, display:'block', marginBottom:3 }}>Nueva área</label>
                        <select value={nuevaArea} onChange={e=>{ setNuevaArea(e.target.value); setNuevoTipo('') }} style={{ width:'100%', border:'1.5px solid #E5E7EB', borderRadius:6, padding:'7px 10px', fontSize:12, background:'#fff' }}>
                          {Object.keys(TIPOS_POR_AREA_REASIGNAR).map(a=><option key={a}>{a}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize:11, color:'#6B7280', fontWeight:600, display:'block', marginBottom:3 }}>Nuevo tipo de caso</label>
                        <select value={nuevoTipo} onChange={e=>setNuevoTipo(e.target.value)} style={{ width:'100%', border:'1.5px solid #E5E7EB', borderRadius:6, padding:'7px 10px', fontSize:12, background:'#fff' }}>
                          <option value="">Seleccionar...</option>
                          {(TIPOS_POR_AREA_REASIGNAR[nuevaArea]||[]).map(t=><option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={hacerReasignacion} disabled={!nuevoTipo} style={{ background:'#7C3AED', color:'#fff', border:'none', borderRadius:6, padding:'7px 14px', fontSize:12, cursor: nuevoTipo?'pointer':'not-allowed', fontWeight:600, opacity: nuevoTipo?1:0.5 }}>Confirmar reasignación</button>
                      <button onClick={()=>{ setReasignar(false); setNuevoTipo('') }} style={{ background:'transparent', color:'#6B7280', border:'1px solid #E5E7EB', borderRadius:6, padding:'7px 14px', fontSize:12, cursor:'pointer' }}>Cancelar</button>
                    </div>
                  </div>
                )}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <div>
                    <label style={{ fontSize:11, color:'#6B7280', fontWeight:600, display:'block', marginBottom:3 }}>Quién actúa</label>
                    <select value={autor} onChange={e=>setAutor(e.target.value)} style={{ width:'100%', border:'1.5px solid #E5E7EB', borderRadius:6, padding:'7px 10px', fontSize:12, background:'#fff' }}>
                      {CARGADO_POR.map(p=><option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:11, color:'#6B7280', fontWeight:600, display:'block', marginBottom:3 }}>Acción</label>
                    <select value={accion} onChange={e=>setAccion(e.target.value)} style={{ width:'100%', border:'1.5px solid #E5E7EB', borderRadius:6, padding:'7px 10px', fontSize:12, background:'#fff' }}>
                      {acciones.map((a:string)=><option key={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
                <textarea value={texto} onChange={e=>setTexto(e.target.value)} placeholder={accion.includes("Cerrar") ? "Obligatorio: describí qué resolviste para que Sol pueda informar al paciente..." : "Describir la acción tomada..."} rows={2} style={{ border:'1.5px solid #E5E7EB', borderRadius:6, padding:'7px 10px', fontSize:12, resize:'vertical', fontFamily:'inherit', background:'#fff' }}/>
                <button onClick={agregar} style={{ background:'#007271', color:'#fff', border:'none', borderRadius:6, padding:'8px 18px', fontSize:12, cursor:'pointer', fontWeight:600, alignSelf:'flex-start' }}>Agregar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CasoCard

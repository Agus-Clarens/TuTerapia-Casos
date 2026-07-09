'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const CARGADO_POR = ['Sol CX','Agus Admin','Sofi Admin','Orne Talent','Caro Talent','Belu Talent','Nico Director','Nacho Director']

const STATUS_COLORS: any = { 'Nuevo': '#3B82F6', 'En curso': '#F97316', 'Cerrado': '#75B781' }

function calcularEstadoGlobal(area: string, ea: string, et: string, ec: string) {
  const a = ea||'Pendiente', t = et||'Pendiente', c = ec||'Pendiente'
  if (area === 'Admin') return a==='Cerrado'?'Cerrado':a==='En curso'?'En curso':'Nuevo'
  if (area === 'Talent') return t==='Cerrado'?'Cerrado':t==='En curso'?'En curso':'Nuevo'
  if (area === 'CX') return c==='Cerrado'?'Cerrado':c==='En curso'?'En curso':'Nuevo'
  if (area === 'Admin+Talent') {
    if (a==='Cerrado'&&t==='Cerrado') return 'Cerrado'
    if (a==='En curso'||t==='En curso'||a==='Cerrado'||t==='Cerrado') return 'En curso'
    return 'Nuevo'
  }
  return 'Nuevo'
}

function Badge({ label, estado }: any) {
  const color = estado==='Cerrado'?'#75B781':estado==='En curso'?'#F97316':'#3B82F6'
  return <span style={{ background:color, color:'#fff', borderRadius:6, padding:'2px 8px', fontSize:11, fontWeight:600, marginRight:4 }}>{label}: {estado||'Pendiente'}</span>
}

function tagColor(tag: string) {
  if (tag.includes('Cerrar')) return '#75B781'
  if (tag==='En curso') return '#F97316'
  return '#3B82F6'
}

function timeAgo(d: string) {
  const m = Math.floor((Date.now()-new Date(d).getTime())/60000)
  if (m<1) return 'ahora'; if (m<60) return `hace ${m}m`
  if (m<1440) return `hace ${Math.floor(m/60)}h`; return `hace ${Math.floor(m/1440)}d`
}

function getAcciones(sector: string, area: string) {
  // Todos ven todo, cada sector ve sus propias acciones + todas las de actualización
  if (sector === 'todos') return ['Actualización','En curso','Cerrar para Admin','Cerrar para Talent','Cerrar para CX']
  if (sector === 'admin') return ['Actualización','En curso','Cerrar para Admin']
  if (sector === 'talent') return ['Actualización','En curso','Cerrar para Talent']
  if (sector === 'cx') return ['Actualización','En curso','Cerrar para CX']
  return ['Actualización']
}

export function CasoCard({ caso, onUpdate, sector, showDelete }: any) {
  const [open, setOpen] = useState(false)
  const [acts, setActs] = useState<any[]>([])
  const [texto, setTexto] = useState('')
  const [autor, setAutor] = useState(CARGADO_POR[0])
  const [accion, setAccion] = useState('Actualización')
  const [del, setDel] = useState(false)

  const cerrado = caso.estado==='Cerrado'
  const bg = STATUS_COLORS[caso.estado]||'#3B82F6'
  const acciones = getAcciones(sector, caso.area)

  async function loadActs() {
    const { data } = await supabase.from('caso_actualizaciones').select('*').eq('caso_id',caso.id).order('created_at',{ascending:true})
    if (data) setActs(data)
  }

  async function agregar() {
    if (!texto.trim() && accion === 'Actualización') return
    const textoFinal = texto.trim() || (accion !== 'Actualización' ? `Cambió el estado a: ${accion}` : '')
    if (!textoFinal) return
    await supabase.from('caso_actualizaciones').insert({ caso_id:caso.id, autor, texto:`[${accion}] ${textoFinal}` })
    const u: any = {}
    if (accion==='En curso') {
      if (sector==='admin'||accion.includes('Admin')) u.estado_admin='En curso'
      if (sector==='talent'||accion.includes('Talent')) u.estado_talent='En curso'
      if (sector==='cx'||accion.includes('CX')) u.estado_cx='En curso'
      if (sector==='todos') {
        if (caso.area.includes('Admin')) u.estado_admin='En curso'
        if (caso.area.includes('Talent')) u.estado_talent='En curso'
        if (caso.area==='CX') u.estado_cx='En curso'
      }
    }
    if (accion==='Cerrar para Admin') u.estado_admin='Cerrado'
    if (accion==='Cerrar para Talent') u.estado_talent='Cerrado'
    if (accion==='Cerrar para CX') u.estado_cx='Cerrado'
    if (Object.keys(u).length>0) {
      u.estado = calcularEstadoGlobal(caso.area, u.estado_admin??caso.estado_admin, u.estado_talent??caso.estado_talent, u.estado_cx??caso.estado_cx)
      await supabase.from('casos').update(u).eq('id',caso.id)
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

  useEffect(()=>{ if(open) loadActs() },[open])

  return (
    <div style={{ background:'#fff', borderRadius:12, marginBottom:12, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', opacity:cerrado?0.55:1, borderLeft:`4px solid ${bg}`, overflow:'hidden' }}>
      <div style={{ padding:'14px 16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <span style={{ fontWeight:700, color:'#264534', fontSize:14 }}>{caso.nro_caso}</span>
            <span style={{ fontSize:11, background:'#F3F4F6', borderRadius:4, padding:'2px 7px', color:'#374151' }}>{caso.area}</span>
            <span style={{ fontSize:11, color:'#9CA3AF' }}>{caso.fecha}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:4, flexWrap:'wrap' }}>
            {caso.area?.includes('Admin') && <Badge label="Admin" estado={caso.estado_admin||'Pendiente'} />}
            {caso.area?.includes('Talent') && <Badge label="Talent" estado={caso.estado_talent||'Pendiente'} />}
            {caso.area==='CX' && <Badge label="CX" estado={caso.estado_cx||'Pendiente'} />}
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
        <div style={{ padding:'0 16px 16px', background:'#FAFAFA', borderTop:'1px solid #F3F4F6' }}>
          <div style={{ paddingTop:12 }}>
            {acts.length===0?<p style={{ fontSize:12, color:'#9CA3AF', margin:'0 0 12px' }}>Sin actualizaciones aún.</p>
              :<div style={{ marginBottom:12 }}>{acts.map((a:any)=>{
                const m=a.texto.match(/^\[([^\]]+)\] ([\s\S]+)$/)
                const tag=m?m[1]:'Actualización'; const msg=m?m[2]:a.texto
                return (
                  <div key={a.id} style={{ marginBottom:8, padding:'8px 12px', background:'#fff', borderRadius:8, fontSize:12, borderLeft:`3px solid ${tagColor(tag)}` }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginBottom:4 }}>
                      <span style={{ fontWeight:700, color:'#264534' }}>{a.autor}</span>
                      <span style={{ background:tagColor(tag), color:'#fff', borderRadius:4, padding:'1px 7px', fontSize:10, fontWeight:600 }}>{tag}</span>
                      <span style={{ color:'#9CA3AF', fontSize:11 }}>{timeAgo(a.created_at)}</span>
                    </div>
                    <p style={{ margin:0, color:'#374151', lineHeight:1.5 }}>{msg}</p>
                  </div>
                )
              })}</div>
            }
            {!cerrado&&(
              <div style={{ display:'flex', flexDirection:'column', gap:8, borderTop:acts.length>0?'1px solid #F3F4F6':'none', paddingTop:acts.length>0?12:0 }}>
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
                <textarea value={texto} onChange={e=>setTexto(e.target.value)} placeholder="Describir la acción tomada..." rows={2} style={{ border:'1.5px solid #E5E7EB', borderRadius:6, padding:'7px 10px', fontSize:12, resize:'vertical', fontFamily:'inherit', background:'#fff' }}/>
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

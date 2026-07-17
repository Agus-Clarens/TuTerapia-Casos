'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

const CARGADO_POR = ['Sol CX','Agus Admin','Sofi Admin','Orne Talent','Caro Talent','Belu Talent','Nico Director','Nacho Director']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const TIPOS_CASO: any = {
  'Admin': { area: 'Admin', desc: false, tipos: ['Link de pago','Devolucion dentro del plazo','Devolucion fuera del plazo sin falla','Envio de factura','Problema con factura','Cupon no aplicado','Pago duplicado','Transferencia sesiones','Contracargo MP','Cambiar modalidad','Cambiar modalidad de sesiones (psicologo ya confirmo)','Ajuste de modalidad de pago'] },
  'Talent': { area: 'Talent', desc: false, tipos: ['Disponibilidad agenda','No confirma sesion','Cancelacion psicologo','Calendario incorrecto','Sesiones pendientes aprobacion','Psicologo fantasmeado','Pocas horas','Sin horas','Mejora perfil','Psicologo lleva pacientes por fuera de plataforma'] },
  'Admin+Talent (con descuento)': { area: 'Admin+Talent', desc: true, tipos: ['Devolucion fuera plazo con falla','Sesion sin consentimiento','Sesion marcada realizada no ocurrio','Descontar sesion'] },
  'Admin+Talent': { area: 'Admin+Talent', desc: false, tipos: ['Desvinculacion con pacientes activos','Cobra fuera plataforma','Horario incorrecto con dano'] },
  'CX': { area: 'CX', desc: false, tipos: ['Cargo mal los datos en la factura','Contactar retencion','Derivacion psicologo','Mala experiencia devolucion autonoma','Cancelacion por paciente'] },
}

function getTipoInfo(tipo: string) {
  for (const g of Object.values(TIPOS_CASO) as any[]) {
    if (g.tipos.includes(tipo)) return { area: g.area, desc: g.desc }
  }
  return null
}

const inp = { width:'100%', padding:'10px 12px', borderRadius:8, border:'1.5px solid #E5E7EB', fontSize:14, boxSizing:'border-box' as const, fontFamily:'inherit' }
const lbl = { fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:4 } as const

export default function NuevoCaso() {
  const router = useRouter()
  const [form, setForm] = useState({ cargado_por: CARGADO_POR[0], pais: 'Argentina', pac_nombre: '', pac_mail: '', psi_nombre: '', psi_mail: '', tipo_caso: '', descripcion: '', monto_descuento: '', mes_descuento: 'Enero', tipo_sesion: 'Presencial' })
  const [sinPsi, setSinPsi] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const info = getTipoInfo(form.tipo_caso)

  async function handleSubmit() {
    if (!form.pac_nombre || !form.pac_mail || !form.tipo_caso || !form.descripcion) { setError('Completá todos los campos obligatorios.'); return }
    setLoading(true); setError('')
    const { data: last } = await supabase.from('casos').select('nro_caso').order('created_at', { ascending: false }).limit(1)
    const lastNum = last?.[0]?.nro_caso ? parseInt(last[0].nro_caso.replace('TKT-', '')) : 0
    const nro_caso = `TKT-${String(lastNum + 1).padStart(3, '0')}`
    const { error: err } = await supabase.from('casos').insert({
      nro_caso, fecha: new Date().toISOString().split('T')[0],
      cargado_por: form.cargado_por, pais: form.pais,
      pac_nombre: form.pac_nombre, pac_mail: form.pac_mail,
      psi_nombre: sinPsi ? null : form.psi_nombre, psi_mail: sinPsi ? null : form.psi_mail,
      tipo_caso: form.tipo_caso, area: info?.area || '',
      descripcion: form.descripcion, estado: 'Nuevo',
      estado_admin: 'Pendiente', estado_talent: 'Pendiente', estado_cx: 'Pendiente',
      requiere_descuento: info?.desc || false,
      monto_descuento: info?.desc ? Number(form.monto_descuento) : null,
      mes_descuento: info?.desc ? form.mes_descuento : null,
      tipo_sesion: info?.desc ? form.tipo_sesion : null,
    })
    if (err) { setError('Error: ' + err.message); setLoading(false); return }
    if (info?.desc) {
      const { data: caso } = await supabase.from('casos').select('id').eq('nro_caso', nro_caso).single()
      if (caso) await supabase.from('descuentos_psicologo').insert({ caso_id: caso.id, nro_caso, psi_nombre: form.psi_nombre, psi_mail: form.psi_mail, pac_nombre: form.pac_nombre, motivo: form.tipo_caso, monto: Number(form.monto_descuento), mes: form.mes_descuento, estado: 'Pendiente', tipo_sesion: form.tipo_sesion, descripcion: form.descripcion })
    }
    fetch('/api/notify-slack', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nro_caso, area: info?.area, tipo_caso: form.tipo_caso, pac_nombre: form.pac_nombre, cargado_por: form.cargado_por, pais: form.pais }) })
    router.push('/casos')
  }

  return (
    <div style={{ maxWidth:640, margin:'0 auto', padding:24 }}>
      <h1 style={{ fontSize:22, fontWeight:700, color:'#264534', marginBottom:24 }}>Nuevo caso</h1>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div><label style={lbl}>Cargado por</label><select value={form.cargado_por} onChange={e=>setForm({...form,cargado_por:e.target.value})} style={inp}>{CARGADO_POR.map(p=><option key={p}>{p}</option>)}</select></div>
        <div><label style={lbl}>País</label><select value={form.pais} onChange={e=>setForm({...form,pais:e.target.value})} style={inp}><option>Argentina</option><option>Uruguay</option></select></div>
        <div><label style={lbl}>Nombre paciente *</label><input value={form.pac_nombre} onChange={e=>setForm({...form,pac_nombre:e.target.value})} style={inp}/></div>
        <div><label style={lbl}>Email paciente *</label><input type="email" value={form.pac_mail} onChange={e=>setForm({...form,pac_mail:e.target.value})} style={inp}/></div>
      </div>
      <div style={{ margin:'16px 0' }}>
        <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:14 }}>
          <input type="checkbox" checked={sinPsi} onChange={e=>setSinPsi(e.target.checked)}/> No necesita datos del psicólogo
        </label>
      </div>
      {!sinPsi && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          <div><label style={lbl}>Nombre psicólogo</label><input value={form.psi_nombre} onChange={e=>setForm({...form,psi_nombre:e.target.value})} style={inp}/></div>
          <div><label style={lbl}>Email psicólogo</label><input type="email" value={form.psi_mail} onChange={e=>setForm({...form,psi_mail:e.target.value})} style={inp}/></div>
        </div>
      )}
      <div style={{ marginBottom:16 }}>
        <label style={lbl}>Tipo de caso *</label>
        <select value={form.tipo_caso} onChange={e=>setForm({...form,tipo_caso:e.target.value})} style={inp}>
          <option value="">Seleccionar...</option>
          {Object.entries(TIPOS_CASO).map(([g,v]:any)=><optgroup key={g} label={g}>{v.tipos.map((t:string)=><option key={t}>{t}</option>)}</optgroup>)}
        </select>
        {info && <p style={{ fontSize:12, color:'#007271', fontWeight:600, marginTop:4 }}>Área: {info.area}{info.desc ? ' · Requiere descuento' : ''}</p>}
      </div>
      {info?.desc && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:16 }}>
          <div><label style={lbl}>Monto *</label><input type="number" value={form.monto_descuento} onChange={e=>setForm({...form,monto_descuento:e.target.value})} style={inp}/></div>
          <div><label style={lbl}>Mes *</label><select value={form.mes_descuento} onChange={e=>setForm({...form,mes_descuento:e.target.value})} style={inp}>{MESES.map(m=><option key={m}>{m}</option>)}</select></div>
          <div><label style={lbl}>Tipo sesión</label><select value={form.tipo_sesion} onChange={e=>setForm({...form,tipo_sesion:e.target.value})} style={inp}><option>Presencial</option><option>Online</option></select></div>
        </div>
      )}
      <div style={{ marginBottom:16 }}>
        <label style={lbl}>Descripción *</label>
        <textarea value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})} rows={4} style={{ ...inp, resize:'vertical' }}/>
      </div>
      {error && <p style={{ color:'#EF4444', marginBottom:12, fontSize:13 }}>{error}</p>}
      <button onClick={handleSubmit} disabled={loading} style={{ width:'100%', background:'#007271', color:'#fff', border:'none', borderRadius:8, padding:'12px', fontSize:15, fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Creando...' : 'Crear caso'}
      </button>
    </div>
  )
}

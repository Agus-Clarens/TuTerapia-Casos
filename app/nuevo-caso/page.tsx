'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const TIPOS = {
  Admin: ['Link de pago','Devolucion dentro del plazo','Devolucion fuera del plazo sin falla','Envio de factura','Problema con factura','Cupon no aplicado','Pago duplicado','Transferencia sesiones','Contracargo MP','Cambiar modalidad'],
  Talent: ['Disponibilidad agenda','No confirma sesion','Cancelacion psicologo','Calendario incorrecto','Sesiones pendientes aprobacion','Psicologo fantasmeado','Pocas horas','Sin horas','Mejora perfil'],
  'Admin+Talent': ['Devolucion fuera plazo con falla','Sesion sin consentimiento','Sesion marcada realizada no ocurrio','Descontar sesion','Desvinculacion con pacientes activos','Cobra fuera plataforma','Horario incorrecto con dano'],
  CX: ['Contactar retencion','Derivacion psicologo','Mala experiencia devolucion autonoma','Cancelacion por paciente']
}
const CON_DESCUENTO = ['Devolucion fuera plazo con falla','Sesion sin consentimiento','Sesion marcada realizada no ocurrio','Descontar sesion']

function getArea(tipo: string) {
  for (const [area, tipos] of Object.entries(TIPOS)) {
    if (tipos.includes(tipo)) return area
  }
  return ''
}

export default function NuevoCaso() {
  const router = useRouter()
  const [cargado_por, setCargadoPor] = useState('Sol CX')
  const [pais, setPais] = useState('Argentina')
  const [pac_nombre, setPacNombre] = useState('')
  const [pac_mail, setPacMail] = useState('')
  const [noPsicologo, setNoPsicologo] = useState(false)
  const [psi_nombre, setPsiNombre] = useState('')
  const [psi_mail, setPsiMail] = useState('')
  const [tipo_caso, setTipoCaso] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [monto_descuento, setMonto] = useState('')
  const [mes_descuento, setMes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const area = getArea(tipo_caso)
  const requiere_descuento = CON_DESCUENTO.includes(tipo_caso)

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const { data: last } = await supabase.from('casos').select('nro_caso').order('created_at', { ascending: false }).limit(1)
      const lastNum = last?.[0]?.nro_caso ? parseInt(last[0].nro_caso.replace('TKT-', '')) : 0
      const nro_caso = `TKT-${String(lastNum + 1).padStart(3, '0')}`

      const { error: err } = await supabase.from('casos').insert({
        nro_caso,
        fecha: new Date().toISOString().split('T')[0],
        cargado_por, pais, pac_nombre, pac_mail,
        psi_nombre: noPsicologo ? null : psi_nombre,
        psi_mail: noPsicologo ? null : psi_mail,
        tipo_caso, area, descripcion,
        estado: 'Nuevo',
        requiere_descuento,
        monto_descuento: requiere_descuento ? Number(monto_descuento) : null,
        mes_descuento: requiere_descuento ? mes_descuento : null
      })

      if (err) { setError('Error: ' + err.message); setLoading(false); return }

      if (requiere_descuento) {
        const { data: caso } = await supabase.from('casos').select('id').eq('nro_caso', nro_caso).single()
        if (caso) {
          await supabase.from('descuentos_psicologo').insert({
            caso_id: caso.id, nro_caso,
            psi_nombre, psi_mail, pac_nombre,
            motivo: tipo_caso,
            monto: Number(monto_descuento),
            mes: mes_descuento,
            estado: 'Pendiente'
          })
        }
      }
      router.push('/casos')
    } catch(e) {
      setError('Error: ' + (e as Error).message)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6" style={{color:'#264534'}}>Nuevo caso</h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Cargado por</label>
          <select value={cargado_por} onChange={e=>setCargadoPor(e.target.value)} className="w-full border rounded p-2">
            {['Sol CX','Agus Admin','Sofi Admin','Orne Talent','Caro Talent','Belu Talent','Nico Director','Nacho Director'].map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">País</label>
          <select value={pais} onChange={e=>setPais(e.target.value)} className="w-full border rounded p-2">
            <option>Argentina</option><option>Uruguay</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nombre paciente *</label>
          <input value={pac_nombre} onChange={e=>setPacNombre(e.target.value)} className="w-full border rounded p-2"/>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email paciente *</label>
          <input value={pac_mail} onChange={e=>setPacMail(e.target.value)} className="w-full border rounded p-2"/>
        </div>
      </div>
      <div className="mt-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={noPsicologo} onChange={e=>setNoPsicologo(e.target.checked)}/>
          No necesita datos del psicólogo
        </label>
      </div>
      {!noPsicologo && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre psicólogo</label>
            <input value={psi_nombre} onChange={e=>setPsiNombre(e.target.value)} className="w-full border rounded p-2"/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email psicólogo</label>
            <input value={psi_mail} onChange={e=>setPsiMail(e.target.value)} className="w-full border rounded p-2"/>
          </div>
        </div>
      )}
      <div className="mt-4">
        <label className="block text-sm font-medium mb-1">Tipo de caso *</label>
        <select value={tipo_caso} onChange={e=>setTipoCaso(e.target.value)} className="w-full border rounded p-2">
          <option value="">Seleccionar...</option>
          {Object.entries(TIPOS).map(([area, tipos])=>(
            <optgroup key={area} label={area}>
              {tipos.map(t=><option key={t}>{t}</option>)}
            </optgroup>
          ))}
        </select>
        {area && <p className="text-sm mt-1" style={{color:'#007271'}}>Área: {area}{requiere_descuento ? ' · Requiere descuento' : ''}</p>}
      </div>
      {requiere_descuento && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Monto descuento *</label>
            <input type="number" value={monto_descuento} onChange={e=>setMonto(e.target.value)} className="w-full border rounded p-2"/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mes descuento *</label>
            <input value={mes_descuento} onChange={e=>setMes(e.target.value)} className="w-full border rounded p-2"/>
          </div>
        </div>
      )}
      <div className="mt-4">
        <label className="block text-sm font-medium mb-1">Descripción *</label>
        <textarea value={descripcion} onChange={e=>setDescripcion(e.target.value)} rows={4} className="w-full border rounded p-2"/>
      </div>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      <button onClick={handleSubmit} disabled={loading} className="mt-6 w-full text-white py-3 rounded font-medium" style={{backgroundColor:'#007271'}}>
        {loading ? 'Creando...' : 'Crear caso'}
      </button>
    </div>
  )
}

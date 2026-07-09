'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function DescuentosPage() {
  const [descuentos, setDescuentos] = useState<any[]>([])
  const [filtroMes, setFiltroMes] = useState('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string|null>(null)

  async function load() {
    const { data } = await supabase.from('descuentos_psicologo').select('*').order('created_at', { ascending: false })
    if (data) setDescuentos(data)
    setLoading(false)
  }

  async function marcarAplicado(id: string) {
    await supabase.from('descuentos_psicologo').update({ estado: 'Aplicado' }).eq('id', id)
    load()
  }

  function buildMensaje(d: any) {
    return `Hola ${d.psi_nombre}! 👋\n\nTe escribimos para avisarte que en tu próxima liquidación se descontará una sesión ${d.tipo_sesion || 'Presencial'} correspondiente al paciente ${d.pac_nombre}.\n\n🗓️ Mes: ${d.mes}\n💰 Monto a descontar: $${d.monto}\n\nMotivo: ${d.descripcion || d.motivo}\n\nAnte cualquier consulta no dudes en escribirnos, estamos para ayudarte.\n\n¡Saludos! 🌿\nSofía\nEquipo Tu Terapia`
  }

  async function copiar(d: any) {
    await navigator.clipboard.writeText(buildMensaje(d))
    setCopied(d.id)
    setTimeout(() => setCopied(null), 2000)
  }

  useEffect(() => { load() }, [])

  const meses = [...new Set(descuentos.map(d => d.mes))].filter(Boolean)
  const filtered = filtroMes ? descuentos.filter(d => d.mes === filtroMes) : descuentos

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:'#264534' }}>Descuentos</h1>
        <select value={filtroMes} onChange={e=>setFiltroMes(e.target.value)} style={{ border:'1.5px solid #E5E7EB', borderRadius:8, padding:'6px 12px', fontSize:13 }}>
          <option value="">Todos los meses</option>
          {meses.map(m=><option key={m}>{m}</option>)}
        </select>
      </div>
      {loading ? <p>Cargando...</p> : filtered.length === 0 ? <p style={{ color:'#9CA3AF' }}>No hay descuentos.</p> : (
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ background:'#F9FAFB' }}>
              {['Mes','N° Caso','Psicólogo','Mail','Paciente','Motivo','Monto','Estado','Acciones'].map(h=>(
                <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontWeight:600, color:'#374151', borderBottom:'1px solid #E5E7EB' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(d=>(
              <tr key={d.id} style={{ borderBottom:'1px solid #F3F4F6' }}>
                <td style={{ padding:'10px 12px' }}>{d.mes}</td>
                <td style={{ padding:'10px 12px', fontWeight:600 }}>{d.nro_caso}</td>
                <td style={{ padding:'10px 12px' }}>{d.psi_nombre}</td>
                <td style={{ padding:'10px 12px', color:'#6B7280' }}>{d.psi_mail}</td>
                <td style={{ padding:'10px 12px' }}>{d.pac_nombre}</td>
                <td style={{ padding:'10px 12px' }}>{d.motivo}</td>
                <td style={{ padding:'10px 12px', fontWeight:600 }}>${d.monto}</td>
                <td style={{ padding:'10px 12px' }}>
                  <span style={{ background: d.estado === 'Aplicado' ? '#75B781' : '#FCD07F', color: d.estado === 'Aplicado' ? '#fff' : '#374151', borderRadius:6, padding:'2px 8px', fontSize:11, fontWeight:600 }}>{d.estado}</span>
                </td>
                <td style={{ padding:'10px 12px' }}>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={()=>copiar(d)} style={{ background:'#007271', color:'#fff', border:'none', borderRadius:6, padding:'5px 10px', fontSize:11, cursor:'pointer', fontWeight:600 }}>
                      {copied === d.id ? '✓ Copiado' : 'Copiar mensaje'}
                    </button>
                    {d.estado !== 'Aplicado' && (
                      <button onClick={()=>marcarAplicado(d.id)} style={{ background:'#75B781', color:'#fff', border:'none', borderRadius:6, padding:'5px 10px', fontSize:11, cursor:'pointer', fontWeight:600 }}>Marcar aplicado</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

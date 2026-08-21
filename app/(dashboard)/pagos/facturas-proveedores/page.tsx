'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabase'
import { SOLICITANTES_PAGO } from '../../../../lib/solicitantes-pago'

const PUEDEN_DESCARGAR = ['admin@tuterapia.com.ar', 'aclarens@tuterapia.com.ar', 'people@tuterapia.com.uy']

export default function Page() {
  const [userEmail, setUserEmail] = useState('')
  const [cargadoPor, setCargadoPor] = useState('')
  const [proveedor, setProveedor] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [lista, setLista] = useState<any[]>([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email || ''
      setUserEmail(email)
      const found = SOLICITANTES_PAGO.find(s => s.email.toLowerCase() === email.toLowerCase())
      if (found) setCargadoPor(found.nombre)
    })
    cargarLista()
  }, [])

  async function cargarLista() {
    const { data } = await supabase.from('facturas_proveedores').select('*, factura_proveedor_adjuntos(*)').order('created_at', { ascending: false })
    if (data) setLista(data)
  }

  async function enviar() {
    setError('')
    if (!cargadoPor) return setError('Elegí quién carga.')
    if (!proveedor.trim()) return setError('Ingresá el proveedor.')
    if (files.length === 0) return setError('Adjuntá al menos un PDF.')
    if (files.some(f => f.type !== 'application/pdf')) return setError('Los archivos deben ser PDF.')

    setSubmitting(true)
    const paths: { path: string; name: string }[] = []
    for (const f of files) {
      const now = new Date()
      const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
      const safeName = f.name.replace(/[^\w.\-]+/g, '_')
      const path = `facturas-prov/${yyyymm}/${crypto.randomUUID()}-${safeName}`
      const { error: upErr } = await supabase.storage.from('pagos').upload(path, f, { contentType: 'application/pdf', upsert: false })
      if (upErr) { setError('Error al subir "' + f.name + '": ' + upErr.message); setSubmitting(false); return }
      paths.push({ path, name: f.name })
    }

    const { data: inserted, error: insErr } = await supabase.from('facturas_proveedores').insert({
      cargado_por: cargadoPor,
      cargado_por_email: userEmail,
      proveedor: proveedor.trim(),
      descripcion: descripcion.trim() || null,
    }).select().single()
    if (insErr) {
      setError('Error al guardar: ' + insErr.message)
      for (const p of paths) await supabase.storage.from('pagos').remove([p.path])
      setSubmitting(false); return
    }

    await supabase.from('factura_proveedor_adjuntos').insert(
      paths.map(p => ({ factura_id: inserted.id, file_path: p.path, file_name: p.name }))
    )

    // Avisar a Slack (canal administracion)
    fetch('/api/notify-slack-pagos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nro_solicitud: 'FP', tipo: 'Facturas a proveedores', solicitante: cargadoPor, destinatario: proveedor.trim(), motivo: descripcion.trim() || '(sin descripción)', monto: 0, moneda: '' })
    })

    setProveedor(''); setDescripcion(''); setFiles([]); setSubmitting(false)
    cargarLista()
  }

  async function descargar(path: string) {
    const { data, error: e } = await supabase.storage.from('pagos').createSignedUrl(path, 60)
    if (e || !data) { alert('No se pudo generar el link.'); return }
    window.open(data.signedUrl, '_blank')
  }

  async function eliminar(f: any) {
    if (!confirm(`¿Eliminar las facturas de ${f.proveedor}?`)) return
    const adj = f.factura_proveedor_adjuntos || []
    if (adj.length > 0) await supabase.storage.from('pagos').remove(adj.map((a: any) => a.file_path))
    await supabase.from('facturas_proveedores').delete().eq('id', f.id)
    cargarLista()
  }

  const puedeDescargar = PUEDEN_DESCARGAR.includes(userEmail.toLowerCase())
  const esCreador = (f: any) => (f.cargado_por_email || '').toLowerCase() === userEmail.toLowerCase()

  const inp = { width: '100%', padding: '9px 12px', borderRadius: 6, border: '1.5px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box' as const, fontFamily: 'inherit' }
  const lbl = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#264534', marginBottom: 6 }}>Facturas de proveedores</h1>
      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>Cargá acá las facturas de proveedores para que Sofi las archive. No es un pago.</p>

      <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 28 }}>
        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Carga *</label>
          <select value={cargadoPor} onChange={e => setCargadoPor(e.target.value)} style={{ ...inp, background: '#fff' }}>
            <option value="">Elegí...</option>
            {SOLICITANTES_PAGO.map(s => <option key={s.nombre} value={s.nombre}>{s.nombre} · {s.sector}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Proveedor *</label>
          <input value={proveedor} onChange={e => setProveedor(e.target.value)} placeholder="Nombre del proveedor / empresa" style={inp} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Descripción</label>
          <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={2} placeholder="Ej: facturas de agosto del proveedor de diseño" style={{ ...inp, resize: 'vertical' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>Facturas (PDF) * <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(podés elegir varias)</span></label>
          <input type="file" accept="application/pdf" multiple onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files || [])])}
            style={{ ...inp, padding: '7px 10px', background: '#fff' }} />
          {files.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {files.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, background: '#F9FAFB', borderRadius: 5, padding: '5px 9px' }}>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                  <button type="button" onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 12 }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
        {error && <p style={{ color: '#EF4444', fontSize: 13, margin: '0 0 12px' }}>{error}</p>}
        <button onClick={enviar} disabled={submitting} style={{ background: '#264534', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 22px', fontSize: 14, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}>
          {submitting ? 'Enviando...' : 'Cargar facturas'}
        </button>
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#264534', marginBottom: 12 }}>Facturas cargadas</h2>
      {lista.length === 0 ? <p style={{ color: '#9CA3AF', fontSize: 13 }}>Todavía no hay facturas cargadas.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lista.map(f => (
            <div key={f.id} style={{ background: '#fff', borderRadius: 10, padding: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#264534', fontSize: 14 }}>{f.proveedor}</div>
                  {f.descripcion && <div style={{ fontSize: 13, color: '#374151', marginTop: 2 }}>{f.descripcion}</div>}
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Cargado por {f.cargado_por} · {new Date(f.created_at).toLocaleDateString('es-AR')}</div>
                </div>
                {(esCreador(f) || puedeDescargar) && (
                  <button onClick={() => eliminar(f)} style={{ background: 'transparent', color: '#EF4444', border: '1px solid #FECACA', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>Eliminar</button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                {(f.factura_proveedor_adjuntos || []).map((a: any) => (
                  puedeDescargar
                    ? <button key={a.id} onClick={() => descargar(a.file_path)} style={{ background: '#EFF6FF', color: '#1e40af', border: '1px solid #BFDBFE', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{a.file_name}</button>
                    : <span key={a.id} style={{ background: '#F9FAFB', color: '#9CA3AF', border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600 }}>{a.file_name} (descarga restringida)</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

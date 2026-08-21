'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import { SOLICITANTES_PAGO } from '../../../../lib/solicitantes-pago'

export default function Page() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [tipo, setTipo] = useState<'Pago a proveedor' | 'Reembolso' | 'Factura equipo interno' | 'Facturas a proveedores'>('Pago a proveedor')
  const [solicitante, setSolicitante] = useState('')
  const [destinatario, setDestinatario] = useState('')
  const [rutCuit, setRutCuit] = useState('')
  const [noAplicaRut, setNoAplicaRut] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [monto, setMonto] = useState('')
  const [moneda, setMoneda] = useState<'ARS' | 'UYU'>('ARS')
  const [datosCuenta, setDatosCuenta] = useState('')
  const [files, setFiles] = useState<File[]>([])

  // Preseleccionar solicitante según email del usuario logueado
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email || ''
      setUserEmail(email)
      const found = SOLICITANTES_PAGO.find(s => s.email.toLowerCase() === email.toLowerCase())
      if (found) setSolicitante(found.nombre)
    })
  }, [])

  // Si es reembolso, el destinatario es el mismo solicitante
  useEffect(() => {
    if ((tipo === 'Reembolso' || tipo === 'Factura equipo interno') && solicitante) setDestinatario(solicitante)
    if (tipo !== 'Reembolso' && tipo !== 'Factura equipo interno' && noAplicaRut) setNoAplicaRut(false)  }, [tipo, solicitante])

  async function submit() {
    setError('')
    if (!solicitante) return setError('Elegí quién solicita.')

    const esArchivar = tipo === 'Facturas a proveedores'

    if (!destinatario.trim()) return setError(esArchivar ? 'Ingresá el proveedor.' : 'Ingresá el destinatario del pago.')
    if (!motivo.trim()) return setError(esArchivar ? 'Ingresá una descripción.' : 'Ingresá el motivo.')

    if (!esArchivar) {
      if (!noAplicaRut && !rutCuit.trim()) return setError('Ingresá el RUT o CUIT.')
      if (!monto || Number(monto) <= 0) return setError('Ingresá un monto válido.')
      if (tipo === 'Pago a proveedor' && !datosCuenta.trim()) return setError('Ingresá los datos de cuenta.')
      if (tipo === 'Factura equipo interno' && !datosCuenta.trim()) return setError('Ingresá los datos de cuenta.')
      if (tipo === 'Factura equipo interno' && files.length === 0) return setError('Adjuntá la factura en PDF.')
    } else {
      if (files.length === 0) return setError('Adjuntá al menos una factura en PDF.')
    }
    if (files.some(f => f.type !== 'application/pdf')) return setError('Los archivos deben ser PDF.')

    setSubmitting(true)

    // Subir PDFs si hay
    let factura_path: string | null = null
    const paths: { path: string; name: string }[] = []
    for (const f of files) {
      const now = new Date()
      const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
      const safeName = f.name.replace(/[^\w.\-]+/g, '_')
      const uid = crypto.randomUUID()
      const path = `${yyyymm}/${uid}-${safeName}`
      const { error: upErr } = await supabase.storage.from('pagos').upload(path, f, {
        contentType: 'application/pdf', upsert: false,
      })
      if (upErr) { setError('Error al subir "' + f.name + '": ' + upErr.message); setSubmitting(false); return }
      paths.push({ path, name: f.name })
    }
    if (paths.length > 0) factura_path = paths[0].path

    const { data: inserted, error: insErr } = await supabase.from('solicitudes_pago').insert({
      tipo,
      solicitante,
      solicitante_email: userEmail,
      destinatario: destinatario.trim(),
      rut_cuit: esArchivar ? null : (noAplicaRut ? null : rutCuit.trim()),
      motivo: motivo.trim(),
      monto: esArchivar ? 0 : Number(monto),
      moneda,
      datos_cuenta: esArchivar ? null : (datosCuenta.trim() || null),
      factura_path,
      estado: 'Nueva',
    }).select().single()
    if (insErr) {
      setError('Error al guardar: ' + insErr.message)
      for (const p of paths) await supabase.storage.from('pagos').remove([p.path])
      setSubmitting(false); return
    }

    if (paths.length > 1) {
      await supabase.from('solicitud_pago_adjuntos').insert(
        paths.slice(1).map(p => ({ solicitud_id: inserted.id, file_path: p.path, file_name: p.name }))
      )
    }

    fetch('/api/notify-slack-pagos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nro_solicitud: inserted.nro_solicitud, tipo, solicitante, destinatario: destinatario.trim(), monto: Number(monto), moneda, motivo: motivo.trim() })
    })

    router.push('/pagos/mis-solicitudes')
  }

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#264534', marginBottom: 20 }}>Nueva solicitud de pago</h1>

      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
        {/* Tipo (segmentado) */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Tipo de solicitud *</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(['Pago a proveedor', 'Reembolso', 'Factura equipo interno', 'Facturas a proveedores'] as const).map(t => (
              <button key={t} onClick={() => setTipo(t)} type="button"
                style={{
                  flex: '1 1 45%', padding: '10px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  border: tipo === t ? '2px solid #264534' : '1.5px solid #E5E7EB',
                  background: tipo === t ? '#264534' : '#fff',
                  color: tipo === t ? '#fff' : '#6B7280',
                }}>
                {t === 'Pago a proveedor' ? '💸 Pago a proveedor' : t === 'Reembolso' ? '🧾 Reembolso' : t === 'Factura equipo interno' ? '📄 Factura equipo interno' : '🗂️ Facturas a proveedores'}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6, marginBottom: 0 }}>
            {tipo === 'Pago a proveedor'
              ? 'La empresa le paga a un tercero (proveedor, evento, servicio).'
              : tipo === 'Reembolso'
                ? 'Vos ya pagaste algo y necesitás que la empresa te lo devuelva.'
                : tipo === 'Factura equipo interno'
                  ? 'Alguien del equipo le factura a la empresa por su trabajo (monotributo/factura propia).'
                  : 'Solo para archivar: le pasás facturas de un proveedor a Sofi para que las guarde. No es un pago.'}
          </p>
        </div>

        {/* Solicitante */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Solicita *</label>
          <select value={solicitante} onChange={e => setSolicitante(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1.5px solid #E5E7EB', fontSize: 13, background: '#fff', boxSizing: 'border-box' }}>
            <option value="">Seleccionar...</option>
            {SOLICITANTES_PAGO.map(s => (
              <option key={s.email} value={s.nombre}>{s.nombre} · {s.sector}</option>
            ))}
          </select>
        </div>

        {/* Destinatario - solo se muestra si es Pago a proveedor */}
        {tipo !== 'Reembolso' && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
              {tipo === 'Facturas a proveedores' ? 'Proveedor *' : 'Pagar a *'}
            </label>
            <input value={destinatario} onChange={e => setDestinatario(e.target.value)}
              placeholder="Nombre del proveedor / persona / empresa"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1.5px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>
        )}

        {/* RUT / CUIT (no aplica para archivar) */}
        {tipo !== 'Facturas a proveedores' && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>RUT / CUIT {noAplicaRut ? '' : '*'}</label>
          <input value={rutCuit} onChange={e => setRutCuit(e.target.value)} disabled={noAplicaRut}
            placeholder="Ej: 20-36896551-1"
            style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1.5px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit', background: noAplicaRut ? '#F3F4F6' : '#fff', color: noAplicaRut ? '#9CA3AF' : 'inherit' }} />
          {(tipo === 'Reembolso' || tipo === 'Factura equipo interno') && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12, color: '#6B7280', cursor: 'pointer' }}>
              <input type="checkbox" checked={noAplicaRut} onChange={e => { setNoAplicaRut(e.target.checked); if (e.target.checked) setRutCuit('') }} />
              No aplica RUT / CUIT
            </label>
          )}
        </div>
        )}

        {/* Motivo / Descripción */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>{tipo === 'Facturas a proveedores' ? 'Descripción *' : 'Motivo *'}</label>
          <textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={2}
            placeholder={tipo === 'Pago a proveedor' ? 'Ej: catering para evento del 20/07' : tipo === 'Reembolso' ? 'Ej: nafta viaje a Rosario para reunión con cliente' : tipo === 'Facturas a proveedores' ? 'Ej: facturas de agosto del proveedor de diseño' : 'Ej: factura de servicios profesionales julio 2026'}
            style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1.5px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }} />
        </div>

        {/* Monto + Moneda (no aplica para archivar) */}
        {tipo !== 'Facturas a proveedores' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Monto *</label>
            <input type="number" step="0.01" value={monto} onChange={e => setMonto(e.target.value)} placeholder="0.00"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1.5px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Moneda *</label>
            <select value={moneda} onChange={e => setMoneda(e.target.value as any)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1.5px solid #E5E7EB', fontSize: 13, background: '#fff', boxSizing: 'border-box' }}>
              <option value="ARS">ARS</option>
              <option value="UYU">UYU</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
        )}

        {/* Datos de cuenta (no aplica para archivar) */}
        {tipo !== 'Facturas a proveedores' && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
            Datos de cuenta {tipo === 'Reembolso' ? '(si querés que te transfieran)' : '*'}
          </label>
          <textarea value={datosCuenta} onChange={e => setDatosCuenta(e.target.value)} rows={2}
            placeholder="CBU / Alias / Titular / Banco"
            style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1.5px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }} />
        </div>
        )}

        {/* PDF */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
            Factura / comprobante (PDF) {(tipo === 'Factura equipo interno' || tipo === 'Facturas a proveedores') ? '*' : ''} <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(podés elegir varios)</span>
          </label>
          <input type="file" accept="application/pdf" multiple
            onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files || [])])}
            style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1.5px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box', background: '#fff' }} />
          {files.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {files.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, background: '#F9FAFB', borderRadius: 5, padding: '5px 9px' }}>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                  <button type="button" onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                    style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 12 }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p style={{ color: '#EF4444', fontSize: 13, margin: '0 0 12px' }}>{error}</p>}

        <button onClick={submit} disabled={submitting}
          style={{ background: '#264534', color: '#fff', border: 'none', borderRadius: 6, padding: '11px 22px', fontSize: 13, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}>
          {submitting ? 'Enviando...' : 'Enviar solicitud'}
        </button>
      </div>
    </div>
  )
}

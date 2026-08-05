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

  const [tipo, setTipo] = useState<'Pago a proveedor' | 'Reembolso' | 'Factura equipo interno'>('Pago a proveedor')
  const [solicitante, setSolicitante] = useState('')
  const [destinatario, setDestinatario] = useState('')
  const [rutCuit, setRutCuit] = useState('')
  const [noAplicaRut, setNoAplicaRut] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [monto, setMonto] = useState('')
  const [moneda, setMoneda] = useState<'ARS' | 'UYU'>('ARS')
  const [datosCuenta, setDatosCuenta] = useState('')
  const [file, setFile] = useState<File | null>(null)

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
    if (tipo !== 'Reembolso' && noAplicaRut) setNoAplicaRut(false)
  }, [tipo, solicitante])

  async function submit() {
    setError('')
    if (!solicitante) return setError('Elegí quién solicita.')
    if (!destinatario.trim()) return setError('Ingresá el destinatario del pago.')
    if (!noAplicaRut && !rutCuit.trim()) return setError('Ingresá el RUT o CUIT.')
    if (!motivo.trim()) return setError('Ingresá el motivo.')
    if (!monto || Number(monto) <= 0) return setError('Ingresá un monto válido.')
    if (tipo === 'Pago a proveedor' && !datosCuenta.trim()) return setError('Ingresá los datos de cuenta.')
    if (tipo === 'Factura equipo interno' && !datosCuenta.trim()) return setError('Ingresá los datos de cuenta.')
    if (tipo === 'Factura equipo interno' && !file) return setError('Adjuntá la factura en PDF.')
    if (file && file.type !== 'application/pdf') return setError('El archivo debe ser un PDF.')

    setSubmitting(true)

    // Subir PDF si hay
    let factura_path: string | null = null
    if (file) {
      const now = new Date()
      const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
      const safeName = file.name.replace(/[^\w.\-]+/g, '_')
      const uid = crypto.randomUUID()
      const path = `${yyyymm}/${uid}-${safeName}`
      const { error: upErr } = await supabase.storage.from('pagos').upload(path, file, {
        contentType: 'application/pdf', upsert: false,
      })
      if (upErr) { setError('Error al subir el PDF: ' + upErr.message); setSubmitting(false); return }
      factura_path = path
    }

    const { data: inserted, error: insErr } = await supabase.from('solicitudes_pago').insert({
      tipo,
      solicitante,
      solicitante_email: userEmail,
      destinatario: destinatario.trim(),
      rut_cuit: noAplicaRut ? null : rutCuit.trim(),
      motivo: motivo.trim(),
      monto: Number(monto),
      moneda,
      datos_cuenta: datosCuenta.trim() || null,
      factura_path,
      estado: 'Nueva',
    }).select().single()
    if (insErr) {
      setError('Error al guardar: ' + insErr.message)
      if (factura_path) await supabase.storage.from('pagos').remove([factura_path])
      setSubmitting(false); return
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
          <div style={{ display: 'flex', gap: 8 }}>
            {(['Pago a proveedor', 'Reembolso', 'Factura equipo interno'] as const).map(t => (
              <button key={t} onClick={() => setTipo(t)} type="button"
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  border: tipo === t ? '2px solid #264534' : '1.5px solid #E5E7EB',
                  background: tipo === t ? '#264534' : '#fff',
                  color: tipo === t ? '#fff' : '#6B7280',
                }}>
                {t === 'Pago a proveedor' ? '💸 Pago a proveedor' : t === 'Reembolso' ? '🧾 Reembolso' : '📄 Factura equipo interno'}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6, marginBottom: 0 }}>
            {tipo === 'Pago a proveedor'
              ? 'La empresa le paga a un tercero (proveedor, evento, servicio).'
              : tipo === 'Reembolso'
                ? 'Vos ya pagaste algo y necesitás que la empresa te lo devuelva.'
                : 'Alguien del equipo le factura a la empresa por su trabajo (monotributo/factura propia).'}
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
              Pagar a *
            </label>
            <input value={destinatario} onChange={e => setDestinatario(e.target.value)}
              placeholder="Nombre del proveedor / persona / empresa"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1.5px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>
        )}

        {/* RUT / CUIT */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>RUT / CUIT {noAplicaRut ? '' : '*'}</label>
          <input value={rutCuit} onChange={e => setRutCuit(e.target.value)} disabled={noAplicaRut}
            placeholder="Ej: 20-36896551-1"
            style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1.5px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit', background: noAplicaRut ? '#F3F4F6' : '#fff', color: noAplicaRut ? '#9CA3AF' : 'inherit' }} />
          {tipo === 'Reembolso' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12, color: '#6B7280', cursor: 'pointer' }}>
              <input type="checkbox" checked={noAplicaRut} onChange={e => { setNoAplicaRut(e.target.checked); if (e.target.checked) setRutCuit('') }} />
              No aplica RUT / CUIT para este reembolso
            </label>
          )}
        </div>

        {/* Motivo */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Motivo *</label>
          <textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={2}
            placeholder={tipo === 'Pago a proveedor' ? 'Ej: catering para evento del 20/07' : tipo === 'Reembolso' ? 'Ej: nafta viaje a Rosario para reunión con cliente' : 'Ej: factura de servicios profesionales julio 2026'}
            style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1.5px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }} />
        </div>

        {/* Monto + Moneda */}
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
            </select>
          </div>
        </div>

        {/* Datos de cuenta */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
            Datos de cuenta {tipo === 'Reembolso' ? '(si querés que te transfieran)' : '*'}
          </label>
          <textarea value={datosCuenta} onChange={e => setDatosCuenta(e.target.value)} rows={2}
            placeholder="CBU / Alias / Titular / Banco"
            style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1.5px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }} />
        </div>

        {/* PDF */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
            Factura / comprobante (PDF) {tipo === 'Factura equipo interno' ? '*' : ''}
          </label>
          <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)}
            style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1.5px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box', background: '#fff' }} />
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

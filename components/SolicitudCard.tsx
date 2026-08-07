'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { EMAILS_PAGOS } from '../lib/solicitantes-pago'

const fmt = (m: number, moneda: string) => new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(m) + ' ' + moneda

export function SolicitudCard({ sol, userEmail, onUpdate }: any) {
  const [marcando, setMarcando] = useState(false)
  const [nota, setNota] = useState('')
  const [comprobante, setComprobante] = useState<File | null>(null)
  const [showAccion, setShowAccion] = useState(false)
  const [error, setError] = useState('')
  const [extraAdjuntos, setExtraAdjuntos] = useState<any[]>([])
  const [editando, setEditando] = useState(false)
  const [guardandoEdit, setGuardandoEdit] = useState(false)
  const [errorEdit, setErrorEdit] = useState('')
  const [eDestinatario, setEDestinatario] = useState(sol.destinatario || '')
  const [eRutCuit, setERutCuit] = useState(sol.rut_cuit || '')
  const [eNoAplicaRut, setENoAplicaRut] = useState(!sol.rut_cuit)
  const [eMotivo, setEMotivo] = useState(sol.motivo || '')
  const [eMonto, setEMonto] = useState(String(sol.monto ?? ''))
  const [eMoneda, setEMoneda] = useState(sol.moneda || 'ARS')
  const [eDatosCuenta, setEDatosCuenta] = useState(sol.datos_cuenta || '')

  useEffect(() => {
    supabase.from('solicitud_pago_adjuntos').select('*').eq('solicitud_id', sol.id)
      .then(({ data }) => { if (data) setExtraAdjuntos(data) })
  }, [sol.id])

  const puedeMarcar = EMAILS_PAGOS.map(e => e.toLowerCase()).includes(userEmail.toLowerCase())
  const esCreador = userEmail.toLowerCase() === (sol.solicitante_email || '').toLowerCase()
  const puedeDescargarFactura = ['admin@tuterapia.com.ar','aclarens@tuterapia.com.ar','people@tuterapia.com.uy'].includes(userEmail.toLowerCase())

  async function descargar(path: string) {
    const { data, error: e } = await supabase.storage.from('pagos').createSignedUrl(path, 60)
    if (e || !data) { alert('No se pudo generar el link.'); return }
    window.open(data.signedUrl, '_blank')
  }

  async function marcarPagada() {
    setError('')
    setMarcando(true)

    let comprobante_path: string | null = null
    if (comprobante) {
      if (comprobante.type !== 'application/pdf') { setError('El comprobante debe ser un PDF.'); setMarcando(false); return }
      const now = new Date()
      const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
      const safeName = comprobante.name.replace(/[^\w.\-]+/g, '_')
      const uid = crypto.randomUUID()
      comprobante_path = `${yyyymm}/comprobante-${uid}-${safeName}`
      const { error: upErr } = await supabase.storage.from('pagos').upload(comprobante_path, comprobante, { contentType: 'application/pdf', upsert: false })
      if (upErr) { setError('Error al subir comprobante: ' + upErr.message); setMarcando(false); return }
    }

    const { error: updErr } = await supabase.from('solicitudes_pago').update({
      estado: 'Pagada',
      fecha_pago: new Date().toISOString().split('T')[0],
      pagada_por: userEmail,
      comprobante_pago_path: comprobante_path,
      nota_pago: nota.trim() || null,
    }).eq('id', sol.id)

    if (updErr) { setError('Error al marcar: ' + updErr.message); setMarcando(false); return }

    fetch('/api/notify-pago-dm', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: sol.solicitante_email, nro_solicitud: sol.nro_solicitud, tipo: sol.tipo, monto: sol.monto, moneda: sol.moneda, motivo: sol.motivo })
    })

    setMarcando(false); setShowAccion(false); setNota(''); setComprobante(null)
    onUpdate()
  }

  async function reabrir() {
    if (!confirm('¿Volver a marcar esta solicitud como Nueva?')) return
    await supabase.from('solicitudes_pago').update({
      estado: 'Nueva',
      fecha_pago: null,
      pagada_por: null,
      comprobante_pago_path: null,
      nota_pago: null,
    }).eq('id', sol.id)
    onUpdate()
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar la solicitud ${sol.nro_solicitud}?`)) return
    if (sol.factura_path) await supabase.storage.from('pagos').remove([sol.factura_path])
    if (sol.comprobante_pago_path) await supabase.storage.from('pagos').remove([sol.comprobante_pago_path])
    if (extraAdjuntos.length > 0) await supabase.storage.from('pagos').remove(extraAdjuntos.map((a: any) => a.file_path))
    await supabase.from('solicitudes_pago').delete().eq('id', sol.id)
    onUpdate()
  }

  async function guardarEdicion() {
    setErrorEdit('')
    if (!eDestinatario.trim()) return setErrorEdit('Ingresá el destinatario.')
    if (!eNoAplicaRut && !eRutCuit.trim()) return setErrorEdit('Ingresá el RUT o CUIT (o tildá que no aplica).')
    if (!eMotivo.trim()) return setErrorEdit('Ingresá el motivo.')
    if (!eMonto || Number(eMonto) <= 0) return setErrorEdit('Ingresá un monto válido.')

    setGuardandoEdit(true)
    const { error: updErr } = await supabase.from('solicitudes_pago').update({
      destinatario: eDestinatario.trim(),
      rut_cuit: eNoAplicaRut ? null : eRutCuit.trim(),
      motivo: eMotivo.trim(),
      monto: Number(eMonto),
      moneda: eMoneda,
      datos_cuenta: eDatosCuenta.trim() || null,
    }).eq('id', sol.id)
    setGuardandoEdit(false)
    if (updErr) { setErrorEdit('Error al guardar: ' + updErr.message); return }
    setEditando(false)
    onUpdate()
  }

  const pagada = sol.estado === 'Pagada'
  const bordeColor = pagada ? '#75B781' : '#F97316'

  return (
    <div style={{
      background: '#fff', border: `1px solid #E5E7EB`, borderLeft: `4px solid ${bordeColor}`,
      borderRadius: 10, padding: 16, marginBottom: 10,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{sol.nro_solicitud}</span>
        <span style={{ fontSize: 11, background: sol.tipo === 'Reembolso' ? '#FEF3C7' : '#E0E7FF', color: sol.tipo === 'Reembolso' ? '#92400E' : '#3730A3', borderRadius: 4, padding: '2px 7px', fontWeight: 600 }}>
          {sol.tipo}
        </span>
        <span style={{ fontSize: 11, background: pagada ? '#DCFCE7' : '#FED7AA', color: pagada ? '#166534' : '#9A3412', borderRadius: 4, padding: '2px 8px', fontWeight: 700 }}>
          {sol.estado === 'Nueva' ? 'Pendiente' : 'Pagada'}
        </span>
        <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 'auto' }}>{new Date(sol.created_at).toLocaleDateString('es-AR')}</span>
      </div>

      {/* Datos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13, marginBottom: 8 }}>
        <div><span style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>SOLICITA</span><div>{sol.solicitante}</div></div>
        <div><span style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>{sol.tipo === 'Reembolso' ? 'A REEMBOLSAR A' : 'PAGAR A'}</span><div>{sol.destinatario}</div></div>
        {sol.rut_cuit && <div><span style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>RUT / CUIT</span><div>{sol.rut_cuit}</div></div>}
        <div style={{ gridColumn: '1 / -1' }}><span style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>MOTIVO</span><div>{sol.motivo}</div></div>
        <div><span style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>MONTO</span><div style={{ fontWeight: 700, fontSize: 15, color: '#264534' }}>{fmt(sol.monto, sol.moneda)}</div></div>
        {sol.datos_cuenta && <div><span style={{ color: '#6B7280', fontSize: 11, fontWeight: 600 }}>DATOS DE CUENTA</span><div style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{sol.datos_cuenta}</div></div>}
      </div>

      {/* Info del pago si ya está pagada */}
      {pagada && (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 6, padding: 10, marginBottom: 8, fontSize: 12 }}>
          <div style={{ fontWeight: 700, color: '#166534', marginBottom: 4 }}>✓ Pagada el {new Date(sol.fecha_pago).toLocaleDateString('es-AR')} por {sol.pagada_por}</div>
          {sol.nota_pago && <div style={{ color: '#374151', fontStyle: 'italic' }}>Nota: {sol.nota_pago}</div>}
        </div>
      )}

      {/* Botones de archivos y acciones */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {sol.factura_path && (
          puedeDescargarFactura ? (
            <button onClick={() => descargar(sol.factura_path)}
              style={{ background: '#EFF6FF', color: '#1e40af', border: '1px solid #BFDBFE', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              📄 Ver factura
            </button>
          ) : (
            <span style={{ background: '#F9FAFB', color: '#9CA3AF', border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600 }}>
              📄 Factura adjunta (descarga restringida)
            </span>
          )
        )}
        {sol.comprobante_pago_path && (
          puedeDescargarFactura ? (
            <button onClick={() => descargar(sol.comprobante_pago_path)}
              style={{ background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              📄 Ver comprobante de pago
            </button>
          ) : (
            <span style={{ background: '#F9FAFB', color: '#9CA3AF', border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600 }}>
              📄 Comprobante adjunto (descarga restringida)
            </span>
          )
        )}

        {extraAdjuntos.map((a: any) => (
          puedeDescargarFactura ? (
            <button key={a.id} onClick={() => descargar(a.file_path)}
              style={{ background: '#EFF6FF', color: '#1e40af', border: '1px solid #BFDBFE', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              📄 {a.file_name}
            </button>
          ) : (
            <span key={a.id} style={{ background: '#F9FAFB', color: '#9CA3AF', border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600 }}>
              📄 Adjunto (descarga restringida)
            </span>
          )
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {puedeMarcar && !pagada && !showAccion && (
            <button onClick={() => setShowAccion(true)}
              style={{ background: '#007271', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              ✓ Marcar como pagada
            </button>
          )}
          {puedeMarcar && pagada && (
            <button onClick={reabrir}
              style={{ background: 'transparent', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
              Reabrir
            </button>
          )}
          {esCreador && !pagada && !editando && (
            <button onClick={() => setEditando(true)}
              style={{ background: 'transparent', color: '#264534', border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              ✎ Editar
            </button>
          )}
          {(puedeMarcar || esCreador) && (
            <button onClick={eliminar}
              style={{ background: 'transparent', color: '#D1D5DB', border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}>
              Eliminar
            </button>
          )}
        </div>
      </div>

      {/* Panel de edicion */}
      {editando && (
        <div style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: 8, padding: 12, marginTop: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#264534', marginBottom: 8 }}>Editar solicitud</div>

          <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 3 }}>{sol.tipo === 'Reembolso' ? 'A reembolsar a' : 'Pagar a'}</label>
          <input value={eDestinatario} onChange={e => setEDestinatario(e.target.value)}
            style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1.5px solid #E5E7EB', fontSize: 12, boxSizing: 'border-box', marginBottom: 8 }} />

          <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 3 }}>RUT / CUIT</label>
          <input value={eRutCuit} onChange={e => setERutCuit(e.target.value)} disabled={eNoAplicaRut}
            style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1.5px solid #E5E7EB', fontSize: 12, boxSizing: 'border-box', marginBottom: 4, background: eNoAplicaRut ? '#F3F4F6' : '#fff' }} />
          {(sol.tipo === 'Reembolso' || sol.tipo === 'Factura equipo interno') && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 11, color: '#6B7280', cursor: 'pointer' }}>
              <input type="checkbox" checked={eNoAplicaRut} onChange={e => { setENoAplicaRut(e.target.checked); if (e.target.checked) setERutCuit('') }} />
              No aplica RUT / CUIT
            </label>
          )}

          <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 3 }}>Motivo</label>
          <textarea value={eMotivo} onChange={e => setEMotivo(e.target.value)} rows={2}
            style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1.5px solid #E5E7EB', fontSize: 12, boxSizing: 'border-box', marginBottom: 8, resize: 'vertical', fontFamily: 'inherit' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8, marginBottom: 8 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 3 }}>Monto</label>
              <input type="number" step="0.01" value={eMonto} onChange={e => setEMonto(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1.5px solid #E5E7EB', fontSize: 12, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 3 }}>Moneda</label>
              <select value={eMoneda} onChange={e => setEMoneda(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1.5px solid #E5E7EB', fontSize: 12, background: '#fff', boxSizing: 'border-box' }}>
                <option value="ARS">ARS</option>
                <option value="UYU">UYU</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 3 }}>Datos de cuenta</label>
          <textarea value={eDatosCuenta} onChange={e => setEDatosCuenta(e.target.value)} rows={2}
            style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1.5px solid #E5E7EB', fontSize: 12, boxSizing: 'border-box', marginBottom: 8, resize: 'vertical', fontFamily: 'inherit' }} />

          {errorEdit && <p style={{ color: '#EF4444', fontSize: 12, margin: '0 0 8px' }}>{errorEdit}</p>}

          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={guardarEdicion} disabled={guardandoEdit}
              style={{ background: '#264534', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: guardandoEdit ? 'not-allowed' : 'pointer', opacity: guardandoEdit ? 0.6 : 1 }}>
              {guardandoEdit ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button onClick={() => { setEditando(false); setErrorEdit('') }}
              style={{ background: 'transparent', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 6, padding: '7px 14px', fontSize: 12, cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Panel de acción para marcar como pagada */}
      {showAccion && (
        <div style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: 8, padding: 12, marginTop: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', marginBottom: 8 }}>Marcar como pagada</div>

          <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 3 }}>Comprobante de pago (PDF, opcional)</label>
          <input type="file" accept="application/pdf" onChange={e => setComprobante(e.target.files?.[0] || null)}
            style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1.5px solid #BBF7D0', fontSize: 12, background: '#fff', boxSizing: 'border-box', marginBottom: 8 }} />

          <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 3 }}>Nota (opcional)</label>
          <input value={nota} onChange={e => setNota(e.target.value)} placeholder="Ej: Transferido desde BBVA cuenta corriente"
            style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1.5px solid #BBF7D0', fontSize: 12, boxSizing: 'border-box', marginBottom: 8 }} />

          {error && <p style={{ color: '#EF4444', fontSize: 12, margin: '0 0 8px' }}>{error}</p>}

          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={marcarPagada} disabled={marcando}
              style={{ background: '#166534', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: marcando ? 'not-allowed' : 'pointer', opacity: marcando ? 0.6 : 1 }}>
              {marcando ? 'Guardando...' : 'Confirmar pagada'}
            </button>
            <button onClick={() => { setShowAccion(false); setNota(''); setComprobante(null); setError('') }}
              style={{ background: 'transparent', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 6, padding: '7px 14px', fontSize: 12, cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

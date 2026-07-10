'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

const PAISES = ['Argentina', 'Uruguay']

export default function FacturasPage() {
  const [facturas, setFacturas] = useState<any[]>([])
  const [casos, setCasos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  // form
  const [paciente, setPaciente] = useState('')
  const [pais, setPais] = useState('Argentina')
  const [casoId, setCasoId] = useState('')
  const [nota, setNota] = useState('')
  const [file, setFile] = useState<File | null>(null)

  async function load() {
    setLoading(true)
    const [{ data: facs }, { data: cs }] = await Promise.all([
      supabase.from('facturas').select('*').order('created_at', { ascending: false }),
      supabase.from('casos').select('id,nro_caso,pac_nombre,pais').order('created_at', { ascending: false }),
    ])
    if (facs) setFacturas(facs)
    if (cs) setCasos(cs)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function subir() {
    setError('')
    if (!file) { setError('Seleccioná un PDF.'); return }
    if (file.type !== 'application/pdf') { setError('El archivo debe ser un PDF.'); return }
    if (!paciente.trim()) { setError('Ingresá el nombre del paciente.'); return }

    setUploading(true)
    const { data: userData } = await supabase.auth.getUser()
    const email = userData.user?.email || 'desconocido'

    // path: {yyyymm}/{uuid}-{safe_name}
    const now = new Date()
    const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
    const safeName = file.name.replace(/[^\w.\-]+/g, '_')
    const uid = crypto.randomUUID()
    const path = `${yyyymm}/${uid}-${safeName}`

    const { error: upErr } = await supabase.storage.from('facturas').upload(path, file, {
      contentType: 'application/pdf',
      upsert: false,
    })
    if (upErr) { setError('Error al subir el PDF: ' + upErr.message); setUploading(false); return }

    const caso = casos.find(c => c.id === casoId)
    const { error: insErr } = await supabase.from('facturas').insert({
      paciente: paciente.trim(),
      pais,
      caso_id: casoId || null,
      nro_caso: caso?.nro_caso || null,
      nota: nota.trim() || null,
      file_path: path,
      subido_por: email,
    })
    if (insErr) {
      setError('Error al guardar: ' + insErr.message)
      await supabase.storage.from('facturas').remove([path])
      setUploading(false); return
    }

    setPaciente(''); setNota(''); setCasoId(''); setFile(null)
    // reset input file
    const inp = document.getElementById('file-input') as HTMLInputElement | null
    if (inp) inp.value = ''
    setUploading(false)
    load()
  }

  async function descargar(f: any) {
    const { data, error: e } = await supabase.storage.from('facturas').createSignedUrl(f.file_path, 60)
    if (e || !data) { alert('No se pudo generar el link.'); return }
    window.open(data.signedUrl, '_blank')
  }

  async function eliminar(f: any) {
    if (!confirm(`Eliminar factura de ${f.paciente}?`)) return
    await supabase.storage.from('facturas').remove([f.file_path])
    await supabase.from('facturas').delete().eq('id', f.id)
    load()
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#264534', marginBottom: 20 }}>Facturas</h1>

      {/* Form de carga */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#264534', marginBottom: 14 }}>Subir nueva factura</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Paciente *</label>
            <input value={paciente} onChange={e => setPaciente(e.target.value)} placeholder="Nombre y apellido"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1.5px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>País *</label>
            <select value={pais} onChange={e => setPais(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1.5px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box', background: '#fff' }}>
              {PAISES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Ticket asociado</label>
            <select value={casoId} onChange={e => setCasoId(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1.5px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box', background: '#fff' }}>
              <option value="">— Ninguno —</option>
              {casos.map(c => (
                <option key={c.id} value={c.id}>{c.nro_caso} · {c.pac_nombre} ({c.pais})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>PDF *</label>
            <input id="file-input" type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1.5px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box', background: '#fff' }} />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Nota (opcional)</label>
          <textarea value={nota} onChange={e => setNota(e.target.value)} placeholder="Cualquier aclaración para Sol..." rows={2}
            style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1.5px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }} />
        </div>

        {error && <p style={{ color: '#EF4444', fontSize: 13, margin: '0 0 12px' }}>{error}</p>}

        <button onClick={subir} disabled={uploading}
          style={{ background: '#264534', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}>
          {uploading ? 'Subiendo...' : 'Subir factura'}
        </button>
      </div>

      {/* Lista */}
      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#264534', marginBottom: 12 }}>
        Facturas cargadas {facturas.length > 0 && <span style={{ color: '#9CA3AF', fontWeight: 400 }}>({facturas.length})</span>}
      </h2>

      {loading ? <p style={{ color: '#9CA3AF', fontSize: 13 }}>Cargando...</p>
        : facturas.length === 0 ? <p style={{ color: '#9CA3AF', fontSize: 13 }}>Aún no hay facturas cargadas.</p>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {facturas.map(f => (
              <div key={f.id} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                    {f.paciente}
                    <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400, marginLeft: 8 }}>· {f.pais}</span>
                    {f.nro_caso && <span style={{ fontSize: 11, background: '#EFF6FF', color: '#1e40af', borderRadius: 4, padding: '2px 7px', marginLeft: 8, fontWeight: 600 }}>{f.nro_caso}</span>}
                  </div>
                  {f.nota && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3, fontStyle: 'italic' }}>{f.nota}</div>}
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>
                    Subido por {f.subido_por} · {new Date(f.created_at).toLocaleString('es-AR')}
                  </div>
                </div>
                <button onClick={() => descargar(f)}
                  style={{ background: '#007271', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  Descargar PDF
                </button>
                <button onClick={() => eliminar(f)}
                  style={{ background: 'transparent', color: '#D1D5DB', border: '1px solid #E5E7EB', borderRadius: 6, padding: '7px 12px', fontSize: 12, cursor: 'pointer' }}>
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
    </div>
  )
}

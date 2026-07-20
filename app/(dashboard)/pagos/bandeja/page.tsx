'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabase'
import { SolicitudCard } from '../../../../components/SolicitudCard'

export default function Page() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [tab, setTab] = useState<'Nueva' | 'Pagada'>('Nueva')
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    setUserEmail(userData.user?.email || '')
    const { data } = await supabase.from('solicitudes_pago')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setSolicitudes(data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const filtradas = solicitudes.filter(s => s.estado === tab)
  const countNuevas = solicitudes.filter(s => s.estado === 'Nueva').length
  const countPagadas = solicitudes.filter(s => s.estado === 'Pagada').length

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#264534', marginBottom: 20 }}>Bandeja de pagos</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1.5px solid #E5E7EB' }}>
        {(['Nueva', 'Pagada'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: '9px 18px', border: 'none', background: 'transparent',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              color: tab === t ? '#264534' : '#9CA3AF',
              borderBottom: tab === t ? '2.5px solid #264534' : '2.5px solid transparent',
              marginBottom: -1.5,
            }}>
            {t === 'Nueva' ? `Pendientes (${countNuevas})` : `Pagadas (${countPagadas})`}
          </button>
        ))}
      </div>

      {loading ? <p style={{ color: '#9CA3AF', fontSize: 13 }}>Cargando...</p>
        : filtradas.length === 0
          ? <p style={{ color: '#9CA3AF', fontSize: 13 }}>{tab === 'Nueva' ? 'No hay solicitudes pendientes 🎉' : 'Aún no hay pagos registrados.'}</p>
          : filtradas.map(s => <SolicitudCard key={s.id} sol={s} userEmail={userEmail} onUpdate={load} />)
      }
    </div>
  )
}

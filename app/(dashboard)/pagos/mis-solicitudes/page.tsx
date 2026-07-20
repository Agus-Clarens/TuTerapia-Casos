'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabase'
import { SolicitudCard } from '../../../../components/SolicitudCard'

export default function Page() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    const email = userData.user?.email || ''
    setUserEmail(email)
    const { data } = await supabase.from('solicitudes_pago')
      .select('*')
      .eq('solicitante_email', email)
      .order('created_at', { ascending: false })
    if (data) setSolicitudes(data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#264534', marginBottom: 20 }}>Mis solicitudes</h1>
      {loading ? <p style={{ color: '#9CA3AF', fontSize: 13 }}>Cargando...</p>
        : solicitudes.length === 0
          ? <p style={{ color: '#9CA3AF', fontSize: 13 }}>Aún no cargaste ninguna solicitud.</p>
          : solicitudes.map(s => <SolicitudCard key={s.id} sol={s} userEmail={userEmail} onUpdate={load} />)
      }
    </div>
  )
}

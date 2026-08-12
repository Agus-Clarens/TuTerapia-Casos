'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [actualizados, setActualizados] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/login')
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') router.replace('/login')
    })
    return () => subscription.unsubscribe()
  }, [router])

  async function cargarActualizados() {
    const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data } = await supabase.from('casos').select('id,nro_caso,area,updated_at,created_at,last_updated_by,estado')
      .neq('estado', 'Cerrado').gte('updated_at', hace24h)
    if (data) {
      const filtrados = data.filter((c: any) => new Date(c.updated_at).getTime() - new Date(c.created_at).getTime() > 60000)
      setActualizados(filtrados)
    }
  }

  useEffect(() => {
    if (loading) return
    cargarActualizados()
    const interval = setInterval(cargarActualizados, 60000)
    return () => clearInterval(interval)
  }, [loading])

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#FEFAF5' }}><p style={{ color:'#264534' }}>Cargando...</p></div>

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <div style={{ width:240, flexShrink:0 }} />
      <main style={{ flex:1, padding: actualizados.length > 0 ? '0 40px 36px' : '36px 40px', background:'#FEFAF5', minHeight:'100vh' }}>
        {actualizados.length > 0 && (
          <div onClick={() => { window.location.href = '/casos?actualizados=1' }} style={{
            position:'sticky', top:0, zIndex:50, cursor:'pointer',
            background:'#FEF3C7', border:'1px solid #FCD34D', borderRadius:8,
            padding:'10px 16px', margin:'20px 0', display:'flex', alignItems:'center', gap:8,
            fontSize:13, color:'#92400E', fontWeight:600, boxShadow:'0 2px 6px rgba(0,0,0,0.08)'
          }}>
            🔔 {actualizados.length === 1 ? '1 caso actualizado' : `${actualizados.length} casos actualizados`} en las últimas 24h — hacé click para revisarlos
          </div>
        )}
        {children}
      </main>
    </div>
  )
}

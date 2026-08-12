'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { nombreDeUsuario } from '../../lib/sectores-usuario'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [actualizados, setActualizados] = useState<any[]>([])
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/login')
      else { setUserEmail(session.user.email || ''); setLoading(false) }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') router.replace('/login')
    })
    return () => subscription.unsubscribe()
  }, [router])

  async function cargarActualizados() {
    if (userEmail === null) return

    // Nombre del usuario segun su email (asi figura como 'autor' en el hilo)
    const miNombre = nombreDeUsuario(userEmail)
    if (!miNombre) { setActualizados([]); return }

    // 1. Casos donde YO participé alguna vez (sin límite de fecha)
    const { data: mias } = await supabase.from('caso_actualizaciones')
      .select('caso_id').eq('autor', miNombre)
    if (!mias) { setActualizados([]); return }
    const casosMios = Array.from(new Set(mias.map((m: any) => m.caso_id)))
    if (casosMios.length === 0) { setActualizados([]); return }

    // 2. De esos casos, traer las actualizaciones de las últimas 24h
    const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: recientes } = await supabase.from('caso_actualizaciones')
      .select('caso_id, autor, created_at')
      .in('caso_id', casosMios)
      .gte('created_at', hace24h)
      .order('created_at', { ascending: true })
    if (!recientes || recientes.length === 0) { setActualizados([]); return }

    // 3. Por cada caso, ver quién hizo la última actualización reciente
    const ultimoPorCaso: Record<string, string> = {}
    for (const a of recientes) ultimoPorCaso[a.caso_id] = a.autor

    // 4. Me quedo con los casos donde la última actualización la hizo OTRA persona
    const idsRelevantes = Object.entries(ultimoPorCaso)
      .filter(([_, ultimoAutor]) => ultimoAutor !== miNombre)
      .map(([id]) => id)

    if (idsRelevantes.length === 0) { setActualizados([]); return }

    // 4. Traer esos casos (que no esten cerrados)
    const { data } = await supabase.from('casos')
      .select('id,nro_caso,area,estado')
      .in('id', idsRelevantes).neq('estado', 'Cerrado')
    setActualizados(data || [])
  }

  useEffect(() => {
    if (loading || userEmail === null) return
    cargarActualizados()
    const interval = setInterval(cargarActualizados, 60000)
    return () => clearInterval(interval)
  }, [loading, userEmail])

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

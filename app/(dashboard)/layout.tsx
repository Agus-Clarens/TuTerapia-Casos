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

    // 5. Traer esos casos (que no esten cerrados) y adjuntar quién los actualizó
    const { data } = await supabase.from('casos')
      .select('id,nro_caso,area,estado')
      .in('id', idsRelevantes).neq('estado', 'Cerrado')
    const conAutor = (data || []).map((c: any) => ({ ...c, ultimoAutor: ultimoPorCaso[c.id] }))
    setActualizados(conAutor)
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
        {actualizados.length > 0 && (() => {
          // Agrupar por quién hizo la última actualización
          const grupos: Record<string, number> = {}
          for (const c of actualizados) {
            const persona = (c.ultimoAutor || 'Alguien').split(' ')[0]
            grupos[persona] = (grupos[persona] || 0) + 1
          }
          // Color grande segun la persona
          const colorDe = (persona: string) => {
            const p = persona.toLowerCase()
            if (p.includes('agus')) return { bg:'#FEF3C7', border:'#F59E0B', text:'#92400E' }       // amarillo
            if (p.includes('sol'))  return { bg:'#EDE9FE', border:'#8B5CF6', text:'#5B21B6' }       // lila
            if (p.includes('belu') || p.includes('orne') || p.includes('caro'))
                                    return { bg:'#DBEAFE', border:'#3B82F6', text:'#1E40AF' }       // azul
            if (p.includes('sofi')) return { bg:'#D1FAE5', border:'#10B981', text:'#065F46' }       // verde
            if (p.includes('flor')) return { bg:'#CCFBF1', border:'#14B8A6', text:'#115E59' }       // turquesa
            return { bg:'#FCE7F3', border:'#EC4899', text:'#9D174F' }                                // rosa (otros)
          }
          return (
            <div style={{ position:'sticky', top:0, zIndex:50, paddingTop:20, paddingBottom:6, background:'#FEFAF5' }}>
              {Object.entries(grupos).map(([persona, cant]) => {
                const col = colorDe(persona)
                return (
                  <div key={persona} onClick={() => { window.location.href = '/casos?actualizados=1' }}
                    style={{
                      cursor:'pointer', background:col.bg, border:`2px solid ${col.border}`, borderRadius:12,
                      padding:'16px 22px', marginBottom:10, display:'flex', alignItems:'center', gap:12,
                      fontSize:18, color:col.text, fontWeight:800, boxShadow:'0 3px 10px rgba(0,0,0,0.10)'
                    }}>
                    <span style={{ fontSize:24 }}>🔔</span>
                    {persona} actualizó {cant === 1 ? '1 caso tuyo' : `${cant} casos tuyos`} — tocá para revisar
                  </div>
                )
              })}
            </div>
          )
        })()}
        {children}
      </main>
    </div>
  )
}

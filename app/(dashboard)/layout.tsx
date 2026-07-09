'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
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

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#FEFAF5' }}><p style={{ color:'#264534' }}>Cargando...</p></div>

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <div style={{ width:240, flexShrink:0 }} />
      <main style={{ flex:1, padding:'36px 40px', background:'#FEFAF5', minHeight:'100vh' }}>
        {children}
      </main>
    </div>
  )
}

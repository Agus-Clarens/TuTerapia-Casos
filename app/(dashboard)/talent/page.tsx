'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { CasoCard, Caso } from '../../../components/CasoCard'

const ord = (e: string) => ({'Nuevo':0,'En curso':1,'Cerrado':3} as Record<string,number>)[e] ?? 2

export default function Page() {
  const [casos, setCasos] = useState<Caso[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const { data } = await supabase.from('casos').select('*').order('created_at', {ascending: false})
    if (data) setCasos(data.filter((c: Caso) => c.area === 'Talent' || c.area === 'Admin+Talent'))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div style={{padding: 24}}>
      <h1 style={{fontSize: 22, fontWeight: 700, color: '#264534', marginBottom: 16}}>Talent</h1>
      {loading ? <p>Cargando...</p> : casos.length === 0
        ? <p style={{color:'#9CA3AF'}}>No hay casos.</p>
        : [...casos].sort((a,b) => ord(a.estado)-ord(b.estado)).map(c =>
            <CasoCard key={c.id} caso={c} onUpdate={load} sector="talent"  />
          )
      }
    </div>
  )
}

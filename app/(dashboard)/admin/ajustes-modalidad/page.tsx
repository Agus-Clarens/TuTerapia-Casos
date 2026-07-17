'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabase'
import { CasoCard, Caso } from '../../../../components/CasoCard'

const ord = (e: string) => ({'Nuevo':0,'En curso':1,'Cerrado':3} as Record<string,number>)[e] ?? 2

export default function Page() {
  const [casos, setCasos] = useState<Caso[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const { data } = await supabase.from('casos').select('*').order('created_at', {ascending: false})
    if (data) setCasos(data.filter((c: any) => c.tipo_caso === 'Ajuste de modalidad de pago'))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div style={{padding: 24}}>
      <h1 style={{fontSize: 22, fontWeight: 700, color: '#264534', marginBottom: 8}}>Ajustes de modalidad de pago</h1>
      <p style={{fontSize: 13, color: '#6B7280', marginBottom: 16}}>Casos donde hay que pagarle a un psicólogo en una modalidad distinta a la que figura en la liquidación.</p>

      {loading ? <p>Cargando...</p> : casos.length === 0
        ? <p style={{color:'#9CA3AF'}}>No hay ajustes pendientes.</p>
        : [...casos].sort((a,b) => ord(a.estado)-ord(b.estado)).map((c: any) => (
            <div key={c.id}>
              {c.psi_nombre && (
                <div style={{margin: '4px 0 -6px 12px', display:'flex', alignItems:'center', gap:8}}>
                  <span style={{fontSize:11, fontWeight:600, color:'#7C3AED', background:'#F3E8FF', padding:'3px 10px', borderRadius:12}}>
                    👤 {c.psi_nombre}
                  </span>
                </div>
              )}
              <CasoCard caso={c} onUpdate={load} sector="admin" />
            </div>
          ))
      }
    </div>
  )
}

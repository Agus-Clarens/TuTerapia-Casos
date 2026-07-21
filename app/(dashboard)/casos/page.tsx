'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { CasoCard, Caso } from '../../../components/CasoCard'

const ord = (e: string) => ({'Nuevo':0,'En curso':1,'Cerrado':3} as Record<string,number>)[e] ?? 2

const SECTORES = ['Todos', 'CX', 'Admin', 'Talent', 'Admin+Talent', 'Business']

export default function Page() {
  const [casos, setCasos] = useState<Caso[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<string>('Todos')

  async function load() {
    const { data } = await supabase.from('casos').select('*').order('created_at', {ascending: false})
    if (data) setCasos(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtrados = filtro === 'Todos' ? casos : casos.filter(c => c.area === filtro)
  const conteoPorSector: Record<string, number> = { Todos: casos.length }
  SECTORES.slice(1).forEach(s => { conteoPorSector[s] = casos.filter(c => c.area === s).length })

  return (
    <div style={{padding: 24}}>
      <h1 style={{fontSize: 22, fontWeight: 700, color: '#264534', marginBottom: 14}}>Todos los casos</h1>

      {/* Filtro por sector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {SECTORES.map(s => {
          const active = filtro === s
          const count = conteoPorSector[s] ?? 0
          return (
            <button key={s} onClick={() => setFiltro(s)}
              style={{
                padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: active ? '1.5px solid #264534' : '1.5px solid #E5E7EB',
                background: active ? '#264534' : '#fff',
                color: active ? '#fff' : '#6B7280',
              }}>
              {s} <span style={{ opacity: 0.6, marginLeft: 4 }}>({count})</span>
            </button>
          )
        })}
      </div>

      {loading ? <p>Cargando...</p> : filtrados.length === 0
        ? <p style={{color:'#9CA3AF'}}>No hay casos {filtro !== 'Todos' ? `en ${filtro}` : ''}.</p>
        : [...filtrados].sort((a,b) => ord(a.estado)-ord(b.estado)).map(c =>
            <CasoCard key={c.id} caso={c} onUpdate={load} sector="todos" showDelete={true} />
          )
      }
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

const MESES_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
function nombreMes(ym: string) {
  const [y, m] = ym.split('-')
  return `${MESES_ES[parseInt(m, 10) - 1]} ${y}`
}

export default function Page() {
  const [casos, setCasos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mes, setMes] = useState<string>('')

  useEffect(() => {
    supabase.from('casos').select('area, tipo_caso, created_at').then(({ data }) => {
      if (data) setCasos(data)
      setLoading(false)
    })
  }, [])

  const meses = Array.from(new Set(casos.map(c => (c.created_at || '').slice(0, 7)).filter(Boolean))).sort().reverse()
  const mesActivo = mes || 'todos'

  const filtrados = mesActivo === 'todos' ? casos : casos.filter(c => (c.created_at || '').slice(0, 7) === mesActivo)

  const conteo: Record<string, number> = {}
  for (const c of filtrados) {
    const t = c.tipo_caso || '(sin tipo)'
    conteo[t] = (conteo[t] || 0) + 1
  }
  const ranking = Object.entries(conteo).sort((a, b) => b[1] - a[1])
  const maxVal = ranking.length > 0 ? ranking[0][1] : 1
  const total = filtrados.length

  const medalla = (i: number) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`

  const pill = (activo: boolean) => ({
    padding: '7px 16px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
    border: activo ? '1.5px solid #264534' : '1.5px solid #E5E7EB',
    background: activo ? '#264534' : '#fff', color: activo ? '#fff' : '#6B7280',
  })

  return (
    <div style={{ padding: 24, maxWidth: 820 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#264534', marginBottom: 6 }}>Métricas</h1>
      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>Ranking de los tipos de caso que más se repiten (todos los sectores).</p>

      <div style={{ display: 'flex', gap: 6, marginBottom: 22, flexWrap: 'wrap' }}>
        <button onClick={() => setMes('todos')} style={pill(mesActivo === 'todos')}>Todos los meses</button>
        {meses.map(m => (
          <button key={m} onClick={() => setMes(m)} style={pill(mesActivo === m)}>{nombreMes(m)}</button>
        ))}
      </div>

      {loading ? <p>Cargando...</p> : (
        <>
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <div style={{ background: '#264534', color: '#fff', borderRadius: 12, padding: '14px 20px', minWidth: 120 }}>
              <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{total}</div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>casos {mesActivo === 'todos' ? 'en total' : 'en el mes'}</div>
            </div>
            <div style={{ background: '#F0FDF4', color: '#264534', borderRadius: 12, padding: '14px 20px', minWidth: 120, border: '1px solid #DCFCE7' }}>
              <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{ranking.length}</div>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>tipos distintos</div>
            </div>
          </div>

          {ranking.length === 0 ? (
            <p style={{ color: '#9CA3AF', fontSize: 13 }}>No hay casos en ese período.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ranking.map(([tipo, cant], i) => {
                const pct = Math.round((cant / total) * 100)
                return (
                  <div key={tipo} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 30, textAlign: 'center', fontSize: i < 3 ? 18 : 13, fontWeight: 700, color: '#6B7280', flexShrink: 0 }}>{medalla(i)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                        <span style={{ fontSize: 13.5, color: '#374151', fontWeight: i < 3 ? 600 : 400 }}>{tipo}</span>
                        <span style={{ fontSize: 13, color: '#6B7280' }}><b style={{ color: '#264534', fontSize: 15 }}>{cant}</b> · {pct}%</span>
                      </div>
                      <div style={{ background: '#F3F4F6', borderRadius: 6, height: 14, overflow: 'hidden' }}>
                        <div style={{ width: `${(cant / maxVal) * 100}%`, background: i === 0 ? '#264534' : '#75B781', height: '100%', borderRadius: 6 }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

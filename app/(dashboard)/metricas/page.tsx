'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

const SECTORES = ['Talent', 'Admin+Talent', 'CX', 'Admin', 'Business']
const MESES_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function nombreMes(ym: string) {
  const [y, m] = ym.split('-')
  return `${MESES_ES[parseInt(m, 10) - 1]} ${y}`
}

export default function Page() {
  const [casos, setCasos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sector, setSector] = useState('Talent')
  const [mes, setMes] = useState<string>('')

  useEffect(() => {
    supabase.from('casos').select('area, tipo_caso, created_at').then(({ data }) => {
      if (data) setCasos(data)
      setLoading(false)
    })
  }, [])

  // Meses disponibles (de más nuevo a más viejo)
  const meses = Array.from(new Set(casos.map(c => (c.created_at || '').slice(0, 7)).filter(Boolean))).sort().reverse()
  const mesActivo = mes || meses[0] || ''

  // Filtrar por sector y mes
  const filtrados = casos.filter(c => c.area === sector && (c.created_at || '').slice(0, 7) === mesActivo)

  // Contar por tipo_caso
  const conteo: Record<string, number> = {}
  for (const c of filtrados) {
    const t = c.tipo_caso || '(sin tipo)'
    conteo[t] = (conteo[t] || 0) + 1
  }
  const ranking = Object.entries(conteo).sort((a, b) => b[1] - a[1])
  const maxVal = ranking.length > 0 ? ranking[0][1] : 1
  const total = filtrados.length

  const pill = (activo: boolean) => ({
    padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
    border: activo ? '1.5px solid #264534' : '1.5px solid #E5E7EB',
    background: activo ? '#264534' : '#fff', color: activo ? '#fff' : '#6B7280',
  })

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#264534', marginBottom: 6 }}>Métricas</h1>
      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>Cantidad de casos por tipo, según sector y mes.</p>

      {/* Filtro de sector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {SECTORES.map(s => (
          <button key={s} onClick={() => setSector(s)} style={pill(sector === s)}>{s}</button>
        ))}
      </div>

      {/* Filtro de mes */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {meses.map(m => (
          <button key={m} onClick={() => setMes(m)} style={pill(mesActivo === m)}>{nombreMes(m)}</button>
        ))}
      </div>

      {loading ? <p>Cargando...</p> : (
        <>
          <div style={{ fontSize: 13, color: '#374151', marginBottom: 14, fontWeight: 600 }}>
            {sector} · {mesActivo ? nombreMes(mesActivo) : '—'} · <span style={{ color: '#264534' }}>{total} caso{total !== 1 ? 's' : ''} en total</span>
          </div>

          {ranking.length === 0 ? (
            <p style={{ color: '#9CA3AF', fontSize: 13 }}>No hay casos de {sector} en ese mes.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ranking.map(([tipo, cant]) => (
                <div key={tipo}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: '#374151' }}>{tipo}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#264534' }}>{cant}</span>
                  </div>
                  <div style={{ background: '#F3F4F6', borderRadius: 6, height: 16, overflow: 'hidden' }}>
                    <div style={{ width: `${(cant / maxVal) * 100}%`, background: '#75B781', height: '100%', borderRadius: 6, transition: 'width 0.3s' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

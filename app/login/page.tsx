'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email o contraseña incorrectos'); setLoading(false); return }
    router.push('/casos')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#264534', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>

      {/* Ilustración de fondo */}
      <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07 }}>
        {/* Persona 1 - izquierda */}
        <circle cx="120" cy="180" r="35" fill="none" stroke="#75B781" strokeWidth="4"/>
        <path d="M80 240 Q120 210 160 240 L170 320 H70 Z" fill="none" stroke="#75B781" strokeWidth="4"/>
        <rect x="60" y="305" width="120" height="75" rx="8" fill="none" stroke="#75B781" strokeWidth="3"/>
        <rect x="70" y="315" width="100" height="55" rx="4" fill="none" stroke="#75B781" strokeWidth="2"/>
        <line x1="50" y1="380" x2="190" y2="380" stroke="#75B781" strokeWidth="4" strokeLinecap="round"/>
        {/* Burbuja 1 */}
        <rect x="170" y="120" width="80" height="50" rx="10" fill="none" stroke="#75B781" strokeWidth="3"/>
        <path d="M185 170 L180 185 L200 170" fill="none" stroke="#75B781" strokeWidth="3"/>
        <circle cx="196" cy="145" r="4" fill="#75B781"/>
        <circle cx="210" cy="145" r="4" fill="#75B781"/>
        <circle cx="224" cy="145" r="4" fill="#75B781"/>

        {/* Persona 2 - derecha */}
        <circle cx="660" cy="200" r="35" fill="none" stroke="#75B781" strokeWidth="4"/>
        <path d="M620 260 Q660 230 700 260 L710 340 H610 Z" fill="none" stroke="#75B781" strokeWidth="4"/>
        <rect x="600" y="325" width="120" height="75" rx="8" fill="none" stroke="#75B781" strokeWidth="3"/>
        <rect x="610" y="335" width="100" height="55" rx="4" fill="none" stroke="#75B781" strokeWidth="2"/>
        <line x1="590" y1="400" x2="730" y2="400" stroke="#75B781" strokeWidth="4" strokeLinecap="round"/>
        {/* Burbuja 2 */}
        <rect x="510" y="140" width="80" height="50" rx="10" fill="none" stroke="#75B781" strokeWidth="3"/>
        <path d="M575 190 L580 205 L560 190" fill="none" stroke="#75B781" strokeWidth="3"/>
        <circle cx="536" cy="165" r="4" fill="#75B781"/>
        <circle cx="550" cy="165" r="4" fill="#75B781"/>
        <circle cx="564" cy="165" r="4" fill="#75B781"/>

        {/* Línea conectora entre las dos personas */}
        <path d="M190 350 Q400 280 610 350" fill="none" stroke="#75B781" strokeWidth="2" strokeDasharray="8 6"/>

        {/* Hojas decorativas */}
        <path d="M350 480 Q370 450 400 460 Q380 490 350 480Z" fill="#75B781" opacity="0.5"/>
        <path d="M420 490 Q440 460 460 475 Q445 500 420 490Z" fill="#75B781" opacity="0.4"/>
        <path d="M300 500 Q310 470 340 478 Q325 505 300 500Z" fill="#75B781" opacity="0.3"/>
        <path d="M460 500 Q480 475 500 488 Q482 510 460 500Z" fill="#75B781" opacity="0.35"/>

        {/* Persona 3 - abajo centro */}
        <circle cx="400" cy="430" r="25" fill="none" stroke="#75B781" strokeWidth="3"/>
        <path d="M370 470 Q400 455 430 470 L438 530 H362 Z" fill="none" stroke="#75B781" strokeWidth="3"/>
      </svg>

      {/* Card de login */}
      <div style={{ position: 'relative', zIndex: 10, background: '#FEFAF5', borderRadius: 20, padding: '40px 48px', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Image src="/logo.png" alt="Tu Terapia" width={180} height={72} style={{ objectFit: 'contain', marginBottom: 8 }} />
          <p style={{ color: '#6B7280', fontSize: 14, margin: 0 }}>Sistema de Gestión de Casos</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 14, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 14, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>
          {error && <p style={{ color: '#EF4444', fontSize: 13, margin: 0 }}>{error}</p>}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ background: '#264534', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4 }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>
      </div>
    </div>
  )
}

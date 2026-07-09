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

      {/* Fondo con ilustración */}
      <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07 }}>
        {/* Persona izq */}
        <circle cx="120" cy="160" r="35" fill="none" stroke="#75B781" strokeWidth="4"/>
        <path d="M80 220 Q120 200 160 220 L168 300 H72 Z" fill="none" stroke="#75B781" strokeWidth="4"/>
        <rect x="60" y="285" width="120" height="75" rx="8" fill="none" stroke="#75B781" strokeWidth="3"/>
        <rect x="70" y="295" width="100" height="55" rx="4" fill="none" stroke="#75B781" strokeWidth="2"/>
        <line x1="48" y1="360" x2="192" y2="360" stroke="#75B781" strokeWidth="4" strokeLinecap="round"/>
        <rect x="165" y="105" width="80" height="48" rx="10" fill="none" stroke="#75B781" strokeWidth="3"/>
        <path d="M170 153 L165 168 L182 153" fill="none" stroke="#75B781" strokeWidth="3"/>
        <circle cx="190" cy="129" r="4" fill="#75B781"/>
        <circle cx="205" cy="129" r="4" fill="#75B781"/>
        <circle cx="220" cy="129" r="4" fill="#75B781"/>
        {/* Persona der */}
        <circle cx="660" cy="180" r="35" fill="none" stroke="#75B781" strokeWidth="4"/>
        <path d="M620 240 Q660 220 700 240 L708 320 H612 Z" fill="none" stroke="#75B781" strokeWidth="4"/>
        <rect x="600" y="305" width="120" height="75" rx="8" fill="none" stroke="#75B781" strokeWidth="3"/>
        <rect x="610" y="315" width="100" height="55" rx="4" fill="none" stroke="#75B781" strokeWidth="2"/>
        <line x1="588" y1="380" x2="732" y2="380" stroke="#75B781" strokeWidth="4" strokeLinecap="round"/>
        <rect x="510" y="122" width="80" height="48" rx="10" fill="none" stroke="#75B781" strokeWidth="3"/>
        <path d="M575 170 L580 185 L563 170" fill="none" stroke="#75B781" strokeWidth="3"/>
        <circle cx="534" cy="146" r="4" fill="#75B781"/>
        <circle cx="550" cy="146" r="4" fill="#75B781"/>
        <circle cx="566" cy="146" r="4" fill="#75B781"/>
        {/* Persona centro abajo */}
        <circle cx="400" cy="420" r="28" fill="none" stroke="#75B781" strokeWidth="3"/>
        <path d="M368 468 Q400 452 432 468 L438 530 H362 Z" fill="none" stroke="#75B781" strokeWidth="3"/>
        {/* Lineas conectoras */}
        <path d="M200 320 Q300 260 368 380" fill="none" stroke="#75B781" strokeWidth="2" strokeDasharray="8 5"/>
        <path d="M600 320 Q500 260 432 380" fill="none" stroke="#75B781" strokeWidth="2" strokeDasharray="8 5"/>
        {/* Hojas */}
        <path d="M350 520 Q370 495 395 505 Q378 528 350 520Z" fill="#75B781" opacity="0.5"/>
        <path d="M410 525 Q432 500 452 513 Q436 535 410 525Z" fill="#75B781" opacity="0.4"/>
        <path d="M300 510 Q315 485 340 495 Q325 518 300 510Z" fill="#75B781" opacity="0.3"/>
      </svg>

      {/* Card */}
      <div style={{ position: 'relative', zIndex: 10, background: '#FEFAF5', borderRadius: 20, padding: '40px 48px', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Image src="/logo.png" alt="Tu Terapia" width={180} height={72} style={{ objectFit: 'contain', marginBottom: 8 }} />
          <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>Sistema de Gestión de Casos Internos</p>
          <p style={{ color: '#9CA3AF', fontSize: 11, margin: '4px 0 0', fontStyle: 'italic' }}>CX · Admin · Talent — juntas llegamos más lejos 🌿</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 14, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 14, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }} />
          </div>
          {error && <p style={{ color: '#EF4444', fontSize: 13, margin: 0 }}>{error}</p>}
          <button onClick={handleLogin} disabled={loading}
            style={{ background: '#264534', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4 }}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>
      </div>
    </div>
  )
}

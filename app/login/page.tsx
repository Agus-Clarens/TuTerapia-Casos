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
    <div style={{ minHeight: '100vh', background: '#FEFAF5', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '40px 24px 90px' }}>

      {/* Ilustración al costado izquierdo: paciente en diván con terapeuta (dibujo a color) */}
      <svg viewBox="0 0 820 560" xmlns="http://www.w3.org/2000/svg"
        className="login-illustration"
        style={{ position: 'absolute', left: '1%', top: '50%', transform: 'translateY(-50%)', width: '48%', maxWidth: 640, height: 'auto', opacity: 0.96 }}>

        {/* Alfombra */}
        <ellipse cx="360" cy="478" rx="300" ry="28" fill="#EDE3D3"/>

        {/* Diván */}
        <rect x="90" y="330" width="420" height="100" rx="28" fill="#75B781" stroke="#264534" strokeWidth="5"/>
        <rect x="470" y="200" width="70" height="230" rx="22" fill="#5FA070" stroke="#264534" strokeWidth="5"/>
        <rect x="60" y="300" width="55" height="130" rx="20" fill="#5FA070" stroke="#264534" strokeWidth="5"/>
        <rect x="110" y="428" width="14" height="30" rx="4" fill="#264534"/>
        <rect x="470" y="428" width="14" height="30" rx="4" fill="#264534"/>

        {/* Paciente: piernas */}
        <path d="M118 358 Q95 345 88 312 Q84 294 100 290 Q115 288 120 305 Q126 332 148 350 Z" fill="#FCD07F" stroke="#264534" strokeWidth="4"/>
        {/* Paciente: torso */}
        <rect x="140" y="328" width="220" height="70" rx="35" fill="#007271" stroke="#264534" strokeWidth="5"/>
        {/* Paciente: brazo */}
        <path d="M230 338 Q252 318 278 320" fill="none" stroke="#F4C89A" strokeWidth="16" strokeLinecap="round"/>
        {/* Paciente: cabeza */}
        <circle cx="420" cy="328" r="42" fill="#F4C89A" stroke="#264534" strokeWidth="5"/>
        {/* Paciente: pelo */}
        <path d="M382 318 Q380 278 420 273 Q462 278 460 318 Q450 296 420 294 Q392 296 382 318Z" fill="#264534"/>

        {/* Globo de diálogo de la paciente */}
        <path d="M290 130 h280 a20 20 0 0 1 20 20 v85 a20 20 0 0 1 -20 20 h-150 l-28 34 l4 -34 h-106 a20 20 0 0 1 -20 -20 v-85 a20 20 0 0 1 20 -20 Z" fill="#FEFAF5" stroke="#264534" strokeWidth="5"/>
        <text x="430" y="172" textAnchor="middle" fontFamily="Georgia, serif" fontSize="21" fontWeight="700" fill="#264534">¡Qué bueno que</text>
        <text x="430" y="202" textAnchor="middle" fontFamily="Georgia, serif" fontSize="21" fontWeight="700" fill="#264534">encontré a Tu Terapia! 🌿</text>

        {/* Terapeuta: silla */}
        <rect x="560" y="260" width="130" height="18" rx="8" fill="#264534"/>
        <rect x="565" y="180" width="18" height="105" rx="8" fill="#264534"/>
        <rect x="665" y="260" width="18" height="80" rx="8" fill="#264534"/>
        <rect x="575" y="260" width="18" height="80" rx="8" fill="#264534"/>

        {/* Terapeuta: cuerpo */}
        <path d="M585 190 Q585 165 610 160 L655 160 Q680 160 680 185 L685 268 L580 268 Z" fill="#75B781" stroke="#264534" strokeWidth="5"/>
        {/* Terapeuta: cabeza */}
        <circle cx="632" cy="140" r="35" fill="#F4C89A" stroke="#264534" strokeWidth="5"/>
        {/* Terapeuta: pelo */}
        <path d="M600 130 Q602 103 632 100 Q662 103 664 130" fill="#264534"/>
        {/* Terapeuta: anteojos */}
        <circle cx="620" cy="140" r="9" fill="none" stroke="#264534" strokeWidth="3"/>
        <circle cx="645" cy="140" r="9" fill="none" stroke="#264534" strokeWidth="3"/>
        <line x1="629" y1="140" x2="636" y2="140" stroke="#264534" strokeWidth="3"/>

        {/* Terapeuta: libreta y brazo */}
        <path d="M685 218 Q660 213 650 198" fill="none" stroke="#F4C89A" strokeWidth="14" strokeLinecap="round"/>
        <rect x="670" y="205" width="55" height="70" rx="6" fill="#FEFAF5" stroke="#264534" strokeWidth="4"/>
        <line x1="680" y1="222" x2="715" y2="222" stroke="#264534" strokeWidth="3"/>
        <line x1="680" y1="235" x2="715" y2="235" stroke="#264534" strokeWidth="3"/>
        <line x1="680" y1="248" x2="700" y2="248" stroke="#264534" strokeWidth="3"/>

        {/* Planta decorativa */}
        <rect x="30" y="440" width="16" height="60" rx="4" fill="#264534"/>
        <path d="M38 435 Q20 405 5 400 Q28 415 38 435Z" fill="#75B781"/>
        <path d="M38 425 Q60 398 80 396 Q58 410 38 425Z" fill="#75B781"/>
        <path d="M38 445 Q22 420 10 412 Q28 425 38 445Z" fill="#5FA070"/>
      </svg>

      <style>{`
        @media (max-width: 900px) {
          .login-illustration { display: none; }
        }
      `}</style>
      <div style={{ position: 'relative', zIndex: 10, background: '#fff', borderRadius: 20, padding: '40px 48px', width: '100%', maxWidth: 420, boxShadow: '0 8px 40px rgba(38,69,52,0.12)', border: '1px solid rgba(38,69,52,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Image src="/logo.png" alt="Tu Terapia" width={170} height={96} style={{ objectFit: 'contain', display: 'block', margin: '0 auto 8px' }} />
          <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>Sistema de Gestión de Casos</p>
          <p style={{ color: '#9CA3AF', fontSize: 11, margin: '4px 0 0' }}>CX · Admin · Talent</p>
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

      {/* Frase fija abajo, siempre visible */}
      <p style={{ position: 'absolute', bottom: 28, left: 0, width: '100%', textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: 18, fontStyle: 'italic', color: '#264534', opacity: 0.55, margin: 0, zIndex: 5 }}>
        un espacio para sanar
      </p>
    </div>
  )
}

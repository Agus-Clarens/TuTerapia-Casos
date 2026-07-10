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

      {/* Ilustración al costado izquierdo: sesión online, estilo del Instagram de la marca (línea simple, un solo color) */}
      <svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg"
        className="login-illustration"
        style={{ position: 'absolute', left: '1%', top: '50%', transform: 'translateY(-50%)', width: '44%', maxWidth: 560, height: 'auto', opacity: 1 }}>

        {/* Almohadón */}
        <ellipse cx="190" cy="412" rx="105" ry="20" fill="#DCEEDD" stroke="#264534" strokeWidth="3"/>

        {/* Piernas cruzadas (sentada) */}
        <path d="M100 402 Q92 366 135 358 Q165 353 190 368 Q215 353 245 358 Q288 366 280 402" fill="none" stroke="#264534" strokeWidth="4" strokeLinecap="round"/>

        {/* Torso */}
        <path d="M148 372 Q145 315 190 308 Q235 315 232 372" fill="none" stroke="#264534" strokeWidth="4"/>

        {/* Brazo apoyado (mano cerca del mentón) */}
        <path d="M150 340 Q126 328 122 300 Q120 288 132 285" fill="none" stroke="#264534" strokeWidth="4" strokeLinecap="round"/>

        {/* Cabeza */}
        <circle cx="188" cy="272" r="34" fill="none" stroke="#264534" strokeWidth="4"/>
        {/* Pelo */}
        <path d="M156 262 Q152 232 188 226 Q224 232 222 262 Q222 250 188 246 Q156 250 156 262Z" fill="none" stroke="#264534" strokeWidth="3.5"/>

        {/* Mesita baja */}
        <line x1="95" y1="440" x2="95" y2="458" stroke="#264534" strokeWidth="4" strokeLinecap="round"/>
        <line x1="300" y1="440" x2="300" y2="458" stroke="#264534" strokeWidth="4" strokeLinecap="round"/>
        <line x1="85" y1="440" x2="310" y2="440" stroke="#264534" strokeWidth="4" strokeLinecap="round"/>

        {/* Laptop abierta con videollamada */}
        <path d="M140 438 L255 438 L266 418 L129 418 Z" fill="none" stroke="#264534" strokeWidth="3.5"/>
        <path d="M148 418 L247 418 L242 340 L153 340 Z" fill="none" stroke="#264534" strokeWidth="3.5"/>
        {/* Cara en la pantalla (terapeuta en videollamada) */}
        <circle cx="197" cy="378" r="20" fill="none" stroke="#264534" strokeWidth="3"/>
        <path d="M188 384 Q197 390 206 384" fill="none" stroke="#264534" strokeWidth="2.5" strokeLinecap="round"/>

        {/* Cuaderno y lápiz al lado */}
        <rect x="320" y="415" width="55" height="40" rx="3" fill="none" stroke="#264534" strokeWidth="3"/>
        <line x1="330" y1="428" x2="365" y2="428" stroke="#264534" strokeWidth="2"/>
        <line x1="330" y1="438" x2="365" y2="438" stroke="#264534" strokeWidth="2"/>
        <line x1="330" y1="448" x2="352" y2="448" stroke="#264534" strokeWidth="2"/>

        {/* Taza */}
        <path d="M40 430 Q40 448 58 448 Q76 448 76 430 Z" fill="none" stroke="#264534" strokeWidth="3"/>
        <path d="M76 434 Q90 434 88 444 Q86 452 76 450" fill="none" stroke="#264534" strokeWidth="2.5"/>

        {/* Plantita */}
        <path d="M470 445 Q468 400 470 370" stroke="#264534" strokeWidth="3" fill="none"/>
        <path d="M470 400 Q440 385 428 360 Q455 372 470 400Z" fill="none" stroke="#264534" strokeWidth="3"/>
        <path d="M470 385 Q502 368 516 345 Q488 360 470 385Z" fill="none" stroke="#264534" strokeWidth="3"/>

        {/* Globo de diálogo */}
        <path d="M40 60 h380 a20 20 0 0 1 20 20 v90 a20 20 0 0 1 -20 20 h-210 l-20 42 l-4 -42 h-146 a20 20 0 0 1 -20 -20 v-90 a20 20 0 0 1 20 -20 Z" fill="#FEFAF5" stroke="#264534" strokeWidth="4"/>
        <text x="230" y="105" textAnchor="middle" fontFamily="Georgia, serif" fontSize="23" fontWeight="700" fill="#264534">¡Qué bueno que</text>
        <text x="230" y="140" textAnchor="middle" fontFamily="Georgia, serif" fontSize="23" fontWeight="700" fill="#264534">encontré a Tu Terapia! 🌿</text>
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

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

      {/* Ilustración al costado izquierdo: sillón + mesita + lámpara + cuadros */}
      <svg viewBox="0 0 700 500" xmlns="http://www.w3.org/2000/svg"
        className="login-illustration"
        style={{ position: 'absolute', left: '1%', top: '50%', transform: 'translateY(-50%)', width: '38%', maxWidth: 500, height: 'auto', opacity: 1 }}>

        {/* Cuadro en la pared (arriba a la izquierda del sillón) */}
        <rect x="40" y="60" width="90" height="70" rx="4" fill="none" stroke="#264534" strokeWidth="3"/>
        <path d="M52 118 Q70 88 88 100 Q104 108 118 88" fill="none" stroke="#264534" strokeWidth="2.5"/>
        <circle cx="65" cy="80" r="6" fill="none" stroke="#264534" strokeWidth="2.5"/>

        {/* Cuadro chiquito */}
        <rect x="150" y="80" width="50" height="60" rx="3" fill="none" stroke="#264534" strokeWidth="3"/>
        <path d="M158 130 L175 105 L192 130" fill="none" stroke="#264534" strokeWidth="2.5"/>

        {/* Lámpara de pie */}
        <path d="M410 100 L440 100 L448 155 L402 155 Z" fill="none" stroke="#264534" strokeWidth="3.5"/>
        <line x1="425" y1="155" x2="425" y2="405" stroke="#264534" strokeWidth="4" strokeLinecap="round"/>
        <ellipse cx="425" cy="410" rx="30" ry="6" fill="none" stroke="#264534" strokeWidth="4"/>

        {/* Alfombra */}
        <ellipse cx="270" cy="415" rx="230" ry="18" fill="none" stroke="#264534" strokeWidth="2.5"/>
        <ellipse cx="270" cy="415" rx="200" ry="14" fill="none" stroke="#264534" strokeWidth="1.5"/>

        {/* Sillón orejero */}
        <path d="M105 305 Q105 220 165 216 Q195 214 200 240 Q205 214 235 216 Q295 220 295 305 L295 365 Q295 385 275 385 L125 385 Q105 385 105 365 Z" fill="none" stroke="#264534" strokeWidth="5"/>
        {/* Orejas del sillón (respaldos altos laterales) */}
        <path d="M105 305 L75 305 Q62 305 62 322 L62 352 Q62 368 78 368 L105 368" fill="none" stroke="#264534" strokeWidth="5"/>
        <path d="M295 305 L325 305 Q338 305 338 322 L338 352 Q338 368 322 368 L295 368" fill="none" stroke="#264534" strokeWidth="5"/>
        {/* Patas */}
        <line x1="130" y1="385" x2="130" y2="410" stroke="#264534" strokeWidth="5" strokeLinecap="round"/>
        <line x1="270" y1="385" x2="270" y2="410" stroke="#264534" strokeWidth="5" strokeLinecap="round"/>
        {/* Almohadón del asiento */}
        <path d="M135 348 Q200 362 265 348 L262 305 Q200 315 138 305 Z" fill="none" stroke="#264534" strokeWidth="3"/>
        {/* Cojin decorativo */}
        <path d="M155 280 Q158 258 185 258 Q212 258 215 280 Q212 302 185 302 Q158 302 155 280Z" fill="none" stroke="#264534" strokeWidth="3"/>
        <path d="M170 268 Q185 275 200 268" fill="none" stroke="#264534" strokeWidth="2" strokeLinecap="round"/>

        {/* Mesita lateral */}
        <line x1="480" y1="335" x2="480" y2="410" stroke="#264534" strokeWidth="4" strokeLinecap="round"/>
        <ellipse cx="480" cy="330" rx="65" ry="9" fill="none" stroke="#264534" strokeWidth="4"/>

        {/* Planta en maceta sobre la mesita */}
        <path d="M455 322 L455 292" stroke="#264534" strokeWidth="3" fill="none"/>
        <path d="M455 306 Q435 296 428 275 Q450 285 455 306Z" fill="none" stroke="#264534" strokeWidth="3"/>
        <path d="M455 296 Q477 286 484 264 Q464 274 455 296Z" fill="none" stroke="#264534" strokeWidth="3"/>
        <path d="M442 322 L468 322 L464 342 L446 342 Z" fill="none" stroke="#264534" strokeWidth="3"/>

        {/* Taza sobre la mesita */}
        <path d="M495 310 Q495 324 508 324 Q521 324 521 310 Z" fill="none" stroke="#264534" strokeWidth="3"/>
        <path d="M521 312 Q532 312 530 322 Q528 330 519 328" fill="none" stroke="#264534" strokeWidth="2.5"/>

        {/* Plantita chica junto al sillón (piso, izquierda) */}
        <path d="M35 435 L35 400" stroke="#264534" strokeWidth="3" fill="none"/>
        <path d="M35 415 Q15 400 10 380 Q30 395 35 415Z" fill="none" stroke="#264534" strokeWidth="3"/>
        <path d="M35 405 Q58 392 65 372 Q42 385 35 405Z" fill="none" stroke="#264534" strokeWidth="3"/>
        <path d="M22 435 L48 435 L44 458 L26 458 Z" fill="none" stroke="#264534" strokeWidth="3"/>
      </svg>

      {/* Foto del equipo, chiquita del lado derecho */}
      <div className="login-illustration" style={{ position: 'absolute', right: '2%', top: '50%', transform: 'translateY(-50%)', width: '22%', maxWidth: 280, zIndex: 5 }}>
        <Image src="/equipo.png" alt="Equipo Tu Terapia" width={280} height={240} style={{ width: '100%', height: 'auto', display: 'block' }} />
        <p style={{ textAlign: 'center', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13, color: '#264534', opacity: 0.7, marginTop: 8 }}>
          Todo el equipo, en un solo lugar
        </p>
      </div>

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
      <p style={{ position: 'absolute', bottom: 28, left: 0, width: '100%', textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: 16, fontStyle: 'italic', color: '#264534', opacity: 0.6, margin: 0, zIndex: 5 }}>
        Coordinando CX, Admin y Talent — un solo equipo, una sola conversación
      </p>
    </div>
  )
}

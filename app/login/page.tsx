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

      {/* Ilustración al costado izquierdo: escena minimalista de objetos, sin personas */}
      <svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg"
        className="login-illustration"
        style={{ position: 'absolute', left: '1%', top: '50%', transform: 'translateY(-50%)', width: '46%', maxWidth: 600, height: 'auto', opacity: 1 }}>

        {/* Alfombra */}
        <ellipse cx="330" cy="410" rx="270" ry="20" fill="none" stroke="#264534" strokeWidth="2"/>

        {/* Sillón orejero (vacío) */}
        <path d="M120 300 Q120 220 175 216 Q205 214 210 240 Q215 214 245 216 Q300 220 300 300 L300 360 Q300 378 282 378 L138 378 Q120 378 120 360 Z" fill="none" stroke="#264534" strokeWidth="5"/>
        <path d="M120 300 L90 300 Q78 300 78 315 L78 340 Q78 355 92 355 L120 355" fill="none" stroke="#264534" strokeWidth="5"/>
        <path d="M300 300 L330 300 Q342 300 342 315 L342 340 Q342 355 328 355 L300 355" fill="none" stroke="#264534" strokeWidth="5"/>
        <line x1="140" y1="378" x2="140" y2="404" stroke="#264534" strokeWidth="5" strokeLinecap="round"/>
        <line x1="280" y1="378" x2="280" y2="404" stroke="#264534" strokeWidth="5" strokeLinecap="round"/>
        {/* almohadón del sillón */}
        <path d="M148 340 Q210 355 272 340 L272 300 Q210 312 148 300 Z" fill="none" stroke="#264534" strokeWidth="3"/>

        {/* Mesita lateral con planta y taza */}
        <line x1="400" y1="330" x2="400" y2="405" stroke="#264534" strokeWidth="4" strokeLinecap="round"/>
        <ellipse cx="400" cy="325" rx="70" ry="10" fill="none" stroke="#264534" strokeWidth="4"/>

        {/* Planta en maceta sobre la mesita */}
        <path d="M370 318 L370 285" stroke="#264534" strokeWidth="3" fill="none"/>
        <path d="M370 300 Q348 288 340 265 Q362 275 370 300Z" fill="none" stroke="#264534" strokeWidth="3"/>
        <path d="M370 290 Q394 278 402 256 Q380 266 370 290Z" fill="none" stroke="#264534" strokeWidth="3"/>
        <path d="M355 318 L385 318 L380 340 L360 340 Z" fill="none" stroke="#264534" strokeWidth="3"/>

        {/* Taza sobre la mesita */}
        <path d="M415 305 Q415 320 428 320 Q441 320 441 305 Z" fill="none" stroke="#264534" strokeWidth="3"/>
        <path d="M441 308 Q452 308 450 317 Q448 325 439 323" fill="none" stroke="#264534" strokeWidth="2.5"/>

        {/* Ventana con cortina, fondo */}
        <rect x="500" y="90" width="150" height="190" rx="6" fill="none" stroke="#264534" strokeWidth="3"/>
        <line x1="575" y1="90" x2="575" y2="280" stroke="#264534" strokeWidth="2"/>
        <line x1="500" y1="185" x2="650" y2="185" stroke="#264534" strokeWidth="2"/>
        <path d="M500 90 Q520 130 512 185" fill="none" stroke="#264534" strokeWidth="2"/>

        {/* Hojitas sueltas decorativas */}
        <path d="M40 150 Q28 135 42 122 Q56 135 40 150Z" fill="none" stroke="#264534" strokeWidth="2.5"/>
        <path d="M470 415 Q458 401 472 389 Q486 401 470 415Z" fill="none" stroke="#264534" strokeWidth="2.5"/>
      </svg>

      {/* Dibujos decorativos del otro lado (derecha), mismo estilo */}
      <svg viewBox="0 0 300 500" xmlns="http://www.w3.org/2000/svg"
        className="login-illustration"
        style={{ position: 'absolute', right: '1%', top: '50%', transform: 'translateY(-50%)', width: '18%', maxWidth: 230, height: 'auto', opacity: 1 }}>
        {/* Planta alta en maceta */}
        <path d="M60 430 L60 300" stroke="#264534" strokeWidth="3" fill="none"/>
        <path d="M60 340 Q30 320 20 285 Q50 300 60 340Z" fill="none" stroke="#264534" strokeWidth="3"/>
        <path d="M60 320 Q95 300 108 268 Q78 285 60 320Z" fill="none" stroke="#264534" strokeWidth="3"/>
        <path d="M60 360 Q35 345 26 318 Q52 330 60 360Z" fill="none" stroke="#264534" strokeWidth="3"/>
        <path d="M38 430 L82 430 L76 470 L44 470 Z" fill="none" stroke="#264534" strokeWidth="3"/>

        {/* Pila de libros */}
        <rect x="150" y="80" width="90" height="16" rx="3" fill="none" stroke="#264534" strokeWidth="3"/>
        <rect x="158" y="96" width="78" height="16" rx="3" fill="none" stroke="#264534" strokeWidth="3"/>
        <rect x="150" y="112" width="86" height="16" rx="3" fill="none" stroke="#264534" strokeWidth="3"/>

        {/* Reloj */}
        <circle cx="200" cy="230" r="34" fill="none" stroke="#264534" strokeWidth="3"/>
        <line x1="200" y1="230" x2="200" y2="210" stroke="#264534" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="200" y1="230" x2="215" y2="236" stroke="#264534" strokeWidth="2.5" strokeLinecap="round"/>

        {/* Hojitas sueltas */}
        <path d="M90 220 Q78 205 92 192 Q106 205 90 220Z" fill="none" stroke="#264534" strokeWidth="2.5"/>
        <path d="M110 410 Q98 396 112 384 Q126 396 110 410Z" fill="none" stroke="#264534" strokeWidth="2.5"/>
        <path d="M180 380 Q168 366 182 354 Q196 366 180 380Z" fill="none" stroke="#264534" strokeWidth="2.5"/>
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

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
      <svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"
        className="login-illustration"
        style={{ position: 'absolute', left: '0.5%', top: '50%', transform: 'translateY(-50%)', width: '50%', maxWidth: 660, height: 'auto', opacity: 0.98 }}>

        {/* Alfombra */}
        <ellipse cx="330" cy="410" rx="270" ry="24" fill="#EDE3D3"/>

        {/* Diván (chaise longue) */}
        <rect x="70" y="308" width="380" height="82" rx="38" fill="#75B781" stroke="#264534" strokeWidth="5"/>
        <path d="M420 308 Q420 218 488 214 Q542 212 542 258 Q542 298 494 304 Q452 308 420 308 Z" fill="#5FA070" stroke="#264534" strokeWidth="5"/>
        <rect x="100" y="386" width="14" height="26" rx="4" fill="#264534"/>
        <rect x="420" y="386" width="14" height="26" rx="4" fill="#264534"/>

        {/* Paciente: cuerpo/vestido reclinado */}
        <path d="M108 336 Q92 330 90 310 Q88 292 106 288 Q122 285 127 304 Q131 320 150 328 L338 344 Q364 347 364 367 Q364 384 338 382 L128 371 Q110 367 108 350 Z" fill="#9CAF88" stroke="#264534" strokeWidth="4"/>
        {/* Paciente: brazo (apoyado sobre el torso, con mano) */}
        <path d="M195 348 Q225 332 255 336 Q268 338 270 345" fill="none" stroke="#F4C89A" strokeWidth="15" strokeLinecap="round"/>
        <circle cx="271" cy="346" r="9" fill="#F4C89A" stroke="#264534" strokeWidth="3"/>
        {/* Paciente: pelo (detrás de la cabeza, fluyendo al hombro) */}
        <path d="M353 302 Q347 268 393 258 Q439 268 433 302 Q433 322 418 334 L418 378 Q400 384 384 378 L384 336 Q363 324 353 302Z" fill="#5B4433" stroke="#264534" strokeWidth="3"/>
        {/* Paciente: cabeza */}
        <circle cx="393" cy="342" r="38" fill="#F4C89A" stroke="#264534" strokeWidth="4"/>

        {/* Globo de diálogo de la paciente */}
        <path d="M155 128 h300 a22 22 0 0 1 22 22 v78 a22 22 0 0 1 -22 22 h-160 l-15 40 l-15 -40 h-110 a22 22 0 0 1 -22 -22 v-78 a22 22 0 0 1 22 -22 Z" fill="#FEFAF5" stroke="#264534" strokeWidth="5"/>
        <text x="305" y="168" textAnchor="middle" fontFamily="Georgia, serif" fontSize="20" fontWeight="700" fill="#264534">¡Qué bueno que</text>
        <text x="305" y="196" textAnchor="middle" fontFamily="Georgia, serif" fontSize="20" fontWeight="700" fill="#264534">encontré a Tu Terapia! 🌿</text>

        {/* Terapeuta: sillón */}
        <path d="M578 300 Q578 195 645 190 Q705 190 705 258 L710 348 Q710 364 694 364 L588 364 Q574 364 574 348 Z" fill="#8B6B4A" stroke="#264534" strokeWidth="5"/>
        <rect x="590" y="360" width="14" height="26" rx="4" fill="#264534"/>
        <rect x="685" y="360" width="14" height="26" rx="4" fill="#264534"/>

        {/* Terapeuta: cuerpo (traje) */}
        <path d="M600 250 Q600 222 625 217 L665 217 Q690 222 690 250 L695 340 L595 340 Z" fill="#A9875F" stroke="#264534" strokeWidth="4"/>
        {/* Terapeuta: cuello camisa */}
        <path d="M632 225 L645 240 L658 225" fill="#FEFAF5" stroke="#264534" strokeWidth="2"/>

        {/* Terapeuta: cabeza (pelado) */}
        <circle cx="645" cy="192" r="34" fill="#F4C89A" stroke="#264534" strokeWidth="4"/>
        {/* Terapeuta: pelo lateral canoso */}
        <path d="M613 195 Q610 210 618 222" fill="none" stroke="#264534" strokeWidth="4" strokeLinecap="round"/>
        <path d="M677 195 Q680 210 672 222" fill="none" stroke="#264534" strokeWidth="4" strokeLinecap="round"/>
        {/* Terapeuta: anteojos */}
        <circle cx="632" cy="195" r="9" fill="none" stroke="#264534" strokeWidth="3"/>
        <circle cx="658" cy="195" r="9" fill="none" stroke="#264534" strokeWidth="3"/>
        <line x1="641" y1="195" x2="649" y2="195" stroke="#264534" strokeWidth="3"/>
        {/* Terapeuta: bigote */}
        <path d="M636 210 Q645 216 654 210" fill="none" stroke="#264534" strokeWidth="4" strokeLinecap="round"/>

        {/* Terapeuta: libreta + brazo */}
        <path d="M600 275 Q588 280 582 296" fill="none" stroke="#F4C89A" strokeWidth="14" strokeLinecap="round"/>
        <rect x="565" y="288" width="50" height="64" rx="6" fill="#FEFAF5" stroke="#264534" strokeWidth="4"/>
        <line x1="574" y1="304" x2="605" y2="304" stroke="#264534" strokeWidth="3"/>
        <line x1="574" y1="317" x2="605" y2="317" stroke="#264534" strokeWidth="3"/>
        <line x1="574" y1="330" x2="594" y2="330" stroke="#264534" strokeWidth="3"/>

        {/* Nube de pensamiento del terapeuta */}
        <circle cx="700" cy="120" r="10" fill="none" stroke="#264534" strokeWidth="3"/>
        <circle cx="716" cy="105" r="7" fill="none" stroke="#264534" strokeWidth="3"/>
        <path d="M660 70 Q650 40 685 32 Q700 15 725 28 Q755 25 758 55 Q778 62 768 85 Q772 105 745 105 Q735 118 715 108 Q685 112 680 90 Q655 90 660 70Z" fill="none" stroke="#264534" strokeWidth="3.5"/>
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

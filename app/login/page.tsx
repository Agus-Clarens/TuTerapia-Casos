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
    <div style={{ minHeight: '100vh', background: '#FEFAF5', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, position: 'relative', overflow: 'hidden', padding: '40px 24px 90px' }}>

      {/* Ilustración al costado: paciente en diván con terapeuta */}
      <svg viewBox="0 0 1200 700" xmlns="http://www.w3.org/2000/svg"
        className="login-illustration"
        style={{ width: '46%', maxWidth: 560, height: 'auto', opacity: 0.35, flexShrink: 0 }}>

        {/* === ESCENA PRINCIPAL: paciente en diván con terapeuta === */}

        {/* Diván / sillón */}
        <path d="M200 420 Q200 380 240 380 L640 380 Q680 380 680 420 L680 460 Q680 480 660 480 L220 480 Q200 480 200 460 Z" fill="#264534"/>
        {/* respaldo del diván */}
        <path d="M600 280 Q600 260 620 260 L680 260 Q700 260 700 280 L700 460 Q700 480 680 480 L660 480 Q640 480 640 460 L640 300 Q640 280 620 280 Z" fill="#264534"/>
        {/* patas del diván */}
        <rect x="220" y="478" width="20" height="40" rx="5" fill="#264534"/>
        <rect x="620" y="478" width="20" height="40" rx="5" fill="#264534"/>

        {/* Paciente acostado en el diván */}
        {/* cuerpo */}
        <path d="M250 360 Q260 340 290 340 L560 350 Q580 352 580 370 L580 390 Q580 400 560 398 L280 392 Q255 390 250 375 Z" fill="#264534"/>
        {/* cabeza paciente */}
        <circle cx="590" cy="345" r="32" fill="#264534"/>
        {/* brazo */}
        <path d="M400 355 Q410 330 430 325 Q450 320 460 340" fill="none" stroke="#264534" strokeWidth="12" strokeLinecap="round"/>
        {/* piernas */}
        <path d="M250 388 Q240 400 235 430 Q232 450 245 455" fill="none" stroke="#264534" strokeWidth="14" strokeLinecap="round"/>
        <path d="M270 390 Q265 408 260 435 Q258 455 272 458" fill="none" stroke="#264534" strokeWidth="14" strokeLinecap="round"/>

        {/* Terapeuta sentada en silla */}
        {/* silla terapeuta */}
        <rect x="720" y="370" width="100" height="15" rx="6" fill="#264534"/>
        <rect x="720" y="280" width="15" height="105" rx="6" fill="#264534"/>
        <rect x="805" y="370" width="15" height="60" rx="6" fill="#264534"/>
        <rect x="730" y="370" width="15" height="60" rx="6" fill="#264534"/>
        {/* cuerpo terapeuta */}
        <path d="M740 280 Q740 260 760 255 L800 255 Q820 255 820 275 L825 370 L735 370 Z" fill="#264534"/>
        {/* cabeza terapeuta */}
        <circle cx="780" cy="225" r="30" fill="#264534"/>
        {/* cabello */}
        <path d="M755 218 Q758 195 780 193 Q802 195 805 218" fill="#264534" stroke="#264534" strokeWidth="2"/>
        {/* brazo con libreta */}
        <path d="M820 300 Q840 310 850 330 Q855 345 840 350" fill="none" stroke="#264534" strokeWidth="12" strokeLinecap="round"/>
        {/* libreta */}
        <rect x="830" y="330" width="45" height="55" rx="4" fill="#264534"/>
        <line x1="838" y1="348" x2="867" y2="348" stroke="#FEFAF5" strokeWidth="2.5"/>
        <line x1="838" y1="358" x2="867" y2="358" stroke="#FEFAF5" strokeWidth="2.5"/>
        <line x1="838" y1="368" x2="855" y2="368" stroke="#FEFAF5" strokeWidth="2.5"/>
        {/* otro brazo */}
        <path d="M740 295 Q720 310 715 330" fill="none" stroke="#264534" strokeWidth="12" strokeLinecap="round"/>

        {/* Burbuja de diálogo terapeuta */}
        <ellipse cx="860" cy="165" rx="70" ry="40" fill="none" stroke="#264534" strokeWidth="3"/>
        <path d="M820 195 L810 220 L840 198" fill="none" stroke="#264534" strokeWidth="3"/>
        <circle cx="840" cy="165" r="4" fill="#264534"/>
        <circle cx="860" cy="165" r="4" fill="#264534"/>
        <circle cx="880" cy="165" r="4" fill="#264534"/>

        {/* Plantas decorativas */}
        {/* planta izq */}
        <rect x="90" y="420" width="18" height="80" rx="4" fill="#264534"/>
        <ellipse cx="99" cy="415" rx="35" ry="50" fill="none" stroke="#264534" strokeWidth="3"/>
        <path d="M99 390 Q80 360 60 355 Q85 370 99 390Z" fill="#264534"/>
        <path d="M99 400 Q120 365 145 362 Q120 378 99 400Z" fill="#264534"/>
        <path d="M99 380 Q99 345 99 320" stroke="#264534" strokeWidth="3" fill="none"/>

        {/* planta der */}
        <rect x="1050" y="430" width="18" height="70" rx="4" fill="#264534"/>
        <path d="M1058 425 Q1035 395 1015 392 Q1040 405 1058 425Z" fill="#264534"/>
        <path d="M1058 415 Q1082 385 1102 382 Q1078 398 1058 415Z" fill="#264534"/>
        <path d="M1058 435 Q1040 408 1028 398 Q1048 412 1058 435Z" fill="#264534"/>

        {/* Ventana fondo izq */}
        <rect x="50" y="150" width="120" height="160" rx="8" fill="none" stroke="#264534" strokeWidth="3"/>
        <line x1="110" y1="150" x2="110" y2="310" stroke="#264534" strokeWidth="2"/>
        <line x1="50" y1="230" x2="170" y2="230" stroke="#264534" strokeWidth="2"/>
        {/* sol por la ventana */}
        <circle cx="90" cy="195" r="18" fill="none" stroke="#264534" strokeWidth="2.5"/>
        {[0,45,90,135,180,225,270,315].map((a,i) => {
          const rad = a * Math.PI / 180
          const x1 = 90 + 22 * Math.cos(rad)
          const y1 = 195 + 22 * Math.sin(rad)
          const x2 = 90 + 30 * Math.cos(rad)
          const y2 = 195 + 30 * Math.sin(rad)
          return `<line key="${i}" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#264534" strokeWidth="2.5" strokeLinecap="round"/>`
        })}

        {/* Cuadro en la pared */}
        <rect x="950" y="140" width="140" height="100" rx="6" fill="none" stroke="#264534" strokeWidth="3"/>
        <path d="M965 210 Q990 170 1020 180 Q1050 190 1075 165" fill="none" stroke="#264534" strokeWidth="2.5"/>
        <circle cx="1000" cy="175" r="8" fill="none" stroke="#264534" strokeWidth="2"/>

        {/* Alfombra */}
        <ellipse cx="480" cy="520" rx="320" ry="30" fill="none" stroke="#264534" strokeWidth="3"/>
        <ellipse cx="480" cy="520" rx="280" ry="22" fill="none" stroke="#264534" strokeWidth="1.5"/>
      </svg>

      {/* Card centrada */}
      <div style={{ position: 'relative', zIndex: 10, background: '#fff', borderRadius: 20, padding: '40px 48px', width: '100%', maxWidth: 420, boxShadow: '0 8px 40px rgba(38,69,52,0.12)', border: '1px solid rgba(38,69,52,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Image src="/logo.png" alt="Tu Terapia" width={160} height={64} style={{ objectFit: 'contain', marginBottom: 8 }} />
          <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>Sistema de Gestión de Casos</p>
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

      {/* Frase fija abajo, siempre visible */}
      <p style={{ position: 'absolute', bottom: 28, left: 0, width: '100%', textAlign: 'center', fontFamily: 'Georgia, serif', fontSize: 18, fontStyle: 'italic', color: '#264534', opacity: 0.55, margin: 0, zIndex: 5 }}>
        un espacio para sanar
      </p>

      <style>{`
        @media (max-width: 900px) {
          .login-illustration { display: none; }
        }
      `}</style>
    </div>
  )
}

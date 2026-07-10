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

      {/* Ilustración al costado izquierdo: paciente en el diván con su terapeuta, línea simple un solo color */}
      <svg viewBox="0 0 820 480" xmlns="http://www.w3.org/2000/svg"
        className="login-illustration"
        style={{ position: 'absolute', left: '0.5%', top: '50%', transform: 'translateY(-50%)', width: '50%', maxWidth: 660, height: 'auto', opacity: 1 }}>

        {/* Alfombra */}
        <ellipse cx="300" cy="410" rx="260" ry="20" fill="none" stroke="#264534" strokeWidth="2"/>

        {/* Diván */}
        <path d="M70 340 Q70 310 100 308 L400 308 Q430 310 430 340 L430 368 Q430 383 415 383 L85 383 Q70 383 70 368 Z" fill="none" stroke="#264534" strokeWidth="4"/>
        <path d="M400 308 Q400 236 458 232 Q505 230 505 272 Q505 304 462 308 Q430 310 400 308Z" fill="none" stroke="#264534" strokeWidth="4"/>
        <line x1="105" y1="383" x2="105" y2="405" stroke="#264534" strokeWidth="4" strokeLinecap="round"/>
        <line x1="400" y1="383" x2="400" y2="405" stroke="#264534" strokeWidth="4" strokeLinecap="round"/>

        {/* Paciente: cuerpo reclinado */}
        <path d="M100 330 Q85 323 84 306 Q83 293 96 291 Q108 290 112 303 Q116 316 135 321 L330 336 Q350 338 350 356 Q350 371 330 369 L120 356 Q104 351 100 336Z" fill="none" stroke="#264534" strokeWidth="4"/>
        {/* Paciente: brazo */}
        <path d="M190 340 Q220 326 248 330" fill="none" stroke="#264534" strokeWidth="3.5" strokeLinecap="round"/>
        {/* Paciente: cabeza */}
        <circle cx="373" cy="335" r="33" fill="none" stroke="#264534" strokeWidth="4"/>
        {/* Paciente: pelo */}
        <path d="M344 322 Q340 292 373 286 Q406 292 402 322 Q402 310 373 306 Q344 310 344 322Z" fill="none" stroke="#264534" strokeWidth="3.5"/>

        {/* Globo de diálogo de la paciente */}
        <path d="M140 118 h300 a20 20 0 0 1 20 20 v78 a20 20 0 0 1 -20 20 h-150 l-25 36 l-3 -36 h-122 a20 20 0 0 1 -20 -20 v-78 a20 20 0 0 1 20 -20 Z" fill="#FEFAF5" stroke="#264534" strokeWidth="4"/>
        <text x="290" y="158" textAnchor="middle" fontFamily="Georgia, serif" fontSize="20" fontWeight="700" fill="#264534">¡Qué bueno que</text>
        <text x="290" y="186" textAnchor="middle" fontFamily="Georgia, serif" fontSize="20" fontWeight="700" fill="#264534">encontré a Tu Terapia! 🌿</text>

        {/* Terapeuta: sillón */}
        <path d="M560 300 Q560 200 622 196 Q678 194 678 258 L682 344 Q682 358 668 358 L570 358 Q556 358 556 344Z" fill="none" stroke="#264534" strokeWidth="4"/>
        <line x1="572" y1="358" x2="572" y2="380" stroke="#264534" strokeWidth="4" strokeLinecap="round"/>
        <line x1="666" y1="358" x2="666" y2="380" stroke="#264534" strokeWidth="4" strokeLinecap="round"/>

        {/* Terapeuta: cuerpo */}
        <path d="M580 258 Q580 228 605 224 L638 224 Q663 228 663 258 L667 340 L576 340Z" fill="none" stroke="#264534" strokeWidth="3.5"/>
        {/* Terapeuta: cabeza */}
        <circle cx="622" cy="196" r="30" fill="none" stroke="#264534" strokeWidth="3.5"/>
        {/* Terapeuta: pelo canoso lateral */}
        <path d="M594 198 Q591 212 598 224" fill="none" stroke="#264534" strokeWidth="3" strokeLinecap="round"/>
        <path d="M650 198 Q653 212 646 224" fill="none" stroke="#264534" strokeWidth="3" strokeLinecap="round"/>
        {/* Terapeuta: anteojos */}
        <circle cx="611" cy="198" r="8" fill="none" stroke="#264534" strokeWidth="2.5"/>
        <circle cx="633" cy="198" r="8" fill="none" stroke="#264534" strokeWidth="2.5"/>
        <line x1="619" y1="198" x2="625" y2="198" stroke="#264534" strokeWidth="2.5"/>
        {/* Terapeuta: bigote */}
        <path d="M614 212 Q622 217 630 212" fill="none" stroke="#264534" strokeWidth="3" strokeLinecap="round"/>
        {/* Terapeuta: libreta */}
        <path d="M578 275 Q562 280 555 296" fill="none" stroke="#264534" strokeWidth="3" strokeLinecap="round"/>
        <rect x="522" y="288" width="46" height="58" rx="5" fill="none" stroke="#264534" strokeWidth="3"/>
        <line x1="531" y1="303" x2="558" y2="303" stroke="#264534" strokeWidth="2"/>
        <line x1="531" y1="314" x2="558" y2="314" stroke="#264534" strokeWidth="2"/>
        <line x1="531" y1="325" x2="548" y2="325" stroke="#264534" strokeWidth="2"/>

        {/* Nube de pensamiento del terapeuta */}
        <circle cx="700" cy="130" r="9" fill="none" stroke="#264534" strokeWidth="2.5"/>
        <circle cx="714" cy="117" r="6" fill="none" stroke="#264534" strokeWidth="2.5"/>
        <path d="M665 90 Q656 65 685 58 Q698 44 718 55 Q744 52 747 76 Q763 82 755 100 Q758 116 736 116 Q727 127 710 119 Q685 122 681 104 Q660 105 665 90Z" fill="none" stroke="#264534" strokeWidth="3"/>

        {/* Planta decorativa junto al diván */}
        <path d="M30 405 Q29 372 30 350" stroke="#264534" strokeWidth="2.5" fill="none"/>
        <path d="M30 372 Q6 360 -4 340 Q18 350 30 372Z" fill="none" stroke="#264534" strokeWidth="2.5"/>
        <path d="M30 360 Q56 346 68 326 Q44 340 30 360Z" fill="none" stroke="#264534" strokeWidth="2.5"/>
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

        {/* Taza humeante */}
        <path d="M170 175 Q170 195 190 195 Q210 195 210 175 Z" fill="none" stroke="#264534" strokeWidth="3"/>
        <path d="M210 180 Q225 180 223 192 Q221 202 209 200" fill="none" stroke="#264534" strokeWidth="2.5"/>
        <path d="M180 160 Q176 150 182 142" fill="none" stroke="#264534" strokeWidth="2" strokeLinecap="round"/>
        <path d="M196 160 Q192 150 198 142" fill="none" stroke="#264534" strokeWidth="2" strokeLinecap="round"/>

        {/* Reloj */}
        <circle cx="200" cy="290" r="34" fill="none" stroke="#264534" strokeWidth="3"/>
        <line x1="200" y1="290" x2="200" y2="270" stroke="#264534" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="200" y1="290" x2="215" y2="296" stroke="#264534" strokeWidth="2.5" strokeLinecap="round"/>

        {/* Hojitas sueltas */}
        <path d="M90 220 Q78 205 92 192 Q106 205 90 220Z" fill="none" stroke="#264534" strokeWidth="2.5"/>
        <path d="M110 410 Q98 396 112 384 Q126 396 110 410Z" fill="none" stroke="#264534" strokeWidth="2.5"/>
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

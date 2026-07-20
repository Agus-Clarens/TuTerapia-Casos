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
    <div style={{ minHeight: '100vh', background: '#FDFCF9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '40px 24px 90px' }}>

      {/* Ilustración al costado izquierdo: sillón + mesita + lámpara + cuadros (verde del equipo, tipo dibujo a mano) */}
      <svg viewBox="0 0 700 560" xmlns="http://www.w3.org/2000/svg"
        className="login-illustration"
        style={{ position: 'absolute', left: '1%', top: '50%', transform: 'translateY(-50%)', width: '36%', maxWidth: 480, height: 'auto', opacity: 1 }}>

        <defs>
          {/* Filtro de textura sutil, como si fuera crayón */}
          <filter id="rough" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4"/>
            <feDisplacementMap in="SourceGraphic" scale="1.5"/>
          </filter>
        </defs>

        <g stroke="#4E9F5B" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#rough)">

          {/* Cuadro grande en la pared con paisaje/montañas */}
          <rect x="60" y="70" width="130" height="95" rx="4" strokeWidth="3"/>
          <path d="M70 145 L100 110 L120 128 L145 95 L180 145" strokeWidth="2.5"/>
          <circle cx="155" cy="92" r="8" strokeWidth="2.5"/>

          {/* Cuadro chiquito al lado con corazón */}
          <rect x="215" y="90" width="60" height="70" rx="3" strokeWidth="3"/>
          <path d="M245 108 Q235 100 230 115 Q230 128 245 138 Q260 128 260 115 Q255 100 245 108Z" strokeWidth="2.5" fill="#4E9F5B" fillOpacity="0.15"/>

          {/* Repisa flotante con librito y planta */}
          <line x1="310" y1="120" x2="410" y2="120" strokeWidth="3"/>
          <rect x="320" y="98" width="14" height="22" strokeWidth="2.5"/>
          <rect x="336" y="94" width="14" height="26" strokeWidth="2.5"/>
          <rect x="352" y="100" width="14" height="20" strokeWidth="2.5"/>
          {/* macetita sobre repisa */}
          <path d="M378 110 L378 100 M378 108 Q368 100 362 88 Q374 96 378 108 M378 105 Q388 96 396 84 Q384 94 378 105" strokeWidth="2.5"/>
          <path d="M372 115 L396 115 L392 120 L376 120 Z" strokeWidth="2.5"/>

          {/* Lámpara de pie con pantalla */}
          <path d="M450 130 Q450 108 490 108 Q530 108 530 130 L520 175 L460 175 Z" strokeWidth="3"/>
          <path d="M460 175 L520 175" strokeWidth="2.5"/>
          <line x1="490" y1="175" x2="490" y2="440" strokeWidth="3.5"/>
          <ellipse cx="490" cy="445" rx="30" ry="7" strokeWidth="3.5"/>
          {/* rayitos suaves de luz */}
          <path d="M448 195 L440 210 M532 195 L540 210 M478 200 L472 215 M502 200 L508 215" strokeWidth="1.5" opacity="0.6"/>

          {/* Alfombra ovalada con doble contorno */}
          <ellipse cx="290" cy="470" rx="270" ry="22" strokeWidth="2.5"/>
          <ellipse cx="290" cy="470" rx="240" ry="16" strokeWidth="1.5"/>
          <path d="M110 470 L470 470" strokeWidth="1" opacity="0.4" strokeDasharray="4 6"/>

          {/* === SILLÓN OREJERO === */}
          {/* respaldo alto con las orejas */}
          <path d="M110 340 Q110 210 190 205 Q235 202 240 240 Q245 202 290 205 Q370 210 370 340" strokeWidth="5"/>
          {/* orejas laterales (protuberancias arriba) */}
          <path d="M110 340 Q80 340 70 320 Q65 300 78 285 Q95 275 110 295" strokeWidth="5"/>
          <path d="M370 340 Q400 340 410 320 Q415 300 402 285 Q385 275 370 295" strokeWidth="5"/>
          {/* brazos del sillón */}
          <path d="M110 340 L88 342 Q72 344 72 362 L72 405 Q72 420 90 420 L110 418" strokeWidth="5"/>
          <path d="M370 340 L392 342 Q408 344 408 362 L408 405 Q408 420 390 420 L370 418" strokeWidth="5"/>
          {/* frente del asiento */}
          <path d="M110 418 Q110 435 128 435 L352 435 Q370 435 370 418" strokeWidth="5"/>
          {/* base debajo del asiento */}
          <path d="M120 435 L120 460 M360 435 L360 460" strokeWidth="5"/>
          {/* patitas */}
          <path d="M115 460 L108 470 M125 460 L130 470 M355 460 L350 470 M365 460 L370 470" strokeWidth="4"/>
          {/* Almohadón del asiento (visible en la panza del sillón) */}
          <path d="M120 400 Q240 415 360 400 Q365 380 358 355 Q240 370 122 355 Q115 380 120 400Z" strokeWidth="3" fill="#4E9F5B" fillOpacity="0.06"/>
          {/* costura decorativa del respaldo */}
          <path d="M240 240 Q238 285 240 335" strokeWidth="2" opacity="0.5" strokeDasharray="3 5"/>

          {/* Dos cojines redondos, uno claro uno con corazón */}
          <path d="M155 335 Q155 305 190 305 Q225 305 225 335 Q225 365 190 365 Q155 365 155 335Z" strokeWidth="3"/>
          <path d="M170 320 Q190 328 210 320" strokeWidth="2" opacity="0.5"/>

          <path d="M258 340 Q258 315 285 315 Q312 315 312 340 Q312 365 285 365 Q258 365 258 340Z" strokeWidth="3"/>
          <path d="M285 328 Q278 322 274 332 Q274 341 285 348 Q296 341 296 332 Q292 322 285 328Z" strokeWidth="2.5" fill="#4E9F5B" fillOpacity="0.2"/>

          {/* === MESITA REDONDA === */}
          <ellipse cx="540" cy="380" rx="72" ry="10" strokeWidth="4"/>
          <ellipse cx="540" cy="380" rx="72" ry="10" strokeWidth="1" opacity="0.4"/>
          <line x1="540" y1="388" x2="530" y2="460" strokeWidth="3.5"/>
          {/* base circular */}
          <ellipse cx="530" cy="463" rx="26" ry="5" strokeWidth="3.5"/>

          {/* Planta grande en maceta sobre la mesita */}
          <path d="M515 375 L515 340" strokeWidth="3"/>
          {/* hojas planta */}
          <path d="M515 358 Q485 348 475 320 Q505 335 515 358Z" strokeWidth="3"/>
          <path d="M515 348 Q545 335 555 308 Q525 322 515 348Z" strokeWidth="3"/>
          <path d="M515 365 Q490 358 480 340 Q500 355 515 365Z" strokeWidth="3"/>
          <path d="M515 355 Q535 350 542 335 Q525 348 515 355Z" strokeWidth="3"/>
          {/* macetita */}
          <path d="M498 375 L534 375 L528 400 L504 400 Z" strokeWidth="3"/>
          <line x1="500" y1="380" x2="532" y2="380" strokeWidth="2" opacity="0.5"/>

          {/* Taza de té humeante sobre la mesita */}
          <path d="M555 365 Q555 380 572 380 Q589 380 589 365 Z" strokeWidth="3"/>
          <path d="M589 368 Q602 368 600 380 Q597 388 587 386" strokeWidth="2.5"/>
          {/* vaporcitos */}
          <path d="M562 358 Q558 350 564 342 M572 356 Q568 348 574 340 M582 358 Q578 350 584 342" strokeWidth="2" opacity="0.6"/>

          {/* Librito pequeño sobre la mesita */}
          <path d="M475 372 L510 372 L510 380 L475 380 Z" strokeWidth="2.5"/>
          <line x1="482" y1="372" x2="482" y2="380" strokeWidth="1.5" opacity="0.5"/>

          {/* Planta grande de piso a la izquierda */}
          <path d="M38 465 L38 400" strokeWidth="3.5"/>
          <path d="M38 430 Q10 415 2 385 Q30 400 38 430Z" strokeWidth="3.5"/>
          <path d="M38 415 Q65 400 75 372 Q45 388 38 415Z" strokeWidth="3.5"/>
          <path d="M38 445 Q15 435 8 415 Q28 425 38 445Z" strokeWidth="3.5"/>
          <path d="M22 465 L54 465 L48 495 L28 495 Z" strokeWidth="3.5"/>

          {/* Detalles decorativos: destellitos y hojitas sueltas (como en la foto del equipo) */}
          <path d="M420 250 L420 262 M414 256 L426 256 M418 253 L422 259 M418 259 L422 253" strokeWidth="1.5"/>
          <path d="M45 260 L45 268 M41 264 L49 264" strokeWidth="1.5"/>
          <path d="M615 265 L615 273 M611 269 L619 269 M613 267 L617 271 M613 271 L617 267" strokeWidth="1.5"/>
          {/* hojitas volando */}
          <path d="M400 470 Q392 462 402 452 Q412 462 400 470Z" strokeWidth="2"/>
          <path d="M615 340 Q607 332 617 322 Q627 332 615 340Z" strokeWidth="2"/>

        </g>
      </svg>

      {/* Foto del equipo, del lado derecho */}
      <div className="login-illustration" style={{ position: 'absolute', right: '2%', top: '50%', transform: 'translateY(-50%)', width: '32%', maxWidth: 420, zIndex: 5 }}>
        <Image src="/equipo.png" alt="Equipo Tu Terapia" width={1046} height={818} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      <style>{`
        @media (max-width: 900px) {
          .login-illustration { display: none; }
        }
      `}</style>
      <div style={{ position: 'relative', zIndex: 10, background: '#fff', borderRadius: 20, padding: '40px 48px', width: '100%', maxWidth: 420, boxShadow: '0 8px 40px rgba(38,69,52,0.12)', border: '1px solid rgba(38,69,52,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Image src="/logo.png" alt="Tu Terapia" width={170} height={96} style={{ objectFit: 'contain', display: 'block', margin: '0 auto 8px' }} />
          <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>Gestiones Internas Tu Terapia</p>
          <p style={{ color: '#9CA3AF', fontSize: 11, margin: '4px 0 0' }}>CX · Admin · Talent · Marketing · Business</p>
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
        Transformamos solicitudes en soluciones
      </p>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user) router.replace('/')
  }, [user, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
    } else {
      router.replace('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#FEFAF5' }}>
      {/* Organic background shapes */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <circle cx="180" cy="160" r="300" fill="#75B781" opacity="0.09" />
        <circle cx="1320" cy="720" r="340" fill="#007271" opacity="0.07" />
        <circle cx="1100" cy="80" r="220" fill="#75B781" opacity="0.06" />
        <circle cx="120" cy="820" r="260" fill="#007271" opacity="0.06" />
        <ellipse cx="720" cy="-20" rx="320" ry="110" fill="#264534" opacity="0.04" />
        <ellipse cx="750" cy="920" rx="380" ry="130" fill="#264534" opacity="0.04" />
        <circle cx="600" cy="450" r="180" fill="#75B781" opacity="0.03" />
      </svg>

      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header verde */}
          <div className="px-8 pt-8 pb-6 flex flex-col items-center" style={{ backgroundColor: '#264534' }}>
            <Image
              src="/logo.png"
              alt="Tu Terapia"
              width={180}
              height={80}
              style={{ objectFit: 'contain', mixBlendMode: 'lighten' }}
              priority
            />
          </div>

          <div className="px-8 py-7">
            <h1 className="text-center text-base font-semibold mb-0.5" style={{ color: '#264534' }}>
              Gestión de Casos Internos
            </h1>
            <p className="text-center text-xs text-gray-400 mb-6" style={{ letterSpacing: '0.04em' }}>
              Ingresá con tu cuenta de Tu Terapia
            </p>

            {error && (
              <div className="mb-4 px-4 py-2.5 rounded-xl text-sm text-center" style={{ backgroundColor: '#FFF0EE', color: '#c0503a', border: '1px solid #F29683' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@tuterapia.com.ar"
                  required
                  autoComplete="email"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-50 mt-2"
                style={{ backgroundColor: '#007271' }}
              >
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          Tu Terapia · Uso interno
        </p>
      </div>
    </div>
  )
}

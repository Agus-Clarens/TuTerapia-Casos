'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { TIPOS_POR_AREA, PAISES, CREADO_POR, AREA_BADGE, getTipoCaso } from '@/lib/tipos-caso'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

async function generateNroCaso(): Promise<string> {
  const { data } = await supabase
    .from('casos')
    .select('nro_caso')
    .like('nro_caso', 'TKT-%')
    .order('nro_caso', { ascending: false })
    .limit(1)
  if (data && data.length > 0 && data[0].nro_caso) {
    const num = parseInt((data[0].nro_caso as string).replace('TKT-', ''), 10)
    return `TKT-${String(num + 1).padStart(3, '0')}`
  }
  return 'TKT-001'
}

export default function NuevoCasoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [sinPsicologo, setSinPsicologo] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    cargado_por: '',
    pais: '',
    pac_nombre: '',
    pac_mail: '',
    psi_nombre: '',
    psi_mail: '',
    tipo_caso: '',
    area: '',
    requiere_descuento: false,
    monto_descuento: '',
    descripcion: '',
  })

  const tipoCasoInfo = getTipoCaso(form.tipo_caso)
  const showAdmin = tipoCasoInfo && (tipoCasoInfo.area === 'Admin' || tipoCasoInfo.area === 'Admin+Talent')
  const showTalent = tipoCasoInfo && (tipoCasoInfo.area === 'Talent' || tipoCasoInfo.area === 'Admin+Talent')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleTipoCaso(e: React.ChangeEvent<HTMLSelectElement>) {
    const info = getTipoCaso(e.target.value)
    setForm(prev => ({
      ...prev,
      tipo_caso: e.target.value,
      area: info?.area || '',
      requiere_descuento: info?.requiere_descuento || false,
      monto_descuento: '',
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const nro_caso = await generateNroCaso()

      const casoData = {
        nro_caso,
        fecha: today,
        cargado_por: form.cargado_por,
        pais: form.pais,
        pac_nombre: form.pac_nombre,
        pac_mail: form.pac_mail,
        psi_nombre: sinPsicologo ? null : (form.psi_nombre || null),
        psi_mail: sinPsicologo ? null : (form.psi_mail || null),
        tipo_caso: form.tipo_caso,
        area: form.area,
        descripcion: form.descripcion,
        accion_admin: null,
        estado_admin: showAdmin ? 'Nuevo' : null,
        accion_talent: null,
        estado_talent: showTalent ? 'Nuevo' : null,
        requiere_descuento: form.requiere_descuento,
        monto_descuento: form.requiere_descuento && form.monto_descuento ? Number(form.monto_descuento) : null,
        estado_general: 'Nuevo',
        observaciones: null,
        mes_liquidacion: null,
      }

      const { data: caso, error: casoError } = await supabase
        .from('casos').insert([casoData]).select().single()
      if (casoError) throw casoError

      if (form.requiere_descuento && caso) {
        const d = new Date(today)
        const mes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        await supabase.from('descuentos_psicologo').insert([{
          caso_id: caso.id,
          nro_caso: caso.nro_caso,
          fecha_caso: today,
          mes,
          pais: form.pais,
          psi_nombre: sinPsicologo ? null : (form.psi_nombre || null),
          psi_mail: sinPsicologo ? null : (form.psi_mail || null),
          pac_nombre: form.pac_nombre,
          pac_mail: form.pac_mail,
          motivo: form.tipo_caso,
          monto: form.monto_descuento ? Number(form.monto_descuento) : null,
          estado: 'Pendiente',
        }])
      }

      setSuccess(true)
      setTimeout(() => router.push('/casos'), 1200)
    } catch (err: unknown) {
      const e = err as { message?: string; details?: string; hint?: string; code?: string }
      const msg = e?.message || 'Error al guardar el caso'
      const detail = e?.details ? ` — ${e.details}` : ''
      const hint = e?.hint ? ` (${e.hint})` : ''
      setError(`${msg}${detail}${hint}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-verde-oscuro">Nuevo Caso</h1>
        <p className="text-gray-400 text-sm mt-1">El número se genera automáticamente · Estado inicial: Nuevo</p>
      </div>

      {success && (
        <div className="mb-5 p-4 bg-verde-medio/15 border border-verde-medio/30 rounded-xl text-verde-oscuro font-medium text-sm flex items-center gap-2">
          <svg className="w-4 h-4 text-verde-medio flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Caso creado correctamente. Redirigiendo...
        </div>
      )}
      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 space-y-5">

        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Creado por" required>
            <select name="cargado_por" value={form.cargado_por} onChange={handleChange} required>
              <option value="">Seleccionar</option>
              {CREADO_POR.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="País" required>
            <select name="pais" value={form.pais} onChange={handleChange} required>
              <option value="">Seleccionar</option>
              {PAISES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
        </div>

        {/* Tipo de caso */}
        <Field label="Tipo de caso" required>
          <select name="tipo_caso" value={form.tipo_caso} onChange={handleTipoCaso} required>
            <option value="">Seleccionar tipo de caso</option>
            {(['Admin', 'Talent', 'Admin+Talent', 'CX'] as const).map(area => (
              <optgroup key={area} label={`── ${area === 'Admin+Talent' ? 'Admin + Talent' : area} ──`}>
                {TIPOS_POR_AREA[area].map(t => (
                  <option key={t.nombre} value={t.nombre}>{t.nombre}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>

        {/* Area badge */}
        {form.area && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-400 font-medium">Área asignada:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${AREA_BADGE[form.area] || ''}`}>
              {form.area === 'Admin+Talent' ? 'Admin + Talent' : form.area}
            </span>
            {form.requiere_descuento && (
              <span className="ml-1 px-2 py-0.5 bg-orange-50 text-orange-600 text-xs rounded-full border border-orange-200 font-medium">
                ⚠ Requiere descuento
              </span>
            )}
          </div>
        )}

        {/* Paciente */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre paciente" required>
            <input type="text" name="pac_nombre" value={form.pac_nombre} onChange={handleChange} placeholder="Nombre completo" required />
          </Field>
          <Field label="Email paciente" required>
            <input type="email" name="pac_mail" value={form.pac_mail} onChange={handleChange} placeholder="paciente@mail.com" required />
          </Field>
        </div>

        {/* Psicólogo con toggle */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Psicólogo</span>
            <button
              type="button"
              onClick={() => { setSinPsicologo(v => !v); setForm(f => ({ ...f, psi_nombre: '', psi_mail: '' })) }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                sinPsicologo ? 'bg-verde-oscuro/5 text-verde-oscuro border-verde-oscuro/20' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                sinPsicologo ? 'bg-verde-oscuro border-verde-oscuro' : 'border-gray-300'
              }`}>
                {sinPsicologo && <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </span>
              No necesita datos del psicólogo
            </button>
          </div>
          {sinPsicologo ? (
            <p className="text-sm text-gray-400 italic bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-100">Sin psicólogo asociado a este caso.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre psicólogo">
                <input type="text" name="psi_nombre" value={form.psi_nombre} onChange={handleChange} placeholder="Nombre completo" />
              </Field>
              <Field label="Email psicólogo">
                <input type="email" name="psi_mail" value={form.psi_mail} onChange={handleChange} placeholder="psi@mail.com" />
              </Field>
            </div>
          )}
        </div>

        {/* Monto descuento */}
        {form.requiere_descuento && (
          <Field label="Monto del descuento">
            <input
              type="number"
              name="monto_descuento"
              value={form.monto_descuento}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </Field>
        )}

        {/* Descripción */}
        <Field label="Descripción del caso" required>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows={4}
            placeholder="Describí el problema o situación..."
            required
            className="resize-none"
          />
        </Field>

        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || success}
            className="px-6 py-2.5 bg-verde-oscuro text-white text-sm font-semibold rounded-xl hover:bg-verde-oscuro/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creando...' : 'Crear caso'}
          </button>
          <button type="button" onClick={() => router.push('/casos')} className="px-5 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

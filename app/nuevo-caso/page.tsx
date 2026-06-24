'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  TIPOS_POR_AREA,
  PAISES,
  ESTADOS_ADMIN,
  ESTADOS_TALENT,
  ESTADOS_GENERAL,
  getTipoCaso,
} from '@/lib/tipos-caso'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-2 mt-2">
      <h3 className="text-sm font-semibold text-verde-oscuro uppercase tracking-wide border-b border-verde-medio/30 pb-1">
        {children}
      </h3>
    </div>
  )
}

export default function NuevoCasoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    fecha: today,
    cargado_por: '',
    pais: '',
    pac_nombre: '',
    pac_mail: '',
    psi_nombre: '',
    psi_mail: '',
    tipo_caso: '',
    area: '',
    descripcion: '',
    accion_admin: '',
    estado_admin: 'Pendiente',
    accion_talent: '',
    estado_talent: 'Pendiente',
    requiere_descuento: false,
    monto_descuento: '',
    estado_general: 'Abierto',
    observaciones: '',
    mes_liquidacion: '',
  })

  const tipoCasoInfo = getTipoCaso(form.tipo_caso)
  const showAdmin = tipoCasoInfo && (tipoCasoInfo.area === 'Admin' || tipoCasoInfo.area === 'Admin+Talent')
  const showTalent = tipoCasoInfo && (tipoCasoInfo.area === 'Talent' || tipoCasoInfo.area === 'Admin+Talent')
  const showDescuento = form.requiere_descuento

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function handleTipoCasoChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const tipoCaso = getTipoCaso(e.target.value)
    setForm(prev => ({
      ...prev,
      tipo_caso: e.target.value,
      area: tipoCaso?.area || '',
      requiere_descuento: tipoCaso?.requiere_descuento || false,
    }))
  }

  async function generateNroCaso(): Promise<string> {
    const { count } = await supabase
      .from('casos')
      .select('*', { count: 'exact', head: true })
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const seq = String((count || 0) + 1).padStart(4, '0')
    return `CX-${year}${month}-${seq}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const nro_caso = await generateNroCaso()

      const casoData = {
        nro_caso,
        fecha: form.fecha,
        cargado_por: form.cargado_por,
        pais: form.pais,
        pac_nombre: form.pac_nombre,
        pac_mail: form.pac_mail,
        psi_nombre: form.psi_nombre,
        psi_mail: form.psi_mail,
        tipo_caso: form.tipo_caso,
        area: form.area,
        descripcion: form.descripcion,
        accion_admin: showAdmin ? form.accion_admin : null,
        estado_admin: showAdmin ? form.estado_admin : null,
        accion_talent: showTalent ? form.accion_talent : null,
        estado_talent: showTalent ? form.estado_talent : null,
        requiere_descuento: form.requiere_descuento,
        monto_descuento: form.requiere_descuento && form.monto_descuento ? Number(form.monto_descuento) : null,
        estado_general: form.estado_general,
        observaciones: form.observaciones || null,
        mes_liquidacion: form.mes_liquidacion || null,
      }

      const { data: caso, error: casoError } = await supabase
        .from('casos')
        .insert([casoData])
        .select()
        .single()

      if (casoError) throw casoError

      if (form.requiere_descuento && caso) {
        const d = new Date(form.fecha)
        const mes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

        const descuentoData = {
          caso_id: caso.id,
          nro_caso: caso.nro_caso,
          fecha_caso: form.fecha,
          mes: form.mes_liquidacion || mes,
          pais: form.pais,
          psi_nombre: form.psi_nombre,
          psi_mail: form.psi_mail,
          pac_nombre: form.pac_nombre,
          pac_mail: form.pac_mail,
          motivo: form.tipo_caso,
          monto: form.monto_descuento ? Number(form.monto_descuento) : null,
          estado: 'Pendiente',
        }

        const { error: descError } = await supabase
          .from('descuentos_psicologo')
          .insert([descuentoData])

        if (descError) throw descError
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/casos')
      }, 1500)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el caso'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-verde-oscuro">Nuevo Caso</h1>
        <p className="text-gray-500 text-sm mt-1">Completá todos los campos para registrar el caso</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-verde-medio/20 border border-verde-medio/40 rounded-xl text-verde-oscuro font-medium flex items-center gap-2">
          <svg className="w-5 h-5 text-verde-medio" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Caso guardado correctamente. Redirigiendo...
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="grid grid-cols-2 gap-5">

          <SectionTitle>Datos del caso</SectionTitle>

          <Field label="Fecha" required>
            <input type="date" name="fecha" value={form.fecha} onChange={handleChange} required />
          </Field>

          <Field label="Cargado por" required>
            <input
              type="text"
              name="cargado_por"
              value={form.cargado_por}
              onChange={handleChange}
              placeholder="Tu nombre"
              required
            />
          </Field>

          <Field label="País" required>
            <select name="pais" value={form.pais} onChange={handleChange} required>
              <option value="">Seleccionar país</option>
              {PAISES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>

          <Field label="Tipo de caso" required>
            <select name="tipo_caso" value={form.tipo_caso} onChange={handleTipoCasoChange} required>
              <option value="">Seleccionar tipo</option>
              {(['Admin', 'Talent', 'Admin+Talent', 'CX'] as const).map(area => (
                <optgroup key={area} label={`— ${area} —`}>
                  {TIPOS_POR_AREA[area].map(t => (
                    <option key={t.nombre} value={t.nombre}>{t.nombre}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>

          {form.area && (
            <div className="col-span-2">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-sm text-gray-500">Área detectada:</span>
                <span className="font-semibold text-verde-oscuro text-sm">{form.area}</span>
                {form.requiere_descuento && (
                  <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full border border-orange-200 font-medium">
                    Requiere descuento al psicólogo
                  </span>
                )}
              </div>
            </div>
          )}

          <SectionTitle>Paciente</SectionTitle>

          <Field label="Nombre del paciente" required>
            <input type="text" name="pac_nombre" value={form.pac_nombre} onChange={handleChange} placeholder="Nombre completo" required />
          </Field>

          <Field label="Email del paciente" required>
            <input type="email" name="pac_mail" value={form.pac_mail} onChange={handleChange} placeholder="paciente@email.com" required />
          </Field>

          <SectionTitle>Psicólogo</SectionTitle>

          <Field label="Nombre del psicólogo" required>
            <input type="text" name="psi_nombre" value={form.psi_nombre} onChange={handleChange} placeholder="Nombre completo" required />
          </Field>

          <Field label="Email del psicólogo" required>
            <input type="email" name="psi_mail" value={form.psi_mail} onChange={handleChange} placeholder="psicologo@email.com" required />
          </Field>

          <SectionTitle>Descripción</SectionTitle>

          <div className="col-span-2">
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
          </div>

          {showAdmin && (
            <>
              <SectionTitle>Acciones Admin</SectionTitle>
              <div className="col-span-2">
                <Field label="Acción a tomar (Admin)">
                  <textarea
                    name="accion_admin"
                    value={form.accion_admin}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describí la acción de Admin..."
                    className="resize-none"
                  />
                </Field>
              </div>
              <Field label="Estado Admin">
                <select name="estado_admin" value={form.estado_admin} onChange={handleChange}>
                  {ESTADOS_ADMIN.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </Field>
            </>
          )}

          {showTalent && (
            <>
              <SectionTitle>Acciones Talent</SectionTitle>
              <div className="col-span-2">
                <Field label="Acción a tomar (Talent)">
                  <textarea
                    name="accion_talent"
                    value={form.accion_talent}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describí la acción de Talent..."
                    className="resize-none"
                  />
                </Field>
              </div>
              <Field label="Estado Talent">
                <select name="estado_talent" value={form.estado_talent} onChange={handleChange}>
                  {ESTADOS_TALENT.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </Field>
            </>
          )}

          {showDescuento && (
            <>
              <SectionTitle>Descuento al psicólogo</SectionTitle>
              <Field label="Monto del descuento (ARS / USD)">
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
              <Field label="Mes de liquidación">
                <input
                  type="month"
                  name="mes_liquidacion"
                  value={form.mes_liquidacion}
                  onChange={handleChange}
                />
              </Field>
            </>
          )}

          <SectionTitle>Cierre</SectionTitle>

          <Field label="Estado general">
            <select name="estado_general" value={form.estado_general} onChange={handleChange}>
              {ESTADOS_GENERAL.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </Field>

          {!showDescuento && (
            <Field label="Mes de liquidación">
              <input
                type="month"
                name="mes_liquidacion"
                value={form.mes_liquidacion}
                onChange={handleChange}
              />
            </Field>
          )}

          <div className="col-span-2">
            <Field label="Observaciones adicionales">
              <textarea
                name="observaciones"
                value={form.observaciones}
                onChange={handleChange}
                rows={3}
                placeholder="Información adicional relevante..."
                className="resize-none"
              />
            </Field>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-4">
          <button
            type="submit"
            disabled={loading || success}
            className="px-6 py-2.5 bg-verde-oscuro text-white text-sm font-semibold rounded-xl hover:bg-verde-oscuro/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading ? 'Guardando...' : 'Guardar caso'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/casos')}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

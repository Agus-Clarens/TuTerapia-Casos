export type Area = 'Admin' | 'Talent' | 'Admin+Talent' | 'CX'

export interface TipoCaso {
  nombre: string
  area: Area
  requiere_descuento: boolean
}

export const TIPOS_CASO: TipoCaso[] = [
  // Admin
  { nombre: 'Link de pago', area: 'Admin', requiere_descuento: false },
  { nombre: 'Devolucion dentro del plazo', area: 'Admin', requiere_descuento: false },
  { nombre: 'Devolucion fuera del plazo sin falla del psicologo', area: 'Admin', requiere_descuento: false },
  { nombre: 'Envio de factura', area: 'Admin', requiere_descuento: false },
  { nombre: 'Problema con factura', area: 'Admin', requiere_descuento: false },
  { nombre: 'Cupon no aplicado', area: 'Admin', requiere_descuento: false },
  { nombre: 'Pago duplicado', area: 'Admin', requiere_descuento: false },
  { nombre: 'Transferencia de sesiones', area: 'Admin', requiere_descuento: false },
  { nombre: 'Contracargo MP o PayPal', area: 'Admin', requiere_descuento: false },
  { nombre: 'Cambiar modalidad', area: 'Admin', requiere_descuento: false },
  // Talent
  { nombre: 'Disponibilidad o agenda', area: 'Talent', requiere_descuento: false },
  { nombre: 'Psicologo no confirma sesion', area: 'Talent', requiere_descuento: false },
  { nombre: 'Cancelacion del psicologo', area: 'Talent', requiere_descuento: false },
  { nombre: 'Calendario incorrecto', area: 'Talent', requiere_descuento: false },
  { nombre: 'Sesiones pendientes de aprobacion', area: 'Talent', requiere_descuento: false },
  { nombre: 'Psicologo fantasmeado', area: 'Talent', requiere_descuento: false },
  { nombre: 'Psicologo con pocas horas', area: 'Talent', requiere_descuento: false },
  { nombre: 'Psicologo sin horas', area: 'Talent', requiere_descuento: false },
  { nombre: 'Mejora de perfil', area: 'Talent', requiere_descuento: false },
  // Admin+Talent con descuento
  { nombre: 'Devolucion fuera del plazo con falla del psicologo', area: 'Admin+Talent', requiere_descuento: true },
  { nombre: 'Sesion agendada sin consentimiento', area: 'Admin+Talent', requiere_descuento: true },
  { nombre: 'Sesion marcada realizada pero no ocurrio', area: 'Admin+Talent', requiere_descuento: true },
  { nombre: 'Descontar sesion al psicologo', area: 'Admin+Talent', requiere_descuento: true },
  // Admin+Talent sin descuento
  { nombre: 'Psicologo en desvinculacion con pacientes activos', area: 'Admin+Talent', requiere_descuento: false },
  { nombre: 'Psicologo cobra fuera de plataforma', area: 'Admin+Talent', requiere_descuento: false },
  { nombre: 'Horario incorrecto con dano al paciente', area: 'Admin+Talent', requiere_descuento: false },
  // CX
  { nombre: 'Mala experiencia devolucion autonoma', area: 'CX', requiere_descuento: false },
  { nombre: 'Cambio de psicologo', area: 'CX', requiere_descuento: false },
  { nombre: 'Retencion con cupon', area: 'CX', requiere_descuento: false },
  { nombre: 'Cancelacion por paciente', area: 'CX', requiere_descuento: false },
]

export const TIPOS_POR_AREA: Record<Area, TipoCaso[]> = {
  Admin: TIPOS_CASO.filter(t => t.area === 'Admin'),
  Talent: TIPOS_CASO.filter(t => t.area === 'Talent'),
  'Admin+Talent': TIPOS_CASO.filter(t => t.area === 'Admin+Talent'),
  CX: TIPOS_CASO.filter(t => t.area === 'CX'),
}

export function getTipoCaso(nombre: string): TipoCaso | undefined {
  return TIPOS_CASO.find(t => t.nombre === nombre)
}

export const PAISES = ['Argentina', 'Uruguay', 'Chile'] as const

export const ESTADOS_ADMIN = ['Pendiente', 'En proceso', 'Resuelto'] as const
export const ESTADOS_TALENT = ['Pendiente', 'En proceso', 'Resuelto'] as const
export const ESTADOS_GENERAL = ['Abierto', 'En proceso', 'Cerrado'] as const
export const ESTADOS_DESCUENTO = ['Pendiente', 'Aplicado', 'Rechazado'] as const

export const AREA_LABELS: Record<Area, string> = {
  Admin: 'Admin',
  Talent: 'Talent',
  'Admin+Talent': 'Admin + Talent',
  CX: 'CX',
}

export const AREA_COLORS: Record<Area, string> = {
  Admin: 'bg-blue-100 text-blue-800',
  Talent: 'bg-purple-100 text-purple-800',
  'Admin+Talent': 'bg-orange-100 text-orange-800',
  CX: 'bg-green-100 text-green-800',
}

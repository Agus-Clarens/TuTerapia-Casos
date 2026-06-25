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
  { nombre: 'Disponibilidad o agenda del psicologo', area: 'Talent', requiere_descuento: false },
  { nombre: 'Psicologo no confirma sesion', area: 'Talent', requiere_descuento: false },
  { nombre: 'Cancelacion del psicologo', area: 'Talent', requiere_descuento: false },
  { nombre: 'Calendario incorrecto', area: 'Talent', requiere_descuento: false },
  { nombre: 'Sesiones pendientes de aprobacion', area: 'Talent', requiere_descuento: false },
  { nombre: 'Psicologo fantasmeado', area: 'Talent', requiere_descuento: false },
  { nombre: 'Psicologo con pocas horas', area: 'Talent', requiere_descuento: false },
  { nombre: 'Psicologo sin horas', area: 'Talent', requiere_descuento: false },
  { nombre: 'Mejora de perfil del psicologo', area: 'Talent', requiere_descuento: false },
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
  { nombre: 'Contactar paciente para retencion', area: 'CX', requiere_descuento: false },
  { nombre: 'Derivacion a nuevo psicologo', area: 'CX', requiere_descuento: false },
  { nombre: 'Mala experiencia devolucion autonoma', area: 'CX', requiere_descuento: false },
  { nombre: 'Cancelacion solicitada por paciente', area: 'CX', requiere_descuento: false },
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

export const CREADO_POR = [
  'Sol (CX)',
  'Agus (Admin)',
  'Sofi (Admin)',
  'Orne (Talent)',
  'Caro (Talent)',
  'Otro',
] as const

export const ESTADOS = ['Nuevo', 'En curso', 'Requiere atención', 'Resuelto', 'Cerrado'] as const
export const ESTADOS_AREA = ['Nuevo', 'En curso', 'Requiere atención', 'Resuelto'] as const
export const ESTADOS_DESCUENTO = ['Pendiente', 'Aplicado', 'Rechazado'] as const

export const AREA_BADGE: Record<string, string> = {
  Admin: 'bg-blue-50 text-blue-700 border border-blue-200',
  Talent: 'bg-purple-50 text-purple-700 border border-purple-200',
  'Admin+Talent': 'bg-orange-50 text-orange-700 border border-orange-200',
  CX: 'bg-verde-medio/20 text-verde-oscuro border border-verde-medio/40',
  General: 'bg-gray-50 text-gray-600 border border-gray-200',
}

export const ESTADO_BADGE: Record<string, string> = {
  Nuevo: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  'En curso': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Requiere atención': 'bg-red-50 text-red-700 border border-red-200',
  Resuelto: 'bg-green-50 text-green-700 border border-green-200',
  Cerrado: 'bg-gray-100 text-gray-500 border border-gray-200',
  Pendiente: 'bg-orange-50 text-orange-700 border border-orange-200',
  Aplicado: 'bg-teal/10 text-teal border border-teal/30',
  Rechazado: 'bg-red-50 text-red-600 border border-red-200',
}

export function getAreaFromAutor(autor: string): string {
  if (autor.includes('(CX)')) return 'CX'
  if (autor.includes('(Admin)')) return 'Admin'
  if (autor.includes('(Talent)')) return 'Talent'
  return 'General'
}

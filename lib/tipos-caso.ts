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
  { nombre: 'Cargo mal los datos en la factura', area: 'CX', requiere_descuento: false },
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

export const PAISES = ['Argentina', 'Uruguay', 'Exterior'] as const

export const CREADO_POR = [
  'Sol (CX)',
  'Agus (Admin)',
  'Sofi (Admin)',
  'Orne (Talent)',
  'Belu (Talent)',
  'Caro (Talent)',
  'Otro',
] as const

export const ESTADOS = ['Nuevo', 'En curso', 'Requiere atención', 'Resuelto', 'Cerrado'] as const
export const ESTADOS_AREA = ['Nuevo', 'En curso', 'Requiere atención', 'Resuelto'] as const
export const ESTADOS_DESCUENTO = ['Pendiente', 'Aplicado', 'Rechazado'] as const

export const AREA_BADGE: Record<string, string> = {
  Admin: 'bg-[#EEF2FF] text-[#213E6E] border border-[#213E6E]/30',
  Talent: 'bg-purple-50 text-purple-700 border border-purple-200',
  'Admin+Talent': 'bg-[#FFF0EE] text-[#c0503a] border border-[#F29683]/50',
  CX: 'bg-verde-medio/20 text-verde-oscuro border border-verde-medio/40',
  General: 'bg-gray-50 text-gray-600 border border-gray-200',
}

export const ESTADO_BADGE: Record<string, string> = {
  Nuevo: 'bg-[#EDFFF4] text-[#264534] border border-[#75B781]',
  'En curso': 'bg-[#FFF4EC] text-[#b35a10] border border-[#F97316]',
  'Requiere atención': 'bg-[#FFFBEB] text-[#92670f] border border-[#FCD07F]',
  Resuelto: 'bg-[#EDFFF4] text-[#264534] border border-[#75B781]',
  Cerrado: 'bg-[#F5F4F2] text-[#938f80] border border-[#938f80]/50',
  Pendiente: 'bg-[#FFF4EC] text-[#b35a10] border border-[#F97316]/50',
  Aplicado: 'bg-teal/10 text-teal border border-teal/30',
  Rechazado: 'bg-red-50 text-red-600 border border-red-200',
}

export const CREADORES_POR_AREA: Record<string, string[]> = {
  CX: ['Sol (CX)'],
  Admin: ['Agus (Admin)', 'Sofi (Admin)'],
  Talent: ['Orne (Talent)', 'Belu (Talent)', 'Caro (Talent)'],
}

export function getAreaFromAutor(autor: string): string {
  if (autor.includes('(CX)')) return 'CX'
  if (autor.includes('(Admin)')) return 'Admin'
  if (autor.includes('(Talent)')) return 'Talent'
  return 'General'
}

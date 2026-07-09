export const CARGADO_POR = [
  'Sol CX', 'Agus Admin', 'Sofi Admin', 'Orne Talent',
  'Caro Talent', 'Belu Talent', 'Nico Director', 'Nacho Director',
]

export const PAISES = ['Argentina', 'Uruguay']

export const ESTADOS = ['Nuevo', 'En curso', 'Requiere atención', 'Cerrado']

export const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export const TIPOS_CASO: Record<string, { area: string; requiere_descuento: boolean; tipos: string[] }> = {
  'Admin': {
    area: 'Admin',
    requiere_descuento: false,
    tipos: [
      'Link de pago', 'Devolucion dentro del plazo', 'Devolucion fuera del plazo sin falla',
      'Envio de factura', 'Problema con factura', 'Cupon no aplicado', 'Pago duplicado',
      'Transferencia sesiones', 'Contracargo MP', 'Cambiar modalidad',
      'Cambiar modalidad de sesiones (psicologo ya confirmo)',
    ],
  },
  'Talent': {
    area: 'Talent',
    requiere_descuento: false,
    tipos: [
      'Disponibilidad agenda', 'No confirma sesion', 'Cancelacion psicologo',
      'Calendario incorrecto', 'Sesiones pendientes aprobacion', 'Psicologo fantasmeado',
      'Pocas horas', 'Sin horas', 'Mejora perfil',
      'Psicologo lleva pacientes por fuera de plataforma',
    ],
  },
  'Admin+Talent (con descuento)': {
    area: 'Admin+Talent',
    requiere_descuento: true,
    tipos: [
      'Devolucion fuera plazo con falla', 'Sesion sin consentimiento',
      'Sesion marcada realizada no ocurrio', 'Descontar sesion',
    ],
  },
  'Admin+Talent': {
    area: 'Admin+Talent',
    requiere_descuento: false,
    tipos: [
      'Desvinculacion con pacientes activos', 'Cobra fuera plataforma',
      'Horario incorrecto con dano',
    ],
  },
  'CX': {
    area: 'CX',
    requiere_descuento: false,
    tipos: [
      'Contactar retencion', 'Derivacion psicologo',
      'Mala experiencia devolucion autonoma', 'Cancelacion por paciente',
    ],
  },
}

export function getTipoCasoInfo(tipo: string): { area: string; requiere_descuento: boolean } | null {
  for (const config of Object.values(TIPOS_CASO)) {
    if (config.tipos.includes(tipo)) {
      return { area: config.area, requiere_descuento: config.requiere_descuento }
    }
  }
  return null
}

export const STATUS_COLORS: Record<string, string> = {
  'Nuevo': '#3B82F6',
  'En curso': '#F97316',
  'Requiere atención': '#F97316',
  'Cerrado': '#75B781',
}

export const SECTOR_ESTADOS = ['Pendiente', 'En curso', 'Cerrado']

export function calcularEstadoGlobal(area: string, estado_admin?: string, estado_talent?: string, estado_cx?: string): string {
  const ea = estado_admin || 'Pendiente'
  const et = estado_talent || 'Pendiente'
  const ec = estado_cx || 'Pendiente'

  if (area === 'Admin') {
    if (ea === 'Cerrado') return 'Cerrado'
    if (ea === 'En curso') return 'En curso'
    return 'Nuevo'
  }
  if (area === 'Talent') {
    if (et === 'Cerrado') return 'Cerrado'
    if (et === 'En curso') return 'En curso'
    return 'Nuevo'
  }
  if (area === 'CX') {
    if (ec === 'Cerrado') return 'Cerrado'
    if (ec === 'En curso') return 'En curso'
    return 'Nuevo'
  }
  if (area === 'Admin+Talent') {
    if (ea === 'Cerrado' && et === 'Cerrado') return 'Cerrado'
    if (ea === 'En curso' || et === 'En curso') return 'En curso'
    return 'Nuevo'
  }
  return 'Nuevo'
}

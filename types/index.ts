export interface Caso {
  id?: string
  created_at?: string
  updated_at?: string
  nro_caso?: string
  fecha: string
  cargado_por: string
  pais: string
  pac_nombre: string
  pac_mail: string
  psi_nombre: string
  psi_mail: string
  tipo_caso: string
  area: string
  descripcion: string
  accion_admin?: string
  estado_admin?: string
  accion_talent?: string
  estado_talent?: string
  requiere_descuento: boolean
  monto_descuento?: number | null
  estado_general: string
  observaciones?: string
  mes_liquidacion?: string
}

export interface CasoActualizacion {
  id?: string
  created_at?: string
  caso_id: string
  autor: string
  area: string
  mensaje: string
}

export interface DescuentoPsicologo {
  id?: string
  created_at?: string
  caso_id?: string
  nro_caso?: string
  fecha_caso?: string
  mes?: string
  pais?: string
  psi_nombre?: string
  psi_mail?: string
  pac_nombre?: string
  pac_mail?: string
  motivo?: string
  monto?: number | null
  estado: string
}

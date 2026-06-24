interface StatusBadgeProps {
  status: string
  type?: 'general' | 'admin' | 'talent' | 'descuento' | 'area'
}

const COLORS: Record<string, string> = {
  // Estado general
  Abierto: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  'En proceso': 'bg-blue-100 text-blue-800 border border-blue-200',
  Cerrado: 'bg-gray-100 text-gray-600 border border-gray-200',
  // Estado admin/talent
  Pendiente: 'bg-orange-100 text-orange-700 border border-orange-200',
  Resuelto: 'bg-green-100 text-green-800 border border-green-200',
  // Descuento
  Aplicado: 'bg-teal/10 text-teal border border-teal/20',
  Rechazado: 'bg-red-100 text-red-700 border border-red-200',
  // Area
  Admin: 'bg-blue-50 text-blue-700 border border-blue-200',
  Talent: 'bg-purple-50 text-purple-700 border border-purple-200',
  'Admin+Talent': 'bg-orange-50 text-orange-700 border border-orange-200',
  CX: 'bg-verde-medio/20 text-verde-oscuro border border-verde-medio/30',
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = COLORS[status] || 'bg-gray-100 text-gray-600 border border-gray-200'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  )
}

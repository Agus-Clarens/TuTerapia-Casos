import { ESTADO_BADGE, AREA_BADGE } from '@/lib/tipos-caso'

interface StatusBadgeProps {
  status: string
  type?: 'estado' | 'area'
}

export default function StatusBadge({ status, type = 'estado' }: StatusBadgeProps) {
  const map = type === 'area' ? AREA_BADGE : ESTADO_BADGE
  const colorClass = map[status] || 'bg-gray-100 text-gray-500 border border-gray-200'
  const label = status === 'Admin+Talent' ? 'Admin + Talent' : status
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  )
}

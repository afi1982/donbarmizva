'use client'
import { Guest, GuestStatus } from '@/lib/types'

const STATUS_BADGE: Record<GuestStatus, string> = {
  coming:     'bg-emerald-100 text-emerald-700',
  not_coming: 'bg-red-100 text-red-600',
  maybe:      'bg-amber-100 text-amber-700',
  pending:    'bg-slate-100 text-slate-500',
}
const STATUS_LABEL: Record<GuestStatus, string> = {
  coming:     'מגיע ✓',
  not_coming: 'לא מגיע',
  maybe:      'לא בטוח',
  pending:    'ממתין',
}

interface Props {
  guests: Guest[]
  onEdit?: (guest: Guest) => void
  onDelete?: (id: string) => void
}

export default function GuestTable({ guests, onEdit, onDelete }: Props) {
  if (guests.length === 0) {
    return (
      <div className="text-center py-12 text-stone-400">
        <div className="text-4xl mb-2">👥</div>
        <p>אין מוזמנים עדיין. הוסף את הראשון!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {guests.map(guest => (
        <div key={guest.id} className="flex items-center gap-3 p-3 bg-white border border-stone-100 rounded-xl hover:border-stone-200 transition-colors">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-stone-800 truncate">{guest.name}</div>
            <div className="text-xs text-stone-400" dir="ltr">{guest.phone}</div>
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_BADGE[guest.status]}`}>
            {STATUS_LABEL[guest.status]}
          </span>
          {onEdit && (
            <button onClick={() => onEdit(guest)} className="text-stone-400 hover:text-stone-600 transition-colors text-sm">✏️</button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(guest.id)} className="text-stone-300 hover:text-red-400 transition-colors text-sm">🗑️</button>
          )}
        </div>
      ))}
    </div>
  )
}

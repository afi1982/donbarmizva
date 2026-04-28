'use client'
import { Guest, GuestStatus, InvitationConfig } from '@/lib/types'

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

const BASE_URL = 'https://donbarmizva.vercel.app'

function normalizePhone(phone: string) {
  const d = phone.replace(/\D/g, '')
  return d.startsWith('972') ? d : d.startsWith('0') ? '972' + d.slice(1) : d
}

function buildWaUrl(guest: Guest, template: string) {
  const msg = template
    .replace(/{name}/g, guest.name)
    .replace(/{link}/g, `${BASE_URL}/rsvp/${guest.token}`)
    .replace(/{custom_message}/g, '')
  return `https://wa.me/${normalizePhone(guest.phone)}?text=${encodeURIComponent(msg)}`
}

interface Props {
  guests: Guest[]
  config?: Partial<InvitationConfig> | null
  onEdit?: (guest: Guest) => void
  onDelete?: (id: string) => void
}

export default function GuestTable({ guests, config, onEdit, onDelete }: Props) {
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
      {guests.map(guest => {
        const inviteTemplate = config?.whatsapp_message
        const reminderTemplate = config?.reminder_message
        const showInvite = guest.status === 'pending' && inviteTemplate
        const showReminder = guest.status === 'maybe' && reminderTemplate

        return (
          <div key={guest.id} className="flex items-center gap-2 p-3 bg-white border border-stone-100 rounded-xl hover:border-stone-200 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-stone-800 truncate text-sm">{guest.name}</div>
              <div className="text-xs text-stone-400" dir="ltr">{guest.phone}</div>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${STATUS_BADGE[guest.status]}`}>
              {STATUS_LABEL[guest.status]}
            </span>
            {showInvite && (
              <a href={buildWaUrl(guest, inviteTemplate!)} target="_blank" rel="noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                📱 שלח
              </a>
            )}
            {showReminder && (
              <a href={buildWaUrl(guest, reminderTemplate!)} target="_blank" rel="noreferrer"
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                🔔 תזכורת
              </a>
            )}
            {onEdit && (
              <button onClick={() => onEdit(guest)} className="text-stone-400 hover:text-stone-600 transition-colors text-sm p-1">✏️</button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(guest.id)} className="text-stone-300 hover:text-red-400 transition-colors text-sm p-1">🗑️</button>
            )}
          </div>
        )
      })}
    </div>
  )
}

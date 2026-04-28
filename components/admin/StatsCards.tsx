import { Guest, GuestStatus } from '@/lib/types'

const STATUS_CONFIG: Record<GuestStatus, { label: string; color: string }> = {
  coming:     { label: 'מגיעים',     color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  not_coming: { label: 'לא מגיעים', color: 'text-red-500 bg-red-50 border-red-200' },
  maybe:      { label: 'לא בטוח',   color: 'text-amber-600 bg-amber-50 border-amber-200' },
  pending:    { label: 'ממתינים',   color: 'text-slate-500 bg-slate-50 border-slate-200' },
}

export default function StatsCards({ guests }: { guests: Guest[] }) {
  const counts = {
    coming:     guests.filter(g => g.status === 'coming').length,
    not_coming: guests.filter(g => g.status === 'not_coming').length,
    maybe:      guests.filter(g => g.status === 'maybe').length,
    pending:    guests.filter(g => g.status === 'pending').length,
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {(Object.keys(STATUS_CONFIG) as GuestStatus[]).map(status => (
        <div key={status} className={`border rounded-xl p-4 text-center ${STATUS_CONFIG[status].color}`}>
          <div className="text-3xl font-black">{counts[status]}</div>
          <div className="text-xs font-medium mt-1">{STATUS_CONFIG[status].label}</div>
        </div>
      ))}
    </div>
  )
}

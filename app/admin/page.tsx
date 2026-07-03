import { supabaseAdmin } from '@/lib/supabase'
import { Guest, InvitationConfig } from '@/lib/types'
import CountdownTimer from '@/components/admin/CountdownTimer'
import StatusDonut from '@/components/admin/StatusDonut'
import LiveStats from '@/components/admin/LiveStats'
import LiveGuestTable from '@/components/admin/LiveGuestTable'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  coming: 'מגיע בשמחה ✓', not_coming: 'לא אוכל להגיע', maybe: 'עדיין לא בטוח', pending: 'ממתין',
}
const STATUS_BADGE: Record<string, string> = {
  coming: 'bg-emerald-500/15 text-emerald-300',
  not_coming: 'bg-red-500/15 text-red-400',
  maybe: 'bg-amber-500/15 text-amber-300',
  pending: 'bg-slate-700/60 text-slate-300',
}

export default async function AdminDashboard() {
  let guests: Guest[] = []
  let config: Partial<InvitationConfig> | null = null

  try {
    const [{ data: g }, { data: c }] = await Promise.all([
      supabaseAdmin.from('guests').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('invitation_config').select('*').eq('id', 1).single(),
    ])
    guests = (g as Guest[]) ?? []
    config = c as InvitationConfig | null
  } catch {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center" dir="rtl">
        <p className="text-red-300 font-bold mb-1">❌ שגיאת חיבור ל-Supabase</p>
        <p className="text-red-400 text-sm">בדוק שמשתני הסביבה מוגדרים נכון ב-Vercel</p>
      </div>
    )
  }

  const coming = guests.filter(g => g.status === 'coming').length
  const notComing = guests.filter(g => g.status === 'not_coming').length
  const maybe = guests.filter(g => g.status === 'maybe').length
  const total = guests.length
  const responded = guests.filter(g => g.responded_at).sort(
    (a, b) => new Date(b.responded_at!).getTime() - new Date(a.responded_at!).getTime()
  ).slice(0, 6)

  return (
    <div dir="rtl" className="space-y-5">

      {/* Countdown */}
      {config?.event_date && (
        <CountdownTimer eventDate={config.event_date} childName={config.child_name} />
      )}

      {/* Stats - live */}
      <LiveStats />

      {/* Middle row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Recent responses */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <h2 className="font-bold text-slate-200 mb-4 text-sm">הגיבו לאחרונה</h2>
          {responded.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">טרם התקבלו תגובות</p>
          ) : (
            <div className="space-y-2">
              {responded.map(g => (
                <div key={g.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                      {g.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-100">{g.name}</p>
                      <p className="text-xs text-slate-400">
                        {g.responded_at ? new Date(g.responded_at).toLocaleDateString('he-IL') : ''}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[g.status]}`}>
                    {STATUS_LABEL[g.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Donut chart */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <h2 className="font-bold text-slate-200 mb-4 text-sm">תמונת מצב</h2>
          <div className="flex justify-center">
            <StatusDonut coming={coming} notComing={notComing} maybe={maybe} total={total} />
          </div>
        </div>
      </div>

      {/* All guests - live */}
      <LiveGuestTable config={config} />
    </div>
  )
}

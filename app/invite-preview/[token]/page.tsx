import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { isValidToken } from '@/lib/tokens'

export const dynamic = 'force-dynamic'

export default async function InvitePreviewPage({
  params,
}: {
  params: { token: string }
  searchParams: { url?: string }
}) {
  if (!isValidToken(params.token)) notFound()

  const [{ data: guest }, { data: config }] = await Promise.all([
    supabaseAdmin.from('guests').select('name').eq('token', params.token).single(),
    supabaseAdmin.from('invitation_config').select('*').eq('id', 1).single(),
  ])

  if (!guest) notFound()

  const eventDateStr = config?.event_date
    ? new Date(config.event_date).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-stone-50 p-0 m-0">
      <div className="w-full bg-white" style={{ maxWidth: 380 }}>

        {/* Gold stripe */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg,#b8963e,#e8c97a,#b8963e)' }} />

        <div className="px-8 py-8 text-center">

          {/* Guest greeting */}
          <p className="text-xs text-stone-400 tracking-widest mb-5">שלום, {guest.name} ♥</p>

          {/* Child name */}
          <h1 className="font-serif font-black text-stone-900 mb-1" style={{ fontSize: 52, lineHeight: 1.1 }}>
            {config?.child_name || 'בר מצווה'}
          </h1>
          <p className="text-stone-500 text-sm mb-5">חוגג בר מצווה</p>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-amber-200" />
            <span className="text-amber-400 text-sm">✦</span>
            <div className="flex-1 h-px bg-amber-200" />
          </div>

          {/* Details */}
          <div className="space-y-2.5 text-sm text-right mb-6">
            {config?.parasha && (
              <div className="flex items-center gap-3">
                <span>📖</span>
                <span className="font-bold text-stone-800">{config.parasha}</span>
              </div>
            )}
            {config?.hebrew_date && (
              <div className="flex items-center gap-3">
                <span>🗓</span>
                <span className="text-stone-700">{config.hebrew_date}</span>
              </div>
            )}
            {eventDateStr && (
              <div className="flex items-center gap-3">
                <span>📅</span>
                <span className="text-stone-600">{eventDateStr}</span>
              </div>
            )}
            {config?.event_time && (
              <div className="flex items-center gap-3">
                <span>🕐</span>
                <span className="text-stone-700">שעה <strong>{config.event_time}</strong></span>
              </div>
            )}
            {config?.synagogue_name && (
              <div className="flex items-center gap-3">
                <span>🕍</span>
                <span className="font-bold text-stone-800">{config.synagogue_name}</span>
              </div>
            )}
            {(config?.address || config?.city) && (
              <div className="flex items-center gap-3">
                <span>📍</span>
                <span className="text-stone-600">{[config?.address, config?.city].filter(Boolean).join(', ')}</span>
              </div>
            )}
          </div>

          {config?.custom_message && (
            <p className="text-stone-400 text-xs italic leading-relaxed mb-4">{config.custom_message}</p>
          )}

          {config?.parents_names && (
            <p className="text-stone-400 text-xs">{config.parents_names}</p>
          )}
        </div>

        {/* Gold stripe */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg,#b8963e,#e8c97a,#b8963e)' }} />
      </div>
    </div>
  )
}

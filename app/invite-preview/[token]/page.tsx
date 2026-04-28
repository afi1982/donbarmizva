import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { isValidToken } from '@/lib/tokens'
import BotanicalLeaves from '@/components/botanical/BotanicalLeaves'
import BotanicalDivider from '@/components/botanical/BotanicalDivider'

export const dynamic = 'force-dynamic'

export default async function InvitePreviewPage({
  params,
  searchParams,
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

  const rsvpUrl = searchParams.url && searchParams.url !== 'undefined' ? searchParams.url : ''

  return (
    <div
      className="relative overflow-hidden w-full"
      style={{ background: 'linear-gradient(160deg, #faf8f5 0%, #f5f0e8 100%)' }}
      dir="rtl"
    >
      <BotanicalLeaves />
      <div className="relative z-10 text-center px-8 pt-8 pb-8">
        <p className="text-stone-400 text-xs tracking-widest mb-3">שלום, {guest.name} ❤</p>
        <h1 className="font-serif text-5xl font-black text-stone-800 mb-1">
          {config?.child_name || 'בר מצווה'}
        </h1>
        <p className="text-stone-500 text-sm mb-1">חוגג בר מצווה</p>
        <BotanicalDivider />
        {config && (
          <div className="text-stone-600 text-sm leading-7 mb-4">
            {config.parasha && <p className="font-bold text-stone-800">{config.parasha}</p>}
            {config.hebrew_date && <p>{config.hebrew_date}</p>}
            {config.event_time && <p>שעה {config.event_time}</p>}
            {eventDateStr && <p>{eventDateStr}</p>}
            {config.synagogue_name && <p className="font-bold text-stone-800 mt-1">{config.synagogue_name}</p>}
            {(config.address || config.city) && <p>{[config.address, config.city].filter(Boolean).join(', ')}</p>}
            {config.custom_message && <p className="mt-2 text-stone-500 italic text-xs">{config.custom_message}</p>}
          </div>
        )}
        {config?.parents_names && (
          <p className="text-stone-400 text-xs mb-4">{config.parents_names}</p>
        )}
        {rsvpUrl && (
          <div className="pt-4 border-t border-stone-200">
            <a
              href={rsvpUrl}
              className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold text-sm px-7 py-3 rounded-2xl shadow"
            >
              ✉️ לאישור הגעה לחץ כאן
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

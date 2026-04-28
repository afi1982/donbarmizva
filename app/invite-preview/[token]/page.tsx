import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { isValidToken } from '@/lib/tokens'
import BotanicalLayout from '@/components/botanical/BotanicalLayout'
import BotanicalDivider from '@/components/botanical/BotanicalDivider'

export const dynamic = 'force-dynamic'

export default async function InvitePreviewPage({ params }: { params: { token: string } }) {
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
    <BotanicalLayout>
      <div className="text-center" dir="rtl">
        <p className="text-stone-400 text-xs tracking-widest mb-4">שלום, {guest.name} ❤</p>
        <h1 className="font-serif text-5xl font-black text-stone-800 mb-2">
          {config?.child_name || 'בר מצווה'}
        </h1>
        <p className="text-stone-500 text-sm mb-1">חוגג בר מצווה</p>
        <BotanicalDivider />
        {config && (
          <div className="text-stone-600 text-sm leading-8 mb-6">
            {config.parasha && <p className="font-bold text-stone-800">{config.parasha}</p>}
            {config.hebrew_date && <p>{config.hebrew_date}</p>}
            {config.event_time && <p>שעה {config.event_time}</p>}
            {eventDateStr && <p>{eventDateStr}</p>}
            {config.synagogue_name && <p className="font-bold text-stone-800 mt-1">{config.synagogue_name}</p>}
            {(config.address || config.city) && <p>{[config.address, config.city].filter(Boolean).join(', ')}</p>}
            {config.custom_message && <p className="mt-2 text-stone-500 italic">{config.custom_message}</p>}
          </div>
        )}
        {config?.parents_names && (
          <p className="text-stone-500 text-xs mt-2">{config.parents_names}</p>
        )}
        <div className="mt-8 border-t border-stone-100 pt-6">
          <p className="text-stone-400 text-xs">לאישור הגעה לחץ על הקישור שנשלח אליך</p>
        </div>
      </div>
    </BotanicalLayout>
  )
}

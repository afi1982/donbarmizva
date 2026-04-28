import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { isValidToken } from '@/lib/tokens'
import BotanicalLayout from '@/components/botanical/BotanicalLayout'
import BotanicalDivider from '@/components/botanical/BotanicalDivider'
import RSVPButtons from '@/components/rsvp/RSVPButtons'

export const dynamic = 'force-dynamic'

export default async function RSVPPage({ params }: { params: { token: string } }) {
  if (!isValidToken(params.token)) notFound()

  const [{ data: guest }, { data: config }] = await Promise.all([
    supabaseAdmin.from('guests').select('*').eq('token', params.token).single(),
    supabaseAdmin.from('invitation_config').select('*').eq('id', 1).single(),
  ])

  if (!guest) notFound()

  const eventDateStr = config?.event_date
    ? new Date(config.event_date).toLocaleDateString('he-IL')
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
          </div>
        )}
        <p className="font-bold text-stone-700 mb-5 text-sm">האם תוכלו להגיע?</p>
        <RSVPButtons token={params.token} />
        {config?.parents_names && <p className="text-stone-400 text-xs mt-8">{config.parents_names}</p>}
      </div>
    </BotanicalLayout>
  )
}

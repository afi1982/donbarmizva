import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { isValidToken } from '@/lib/tokens'
import BotanicalLayout from '@/components/botanical/BotanicalLayout'
import BotanicalDivider from '@/components/botanical/BotanicalDivider'

export const dynamic = 'force-dynamic'

export default async function InvitePreviewPage({
  params,
}: {
  params: { token: string }
}) {
  if (!isValidToken(params.token)) notFound()

  const [{ data: guest }, { data: config }] = await Promise.all([
    supabaseAdmin.from('guests').select('*').eq('token', params.token).single(),
    supabaseAdmin.from('invitation_config').select('*').eq('id', 1).single(),
  ])

  if (!guest) notFound()

  const eventDateStr = config?.event_date
    ? new Date(config.event_date).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  return (
    <BotanicalLayout>
      {/* Greeting */}
      <p className="text-xs tracking-widest mb-6" style={{ color: '#9a8e7a' }}>
        שלום, {guest.name} ♥
      </p>

      {/* Invitation text */}
      <p className="text-sm mb-1" style={{ color: '#5a5347' }}>
        הנכם מוזמנים לטקס העלייה לתורה
      </p>
      <p className="text-sm mb-3" style={{ color: '#5a5347' }}>
        של בננו האהוב
      </p>

      {/* Child name - large elegant */}
      <h1
        className="font-black mb-2"
        style={{ fontFamily: 'serif', fontSize: '3rem', lineHeight: 1.1, color: '#1a1a1a' }}
      >
        {config?.child_name || 'בר מצווה'}
      </h1>
      <p className="text-sm mb-1" style={{ color: '#5a5347' }}>חוגג בר מצווה</p>

      <BotanicalDivider />

      {/* Event details */}
      {config && (
        <div className="space-y-2 text-sm mb-6" style={{ color: '#4a4a4a' }}>
          {config.parasha && (
            <p className="font-bold" style={{ color: '#1a1a1a' }}>שיערך אי&quot;ה בשבת {config.parasha}</p>
          )}
          {config.hebrew_date && <p>{config.hebrew_date}</p>}
          {eventDateStr && (
            <p className="font-bold text-lg tracking-wide" style={{ color: '#1a1a1a' }}>
              {eventDateStr}
            </p>
          )}
          {config.synagogue_name && (
            <p className="font-bold mt-2" style={{ color: '#1a1a1a' }}>
              {config.synagogue_name}
            </p>
          )}
          {(config.address || config.city) && (
            <p>{[config.address, config.city].filter(Boolean).join(', ')}</p>
          )}
          {config.event_time && (
            <p className="mt-2">
              {config.event_time} - תפילת שחרית
              <br />
              <span className="text-xs" style={{ color: '#7a7a7a' }}>קידוש וארוחה לאחר התפילה</span>
            </p>
          )}
        </div>
      )}

      {config?.custom_message && (
        <p className="text-xs italic leading-relaxed mb-4" style={{ color: '#9a8e7a' }}>
          {config.custom_message}
        </p>
      )}

      {/* Static Welcome Message for preview */}
      <div className="mb-4">
        <div
          className="rounded-xl px-4 py-3 text-sm font-bold text-center"
          style={{
            background: '#fcfaf2',
            color: '#b8963e',
            border: '1px solid #ebdcb9',
          }}
        >
          ✨ תצוגה מקדימה של ההזמנה ✨
        </div>
      </div>

      {/* Parents */}
      {config?.parents_names && (
        <p className="text-xs mt-6" style={{ color: '#b8a88a', fontStyle: 'italic' }}>
          נשמח לראותכם,
          <br />
          {config.parents_names}
        </p>
      )}
    </BotanicalLayout>
  )
}

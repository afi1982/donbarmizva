import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { isValidToken } from '@/lib/tokens'
import BotanicalLayout from '@/components/botanical/BotanicalLayout'
import BotanicalDivider from '@/components/botanical/BotanicalDivider'
import RSVPButtons from '@/components/rsvp/RSVPButtons'
import { parseCustomMessage } from '@/lib/config-helper'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RSVPPage({ params }: { params: { token: string } }) {
  if (!isValidToken(params.token)) notFound()

  const [{ data: guest }, { data: config }] = await Promise.all([
    supabaseAdmin.from('guests').select('*').eq('token', params.token).single(),
    supabaseAdmin.from('invitation_config').select('*').eq('id', 1).single(),
  ])

  if (!guest) notFound()

  const eventDateStr = config?.event_date
    ? new Date(config.event_date).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const alreadyResponded = guest.status !== 'pending'
  const p = parseCustomMessage(config?.custom_message)

  return (
    <BotanicalLayout>
      {/* Greeting */}
      <p className="text-xs tracking-widest mb-6" style={{ color: '#9a8e7a' }}>
        שלום, {guest.name} ♥
      </p>

      {/* Invitation text */}
      <p className="text-sm mb-1" style={{ color: '#5a5347' }}>
        {p.title1}
      </p>
      <p className="text-sm mb-3" style={{ color: '#5a5347' }}>
        {p.title2}
      </p>

      {/* Child name - large elegant */}
      <h1
        className="font-black mb-2"
        style={{ fontFamily: 'serif', fontSize: '3.5rem', lineHeight: 1.1, color: '#b8963e', textShadow: '0.5px 0.5px 0px rgba(0,0,0,0.05)' }}
      >
        {config?.child_name || 'בר מצווה'}
      </h1>
      <p className="text-sm mb-1" style={{ color: '#5a5347' }}>{p.tagline}</p>

      <BotanicalDivider />

      {/* Event details */}
      {config && (
        <div className="space-y-2 text-sm mb-6" style={{ color: '#4a4a4a' }}>
          {config.parasha && (
            <p className="font-bold text-stone-850" style={{ color: '#2c3e6b' }}>שיערך אי&quot;ה בשבת {config.parasha}</p>
          )}
          {config.hebrew_date && <p>{config.hebrew_date}</p>}
          {eventDateStr && (
            <p className="font-bold text-2xl tracking-wide my-1" style={{ color: '#b8963e', fontFamily: 'serif' }}>
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
              {config.event_time} - {p.prayer_time_label}
              <br />
              <span className="text-xs" style={{ color: '#7a7a7a' }}>{p.meal_label}</span>
            </p>
          )}
        </div>
      )}

      {p.custom_message && (
        <p className="text-xs italic leading-relaxed mb-4" style={{ color: '#9a8e7a' }}>
          {p.custom_message}
        </p>
      )}

      {/* Already responded state */}
      {guest.phone.includes('#info') ? (
        <div className="mb-4">
          <div
            className="rounded-xl px-4 py-3 text-sm font-bold text-center"
            style={{
              background: '#fcfaf2',
              color: '#b8963e',
              border: '1px solid #ebdcb9',
            }}
          >
            ✨ נשמח מאוד לראותכם בין אורחינו! ✨
          </div>
        </div>
      ) : alreadyResponded ? (
        <div className="mb-4">
          <div
            className="rounded-xl px-4 py-3 mb-3 text-sm font-bold"
            style={{
              background: guest.status === 'coming' ? '#ecfdf5' : guest.status === 'not_coming' ? '#fef2f2' : '#fffbeb',
              color: guest.status === 'coming' ? '#065f46' : guest.status === 'not_coming' ? '#991b1b' : '#92400e',
            }}
          >
            {guest.status === 'coming' && '✓ אישרת הגעה — נשמח לראותכם!'}
            {guest.status === 'not_coming' && 'עדכנת שלא תוכלו להגיע'}
            {guest.status === 'maybe' && '🤔 עדיין לא בטוחים — נשמח לשמוע'}
          </div>
          <RSVPButtons token={params.token} label="שינוי תשובה" collapsed />
        </div>
      ) : (
        <>
          <p className="font-bold text-sm mb-4" style={{ color: '#3a3a3a' }}>האם תוכלו להגיע?</p>
          <RSVPButtons token={params.token} />
        </>
      )}

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

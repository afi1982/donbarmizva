import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { isValidToken } from '@/lib/tokens'
import BotanicalLayout from '@/components/botanical/BotanicalLayout'
import BotanicalDivider from '@/components/botanical/BotanicalDivider'
import RSVPButtons from '@/components/rsvp/RSVPButtons'
import EventActionLinks from '@/components/rsvp/EventActionLinks'
import { parseCustomMessage } from '../../../lib/config-helper'
import { getPublishedDesign } from '@/lib/design/server'
import { formatParasha, formatVenue, getEventDef } from '@/lib/events'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const BASE_URL = 'https://donbarmizva.vercel.app'

export async function generateMetadata({ params }: { params: { token: string } }) {
  let title = 'הזמנה אישית עבורכם'
  try {
    const { data: c } = await supabaseAdmin
      .from('invitation_config').select('child_name, event_type').eq('id', 1).maybeSingle()
    const def = getEventDef(c?.event_type)
    title = `הזמנה: ${def.calendarTitle(c?.child_name || def.celebrantFallback)}`
  } catch { /* keep generic title */ }
  return {
    title,
    description: 'לחצו לצפייה בהזמנה ואישור הגעה',
    openGraph: {
      title,
      description: 'לחצו לצפייה בהזמנה ואישור הגעה',
      images: [{ url: `${BASE_URL}/api/invitation-image/${params.token}?format=og`, width: 1200, height: 630 }],
    },
  }
}

export default async function RSVPPage({ params }: { params: { token: string } }) {
  if (!isValidToken(params.token)) notFound()

  const [{ data: guest }, { data: config }, design] = await Promise.all([
    supabaseAdmin.from('guests').select('*').eq('token', params.token).single(),
    supabaseAdmin.from('invitation_config').select('*').eq('id', 1).single(),
    getPublishedDesign(),
  ])

  if (!guest) notFound()

  const eventDateStr = config?.event_date
    ? new Date(config.event_date).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const alreadyResponded = guest.status !== 'pending'
  const p = parseCustomMessage(config?.custom_message)
  const eventDef = getEventDef(config?.event_type)

  return (
    <BotanicalLayout design={design}>
      {/* Greeting */}
      <p className="text-xs tracking-widest mb-6" style={{ color: 'var(--inv-muted, #9a8e7a)' }}>
        שלום, {guest.name} ♥
      </p>

      {/* Invitation text */}
      <p className="text-sm mb-1" style={{ color: 'var(--inv-ink, #5a5347)' }}>
        {p.title1}
      </p>
      <p className="text-sm mb-3" style={{ color: 'var(--inv-ink, #5a5347)' }}>
        {p.title2}
      </p>

      {/* Child name - large elegant */}
      <h1
        className="font-black mb-2"
        style={{ fontFamily: 'serif', fontSize: '3.5rem', lineHeight: 1.1, color: 'var(--inv-primary, #b8963e)', textShadow: '0.5px 0.5px 0px rgba(0,0,0,0.05)' }}
      >
        {config?.child_name || eventDef.celebrantFallback}
      </h1>
      <p className="text-sm mb-1" style={{ color: 'var(--inv-ink, #5a5347)' }}>{p.tagline}</p>

      <BotanicalDivider />

      {/* Event details */}
      {config && (() => {
        const parashaText = formatParasha(config.parasha, eventDef);
        const synagogueText = formatVenue(config.synagogue_name, eventDef);

        const cleanAddress = config.address?.trim() || '';
        const addressText = cleanAddress 
          ? (cleanAddress.startsWith('בכתובת') ? cleanAddress : `בכתובת: ${cleanAddress}`) 
          : '';
        const fullAddress = [addressText, config.city?.trim()].filter(Boolean).join(', ');

        return (
          <div className="space-y-2 text-sm mb-6" style={{ color: 'var(--inv-ink, #4a4a4a)' }}>
            {parashaText && (
              <p className="font-bold text-stone-850" style={{ color: 'var(--inv-accent, #2c3e6b)' }}>{parashaText}</p>
            )}
            {config.hebrew_date && <p>{config.hebrew_date}</p>}
            {eventDateStr && (
              <p className="font-bold text-2xl tracking-wide my-1" style={{ color: 'var(--inv-primary, #b8963e)', fontFamily: 'serif' }}>
                {eventDateStr}
              </p>
            )}
            {synagogueText && (
              <p className="font-bold mt-2" style={{ color: 'var(--inv-ink, #1a1a1a)' }}>
                {synagogueText}
              </p>
            )}
            {fullAddress && (
              <p>{fullAddress}</p>
            )}
            {config.event_time && (
              <p className="mt-2">
                {config.event_time} - {p.prayer_time_label}
                <br />
                <span className="text-xs" style={{ color: 'var(--inv-muted, #7a7a7a)' }}>{p.meal_label}</span>
              </p>
            )}
          </div>
        );
      })()}

      {p.custom_message && (
        <p className="text-xs italic leading-relaxed mb-4" style={{ color: 'var(--inv-muted, #9a8e7a)' }}>
          {p.custom_message}
        </p>
      )}

      {/* Already responded state */}
      {guest.phone.includes('#info') ? (
        <div className="mb-4">
          <div
            className="rounded-xl px-4 py-3 text-sm font-bold text-center"
            style={{
              background: 'color-mix(in srgb, var(--inv-primary, #b8963e) 7%, transparent)',
              color: 'var(--inv-primary, #b8963e)',
              border: '1px solid var(--inv-frame, #ebdcb9)',
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
          <p className="font-bold text-sm mb-4" style={{ color: 'var(--inv-ink, #3a3a3a)' }}>האם תוכלו להגיע?</p>
          <RSVPButtons token={params.token} />
        </>
      )}

      <EventActionLinks config={config} />

      {/* Parents */}
      {config?.parents_names && (
        <p className="text-xs mt-6" style={{ color: 'var(--inv-muted, #b8a88a)', fontStyle: 'italic' }}>
          נשמח לראותכם,
          <br />
          {config.parents_names}
        </p>
      )}
    </BotanicalLayout>
  )
}

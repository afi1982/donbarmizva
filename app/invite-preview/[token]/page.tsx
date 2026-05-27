import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { isValidToken } from '@/lib/tokens'
import BotanicalLayout from '@/components/botanical/BotanicalLayout'
import BotanicalDivider from '@/components/botanical/BotanicalDivider'
import { parseCustomMessage } from '../../../lib/config-helper'

export const dynamic = 'force-dynamic'

export default async function InvitePreviewPage({
  params,
  searchParams,
}: {
  params: { token: string }
  searchParams?: { screenshot?: string }
}) {
  if (!isValidToken(params.token)) notFound()

  const [guestResult, configResult] = await Promise.all([
    supabaseAdmin.from('guests').select('*').eq('token', params.token).single(),
    supabaseAdmin.from('invitation_config').select('*').eq('id', 1).single(),
  ])

  if (guestResult.error) {
    console.error('❌ Supabase Guest Query Error:', guestResult.error.message, guestResult.error)
  }
  if (configResult.error) {
    console.error('❌ Supabase Config Query Error:', configResult.error.message, configResult.error)
  }

  const guest = guestResult.data
  const config = configResult.data

  if (!guest) {
    console.warn(`⚠️ Guest not found for token: ${params.token}`)
    notFound()
  }

  const eventDateStr = config?.event_date
    ? new Date(config.event_date).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const p = parseCustomMessage(config?.custom_message)

  const isScreenshot = searchParams?.screenshot === '1'

  return (
    <BotanicalLayout isScreenshot={isScreenshot}>
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
            <p className="font-bold text-stone-850" style={{ color: '#2c3e6b' }}>{config.parasha}</p>
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

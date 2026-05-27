import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { isValidToken } from '@/lib/tokens'
import BotanicalLayout from '@/components/botanical/BotanicalLayout'
import BotanicalDivider from '@/components/botanical/BotanicalDivider'
import { parseCustomMessage } from '../../../lib/config-helper'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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
      <p className="mb-6" style={{ color: '#9a8e7a', fontSize: isScreenshot ? '14px' : '12px', letterSpacing: '0.05em' }}>
        שלום, {guest.name} ♥
      </p>

      {/* Invitation text */}
      <p className="mb-1" style={{ color: '#5a5347', fontSize: isScreenshot ? '16px' : '14px' }}>
        {p.title1}
      </p>
      <p className="mb-3" style={{ color: '#5a5347', fontSize: isScreenshot ? '16px' : '14px' }}>
        {p.title2}
      </p>

      {/* Child name - large elegant */}
      <h1
        className="font-black mb-2"
        style={{ 
          fontFamily: 'serif', 
          fontSize: isScreenshot ? '4.2rem' : '3.5rem', 
          lineHeight: 1.1, 
          color: '#b8963e', 
          textShadow: '0.5px 0.5px 0px rgba(0,0,0,0.05)' 
        }}
      >
        {config?.child_name || 'בר מצווה'}
      </h1>
      <p className="mb-1" style={{ color: '#5a5347', fontSize: isScreenshot ? '16px' : '14px' }}>{p.tagline}</p>

      <BotanicalDivider />

      {/* Event details */}
      {config && (
        <div 
          className="mb-6" 
          style={{ 
            color: '#4a4a4a', 
            fontSize: isScreenshot ? '16px' : '14px',
            lineHeight: '1.6',
            display: 'flex',
            flexDirection: 'column',
            gap: isScreenshot ? '8px' : '6px'
          }}
        >
          {config.parasha && (
            <p className="font-bold" style={{ color: '#2c3e6b', fontSize: isScreenshot ? '18px' : '14px' }}>{config.parasha}</p>
          )}
          {config.hebrew_date && <p>{config.hebrew_date}</p>}
          {eventDateStr && (
            <p className="font-bold tracking-wide my-1" style={{ color: '#b8963e', fontFamily: 'serif', fontSize: isScreenshot ? '28px' : '24px' }}>
              {eventDateStr}
            </p>
          )}
          {config.synagogue_name && (
            <p className="font-bold mt-2" style={{ color: '#1a1a1a', fontSize: isScreenshot ? '18px' : '14px' }}>
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
              <span style={{ color: '#7a7a7a', fontSize: isScreenshot ? '13px' : '12px' }}>{p.meal_label}</span>
            </p>
          )}
        </div>
      )}

      {p.custom_message && (
        <p className="italic leading-relaxed mb-4" style={{ color: '#9a8e7a', fontSize: isScreenshot ? '14px' : '12px' }}>
          {p.custom_message}
        </p>
      )}

      {/* Static Welcome Message for preview */}
      <div className="mb-4">
        <div
          className="rounded-xl px-4 py-3 font-bold text-center"
          style={{
            background: '#fcfaf2',
            color: '#b8963e',
            border: '1px solid #ebdcb9',
            fontSize: isScreenshot ? '15px' : '14px'
          }}
        >
          ✨ תצוגה מקדימה של ההזמנה ✨
        </div>
      </div>

      {/* Parents */}
      {config?.parents_names && (
        <p className="mt-6" style={{ color: '#b8a88a', fontStyle: 'italic', fontSize: isScreenshot ? '14px' : '12px' }}>
          נשמח לראותכם,
          <br />
          {config.parents_names}
        </p>
      )}
    </BotanicalLayout>
  )
}

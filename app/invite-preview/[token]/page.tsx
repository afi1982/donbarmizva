import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { isValidToken } from '@/lib/tokens'

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

  const rsvpUrl = searchParams.url && searchParams.url !== 'undefined' ? searchParams.url : ''

  const eventDateStr = config?.event_date
    ? new Date(config.event_date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const location = [config?.synagogue_name, config?.address, config?.city].filter(Boolean).join(' • ')

  return (
    <div
      dir="rtl"
      style={{
        background: 'linear-gradient(160deg, #faf8f5 0%, #f0ebe0 100%)',
        fontFamily: "'Segoe UI', Arial, sans-serif",
        width: '100%',
        padding: '0',
        margin: '0',
      }}
    >
      {/* Gold top bar */}
      <div style={{ height: '6px', background: 'linear-gradient(90deg, #c9a84c, #e8c97a, #c9a84c)' }} />

      <div style={{ padding: '28px 28px 24px', textAlign: 'center' }}>

        {/* Greeting */}
        <p style={{ color: '#9c8060', fontSize: '13px', letterSpacing: '2px', marginBottom: '16px', marginTop: '0' }}>
          ♥ שלום, {guest.name}
        </p>

        {/* Child name */}
        <h1 style={{
          fontSize: '52px',
          fontWeight: '900',
          color: '#2c2416',
          margin: '0 0 4px 0',
          lineHeight: '1.1',
          fontFamily: 'Georgia, serif',
        }}>
          {config?.child_name || 'בר מצווה'}
        </h1>

        <p style={{ color: '#7a6a50', fontSize: '14px', margin: '0 0 20px 0' }}>
          חוגג בר מצווה
        </p>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, transparent, #c9a84c)' }} />
          <span style={{ color: '#c9a84c', fontSize: '16px' }}>✦</span>
          <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, #c9a84c, transparent)' }} />
        </div>

        {/* Event details */}
        <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '16px', padding: '16px 20px', marginBottom: '16px', textAlign: 'right' }}>
          {config?.parasha && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '18px' }}>📖</span>
              <span style={{ color: '#2c2416', fontWeight: '700', fontSize: '14px' }}>{config.parasha}</span>
            </div>
          )}
          {(config?.hebrew_date || eventDateStr) && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '18px' }}>📅</span>
              <div>
                {config?.hebrew_date && <div style={{ color: '#2c2416', fontWeight: '600', fontSize: '13px' }}>{config.hebrew_date}</div>}
                {eventDateStr && <div style={{ color: '#6b5a3e', fontSize: '12px' }}>{eventDateStr}</div>}
              </div>
            </div>
          )}
          {config?.event_time && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '18px' }}>🕐</span>
              <span style={{ color: '#2c2416', fontSize: '13px' }}>שעה <strong>{config.event_time}</strong></span>
            </div>
          )}
          {location && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: config?.parents_names ? '10px' : '0' }}>
              <span style={{ fontSize: '18px' }}>📍</span>
              <span style={{ color: '#2c2416', fontSize: '13px', lineHeight: '1.5' }}>{location}</span>
            </div>
          )}
          {config?.parents_names && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(201,168,76,0.2)' }}>
              <span style={{ fontSize: '18px' }}>👨‍👩‍👦</span>
              <span style={{ color: '#6b5a3e', fontSize: '12px' }}>{config.parents_names}</span>
            </div>
          )}
        </div>

        {/* Custom message */}
        {config?.custom_message && (
          <p style={{ color: '#7a6a50', fontSize: '12px', fontStyle: 'italic', margin: '0 0 16px 0', lineHeight: '1.6' }}>
            {config.custom_message}
          </p>
        )}

        {/* RSVP Button */}
        {rsvpUrl && (
          <a
            href={rsvpUrl}
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #2e7d52, #3da86e)',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '15px',
              padding: '14px 32px',
              borderRadius: '50px',
              textDecoration: 'none',
              boxShadow: '0 4px 15px rgba(46,125,82,0.3)',
              marginBottom: '4px',
            }}
          >
            ✉️ לאישור הגעה לחץ כאן
          </a>
        )}
      </div>

      {/* Gold bottom bar */}
      <div style={{ height: '6px', background: 'linear-gradient(90deg, #c9a84c, #e8c97a, #c9a84c)' }} />
    </div>
  )
}

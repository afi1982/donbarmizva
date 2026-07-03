import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isValidToken } from '@/lib/tokens'
import { getPublishedDesign } from '@/lib/design/server'
import { DEFAULT_SPEC } from '@/lib/design/spec'
import { parseCustomMessage } from '@/lib/config-helper'
import { toVisual } from '@/lib/hebrew-visual'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

let fontCache: { heebo: ArrayBuffer; heeboBold: ArrayBuffer; frank: ArrayBuffer } | null = null

async function loadFonts(origin: string) {
  if (fontCache) return fontCache
  const [heebo, heeboBold, frank] = await Promise.all([
    fetch(`${origin}/fonts/Heebo-Regular.ttf`).then(r => r.arrayBuffer()),
    fetch(`${origin}/fonts/Heebo-Bold.ttf`).then(r => r.arrayBuffer()),
    fetch(`${origin}/fonts/FrankRuhlLibre-Black.ttf`).then(r => r.arrayBuffer()),
  ])
  fontCache = { heebo, heeboBold, frank }
  return fontCache
}

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  if (!isValidToken(params.token)) return new Response('Not found', { status: 404 })

  const origin = new URL(req.url).origin
  const isOg = new URL(req.url).searchParams.get('format') === 'og'

  const [{ data: guest }, { data: config }, design, fonts] = await Promise.all([
    supabaseAdmin.from('guests').select('id').eq('token', params.token).maybeSingle(),
    supabaseAdmin.from('invitation_config').select('*').eq('id', 1).maybeSingle(),
    getPublishedDesign(),
    loadFonts(origin),
  ])

  if (!guest) return new Response('Not found', { status: 404 })

  const d = design ?? DEFAULT_SPEC
  const p = parseCustomMessage(config?.custom_message)

  const eventDateStr = config?.event_date
    ? new Date(config.event_date).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: 'numeric' })
    : ''

  const cleanParasha = config?.parasha?.trim() || ''
  const parashaText = cleanParasha
    ? (cleanParasha.startsWith('פרשת') || cleanParasha.startsWith('שבת') ? cleanParasha : `פרשת ${cleanParasha}`)
    : ''
  const cleanSynagogue = config?.synagogue_name?.trim() || ''
  const synagogueText = cleanSynagogue
    ? (cleanSynagogue.startsWith('בבית') || cleanSynagogue.startsWith('בית') ? cleanSynagogue : `בבית הכנסת ${cleanSynagogue}`)
    : ''
  const fullAddress = [config?.address?.trim(), config?.city?.trim()].filter(Boolean).join(', ')
  const childName = config?.child_name || 'בר מצווה'

  const goldStripe = `linear-gradient(90deg, ${d.primary}, ${d.primaryLight}, ${d.primary})`

  const fontOptions = {
    fonts: [
      { name: 'Heebo', data: fonts.heebo, weight: 400 as const },
      { name: 'Heebo', data: fonts.heeboBold, weight: 700 as const },
      { name: 'Frank', data: fonts.frank, weight: 900 as const },
    ],
    headers: { 'Cache-Control': 'public, max-age=300, s-maxage=600' },
  }

  // Landscape banner for WhatsApp link previews (og:image)
  if (isOg) {
    return new ImageResponse(
      (
        <div style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(135deg, ${d.bgFrom}, ${d.bgTo})`,
          fontFamily: 'Heebo',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 14, background: goldStripe, display: 'flex' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 14, background: goldStripe, display: 'flex' }} />
          <div style={{ display: 'flex', fontSize: 30, color: d.ink }}>{toVisual(p.title1 || 'הנכם מוזמנים לשמוח עימנו')}</div>
          <div style={{ display: 'flex', fontSize: 120, fontFamily: 'Frank', fontWeight: 900, color: d.primary, marginTop: 8 }}>{toVisual(childName)}</div>
          <div style={{ display: 'flex', fontSize: 34, color: d.ink, marginTop: 4 }}>{toVisual(p.tagline || 'עולה לתורה')}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 24 }}>
            {eventDateStr && <div style={{ display: 'flex', fontSize: 44, fontWeight: 700, color: d.primary }}>{eventDateStr}</div>}
            {synagogueText && <div style={{ display: 'flex', fontSize: 30, color: d.ink }}>{toVisual(`· ${synagogueText}`)}</div>}
          </div>
          <div style={{ display: 'flex', fontSize: 26, color: d.muted, marginTop: 20 }}>{toVisual('לחצו לצפייה בהזמנה ואישור הגעה ↓')}</div>
        </div>
      ),
      { width: 1200, height: 630, ...fontOptions }
    )
  }

  // Full vertical invitation card
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 36,
        background: `linear-gradient(180deg, ${d.bgFrom}, ${d.bgTo})`,
        fontFamily: 'Heebo',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%',
          background: d.cardBg, border: `2px solid ${d.frame}`, borderRadius: 6, overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', height: 12, width: '100%', background: goldStripe }} />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, justifyContent: 'center', padding: '20px 48px', width: '100%' }}>
            <div style={{ display: 'flex', fontSize: 24, color: d.muted, marginBottom: 26 }}>{toVisual('בס״ד')}</div>

            {p.title1 && <div style={{ display: 'flex', fontSize: 32, color: d.ink, textAlign: 'center' }}>{toVisual(p.title1)}</div>}
            {p.title2 && <div style={{ display: 'flex', fontSize: 32, color: d.ink, marginTop: 6, textAlign: 'center' }}>{toVisual(p.title2)}</div>}

            <div style={{ display: 'flex', fontSize: 130, fontFamily: 'Frank', fontWeight: 900, color: d.primary, marginTop: 14, marginBottom: 6 }}>
              {toVisual(childName)}
            </div>
            {p.tagline && <div style={{ display: 'flex', fontSize: 32, color: d.ink }}>{toVisual(p.tagline)}</div>}

            {/* Divider — the diamond is drawn (rotated square) since ✦ is missing from the font */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '28px 0', width: 340 }}>
              <div style={{ display: 'flex', flexGrow: 1, height: 2, background: d.divider }} />
              <div style={{ display: 'flex', width: 12, height: 12, background: d.primary, transform: 'rotate(45deg)' }} />
              <div style={{ display: 'flex', flexGrow: 1, height: 2, background: d.divider }} />
            </div>

            {parashaText && <div style={{ display: 'flex', fontSize: 36, fontWeight: 700, color: d.accent }}>{toVisual(parashaText)}</div>}
            {config?.hebrew_date && <div style={{ display: 'flex', fontSize: 30, color: d.ink, marginTop: 10 }}>{toVisual(config.hebrew_date)}</div>}
            {eventDateStr && (
              <div style={{ display: 'flex', fontSize: 60, fontWeight: 700, color: d.primary, marginTop: 12, marginBottom: 12 }}>{eventDateStr}</div>
            )}
            {synagogueText && <div style={{ display: 'flex', fontSize: 36, fontWeight: 700, color: d.ink, marginTop: 6, textAlign: 'center' }}>{toVisual(synagogueText)}</div>}
            {fullAddress && <div style={{ display: 'flex', fontSize: 30, color: d.ink, marginTop: 8 }}>{toVisual(fullAddress)}</div>}
            {config?.event_time && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 18 }}>
                <div style={{ display: 'flex', fontSize: 30, color: d.ink }}>{toVisual(`${p.prayer_time_label || 'תפילת שחרית'} - ${config.event_time}`)}</div>
                {p.meal_label && <div style={{ display: 'flex', fontSize: 25, color: d.muted, marginTop: 6 }}>{toVisual(p.meal_label)}</div>}
              </div>
            )}

            {p.custom_message && (
              <div style={{ display: 'flex', fontSize: 26, color: d.muted, fontStyle: 'italic', marginTop: 26, textAlign: 'center' }}>
                {toVisual(p.custom_message)}
              </div>
            )}

            {config?.parents_names && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 26 }}>
                <div style={{ display: 'flex', fontSize: 24, color: d.muted, fontStyle: 'italic' }}>{toVisual('נשמח לראותכם,')}</div>
                <div style={{ display: 'flex', fontSize: 26, color: d.muted, fontStyle: 'italic', marginTop: 4 }}>{toVisual(config.parents_names)}</div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', height: 12, width: '100%', background: goldStripe }} />
        </div>
      </div>
    ),
    { width: 920, height: 1450, ...fontOptions }
  )
}

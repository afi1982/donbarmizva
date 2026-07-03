import BotanicalLayout from '@/components/botanical/BotanicalLayout'
import BotanicalDivider from '@/components/botanical/BotanicalDivider'
import { supabaseAdmin } from '@/lib/supabase'
import { isValidToken } from '@/lib/tokens'
import EventActionLinks from '@/components/rsvp/EventActionLinks'
import { getPublishedDesign } from '@/lib/design/server'
import { DesignSpec } from '@/lib/design/spec'

export const dynamic = 'force-dynamic'

export default async function MaybePage({ params }: { params: { token: string } }) {
  let guestName = ''
  let customText = ''
  let config: Record<string, string | null> | null = null
  let design: DesignSpec | null = null

  if (isValidToken(params.token)) {
    const [{ data: guest }, { data: c }, d] = await Promise.all([
      supabaseAdmin.from('guests').select('name').eq('token', params.token).maybeSingle(),
      supabaseAdmin.from('invitation_config').select('*').eq('id', 1).maybeSingle(),
      getPublishedDesign(),
    ])
    guestName = guest?.name ?? ''
    config = c
    design = d
    customText = (c?.thanks_maybe ?? '').trim()
  }

  return (
    <BotanicalLayout design={design}>
      <div className="text-5xl mb-4">🌿</div>
      <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'serif', color: 'var(--inv-ink, #1a1a1a)' }}>קיבלנו!</h1>
      <BotanicalDivider />
      <p className="text-sm leading-7 whitespace-pre-line" style={{ color: 'var(--inv-ink, #5a5347)' }}>
        {customText
          ? customText.replace(/{name}/g, guestName)
          : <>תודה, הבנו שאתם עדיין לא בטוחים.<br />ניצור איתכם קשר בוואטסאפ לאישור סופי 💛</>}
      </p>
      {!customText && (
        <p className="text-xs mt-4" style={{ color: 'var(--inv-muted, #9a8e7a)' }}>תזכורת תישלח אליכם בקרוב</p>
      )}
      <EventActionLinks config={config} />
    </BotanicalLayout>
  )
}

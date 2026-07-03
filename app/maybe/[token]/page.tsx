import BotanicalLayout from '@/components/botanical/BotanicalLayout'
import BotanicalDivider from '@/components/botanical/BotanicalDivider'
import { supabaseAdmin } from '@/lib/supabase'
import { isValidToken } from '@/lib/tokens'
import EventActionLinks from '@/components/rsvp/EventActionLinks'

export const dynamic = 'force-dynamic'

export default async function MaybePage({ params }: { params: { token: string } }) {
  let guestName = ''
  let customText = ''
  let config: Record<string, string | null> | null = null

  if (isValidToken(params.token)) {
    const [{ data: guest }, { data: c }] = await Promise.all([
      supabaseAdmin.from('guests').select('name').eq('token', params.token).maybeSingle(),
      supabaseAdmin.from('invitation_config').select('*').eq('id', 1).maybeSingle(),
    ])
    guestName = guest?.name ?? ''
    config = c
    customText = (c?.thanks_maybe ?? '').trim()
  }

  return (
    <BotanicalLayout>
      <div className="text-5xl mb-4">🌿</div>
      <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'serif', color: '#1a1a1a' }}>קיבלנו!</h1>
      <BotanicalDivider />
      <p className="text-sm leading-7 whitespace-pre-line" style={{ color: '#5a5347' }}>
        {customText
          ? customText.replace(/{name}/g, guestName)
          : <>תודה, הבנו שאתם עדיין לא בטוחים.<br />ניצור איתכם קשר בוואטסאפ לאישור סופי 💛</>}
      </p>
      {!customText && (
        <p className="text-xs mt-4" style={{ color: '#9a8e7a' }}>תזכורת תישלח אליכם בקרוב</p>
      )}
      <EventActionLinks config={config} />
    </BotanicalLayout>
  )
}

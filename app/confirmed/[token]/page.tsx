import BotanicalLayout from '@/components/botanical/BotanicalLayout'
import BotanicalDivider from '@/components/botanical/BotanicalDivider'
import { supabaseAdmin } from '@/lib/supabase'
import { isValidToken } from '@/lib/tokens'
import EventActionLinks from '@/components/rsvp/EventActionLinks'

export const dynamic = 'force-dynamic'

export default async function ConfirmedPage({ params }: { params: { token: string } }) {
  let guestName = ''
  let partySize = 0
  let customText = ''
  let config: Record<string, string | null> | null = null

  if (isValidToken(params.token)) {
    const [{ data: guest }, { data: c }] = await Promise.all([
      supabaseAdmin.from('guests').select('name, party_size').eq('token', params.token).maybeSingle(),
      supabaseAdmin.from('invitation_config').select('*').eq('id', 1).maybeSingle(),
    ])
    guestName = guest?.name ?? ''
    partySize = guest?.party_size ?? 0
    config = c
    customText = (c?.thanks_confirmed ?? '').trim()
  }

  return (
    <BotanicalLayout>
      <div className="text-5xl mb-4">🎉</div>
      <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'serif', color: '#1a1a1a' }}>תודה על האישור!</h1>
      <BotanicalDivider />
      {partySize > 1 && (
        <p className="text-sm font-bold mb-2" style={{ color: '#2d6a4f' }}>
          נרשמה הגעה של {partySize} משתתפים 💚
        </p>
      )}
      <p className="text-sm leading-7 whitespace-pre-line" style={{ color: '#5a5347' }}>
        {customText
          ? customText.replace(/{name}/g, guestName)
          : <>שמחים שתוכלו להגיע!<br />נשמח לראותכם בשמחת בר המצווה של {config?.child_name || 'דון'} 💛</>}
      </p>
      <EventActionLinks config={config} />
    </BotanicalLayout>
  )
}

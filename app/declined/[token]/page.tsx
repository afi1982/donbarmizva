import BotanicalLayout from '@/components/botanical/BotanicalLayout'
import BotanicalDivider from '@/components/botanical/BotanicalDivider'
import { supabaseAdmin } from '@/lib/supabase'
import { isValidToken } from '@/lib/tokens'

export const dynamic = 'force-dynamic'

export default async function DeclinedPage({ params }: { params: { token: string } }) {
  let guestName = ''
  let customText = ''

  if (isValidToken(params.token)) {
    const [{ data: guest }, { data: c }] = await Promise.all([
      supabaseAdmin.from('guests').select('name').eq('token', params.token).maybeSingle(),
      supabaseAdmin.from('invitation_config').select('thanks_declined').eq('id', 1).maybeSingle(),
    ])
    guestName = guest?.name ?? ''
    customText = (c?.thanks_declined ?? '').trim()
  }

  return (
    <BotanicalLayout>
      <div className="text-5xl mb-4">💙</div>
      <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'serif', color: '#1a1a1a' }}>תודה על הידיעה</h1>
      <BotanicalDivider />
      <p className="text-sm leading-7 whitespace-pre-line" style={{ color: '#5a5347' }}>
        {customText
          ? customText.replace(/{name}/g, guestName)
          : <>חבל שלא תוכלו להגיע.<br />נשמח לחגוג איתכם בהזדמנויות אחרות 💛</>}
      </p>
    </BotanicalLayout>
  )
}

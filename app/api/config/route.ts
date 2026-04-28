import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const DEFAULTS = {
  id: 1,
  child_name: 'דון',
  whatsapp_message: `שלום {name} 🎟️

אנחנו שמחים להזמין אותך לבר המצווה של דון בר אל!

לפרטי האירוע ולאישור הגעה לחץ כאן:
{link}

נשמח לראותך 🙏`,
  reminder_message: `שלום {name} 🙏

טרם קיבלנו אישור הגעה לבר המצווה של דון.
נשמח לדעת — לחץ לאישור:
{link}`,
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('invitation_config')
    .select('*')
    .eq('id', 1)
    .single()

  if (error || !data) {
    // Return defaults if no row exists yet
    return NextResponse.json(DEFAULTS)
  }
  // Merge defaults for any empty fields
  const merged = { ...DEFAULTS, ...data }
  if (!merged.whatsapp_message) merged.whatsapp_message = DEFAULTS.whatsapp_message
  if (!merged.reminder_message) merged.reminder_message = DEFAULTS.reminder_message
  return NextResponse.json(merged)
}

export async function PUT(request: NextRequest) {
  const body = await request.json()

  const allowed = [
    'child_name', 'event_date', 'event_time', 'parasha', 'hebrew_date',
    'synagogue_name', 'address', 'city', 'parents_names', 'siblings_names',
    'custom_message', 'whatsapp_message', 'reminder_message',
  ]
  const update = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  )

  const { data, error } = await supabaseAdmin
    .from('invitation_config')
    .upsert({ id: 1, ...update })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const DEFAULTS = {
  id: 1,
  child_name: 'דון',
  whatsapp_message: '',
  reminder_message: '',
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
  return NextResponse.json({ ...DEFAULTS, ...data })
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

  // Check if row exists
  const { data: existing } = await supabaseAdmin
    .from('invitation_config')
    .select('id')
    .eq('id', 1)
    .maybeSingle()

  let data, error
  if (existing) {
    // Row exists → update
    ;({ data, error } = await supabaseAdmin
      .from('invitation_config')
      .update(update)
      .eq('id', 1)
      .select()
      .single())
  } else {
    // Row doesn't exist → insert
    ;({ data, error } = await supabaseAdmin
      .from('invitation_config')
      .insert({ id: 1, ...update })
      .select()
      .single())
  }

  if (error) {
    console.error('Config save error:', JSON.stringify(error))
    return NextResponse.json({ error: error.message, details: error }, { status: 500 })
  }
  return NextResponse.json(data)
}

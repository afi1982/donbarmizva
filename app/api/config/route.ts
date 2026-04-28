import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('invitation_config')
    .select('*')
    .eq('id', 1)
    .maybeSingle()

  if (error) {
    console.error('Config GET error:', error)
    return NextResponse.json({ id: 1 })
  }
  return NextResponse.json(data ?? { id: 1 })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()

  const allowed = [
    'child_name', 'event_date', 'event_time', 'parasha', 'hebrew_date',
    'synagogue_name', 'address', 'city', 'parents_names', 'siblings_names',
    'custom_message', 'whatsapp_message', 'reminder_message',
  ]
  const update = Object.fromEntries(
    Object.entries(body).filter(([k, v]) => allowed.includes(k) && v !== undefined)
  )

  const { data, error } = await supabaseAdmin
    .from('invitation_config')
    .upsert({ id: 1, ...update }, { onConflict: 'id' })
    .select()
    .single()

  if (error) {
    console.error('Config save error:', JSON.stringify(error))
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

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
    Object.entries(body).filter(([k, v]) =>
      allowed.includes(k) && v !== undefined && v !== null && v !== ''
    )
  )

  // Try update first (row with id=1 should always exist)
  const { data: updated, error: updateError } = await supabaseAdmin
    .from('invitation_config')
    .update(update)
    .eq('id', 1)
    .select()
    .maybeSingle()

  if (updateError) {
    console.error('Config update error:', JSON.stringify(updateError))
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Row didn't exist yet — insert it
  if (!updated) {
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('invitation_config')
      .insert({ id: 1, ...update })
      .select()
      .single()
    if (insertError) {
      console.error('Config insert error:', JSON.stringify(insertError))
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
    return NextResponse.json(inserted)
  }

  return NextResponse.json(updated)
}

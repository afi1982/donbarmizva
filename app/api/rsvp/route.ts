import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isValidToken } from '@/lib/tokens'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { token, status } = await request.json()

  if (!isValidToken(token)) {
    return NextResponse.json({ error: 'קישור לא תקין' }, { status: 400 })
  }

  const validStatuses = ['coming', 'not_coming', 'maybe']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'סטטוס לא תקין' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('guests')
    .update({ status, responded_at: new Date().toISOString() })
    .eq('token', token)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'מוזמן לא נמצא' }, { status: 404 })
  }

  return NextResponse.json({ ok: true, status })
}

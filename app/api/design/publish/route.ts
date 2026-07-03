import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sanitizeSpec } from '@/lib/design/spec'

export const dynamic = 'force-dynamic'

// Copies the draft to published — the only thing guest pages ever read.
export async function POST() {
  const { data, error } = await supabaseAdmin
    .from('invitation_designs')
    .select('draft_spec')
    .eq('event_id', 1)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data?.draft_spec) {
    return NextResponse.json({ error: 'אין טיוטה לפרסום — שמור עיצוב קודם' }, { status: 400 })
  }

  const spec = sanitizeSpec(data.draft_spec)
  const { error: updErr } = await supabaseAdmin
    .from('invitation_designs')
    .update({ published_spec: spec, updated_at: new Date().toISOString() })
    .eq('event_id', 1)

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

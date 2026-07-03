import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { DEFAULT_SPEC, sanitizeSpec } from '@/lib/design/spec'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('invitation_designs')
    .select('draft_spec, published_spec')
    .eq('event_id', 1)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    draft: sanitizeSpec(data?.draft_spec ?? data?.published_spec ?? DEFAULT_SPEC),
    published: data?.published_spec ? sanitizeSpec(data.published_spec) : null,
  })
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const spec = sanitizeSpec(body?.spec)

  const { error } = await supabaseAdmin
    .from('invitation_designs')
    .upsert(
      { event_id: 1, draft_spec: spec, updated_at: new Date().toISOString() },
      { onConflict: 'event_id' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, spec })
}

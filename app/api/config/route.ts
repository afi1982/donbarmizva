import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ id: 1 })
  }

  const res = await fetch(
    `${supabaseUrl}/rest/v1/invitation_config?id=eq.1&select=*`,
    {
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
      },
      cache: 'no-store',
    }
  )

  if (!res.ok) {
    console.error('Config GET error:', res.status, await res.text())
    return NextResponse.json({ id: 1 })
  }

  const rows = await res.json()
  return NextResponse.json(rows?.[0] ?? { id: 1 })
}

export async function PUT(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: `Missing env vars: URL=${!!supabaseUrl} KEY=${!!serviceKey}` },
      { status: 500 }
    )
  }

  const body = await request.json()

  const allowed = [
    'child_name', 'event_date', 'event_time', 'parasha', 'hebrew_date',
    'synagogue_name', 'address', 'city', 'parents_names', 'siblings_names',
    'custom_message', 'whatsapp_message', 'reminder_message',
  ]
  const update = Object.fromEntries(
    Object.entries(body)
      .filter(([k, v]) => allowed.includes(k) && v !== undefined)
      .map(([k, v]) => [k, k === 'event_date' && v === '' ? null : v])
  )

  // Direct HTTP call to PostgREST — bypasses JS client init issues
  const res = await fetch(
    `${supabaseUrl}/rest/v1/invitation_config?id=eq.1`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(update),
    }
  )

  const text = await res.text()

  if (!res.ok) {
    console.error('Supabase PATCH error:', res.status, text)
    return NextResponse.json({ error: `DB error ${res.status}: ${text}` }, { status: 500 })
  }

  // Empty array means 0 rows matched — row doesn't exist yet, insert it
  let rows: unknown[]
  try { rows = JSON.parse(text) } catch { rows = [] }

  if (Array.isArray(rows) && rows.length === 0) {
    const insertRes = await fetch(
      `${supabaseUrl}/rest/v1/invitation_config`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({ id: 1, ...update }),
      }
    )
    if (!insertRes.ok) {
      const insertText = await insertRes.text()
      return NextResponse.json({ error: `Insert error ${insertRes.status}: ${insertText}` }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}

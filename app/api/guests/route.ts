import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateToken } from '@/lib/tokens'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('guests')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (e) {
    console.error('GET /api/guests error:', e)
    return NextResponse.json({ error: 'שגיאת חיבור למסד הנתונים' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, phone } = await request.json()

    if (!name?.trim() || !phone?.trim() || phone.trim().length <= 6) {
      return NextResponse.json({ error: 'שם וטלפון נדרשים' }, { status: 400 })
    }

    const token = generateToken()
    const { data, error } = await supabaseAdmin
      .from('guests')
      .insert({ name: name.trim(), phone: phone.trim(), token })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    console.error('POST /api/guests error:', e)
    return NextResponse.json({ error: 'שגיאת חיבור למסד הנתונים' }, { status: 500 })
  }
}

export async function PUT() {
  try {
    const { data: guests, error: fetchError } = await supabaseAdmin
      .from('guests')
      .select('id, phone')

    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })

    const updates = guests
      .filter(g => !g.phone.includes('#info'))
      .map(g => ({
        id: g.id,
        phone: g.phone + '#info'
      }))

    let updatedCount = 0
    if (updates.length > 0) {
      for (const update of updates) {
        const { error } = await supabaseAdmin
          .from('guests')
          .update({ phone: update.phone })
          .eq('id', update.id)
        if (!error) updatedCount++
      }
    }

    return NextResponse.json({ ok: true, updated: updatedCount })
  } catch (e) {
    console.error('PUT /api/guests error:', e)
    return NextResponse.json({ error: 'שגיאת חיבור למסד הנתונים' }, { status: 500 })
  }
}


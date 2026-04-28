import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateToken } from '@/lib/tokens'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('guests')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
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
}

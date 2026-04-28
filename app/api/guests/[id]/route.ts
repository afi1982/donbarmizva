import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { name, phone } = await request.json()

  if (!name?.trim() || !phone?.trim() || phone.trim().length <= 6) {
    return NextResponse.json({ error: 'שם וטלפון נדרשים' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('guests')
    .update({ name: name.trim(), phone: phone.trim() })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await supabaseAdmin
    .from('guests')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}

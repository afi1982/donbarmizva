import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  const { code } = params

  const { data } = await supabaseAdmin
    .from('guests')
    .select('token')
    .ilike('token', `${code}%`)
    .limit(1)
    .single()

  if (!data?.token) {
    return NextResponse.redirect(new URL('/', _req.url))
  }

  return NextResponse.redirect(new URL(`/rsvp/${data.token}`, _req.url))
}

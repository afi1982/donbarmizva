import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabaseAdmin: SupabaseClient | null = null
let _supabase: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _supabaseAdmin
}

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _supabase
}

// Named exports for backward compatibility (lazy-initialized via Proxy)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdmin()
    return (client as unknown as Record<string | symbol, unknown>)[prop]
  },
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase()
    return (client as unknown as Record<string | symbol, unknown>)[prop]
  },
})

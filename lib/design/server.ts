import { supabaseAdmin } from '@/lib/supabase'
import { DesignSpec, sanitizeSpec } from './spec'

// Published design for guest-facing pages. Returns null when nothing was ever
// published — pages then render with the built-in defaults (identical to today).
export async function getPublishedDesign(): Promise<DesignSpec | null> {
  try {
    const { data } = await supabaseAdmin
      .from('invitation_designs')
      .select('published_spec')
      .eq('event_id', 1)
      .maybeSingle()
    if (!data?.published_spec) return null
    return sanitizeSpec(data.published_spec)
  } catch {
    return null
  }
}

import { Guest } from './types'

export const LOCAL_SERVER = 'http://localhost:3333'

export type MessageTemplates = {
  whatsapp_message?: string | null
  reminder_message?: string | null
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('972')) return digits
  if (digits.startsWith('0')) return '972' + digits.slice(1)
  return digits
}

export function buildWaText(
  template: string | null | undefined,
  guest: Pick<Guest, 'name' | 'phone' | 'token'>,
  origin: string
): string {
  const message = (template ?? '')
    .replace(/\\n/g, '\n')
    .replace(/{name}/g, guest.name)
    .replace(/\n?{link}\n?/g, '')
    .replace(/{custom_message}/g, '')
    .trim()

  // Info-only guests get ONLY the invitation itself — no intro text, no RSVP link
  if (guest.phone.includes('#info')) {
    return `${origin}/invite-preview/${guest.token}`
  }

  const shortUrl = `${origin}/r/${guest.token.slice(0, 8)}`
  return message
    ? `${message}\n\nלאישור הגעה לחץ כאן:\n${shortUrl}`
    : `לאישור הגעה לחץ כאן:\n${shortUrl}`
}

export function waLink(phone: string, text: string): string {
  const number = normalizePhone(phone.split('#')[0])
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}

export function pickTemplate(
  config: MessageTemplates | null | undefined,
  mode: 'invite' | 'reminder'
): string | null {
  const t = mode === 'reminder' ? config?.reminder_message : config?.whatsapp_message
  return t?.trim() ? t : null
}

// Must be called synchronously from a user click so the browser doesn't block the popup
export function openWa(phone: string, text: string): void {
  const url = waLink(phone, text)
  const win = window.open(url, '_blank')
  if (!win) window.location.href = url
}

export async function checkLocalServer(): Promise<boolean> {
  try {
    const res = await fetch(`${LOCAL_SERVER}/status`, { signal: AbortSignal.timeout(2000) })
    const data = await res.json()
    return data.status === 'connected'
  } catch {
    return false
  }
}

export async function markSent(guestId: string, mode: 'invite' | 'reminder'): Promise<void> {
  try {
    await fetch(`/api/guests/${guestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mark: mode === 'reminder' ? 'reminded' : 'invited' }),
    })
  } catch {
    // best-effort — the message was already opened in WhatsApp
  }
}

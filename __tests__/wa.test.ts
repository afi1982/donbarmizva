import { normalizePhone, buildWaText, waLink, pickTemplate } from '@/lib/wa'

const ORIGIN = 'https://donbarmizva.vercel.app'
const guest = {
  name: 'אופיר',
  phone: '0543366012',
  token: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
}

describe('normalizePhone', () => {
  it('converts leading 0 to 972', () => {
    expect(normalizePhone('0543366012')).toBe('972543366012')
  })

  it('keeps numbers already prefixed with 972', () => {
    expect(normalizePhone('972543366012')).toBe('972543366012')
  })

  it('strips non-digit characters', () => {
    expect(normalizePhone('054-336-6012')).toBe('972543366012')
  })
})

describe('buildWaText', () => {
  it('replaces {name} and appends the short RSVP link', () => {
    const text = buildWaText('שלום {name}!', guest, ORIGIN)
    expect(text).toContain('שלום אופיר!')
    expect(text).toContain(`${ORIGIN}/r/a1b2c3d4`)
    expect(text).toContain('לאישור הגעה לחץ כאן:')
  })

  it('removes the {link} placeholder from the template body', () => {
    const text = buildWaText('היי {name}\n{link}\nנתראה', guest, ORIGIN)
    expect(text).not.toContain('{link}')
  })

  it('sends only the RSVP link when the template is empty', () => {
    const text = buildWaText('', guest, ORIGIN)
    expect(text).toBe(`לאישור הגעה לחץ כאן:\n${ORIGIN}/r/a1b2c3d4`)
  })

  it('sends ONLY the invitation preview link for #info guests — no intro text', () => {
    const infoGuest = { ...guest, phone: '0543366012#info' }
    const text = buildWaText('שלום {name}', infoGuest, ORIGIN)
    expect(text).toBe(`${ORIGIN}/invite-preview/${guest.token}`)
    expect(text).not.toContain('שלום')
    expect(text).not.toContain('/r/')
    expect(text).not.toContain('לאישור הגעה')
  })
})

describe('waLink', () => {
  it('builds a wa.me URL with normalized phone and encoded text', () => {
    const url = waLink('0543366012', 'שלום עולם')
    expect(url).toBe(`https://wa.me/972543366012?text=${encodeURIComponent('שלום עולם')}`)
  })

  it('strips the #info suffix from the phone', () => {
    const url = waLink('0543366012#info', 'הי')
    expect(url).toContain('wa.me/972543366012')
    expect(url).not.toContain('info')
  })
})

describe('pickTemplate', () => {
  const config = { whatsapp_message: 'הזמנה', reminder_message: 'תזכורת' }

  it('picks whatsapp_message for invite mode', () => {
    expect(pickTemplate(config, 'invite')).toBe('הזמנה')
  })

  it('picks reminder_message for reminder mode', () => {
    expect(pickTemplate(config, 'reminder')).toBe('תזכורת')
  })

  it('returns null when the template is missing or blank', () => {
    expect(pickTemplate(null, 'invite')).toBeNull()
    expect(pickTemplate({ whatsapp_message: '  ' }, 'invite')).toBeNull()
  })
})

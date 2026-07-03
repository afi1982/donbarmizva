import { EVENT_TYPES, getEventDef, formatParasha, formatVenue } from '@/lib/events'

describe('getEventDef', () => {
  it('returns the matching event type', () => {
    expect(getEventDef('wedding').name).toBe('חתונה')
    expect(getEventDef('birthday').emoji).toBe('🎂')
  })

  it('falls back to bar mitzvah for unknown/missing types', () => {
    expect(getEventDef(null).key).toBe('bar_mitzvah')
    expect(getEventDef('nonsense').key).toBe('bar_mitzvah')
  })

  it('has unique keys and complete defaults for every type', () => {
    const keys = new Set(EVENT_TYPES.map(t => t.key))
    expect(keys.size).toBe(EVENT_TYPES.length)
    for (const t of EVENT_TYPES) {
      expect(t.name).toBeTruthy()
      expect(t.defaults.title1).toBeTruthy()
      expect(t.calendarTitle('דון')).toBeTruthy()
      expect(t.thanksDefault('דון')).toBeTruthy()
    }
  })
})

describe('formatParasha', () => {
  const barMitzvah = getEventDef('bar_mitzvah')
  const wedding = getEventDef('wedding')

  it('prefixes with פרשת for bar mitzvah', () => {
    expect(formatParasha('מטות', barMitzvah)).toBe('פרשת מטות')
    expect(formatParasha('פרשת מטות', barMitzvah)).toBe('פרשת מטות')
  })

  it('leaves the headline untouched for weddings', () => {
    expect(formatParasha('ביום מיוחד אחד', wedding)).toBe('ביום מיוחד אחד')
  })

  it('returns empty for blank input', () => {
    expect(formatParasha('  ', barMitzvah)).toBe('')
  })
})

describe('formatVenue', () => {
  const barMitzvah = getEventDef('bar_mitzvah')
  const wedding = getEventDef('wedding')

  it('prefixes בבית הכנסת for bar mitzvah', () => {
    expect(formatVenue('אור החיים', barMitzvah)).toBe('בבית הכנסת אור החיים')
    expect(formatVenue('בית הכנסת הגדול', barMitzvah)).toBe('בית הכנסת הגדול')
  })

  it('shows the venue as-is for weddings', () => {
    expect(formatVenue('גן האירועים ורסאי', wedding)).toBe('גן האירועים ורסאי')
  })
})

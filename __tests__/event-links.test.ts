import { buildCalendarUrl } from '@/components/rsvp/EventActionLinks'

describe('buildCalendarUrl', () => {
  const config = {
    child_name: 'דון',
    event_date: '2026-08-15',
    event_time: '13:30',
    synagogue_name: 'בית הכנסת המרכזי',
    address: 'הרצל 10',
    city: 'תל אביב',
  }

  it('builds a Google Calendar URL with a 3-hour timed event', () => {
    const url = buildCalendarUrl(config)!
    expect(url).toContain('calendar.google.com/calendar/render')
    expect(url).toContain('dates=20260815T133000%2F20260815T163000')
    expect(url).toContain('ctz=Asia%2FJerusalem')
  })

  it('includes the event title and location', () => {
    const decoded = decodeURIComponent(buildCalendarUrl(config)!).replace(/\+/g, ' ')
    expect(decoded).toContain('בר מצווה של דון')
    expect(decoded).toContain('הרצל 10, תל אביב')
  })

  it('falls back to an all-day event without event_time', () => {
    const url = buildCalendarUrl({ ...config, event_time: null })!
    expect(url).toContain('dates=20260815%2F20260816')
  })

  it('returns null without event_date', () => {
    expect(buildCalendarUrl({ ...config, event_date: null })).toBeNull()
    expect(buildCalendarUrl(null)).toBeNull()
  })
})

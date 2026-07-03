import type { CSSProperties } from 'react'

const pillStyle: CSSProperties = {
  border: '1px solid #ebdcb9',
  background: '#fcfaf2',
  color: '#8a713a',
}

type ConfigLike = {
  address?: string | null
  city?: string | null
  synagogue_name?: string | null
  event_date?: string | null
  event_time?: string | null
  child_name?: string | null
} | null

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function buildCalendarUrl(config: ConfigLike): string | null {
  if (!config?.event_date) return null
  const date = new Date(config.event_date)
  if (isNaN(date.getTime())) return null

  const title = `בר מצווה של ${config.child_name?.trim() || 'דון'}`
  const location = [config.synagogue_name, config.address, config.city]
    .map(s => s?.trim())
    .filter(Boolean)
    .join(', ')

  const y = date.getFullYear()
  const m = pad(date.getMonth() + 1)
  const d = pad(date.getDate())

  let dates: string
  const timeMatch = config.event_time?.match(/^(\d{1,2}):(\d{2})/)
  if (timeMatch) {
    const h = parseInt(timeMatch[1], 10)
    const min = timeMatch[2]
    const start = `${y}${m}${d}T${pad(h)}${min}00`
    const end = `${y}${m}${d}T${pad(Math.min(h + 3, 23))}${min}00`
    dates = `${start}/${end}`
  } else {
    const next = new Date(date)
    next.setDate(next.getDate() + 1)
    dates = `${y}${m}${d}/${next.getFullYear()}${pad(next.getMonth() + 1)}${pad(next.getDate())}`
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates,
    ctz: 'Asia/Jerusalem',
  })
  if (location) params.set('location', location)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export default function EventActionLinks({ config }: { config: ConfigLike }) {
  const destination = [config?.address, config?.city].map(s => s?.trim()).filter(Boolean).join(', ')
  const calendarUrl = buildCalendarUrl(config)

  if (!destination && !calendarUrl) return null

  const enc = encodeURIComponent(destination)

  return (
    <div className="flex flex-wrap justify-center gap-2 mt-5" dir="rtl">
      {destination && (
        <>
          <a
            href={`https://waze.com/ul?q=${enc}&navigate=yes`}
            target="_blank" rel="noopener noreferrer"
            className="text-xs font-bold px-3.5 py-2 rounded-full transition-opacity hover:opacity-80"
            style={pillStyle}
          >
            🚗 ניווט ב-Waze
          </a>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${enc}`}
            target="_blank" rel="noopener noreferrer"
            className="text-xs font-bold px-3.5 py-2 rounded-full transition-opacity hover:opacity-80"
            style={pillStyle}
          >
            📍 Google Maps
          </a>
        </>
      )}
      {calendarUrl && (
        <a
          href={calendarUrl}
          target="_blank" rel="noopener noreferrer"
          className="text-xs font-bold px-3.5 py-2 rounded-full transition-opacity hover:opacity-80"
          style={pillStyle}
        >
          📅 הוסיפו ליומן
        </a>
      )}
    </div>
  )
}

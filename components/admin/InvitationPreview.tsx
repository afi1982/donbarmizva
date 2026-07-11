import { InvitationConfig } from '@/lib/types'
import EventOrnament from '@/components/botanical/EventOrnament'
import CornerBranch from '@/components/botanical/CornerBranch'
import BotanicalDivider from '@/components/botanical/BotanicalDivider'
import { parseCustomMessage } from '@/lib/config-helper'
import { getEventDef } from '@/lib/events'

export default function InvitationPreview({ config, showWreath = true, ornament = 'botanical' }: { config: Partial<InvitationConfig>; showWreath?: boolean; ornament?: string }) {
  const eventDateStr = config.event_date
    ? new Date(config.event_date).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const p = parseCustomMessage(config.custom_message)

  return (
    <div
      className="min-h-[550px] relative flex flex-col items-center justify-center py-6 px-4"
      style={{ background: 'linear-gradient(180deg, var(--inv-bg-from, #f7f5f0) 0%, var(--inv-bg-to, #eee9df) 100%)', borderRadius: '16px' }}
      dir="rtl"
    >
      <div
        className="relative w-full max-w-sm mx-auto rounded-sm shadow-xl overflow-hidden border"
        style={{
          background: 'var(--inv-card-bg, #faf6f0)',
          borderColor: 'color-mix(in srgb, var(--inv-frame, #ebdcb9) 40%, transparent)',
        }}
      >
        {/* Gold stripe top */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, var(--inv-primary, #b8963e), var(--inv-primary-light, #e8c97a), var(--inv-primary, #b8963e))' }} />

        {/* Corner branches */}
        <div className="absolute top-2 left-2 pointer-events-none opacity-50 inv-ornaments">
          <CornerBranch position="top-left" />
        </div>
        <div className="absolute bottom-2 right-2 pointer-events-none opacity-50 inv-ornaments">
          <CornerBranch position="bottom-right" />
        </div>

        <div className="relative z-10 px-8 py-8 text-center">
          {/* בס"ד */}
          <p className="text-xs mb-4" style={{ fontFamily: 'serif', color: 'var(--inv-muted, #a8a29e)' }}>בס&quot;ד</p>

          {showWreath && (
            <div className="flex justify-center mb-5 inv-ornaments">
              <EventOrnament kind={ornament} />
            </div>
          )}

          <p className="text-sm mb-1" style={{ color: 'var(--inv-ink, #5a5347)' }}>
            {p.title1}
          </p>
          <p className="text-sm mb-3" style={{ color: 'var(--inv-ink, #5a5347)' }}>
            {p.title2}
          </p>

          {/* Child name - large elegant gold */}
          <h1
            className="font-black mb-2"
            style={{ fontFamily: 'serif', fontSize: '3rem', lineHeight: 1.1, color: 'var(--inv-primary, #b8963e)', textShadow: '0.5px 0.5px 0px rgba(0,0,0,0.05)' }}
          >
            {config.child_name || getEventDef(config.event_type).celebrantFallback}
          </h1>
          <p className="text-sm mb-1" style={{ color: 'var(--inv-ink, #5a5347)' }}>{p.tagline}</p>

          <BotanicalDivider />

          {/* Event details */}
          <div className="space-y-2 text-sm mb-6" style={{ color: 'var(--inv-ink, #4a4a4a)' }}>
            {config.parasha && (
              <p className="font-bold" style={{ color: 'var(--inv-accent, #2c3e6b)' }}>{config.parasha}</p>
            )}
            {config.hebrew_date && <p>{config.hebrew_date}</p>}
            {eventDateStr && (
              <p className="font-bold text-2xl tracking-wide my-1" style={{ color: 'var(--inv-primary, #b8963e)', fontFamily: 'serif' }}>
                {eventDateStr}
              </p>
            )}
            {config.synagogue_name && (
              <p className="font-bold mt-2" style={{ color: 'var(--inv-ink, #1a1a1a)' }}>
                {config.synagogue_name}
              </p>
            )}
            {(config.address || config.city) && (
              <p>{[config.address, config.city].filter(Boolean).join(', ')}</p>
            )}
            {config.event_time && (
              <p className="mt-2">
                {config.event_time} - {p.prayer_time_label}
                <br />
                <span className="text-xs" style={{ color: 'var(--inv-muted, #7a7a7a)' }}>{p.meal_label}</span>
              </p>
            )}
          </div>

          {p.custom_message && (
            <p className="text-xs italic leading-relaxed mb-4" style={{ color: 'var(--inv-muted, #9a8e7a)' }}>
              {p.custom_message}
            </p>
          )}

          {config.parents_names && (
            <p className="text-xs mt-6" style={{ color: 'var(--inv-muted, #b8a88a)', fontStyle: 'italic' }}>
              נשמח לראותכם,
              <br />
              {config.parents_names}
            </p>
          )}
        </div>
        
        {/* Gold stripe bottom */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, var(--inv-primary, #b8963e), var(--inv-primary-light, #e8c97a), var(--inv-primary, #b8963e))' }} />
      </div>
    </div>
  )
}

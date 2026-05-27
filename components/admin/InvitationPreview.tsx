import { InvitationConfig } from '@/lib/types'
import FloralWreath from '@/components/botanical/FloralWreath'
import CornerBranch from '@/components/botanical/CornerBranch'
import BotanicalDivider from '@/components/botanical/BotanicalDivider'

export default function InvitationPreview({ config }: { config: Partial<InvitationConfig> }) {
  const eventDateStr = config.event_date
    ? new Date(config.event_date).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  return (
    <div
      className="min-h-[500px] relative flex flex-col items-center justify-center py-6 px-4"
      style={{ background: 'linear-gradient(180deg, #f7f5f0 0%, #eee9df 100%)', borderRadius: '16px' }}
      dir="rtl"
    >
      <div className="relative w-full max-w-sm mx-auto bg-[#faf6f0] rounded-sm shadow-xl overflow-hidden border border-[#ebdcb9]/40">
        {/* Gold stripe top */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #b8963e, #e8c97a, #b8963e)' }} />
        
        {/* Corner branches */}
        <div className="absolute top-2 left-2 pointer-events-none opacity-50">
          <CornerBranch position="top-left" />
        </div>
        <div className="absolute bottom-2 right-2 pointer-events-none opacity-50">
          <CornerBranch position="bottom-right" />
        </div>
        
        <div className="relative z-10 px-8 py-8 text-center">
          {/* בס"ד */}
          <p className="text-xs text-stone-400 mb-4" style={{ fontFamily: 'serif' }}>בס&quot;ד</p>
          
          <div className="flex justify-center mb-5">
            <FloralWreath />
          </div>

          <p className="text-sm mb-1" style={{ color: '#5a5347' }}>
            הנכם מוזמנים לטקס העלייה לתורה
          </p>
          <p className="text-sm mb-3" style={{ color: '#5a5347' }}>
            של בננו האהוב
          </p>

          {/* Child name - large elegant gold */}
          <h1
            className="font-black mb-2"
            style={{ fontFamily: 'serif', fontSize: '3rem', lineHeight: 1.1, color: '#b8963e', textShadow: '0.5px 0.5px 0px rgba(0,0,0,0.05)' }}
          >
            {config.child_name || 'בר מצווה'}
          </h1>
          <p className="text-sm mb-1" style={{ color: '#5a5347' }}>חוגג בר מצווה</p>

          <BotanicalDivider />

          {/* Event details */}
          <div className="space-y-2 text-sm mb-6" style={{ color: '#4a4a4a' }}>
            {config.parasha && (
              <p className="font-bold" style={{ color: '#2c3e6b' }}>שיערך אי&quot;ה בשבת {config.parasha}</p>
            )}
            {config.hebrew_date && <p>{config.hebrew_date}</p>}
            {eventDateStr && (
              <p className="font-bold text-2xl tracking-wide my-1" style={{ color: '#b8963e', fontFamily: 'serif' }}>
                {eventDateStr}
              </p>
            )}
            {config.synagogue_name && (
              <p className="font-bold mt-2" style={{ color: '#1a1a1a' }}>
                {config.synagogue_name}
              </p>
            )}
            {(config.address || config.city) && (
              <p>{[config.address, config.city].filter(Boolean).join(', ')}</p>
            )}
            {config.event_time && (
              <p className="mt-2">
                {config.event_time} - תפילת שחרית
                <br />
                <span className="text-xs" style={{ color: '#7a7a7a' }}>קידוש וארוחה לאחר התפילה</span>
              </p>
            )}
          </div>

          {config.custom_message && (
            <p className="text-xs italic leading-relaxed mb-4" style={{ color: '#9a8e7a' }}>
              {config.custom_message}
            </p>
          )}

          {config.parents_names && (
            <p className="text-xs mt-6" style={{ color: '#b8a88a', fontStyle: 'italic' }}>
              נשמח לראותכם,
              <br />
              {config.parents_names}
            </p>
          )}
        </div>
        
        {/* Gold stripe bottom */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #b8963e, #e8c97a, #b8963e)' }} />
      </div>
    </div>
  )
}

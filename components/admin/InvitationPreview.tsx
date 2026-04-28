import { InvitationConfig } from '@/lib/types'
import BotanicalLeaves from '@/components/botanical/BotanicalLeaves'
import BotanicalDivider from '@/components/botanical/BotanicalDivider'

export default function InvitationPreview({ config }: { config: Partial<InvitationConfig> }) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-8 text-center"
      style={{ background: 'linear-gradient(160deg, #faf8f5 0%, #f5f0e8 100%)', minHeight: 400 }}
      dir="rtl">
      <BotanicalLeaves />
      <div className="relative z-10">
        <p className="text-stone-400 text-xs tracking-widest mb-3">נשמח לחגוג עמכם</p>
        <h1 className="font-serif text-5xl font-black text-stone-800 mb-2">{config.child_name || 'שם הילד'}</h1>
        <p className="text-stone-500 text-sm mb-1">חוגג בר מצווה</p>
        <BotanicalDivider />
        <div className="text-stone-600 text-sm leading-8">
          {config.parasha && <p className="font-bold text-stone-800">{config.parasha}</p>}
          {config.hebrew_date && <p>{config.hebrew_date}</p>}
          {config.event_time && <p>שעה {config.event_time}</p>}
          {config.event_date && <p>{new Date(config.event_date).toLocaleDateString('he-IL')}</p>}
          {config.synagogue_name && <p className="font-bold text-stone-800 mt-2">{config.synagogue_name}</p>}
          {(config.address || config.city) && <p>{[config.address, config.city].filter(Boolean).join(', ')}</p>}
        </div>
        {config.parents_names && (
          <>
            <BotanicalDivider />
            <p className="text-stone-500 text-xs">{config.parents_names}</p>
          </>
        )}
      </div>
    </div>
  )
}

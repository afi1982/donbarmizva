import BotanicalLayout from '@/components/botanical/BotanicalLayout'
import BotanicalDivider from '@/components/botanical/BotanicalDivider'

export default function MaybePage() {
  return (
    <BotanicalLayout>
      <div className="text-5xl mb-4">🌿</div>
      <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'serif', color: '#1a1a1a' }}>קיבלנו!</h1>
      <BotanicalDivider />
      <p className="text-sm leading-7" style={{ color: '#5a5347' }}>
        תודה, הבנו שאתם עדיין לא בטוחים.<br />ניצור איתכם קשר בוואטסאפ לאישור סופי 💛
      </p>
      <p className="text-xs mt-4" style={{ color: '#9a8e7a' }}>תזכורת תישלח אליכם בקרוב</p>
    </BotanicalLayout>
  )
}

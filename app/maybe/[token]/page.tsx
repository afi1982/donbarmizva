import BotanicalLayout from '@/components/botanical/BotanicalLayout'
import BotanicalDivider from '@/components/botanical/BotanicalDivider'

export default function MaybePage() {
  return (
    <BotanicalLayout>
      <div className="text-center" dir="rtl">
        <div className="text-5xl mb-4">🌿</div>
        <h1 className="font-serif text-3xl font-black text-stone-800 mb-2">קיבלנו!</h1>
        <BotanicalDivider />
        <p className="text-stone-600 text-sm leading-7">תודה, הבנו שאתם עדיין לא בטוחים.<br />ניצור איתכם קשר בוואטסאפ לאישור סופי 💛</p>
        <p className="text-stone-400 text-xs mt-8">תזכורת תישלח אליכם בקרוב</p>
        <p className="text-stone-400 text-xs mt-4 tracking-widest">✿ ✦ ✿</p>
      </div>
    </BotanicalLayout>
  )
}

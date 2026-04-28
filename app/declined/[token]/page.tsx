import BotanicalLayout from '@/components/botanical/BotanicalLayout'
import BotanicalDivider from '@/components/botanical/BotanicalDivider'

export default function DeclinedPage() {
  return (
    <BotanicalLayout>
      <div className="text-center" dir="rtl">
        <div className="text-5xl mb-4">💙</div>
        <h1 className="font-serif text-3xl font-black text-stone-800 mb-2">תודה על הידיעה</h1>
        <BotanicalDivider />
        <p className="text-stone-600 text-sm leading-7">חבל שלא תוכלו להגיע.<br />נשמח לחגוג איתכם בהזדמנויות אחרות 💛</p>
        <p className="text-stone-400 text-xs mt-8 tracking-widest">✿ ✦ ✿</p>
      </div>
    </BotanicalLayout>
  )
}

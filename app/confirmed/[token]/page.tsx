import BotanicalLayout from '@/components/botanical/BotanicalLayout'
import BotanicalDivider from '@/components/botanical/BotanicalDivider'

export default function ConfirmedPage() {
  return (
    <BotanicalLayout>
      <div className="text-5xl mb-4">🎉</div>
      <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'serif', color: '#1a1a1a' }}>תודה על האישור!</h1>
      <BotanicalDivider />
      <p className="text-sm leading-7" style={{ color: '#5a5347' }}>
        שמחים שתוכלו להגיע!<br />נשמח לראותכם בשמחת בר המצווה של דון 💛
      </p>
    </BotanicalLayout>
  )
}

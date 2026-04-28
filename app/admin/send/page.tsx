import { supabaseAdmin } from '@/lib/supabase'
import { Guest } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function SendPage() {
  const { data: guests = [] } = await supabaseAdmin
    .from('guests').select('*').order('created_at', { ascending: true })

  const pending = (guests as Guest[]).filter(g => g.status === 'pending')
  const maybe   = (guests as Guest[]).filter(g => g.status === 'maybe' && !g.reminder_sent)

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-bold text-stone-800 mb-2">שליחת הזמנות</h1>
      <p className="text-stone-500 text-sm mb-8">הסקריפט רץ על המחשב שלך ושולח הודעות ישירות מהוואטסאפ שלך</p>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
        <h2 className="font-bold text-stone-800 mb-4">⚙️ הגדרה ראשונה (פעם אחת בלבד)</h2>
        <ol className="space-y-2 text-sm text-stone-600 list-decimal list-inside">
          <li>ודא ש-<strong>Node.js</strong> מותקן על המחשב</li>
          <li>פתח Command Prompt בתיקיית <code className="bg-stone-100 px-1 rounded">scripts/</code></li>
          <li>הרץ: <code className="bg-stone-100 px-1 rounded">npm install</code></li>
          <li>ערוך את <code className="bg-stone-100 px-1 rounded">scripts/.env</code> עם מפתחות Supabase</li>
        </ol>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="font-bold text-stone-800">📤 שלח הזמנות ראשוניות</h2>
            <p className="text-stone-400 text-xs mt-1">{pending.length} מוזמנים ממתינים לשליחה</p>
          </div>
        </div>
        <div className="bg-stone-900 text-green-400 rounded-xl p-4 font-mono text-sm mb-3" dir="ltr">
          cd scripts<br />node send-whatsapp.js
        </div>
        <p className="text-stone-500 text-xs">✓ סרוק QR עם הוואטסאפ שלך · ✓ שולח לכל {pending.length} הממתינים</p>
      </div>

      <div className="bg-white rounded-2xl border border-amber-100 p-6">
        <div className="mb-3">
          <h2 className="font-bold text-stone-800">🔔 שלח תזכורת ל&quot;לא בטוח&quot;</h2>
          <p className="text-stone-400 text-xs mt-1">{maybe.length} מוזמנים שטרם אישרו</p>
        </div>
        <div className="bg-stone-900 text-green-400 rounded-xl p-4 font-mono text-sm mb-3" dir="ltr">
          cd scripts<br />node send-whatsapp.js --mode reminder
        </div>
        <p className="text-stone-500 text-xs">✓ שולח רק למי שבחר &quot;לא בטוח&quot; ועדיין לא קיבל תזכורת</p>
      </div>
    </div>
  )
}

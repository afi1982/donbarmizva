import { supabaseAdmin } from '@/lib/supabase'
import StatsCards from '@/components/admin/StatsCards'
import GuestTable from '@/components/admin/GuestTable'
import { Guest } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const missingVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ADMIN_PASSWORD',
  ].filter(k => !process.env[k])

  if (missingVars.length > 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h1 className="text-lg font-bold text-amber-800 mb-2">⚠️ הגדרות חסרות</h1>
        <p className="text-amber-700 text-sm mb-3">הוסף את משתני הסביבה הבאים ב-Vercel → Settings → Environment Variables:</p>
        <ul className="space-y-1">
          {missingVars.map(v => (
            <li key={v} className="font-mono text-sm bg-amber-100 px-3 py-1 rounded text-amber-900">{v}</li>
          ))}
        </ul>
        <p className="text-amber-600 text-xs mt-3">לאחר ההוספה לחץ Redeploy ב-Vercel.</p>
      </div>
    )
  }

  let guests: Guest[] = []
  try {
    const { data } = await supabaseAdmin
      .from('guests')
      .select('*')
      .order('created_at', { ascending: true })
    guests = (data as Guest[]) ?? []
  } catch {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <h1 className="text-lg font-bold text-red-800 mb-2">❌ שגיאת חיבור ל-Supabase</h1>
        <p className="text-red-600 text-sm">בדוק שמפתחות Supabase נכונים ב-Vercel → Settings → Environment Variables.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800 mb-6">דשבורד</h1>
      <StatsCards guests={guests} />
      <div className="bg-white rounded-2xl border border-stone-200 p-4">
        <h2 className="font-bold text-stone-700 mb-4">כל המוזמנים</h2>
        <GuestTable guests={guests} />
      </div>
    </div>
  )
}

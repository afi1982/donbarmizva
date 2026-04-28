import { supabaseAdmin } from '@/lib/supabase'
import StatsCards from '@/components/admin/StatsCards'
import GuestTable from '@/components/admin/GuestTable'
import { Guest } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const { data: guests = [] } = await supabaseAdmin
    .from('guests')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800 mb-6">דשבורד</h1>
      <StatsCards guests={guests as Guest[]} />
      <div className="bg-white rounded-2xl border border-stone-200 p-4">
        <h2 className="font-bold text-stone-700 mb-4">כל המוזמנים</h2>
        <GuestTable guests={guests as Guest[]} />
      </div>
    </div>
  )
}

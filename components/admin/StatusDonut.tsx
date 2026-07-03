export default function StatusDonut({ coming, notComing, maybe, total }: {
  coming: number; notComing: number; maybe: number; total: number
}) {
  if (total === 0) return (
    <div className="flex items-center justify-center h-32 text-slate-500 text-sm">אין תגובות עדיין</div>
  )
  const r = 54
  const circ = 2 * Math.PI * r
  const pctComing = coming / total
  const pctNot = notComing / total
  const pctMaybe = maybe / total
  const dComing = pctComing * circ
  const dNot = pctNot * circ
  const dMaybe = pctMaybe * circ
  const offComing = circ * 0.25
  const offNot = offComing - dComing
  const offMaybe = offNot - dNot
  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 140 140" className="w-36 h-36">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#1e293b" strokeWidth="22" />
        {coming > 0 && <circle cx="70" cy="70" r={r} fill="none" stroke="#34d399" strokeWidth="22"
          strokeDasharray={`${dComing} ${circ}`} strokeDashoffset={offComing} />}
        {notComing > 0 && <circle cx="70" cy="70" r={r} fill="none" stroke="#f87171" strokeWidth="22"
          strokeDasharray={`${dNot} ${circ}`} strokeDashoffset={offNot} />}
        {maybe > 0 && <circle cx="70" cy="70" r={r} fill="none" stroke="#fbbf24" strokeWidth="22"
          strokeDasharray={`${dMaybe} ${circ}`} strokeDashoffset={offMaybe} />}
        <text x="70" y="67" textAnchor="middle" className="text-2xl" fontSize="22" fontWeight="bold" fill="#f1f5f9">{total}</text>
        <text x="70" y="82" textAnchor="middle" fontSize="10" fill="#94a3b8">מוזמנים</text>
      </svg>
      <div className="flex gap-4 text-xs" dir="rtl">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />מגיעים {coming}</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />לא מגיעים {notComing}</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />לא בטוח {maybe}</span>
      </div>
    </div>
  )
}

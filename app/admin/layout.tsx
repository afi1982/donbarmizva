import AdminNav from '@/components/admin/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 [color-scheme:dark]" dir="rtl">
      {/* Contextual ambient glow — the event's gold, not a generic ornament */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-64 opacity-60"
        style={{ background: 'radial-gradient(60% 100% at 50% 0%, rgba(232,201,122,0.07), transparent 70%)' }}
      />

      <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50">
        {/* Gold brand stripe — the invitation's signature motif */}
        <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, transparent, #b8963e, #e8c97a, #b8963e, transparent)' }} />
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="font-bold text-sm whitespace-nowrap flex items-center gap-1.5">
            <span style={{ color: '#e8c97a' }}>✨</span>
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, #e8c97a, #f5e3b3, #e8c97a)' }} dir="ltr">
              SendAI
            </span>
          </div>
          <AdminNav />
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

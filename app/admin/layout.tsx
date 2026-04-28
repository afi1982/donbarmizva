import Link from 'next/link'

const NAV = [
  { href: '/admin', label: '📊 דשבורד' },
  { href: '/admin/guests', label: '👥 מוזמנים' },
  { href: '/admin/invitation', label: '🎨 הזמנה' },
  { href: '/admin/send', label: '📤 שליחה' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50" dir="rtl">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-6">
          <div className="font-bold text-stone-800 text-sm whitespace-nowrap">✡ בר מצווה | דון</div>
          <nav className="flex gap-1 overflow-x-auto">
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href} className="text-xs px-3 py-2 rounded-lg text-stone-600 hover:bg-stone-100 whitespace-nowrap transition-colors">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin', label: '📊 דשבורד' },
  { href: '/admin/guests', label: '👥 מוזמנים' },
  { href: '/admin/invitation', label: '📝 הזמנה' },
  { href: '/admin/design', label: '🎨 סטודיו עיצוב' },
  { href: '/admin/send', label: '📤 שליחה' },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-wrap gap-1" aria-label="ניווט ראשי">
      {NAV.map(({ href, label }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`text-xs px-3 py-2 rounded-lg whitespace-nowrap transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              active
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25 font-bold shadow-[0_0_12px_rgba(232,201,122,0.08)]'
                : 'text-slate-400 border border-transparent hover:text-slate-100 hover:bg-slate-800/70'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

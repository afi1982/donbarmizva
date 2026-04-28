import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'בר מצווה | דון בר אל',
  description: 'הזמנה לבר המצווה של דון בר אל',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased">{children}</body>
    </html>
  )
}

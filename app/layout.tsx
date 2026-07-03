import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SendAI — הזמנות ואישורי הגעה חכמים',
  description: 'מערכת חכמה ליצירת הזמנות דיגיטליות, שליחה בווטסאפ וניהול אישורי הגעה לכל סוגי האירועים',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300;400;700;900&family=Heebo:wght@300;400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}

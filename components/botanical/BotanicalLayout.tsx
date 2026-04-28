import BotanicalLeaves from './BotanicalLeaves'

interface BotanicalLayoutProps {
  children: React.ReactNode
  className?: string
}

export default function BotanicalLayout({ children, className = '' }: BotanicalLayoutProps) {
  return (
    <div
      className={`min-h-screen relative overflow-hidden flex flex-col items-center justify-center ${className}`}
      style={{ background: 'linear-gradient(160deg, #faf8f5 0%, #f5f0e8 100%)' }}
      dir="rtl"
    >
      <BotanicalLeaves />
      <div className="relative z-10 w-full max-w-sm mx-auto px-6 py-10">
        {children}
      </div>
    </div>
  )
}

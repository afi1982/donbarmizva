import FloralWreath from './FloralWreath'
import SideBranch from './SideBranch'

interface BotanicalLayoutProps {
  children: React.ReactNode
  className?: string
  showWreath?: boolean
}

export default function BotanicalLayout({ children, className = '', showWreath = true }: BotanicalLayoutProps) {
  return (
    <div
      className={`min-h-screen relative flex flex-col items-center justify-center py-8 px-4 ${className}`}
      style={{ background: 'linear-gradient(180deg, #f7f5f0 0%, #eee9df 100%)' }}
      dir="rtl"
    >
      <div className="relative w-full max-w-sm mx-auto bg-white rounded-sm shadow-lg overflow-hidden">
        {/* Gold stripe top */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #b8963e, #e8c97a, #b8963e)' }} />
        
        {/* Side branches */}
        <div className="absolute top-16 left-3 pointer-events-none opacity-40">
          <SideBranch side="left" />
        </div>
        <div className="absolute top-16 right-3 pointer-events-none opacity-40">
          <SideBranch side="right" />
        </div>
        
        <div className="relative z-10 px-8 py-8 text-center">
          {/* בס"ד */}
          <p className="text-xs text-stone-400 mb-4" style={{ fontFamily: 'serif' }}>בס&quot;ד</p>
          
          {showWreath && (
            <div className="flex justify-center mb-5">
              <FloralWreath />
            </div>
          )}
          
          {children}
        </div>
        
        {/* Gold stripe bottom */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #b8963e, #e8c97a, #b8963e)' }} />
      </div>
    </div>
  )
}

import FloralWreath from './FloralWreath'
import CornerBranch from './CornerBranch'

interface BotanicalLayoutProps {
  children: React.ReactNode
  className?: string
  showWreath?: boolean
  isScreenshot?: boolean
}

export default function BotanicalLayout({ children, className = '', showWreath = true, isScreenshot = false }: BotanicalLayoutProps) {
  const bgStyle = isScreenshot 
    ? { background: '#faf6f0' } 
    : { background: 'linear-gradient(180deg, #f7f5f0 0%, #eee9df 100%)' }

  return (
    <div
      className={`min-h-screen relative flex flex-col items-center justify-center py-8 px-4 ${className}`}
      style={bgStyle}
      dir="rtl"
    >
      <div 
        id="invitation-card" 
        className={`relative w-full ${isScreenshot ? 'max-w-[460px]' : 'max-w-sm'} mx-auto bg-[#faf6f0] rounded-sm overflow-hidden ${
          isScreenshot ? 'border border-[#ebdcb9]/20' : 'shadow-xl border border-[#ebdcb9]/40'
        }`}
      >
        {/* Gold stripe top */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #b8963e, #e8c97a, #b8963e)' }} />
        
        {/* Corner branches */}
        <div className="absolute top-2 left-2 pointer-events-none opacity-50">
          <CornerBranch position="top-left" />
        </div>
        <div className="absolute bottom-2 right-2 pointer-events-none opacity-50">
          <CornerBranch position="bottom-right" />
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

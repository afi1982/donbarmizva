import type { CSSProperties } from 'react'
import FloralWreath from './FloralWreath'
import CornerBranch from './CornerBranch'
import { DesignSpec, specToCssVars } from '@/lib/design/spec'

interface BotanicalLayoutProps {
  children: React.ReactNode
  className?: string
  showWreath?: boolean
  isScreenshot?: boolean
  design?: DesignSpec | null
}

export default function BotanicalLayout({ children, className = '', showWreath = true, isScreenshot = false, design = null }: BotanicalLayoutProps) {
  const vars = (design ? specToCssVars(design) : {}) as CSSProperties

  const bgStyle: CSSProperties = isScreenshot
    ? { background: 'var(--inv-card-bg, #faf6f0)' }
    : { background: 'linear-gradient(180deg, var(--inv-bg-from, #f7f5f0) 0%, var(--inv-bg-to, #eee9df) 100%)' }

  const goldStripe = 'linear-gradient(90deg, var(--inv-primary, #b8963e), var(--inv-primary-light, #e8c97a), var(--inv-primary, #b8963e))'
  const wreathVisible = design ? design.wreath : showWreath

  return (
    <div
      className={`min-h-screen relative flex flex-col items-center justify-center py-8 px-4 ${className}`}
      style={{ ...vars, ...bgStyle }}
      dir="rtl"
    >
      <div
        id="invitation-card"
        className={`relative w-full ${isScreenshot ? 'max-w-[460px]' : 'max-w-sm'} mx-auto rounded-sm overflow-hidden border ${
          isScreenshot ? '' : 'shadow-xl'
        }`}
        style={{
          background: 'var(--inv-card-bg, #faf6f0)',
          borderColor: isScreenshot ? 'color-mix(in srgb, var(--inv-frame, #ebdcb9) 20%, transparent)' : 'color-mix(in srgb, var(--inv-frame, #ebdcb9) 40%, transparent)',
        }}
      >
        {/* Gold stripe top */}
        <div className="h-1.5 w-full" style={{ background: goldStripe }} />

        {/* Corner branches */}
        <div className="absolute top-2 left-2 pointer-events-none opacity-50 inv-ornaments">
          <CornerBranch position="top-left" />
        </div>
        <div className="absolute bottom-2 right-2 pointer-events-none opacity-50 inv-ornaments">
          <CornerBranch position="bottom-right" />
        </div>

        <div className="relative z-10 px-8 py-8 text-center">
          {/* בס"ד */}
          <p className="text-xs mb-4" style={{ fontFamily: 'serif', color: 'var(--inv-muted, #a8a29e)' }}>בס&quot;ד</p>

          {wreathVisible && (
            <div className="flex justify-center mb-5 inv-ornaments">
              <FloralWreath />
            </div>
          )}

          {children}
        </div>

        {/* Gold stripe bottom */}
        <div className="h-1.5 w-full" style={{ background: goldStripe }} />
      </div>
    </div>
  )
}

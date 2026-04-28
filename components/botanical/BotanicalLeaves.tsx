export default function BotanicalLeaves() {
  return (
    <>
      {/* Top-left cluster */}
      <div className="absolute top-0 left-0 pointer-events-none select-none" aria-hidden>
        <svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Large leaf 1 */}
          <path d="M10 180 Q-10 80 80 10 Q60 100 10 180Z" fill="#5a8a4a" opacity="0.55" />
          <path d="M10 180 Q40 120 80 10" stroke="#4a7a3a" strokeWidth="1.2" opacity="0.4" fill="none"/>
          {/* Large leaf 2 */}
          <path d="M5 140 Q-20 60 100 20 Q70 90 5 140Z" fill="#6fa058" opacity="0.45" />
          <path d="M5 140 Q50 90 100 20" stroke="#4a7a3a" strokeWidth="1" opacity="0.35" fill="none"/>
          {/* Medium leaf 3 */}
          <path d="M30 200 Q-5 130 90 60 Q75 130 30 200Z" fill="#4d7a3d" opacity="0.50" />
          {/* Thin accent leaf */}
          <path d="M60 210 Q20 160 110 80 Q95 145 60 210Z" fill="#7ab86a" opacity="0.38" />
          {/* Small top leaf */}
          <path d="M90 15 Q130 -10 160 30 Q120 40 90 15Z" fill="#5a8a4a" opacity="0.42" />
          {/* Berries */}
          <circle cx="78" cy="62" r="5" fill="#c8a060" opacity="0.75" />
          <circle cx="92" cy="52" r="3.5" fill="#d4ac72" opacity="0.65" />
          <circle cx="68" cy="78" r="4" fill="#b89050" opacity="0.60" />
          {/* Stem lines */}
          <path d="M40 195 Q60 140 78 62" stroke="#4a7a3a" strokeWidth="1.2" opacity="0.35" fill="none" strokeLinecap="round"/>
          <path d="M78 62 Q110 30 155 28" stroke="#4a7a3a" strokeWidth="0.9" opacity="0.30" fill="none" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Bottom-right cluster */}
      <div className="absolute bottom-0 right-0 pointer-events-none select-none" aria-hidden>
        <svg width="200" height="200" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(180deg)' }}>
          <path d="M10 180 Q-10 80 80 10 Q60 100 10 180Z" fill="#5a8a4a" opacity="0.48" />
          <path d="M5 140 Q-20 60 100 20 Q70 90 5 140Z" fill="#6fa058" opacity="0.40" />
          <path d="M30 200 Q-5 130 90 60 Q75 130 30 200Z" fill="#4d7a3d" opacity="0.44" />
          <path d="M60 210 Q20 160 110 80 Q95 145 60 210Z" fill="#7ab86a" opacity="0.33" />
          <circle cx="78" cy="62" r="5" fill="#c8a060" opacity="0.65" />
          <circle cx="92" cy="52" r="3.5" fill="#d4ac72" opacity="0.55" />
          <circle cx="68" cy="78" r="4" fill="#b89050" opacity="0.50" />
          <path d="M40 195 Q60 140 78 62" stroke="#4a7a3a" strokeWidth="1.2" opacity="0.30" fill="none" strokeLinecap="round"/>
        </svg>
      </div>
    </>
  )
}

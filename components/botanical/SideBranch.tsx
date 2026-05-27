interface SideBranchProps {
  side: 'left' | 'right'
}

export default function SideBranch({ side }: SideBranchProps) {
  const flip = side === 'left'

  return (
    <svg
      width="28"
      height="260"
      viewBox="0 0 28 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: flip ? 'scaleX(-1)' : undefined }}
      aria-hidden="true"
    >
      {/* Main vertical stem */}
      <path
        d="M14 8 C14 30, 15 50, 14 70 C13 90, 15 110, 14 130 C13 150, 15 170, 14 190 C13 210, 14 230, 14 252"
        stroke="#3a4f7a"
        strokeWidth="0.9"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />

      {/* Leaf pair 1 (top) */}
      <path d="M14 20 C18 14, 24 16, 22 22 C20 26, 16 24, 14 20Z" fill="#3a4f7a" opacity="0.18" />
      <path d="M15 20 C18 16, 22 17, 21 22" stroke="#3a4f7a" strokeWidth="0.5" fill="none" opacity="0.4" />
      <path d="M14 24 C10 18, 4 20, 6 26 C8 30, 12 28, 14 24Z" fill="#3a4f7a" opacity="0.15" />
      <path d="M13 24 C10 20, 6 21, 7 26" stroke="#3a4f7a" strokeWidth="0.5" fill="none" opacity="0.35" />

      {/* Small bud */}
      <circle cx="20" cy="36" r="1.5" fill="#3a4f7a" opacity="0.15" />
      <circle cx="20" cy="36" r="0.7" fill="#3a4f7a" opacity="0.3" />

      {/* Leaf pair 2 */}
      <path d="M14 48 C19 42, 26 44, 24 50 C22 56, 17 54, 14 48Z" fill="#3a4f7a" opacity="0.2" />
      <path d="M15 48 C19 44, 24 45, 23 50" stroke="#3a4f7a" strokeWidth="0.5" fill="none" opacity="0.4" />
      <path d="M14 52 C9 46, 2 48, 4 54 C6 60, 11 58, 14 52Z" fill="#3a4f7a" opacity="0.15" />
      <path d="M13 52 C9 48, 4 49, 5 54" stroke="#3a4f7a" strokeWidth="0.5" fill="none" opacity="0.35" />

      {/* Tiny flower */}
      <circle cx="8" cy="68" r="2" fill="none" stroke="#3a4f7a" strokeWidth="0.6" opacity="0.25" />
      <circle cx="8" cy="68" r="0.8" fill="#3a4f7a" opacity="0.2" />

      {/* Leaf pair 3 */}
      <path d="M14 80 C20 74, 26 78, 23 84 C20 90, 16 86, 14 80Z" fill="#3a4f7a" opacity="0.18" />
      <path d="M15 80 C19 76, 24 78, 22 84" stroke="#3a4f7a" strokeWidth="0.5" fill="none" opacity="0.4" />
      <path d="M14 86 C8 80, 2 84, 5 90 C8 96, 12 92, 14 86Z" fill="#3a4f7a" opacity="0.15" />
      <path d="M13 86 C9 82, 4 84, 6 90" stroke="#3a4f7a" strokeWidth="0.5" fill="none" opacity="0.35" />

      {/* Small bud */}
      <circle cx="22" cy="100" r="1.5" fill="#3a4f7a" opacity="0.12" />
      <circle cx="22" cy="100" r="0.7" fill="#3a4f7a" opacity="0.25" />

      {/* Leaf pair 4 */}
      <path d="M14 112 C18 106, 24 108, 22 114 C20 120, 16 118, 14 112Z" fill="#3a4f7a" opacity="0.2" />
      <path d="M15 112 C18 108, 22 109, 21 114" stroke="#3a4f7a" strokeWidth="0.5" fill="none" opacity="0.4" />
      <path d="M14 118 C10 112, 4 114, 6 120 C8 124, 12 122, 14 118Z" fill="#3a4f7a" opacity="0.15" />

      {/* Tiny flower */}
      <circle cx="22" cy="134" r="2" fill="none" stroke="#3a4f7a" strokeWidth="0.6" opacity="0.25" />
      <circle cx="22" cy="134" r="0.8" fill="#3a4f7a" opacity="0.2" />

      {/* Leaf pair 5 */}
      <path d="M14 146 C20 140, 26 144, 23 150 C20 156, 16 152, 14 146Z" fill="#3a4f7a" opacity="0.18" />
      <path d="M15 146 C19 142, 24 144, 22 150" stroke="#3a4f7a" strokeWidth="0.5" fill="none" opacity="0.38" />
      <path d="M14 152 C8 146, 2 150, 5 156 C8 162, 12 158, 14 152Z" fill="#3a4f7a" opacity="0.15" />

      {/* Small bud */}
      <circle cx="6" cy="168" r="1.5" fill="#3a4f7a" opacity="0.12" />
      <circle cx="6" cy="168" r="0.7" fill="#3a4f7a" opacity="0.25" />

      {/* Leaf pair 6 */}
      <path d="M14 178 C18 172, 24 174, 22 180 C20 186, 16 184, 14 178Z" fill="#3a4f7a" opacity="0.18" />
      <path d="M15 178 C18 174, 22 175, 21 180" stroke="#3a4f7a" strokeWidth="0.5" fill="none" opacity="0.35" />
      <path d="M14 184 C10 178, 4 180, 6 186 C8 190, 12 188, 14 184Z" fill="#3a4f7a" opacity="0.15" />

      {/* Tiny flower */}
      <circle cx="8" cy="198" r="2" fill="none" stroke="#3a4f7a" strokeWidth="0.6" opacity="0.22" />
      <circle cx="8" cy="198" r="0.8" fill="#3a4f7a" opacity="0.18" />

      {/* Leaf pair 7 */}
      <path d="M14 210 C20 204, 26 208, 23 214 C20 220, 16 216, 14 210Z" fill="#3a4f7a" opacity="0.16" />
      <path d="M15 210 C19 206, 24 208, 22 214" stroke="#3a4f7a" strokeWidth="0.5" fill="none" opacity="0.35" />
      <path d="M14 218 C8 212, 2 216, 5 222 C8 226, 12 224, 14 218Z" fill="#3a4f7a" opacity="0.13" />

      {/* Bottom leaves (fading out) */}
      <path d="M14 236 C18 232, 22 234, 20 238 C18 242, 15 240, 14 236Z" fill="#3a4f7a" opacity="0.12" />
      <path d="M14 244 C10 240, 6 242, 8 246 C10 250, 13 248, 14 244Z" fill="#3a4f7a" opacity="0.1" />

      {/* Secondary thin branch lines */}
      <path d="M14 30 C18 28, 20 32, 16 34" stroke="#3a4f7a" strokeWidth="0.4" fill="none" opacity="0.25" />
      <path d="M14 62 C10 60, 8 64, 12 66" stroke="#3a4f7a" strokeWidth="0.4" fill="none" opacity="0.25" />
      <path d="M14 94 C18 92, 20 96, 16 98" stroke="#3a4f7a" strokeWidth="0.4" fill="none" opacity="0.25" />
      <path d="M14 126 C10 124, 8 128, 12 130" stroke="#3a4f7a" strokeWidth="0.4" fill="none" opacity="0.25" />
      <path d="M14 160 C18 158, 20 162, 16 164" stroke="#3a4f7a" strokeWidth="0.4" fill="none" opacity="0.25" />
      <path d="M14 192 C10 190, 8 194, 12 196" stroke="#3a4f7a" strokeWidth="0.4" fill="none" opacity="0.22" />
      <path d="M14 228 C18 226, 20 230, 16 232" stroke="#3a4f7a" strokeWidth="0.4" fill="none" opacity="0.2" />
    </svg>
  )
}

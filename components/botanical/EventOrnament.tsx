import FloralWreath from './FloralWreath'

export type OrnamentKind = 'botanical' | 'rings' | 'hearts' | 'balloons' | 'none'

export const ORNAMENTS: { kind: OrnamentKind; label: string; emoji: string }[] = [
  { kind: 'botanical', label: 'זר בוטני', emoji: '🌿' },
  { kind: 'rings',     label: 'טבעות',    emoji: '💍' },
  { kind: 'hearts',    label: 'לבבות',    emoji: '💗' },
  { kind: 'balloons',  label: 'בלונים',   emoji: '🎈' },
  { kind: 'none',      label: 'ללא',      emoji: '⬜' },
]

const gold = 'var(--inv-primary, #b8963e)'
const goldLight = 'var(--inv-primary-light, #e8c97a)'
const accent = 'var(--inv-accent, #2c3e6b)'
const leaf = 'var(--inv-leaf, #3a4f7a)'

function Rings() {
  return (
    <svg width="180" height="130" viewBox="0 0 180 130" fill="none" aria-hidden="true">
      {/* Interlocking wedding rings */}
      <circle cx="72" cy="72" r="38" style={{ stroke: gold }} strokeWidth="3.5" />
      <circle cx="72" cy="72" r="33.5" style={{ stroke: goldLight }} strokeWidth="1" opacity="0.7" />
      <circle cx="108" cy="72" r="38" style={{ stroke: gold }} strokeWidth="3.5" />
      <circle cx="108" cy="72" r="33.5" style={{ stroke: goldLight }} strokeWidth="1" opacity="0.7" />
      {/* Diamond on the left ring */}
      <path d="M72 28 L79 36 L72 44 L65 36 Z" style={{ fill: goldLight, stroke: gold }} strokeWidth="1.2" />
      <path d="M67 36 L77 36" style={{ stroke: gold }} strokeWidth="0.8" opacity="0.7" />
      {/* Sparkles */}
      <path d="M28 30 L30 36 L36 38 L30 40 L28 46 L26 40 L20 38 L26 36 Z" style={{ fill: goldLight }} opacity="0.9" />
      <path d="M152 22 L153.5 26.5 L158 28 L153.5 29.5 L152 34 L150.5 29.5 L146 28 L150.5 26.5 Z" style={{ fill: goldLight }} opacity="0.75" />
      <circle cx="150" cy="52" r="2" style={{ fill: gold }} opacity="0.5" />
      <circle cx="36" cy="58" r="1.6" style={{ fill: gold }} opacity="0.4" />
      {/* Tiny leaves under the rings */}
      <path d="M56 114 C66 108, 78 106, 90 108 C102 106, 114 108, 124 114" style={{ stroke: leaf }} strokeWidth="1.1" opacity="0.5" fill="none" />
      <path d="M66 110 C68 106, 72 106, 73 109 C71 112, 67 112, 66 110 Z" style={{ fill: leaf }} opacity="0.3" />
      <path d="M108 109 C110 105, 114 105, 115 108 C113 111, 109 111, 108 109 Z" style={{ fill: leaf }} opacity="0.3" />
    </svg>
  )
}

function Hearts() {
  return (
    <svg width="180" height="130" viewBox="0 0 180 130" fill="none" aria-hidden="true">
      {/* Main heart */}
      <path
        d="M90 108 C60 84, 42 66, 42 46 C42 30, 54 22, 66 22 C76 22, 85 28, 90 38 C95 28, 104 22, 114 22 C126 22, 138 30, 138 46 C138 66, 120 84, 90 108 Z"
        style={{ stroke: gold }} strokeWidth="3" fill="none"
      />
      <path
        d="M90 96 C67 77, 53 62, 53 47 C53 36, 61 30, 69 30 C77 30, 85 36, 90 45 C95 36, 103 30, 111 30 C119 30, 127 36, 127 47 C127 62, 113 77, 90 96 Z"
        style={{ fill: goldLight }} opacity="0.18"
      />
      {/* Small companion hearts */}
      <path d="M34 78 C27 72, 23 67, 23 62 C23 58, 26 56, 29 56 C31 56, 33 57.5, 34 60 C35 57.5, 37 56, 39 56 C42 56, 45 58, 45 62 C45 67, 41 72, 34 78 Z" style={{ fill: accent }} opacity="0.35" />
      <path d="M148 66 C143 62, 140 58, 140 55 C140 52, 142 50.5, 144 50.5 C145.5 50.5, 147 51.5, 148 53 C149 51.5, 150.5 50.5, 152 50.5 C154 50.5, 156 52, 156 55 C156 58, 153 62, 148 66 Z" style={{ fill: gold }} opacity="0.4" />
      {/* Sparkles */}
      <path d="M152 26 L153.5 30.5 L158 32 L153.5 33.5 L152 38 L150.5 33.5 L146 32 L150.5 30.5 Z" style={{ fill: goldLight }} opacity="0.8" />
      <circle cx="30" cy="36" r="2" style={{ fill: goldLight }} opacity="0.6" />
    </svg>
  )
}

function Balloons() {
  return (
    <svg width="180" height="140" viewBox="0 0 180 140" fill="none" aria-hidden="true">
      {/* Balloon 1 — center, primary */}
      <ellipse cx="90" cy="46" rx="24" ry="30" style={{ fill: gold }} opacity="0.85" />
      <ellipse cx="82" cy="36" rx="7" ry="10" fill="#ffffff" opacity="0.25" />
      <path d="M90 76 L86 82 L94 82 Z" style={{ fill: gold }} opacity="0.85" />
      <path d="M90 82 C92 96, 86 106, 90 122" style={{ stroke: gold }} strokeWidth="1.2" fill="none" opacity="0.6" />
      {/* Balloon 2 — left, accent */}
      <ellipse cx="48" cy="58" rx="18" ry="23" style={{ fill: accent }} opacity="0.75" />
      <ellipse cx="42" cy="50" rx="5" ry="7" fill="#ffffff" opacity="0.25" />
      <path d="M48 81 L45 86 L51 86 Z" style={{ fill: accent }} opacity="0.75" />
      <path d="M48 86 C50 98, 46 108, 49 120" style={{ stroke: accent }} strokeWidth="1.1" fill="none" opacity="0.5" />
      {/* Balloon 3 — right, leaf */}
      <ellipse cx="132" cy="54" rx="19" ry="24" style={{ fill: leaf }} opacity="0.7" />
      <ellipse cx="126" cy="45" rx="5" ry="7" fill="#ffffff" opacity="0.25" />
      <path d="M132 78 L129 83 L135 83 Z" style={{ fill: leaf }} opacity="0.7" />
      <path d="M132 83 C130 96, 136 106, 132 120" style={{ stroke: leaf }} strokeWidth="1.1" fill="none" opacity="0.5" />
      {/* Confetti */}
      <circle cx="26" cy="26" r="2.5" style={{ fill: goldLight }} opacity="0.8" />
      <rect x="150" y="20" width="5" height="5" rx="1" style={{ fill: goldLight }} opacity="0.7" transform="rotate(25 152 22)" />
      <circle cx="164" cy="94" r="2" style={{ fill: gold }} opacity="0.5" />
      <rect x="16" y="88" width="4" height="4" rx="1" style={{ fill: accent }} opacity="0.4" transform="rotate(-20 18 90)" />
    </svg>
  )
}

export default function EventOrnament({ kind }: { kind?: string | null }) {
  switch (kind) {
    case 'rings':    return <Rings />
    case 'hearts':   return <Hearts />
    case 'balloons': return <Balloons />
    case 'none':     return null
    case 'botanical':
    default:         return <FloralWreath />
  }
}

interface CornerBranchProps {
  position: 'top-left' | 'bottom-right'
}

export default function CornerBranch({ position }: CornerBranchProps) {
  const rotate = position === 'bottom-right' ? 'rotate(180deg)' : 'none'

  return (
    <svg
      width="70"
      height="70"
      viewBox="0 0 70 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: rotate }}
      aria-hidden="true"
    >
      {/* Corner lines forming a border */}
      <path
        d="M2 30 L2 2 C2 2, 30 2, 30 2"
        stroke="#3a4f7a"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Main curving stem of the branch */}
      <path
        d="M2 2 C18 10, 32 25, 45 42 M2 2 C10 18, 25 32, 42 45"
        stroke="#3a4f7a"
        strokeWidth="0.9"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />

      {/* Leaves along the upper path */}
      <path d="M12 7 C14 4, 18 6, 16 10 C14 13, 10 11, 12 7Z" fill="#3a4f7a" opacity="0.2" />
      <path d="M13 7 C14 5, 17 6, 15 9" stroke="#3a4f7a" strokeWidth="0.5" fill="none" opacity="0.45" />

      <path d="M22 14 C25 11, 28 14, 26 18 C24 21, 20 18, 22 14Z" fill="#3a4f7a" opacity="0.22" />
      <path d="M23 14 C25 12, 27 14, 25 17" stroke="#3a4f7a" strokeWidth="0.5" fill="none" opacity="0.45" />

      <path d="M32 24 C36 21, 38 25, 35 28 C32 31, 29 28, 32 24Z" fill="#3a4f7a" opacity="0.18" />

      {/* Leaves along the lower path */}
      <path d="M7 12 C4 14, 6 18, 10 16 C13 14, 11 10, 7 12Z" fill="#3a4f7a" opacity="0.2" />
      <path d="M7 13 C5 14, 6 17, 9 15" stroke="#3a4f7a" strokeWidth="0.5" fill="none" opacity="0.45" />

      <path d="M14 22 C11 25, 14 28, 18 26 C21 24, 18 20, 14 22Z" fill="#3a4f7a" opacity="0.22" />
      <path d="M14 23 C12 25, 14 27, 17 25" stroke="#3a4f7a" strokeWidth="0.5" fill="none" opacity="0.45" />

      <path d="M24 32 C21 36, 25 38, 28 35 C31 32, 28 29, 24 32Z" fill="#3a4f7a" opacity="0.18" />

      {/* Tiny flower bud in the middle */}
      <circle cx="28" cy="28" r="1.5" fill="#b8963e" opacity="0.6" />
      <path d="M28 26.5 L28 29.5 M26.5 28 L29.5 28" stroke="#3a4f7a" strokeWidth="0.4" opacity="0.4" />
    </svg>
  )
}

export default function FloralWreath() {
  return (
    <svg
      width="180"
      height="180"
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Floral wreath with number 13"
    >
      {/* Background soft shadow effect */}
      <circle cx="90" cy="90" r="74" stroke="#ebdcb9" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />

      {/* Main woven branch ring (3 overlapping delicate lines for hand-drawn look) */}
      <circle cx="90" cy="90" r="72" stroke="#2c3e6b" strokeWidth="0.8" opacity="0.65" />
      <path
        d="M90 16 A 74 74 0 1 1 89.9 16"
        stroke="#2c3e6b"
        strokeWidth="0.6"
        strokeDasharray="40 10 30 15"
        opacity="0.5"
      />
      <path
        d="M90 20 A 70 70 0 1 1 89.9 20"
        stroke="#3a4f7a"
        strokeWidth="0.5"
        strokeDasharray="15 30 25 10"
        opacity="0.4"
      />

      {/* Delicate hand-drawn leaf nodes winding around the circle */}
      {/* Top section (0 - 90 deg) */}
      <path d="M90 18 C94 13, 100 15, 97 22 C94 27, 88 25, 90 18Z" fill="#2c3e6b" opacity="0.25" />
      <path d="M91 19 C94 15, 98 16, 96 21" stroke="#2c3e6b" strokeWidth="0.5" fill="none" opacity="0.5" />

      <path d="M108 22 C114 18, 118 22, 114 28 C110 32, 106 28, 108 22Z" fill="#2c3e6b" opacity="0.22" />
      <path d="M109 23 C113 20, 116 23, 113 27" stroke="#2c3e6b" strokeWidth="0.5" fill="none" opacity="0.5" />

      <path d="M125 32 C131 28, 134 33, 129 38 C124 42, 121 37, 125 32Z" fill="#3a4f7a" opacity="0.25" />
      <path d="M138 46 C144 42, 147 47, 142 52 C137 56, 134 51, 138 46Z" fill="#2c3e6b" opacity="0.2" />

      {/* Mid Right (90 - 180 deg) */}
      <path d="M149 62 C155 59, 157 65, 152 69 C147 73, 144 67, 149 62Z" fill="#3a4f7a" opacity="0.24" />
      <path d="M156 80 C162 78, 163 84, 158 88 C153 91, 151 85, 156 80Z" fill="#2c3e6b" opacity="0.22" />
      <path d="M158 98 C163 97, 164 103, 159 107 C154 110, 152 104, 158 98Z" fill="#3a4f7a" opacity="0.25" />
      <path d="M154 116 C159 116, 158 122, 153 125 C148 127, 147 121, 154 116Z" fill="#2c3e6b" opacity="0.2" />

      {/* Lower Right (180 - 270 deg) */}
      <path d="M144 133 C148 135, 146 141, 141 143 C136 144, 135 138, 144 133Z" fill="#3a4f7a" opacity="0.23" />
      <path d="M130 148 C134 151, 131 157, 126 158 C121 158, 121 152, 130 148Z" fill="#2c3e6b" opacity="0.25" />
      <path d="M113 158 C116 162, 112 167, 107 167 C103 166, 104 160, 113 158Z" fill="#3a4f7a" opacity="0.2" />
      <path d="M95 163 C97 168, 92 172, 88 171 C85 169, 87 163, 95 163Z" fill="#2c3e6b" opacity="0.22" />

      {/* Bottom section (left side mirror arcs) */}
      <path d="M75 163 C73 168, 78 172, 82 171 C85 169, 83 163, 75 163Z" fill="#2c3e6b" opacity="0.22" />
      <path d="M57 158 C54 162, 58 167, 63 167 C67 166, 66 160, 57 158Z" fill="#3a4f7a" opacity="0.2" />
      <path d="M40 148 C36 151, 39 157, 44 158 C49 158, 49 152, 40 148Z" fill="#2c3e6b" opacity="0.25" />
      <path d="M26 133 C22 135, 24 141, 29 143 C34 144, 35 138, 26 133Z" fill="#3a4f7a" opacity="0.23" />

      {/* Mid Left (270 - 360 deg) */}
      <path d="M16 116 C11 116, 12 122, 17 125 C22 127, 23 121, 16 116Z" fill="#2c3e6b" opacity="0.2" />
      <path d="M12 98 C7 97, 6 103, 11 107 C16 110, 18 104, 12 98Z" fill="#3a4f7a" opacity="0.25" />
      <path d="M14 80 C8 78, 7 84, 12 88 C17 91, 19 85, 14 80Z" fill="#2c3e6b" opacity="0.22" />
      <path d="M21 62 C15 59, 13 65, 18 69 C23 73, 26 67, 21 62Z" fill="#3a4f7a" opacity="0.24" />

      {/* Upper Left (360 - 90 deg) */}
      <path d="M32 46 C26 42, 23 47, 28 52 C33 56, 36 51, 32 46Z" fill="#2c3e6b" opacity="0.2" />
      <path d="M45 32 C39 28, 36 33, 41 38 C46 42, 49 37, 45 32Z" fill="#3a4f7a" opacity="0.25" />
      <path d="M62 22 C56 18, 52 22, 56 28 C60 32, 64 28, 62 22Z" fill="#2c3e6b" opacity="0.22" />
      <path d="M63 23 C59 20, 56 23, 59 27" stroke="#2c3e6b" strokeWidth="0.5" fill="none" opacity="0.5" />

      {/* Overlapping small branch strokes for organic look */}
      <path d="M102 20 Q112 32 110 38" stroke="#2c3e6b" strokeWidth="0.4" fill="none" opacity="0.4" />
      <path d="M136 40 Q146 54 140 64" stroke="#2c3e6b" strokeWidth="0.4" fill="none" opacity="0.4" />
      <path d="M152 76 Q156 90 148 100" stroke="#2c3e6b" strokeWidth="0.4" fill="none" opacity="0.4" />
      <path d="M44 20 Q32 32 34 38" stroke="#2c3e6b" strokeWidth="0.4" fill="none" opacity="0.4" />
      <path d="M24 76 Q20 90 28 100" stroke="#2c3e6b" strokeWidth="0.4" fill="none" opacity="0.4" />

      {/* Gold berry highlights around the wreath (matches the photo design) */}
      <circle cx="103" cy="24" r="1.8" fill="#b8963e" opacity="0.85" />
      <circle cx="120" cy="30" r="1.5" fill="#b8963e" opacity="0.75" />
      <circle cx="134" cy="42" r="1.8" fill="#b8963e" opacity="0.85" />
      <circle cx="148" cy="58" r="1.5" fill="#b8963e" opacity="0.75" />
      <circle cx="156" cy="74" r="1.8" fill="#b8963e" opacity="0.85" />
      <circle cx="158" cy="94" r="1.5" fill="#b8963e" opacity="0.75" />
      <circle cx="154" cy="112" r="1.8" fill="#b8963e" opacity="0.85" />
      <circle cx="144" cy="128" r="1.5" fill="#b8963e" opacity="0.75" />
      <circle cx="132" cy="144" r="1.8" fill="#b8963e" opacity="0.85" />
      <circle cx="116" cy="154" r="1.5" fill="#b8963e" opacity="0.75" />
      <circle cx="98" cy="160" r="1.8" fill="#b8963e" opacity="0.85" />

      <circle cx="77" cy="24" r="1.8" fill="#b8963e" opacity="0.85" />
      <circle cx="60" cy="30" r="1.5" fill="#b8963e" opacity="0.75" />
      <circle cx="46" cy="42" r="1.8" fill="#b8963e" opacity="0.85" />
      <circle cx="32" cy="58" r="1.5" fill="#b8963e" opacity="0.75" />
      <circle cx="24" cy="74" r="1.8" fill="#b8963e" opacity="0.85" />
      <circle cx="22" cy="94" r="1.5" fill="#b8963e" opacity="0.75" />
      <circle cx="26" cy="112" r="1.8" fill="#b8963e" opacity="0.85" />
      <circle cx="36" cy="128" r="1.5" fill="#b8963e" opacity="0.75" />
      <circle cx="48" cy="144" r="1.8" fill="#b8963e" opacity="0.85" />
      <circle cx="64" cy="154" r="1.5" fill="#b8963e" opacity="0.75" />
      <circle cx="82" cy="160" r="1.8" fill="#b8963e" opacity="0.85" />

      {/* Decorative leaf branch curls pointing outward */}
      <path d="M125 24 Q135 15 140 22" stroke="#2c3e6b" strokeWidth="0.5" fill="none" opacity="0.35" />
      <path d="M152 50 Q164 48 162 58" stroke="#2c3e6b" strokeWidth="0.5" fill="none" opacity="0.35" />
      <path d="M164 90 Q174 94 170 102" stroke="#2c3e6b" strokeWidth="0.5" fill="none" opacity="0.35" />
      <path d="M55 24 Q45 15 40 22" stroke="#2c3e6b" strokeWidth="0.5" fill="none" opacity="0.35" />
      <path d="M28 50 Q16 48 18 58" stroke="#2c3e6b" strokeWidth="0.5" fill="none" opacity="0.35" />
      <path d="M16 90 Q6 94 10 102" stroke="#2c3e6b" strokeWidth="0.5" fill="none" opacity="0.35" />

      {/* Center gold styled "13" with serif elegance */}
      <text
        x="90"
        y="102"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="48"
        fontWeight="bold"
        fill="#b8963e"
        style={{ letterSpacing: '-1px' }}
      >
        13
      </text>
    </svg>
  )
}

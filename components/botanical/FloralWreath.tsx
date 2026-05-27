export default function FloralWreath() {
  return (
    <div className="relative w-[200px] h-[200px] flex items-center justify-center">
      {/* SVG Wreath */}
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
        aria-hidden="true"
      >
        {/* Main organic circular stems (overlapping) */}
        <path
          d="M100 25 C141 25, 175 59, 175 100 C175 141, 141 175, 100 175 C59 175, 25 141, 25 100 C25 59, 59 25, 100 25"
          stroke="#2c3e6b"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path
          d="M95 28 C138 24, 172 61, 172 100 C172 139, 138 172, 98 172 C58 172, 28 139, 28 100 C28 65, 59 32, 95 28"
          stroke="#3a4f7a"
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M105 23 C145 28, 178 63, 178 100 C178 143, 142 178, 100 178 C57 178, 22 143, 22 100 C22 57, 58 24, 105 23"
          stroke="#2c3e6b"
          strokeWidth="0.5"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* Detailed Leaf Paths - Outer & Inner along the circle */}
        {/* Top & Right side leaves */}
        <path d="M100 25 C108 20, 115 18, 122 22 C116 26, 108 27, 100 25 Z" fill="#2c3e6b" fillOpacity="0.15" stroke="#2c3e6b" strokeWidth="0.8" />
        <path d="M115 23 C125 18, 132 18, 136 24 C128 26, 121 26, 115 23 Z" fill="#3a4f7a" fillOpacity="0.2" stroke="#3a4f7a" strokeWidth="0.6" />
        <path d="M130 27 C140 24, 148 27, 151 34 C143 35, 136 32, 130 27 Z" fill="#2c3e6b" fillOpacity="0.15" stroke="#2c3e6b" strokeWidth="0.8" />
        <path d="M145 36 C155 35, 161 40, 163 48 C155 47, 149 43, 145 36 Z" fill="#3a4f7a" fillOpacity="0.2" stroke="#3a4f7a" strokeWidth="0.6" />
        <path d="M156 48 C165 49, 170 56, 171 64 C163 62, 158 56, 156 48 Z" fill="#2c3e6b" fillOpacity="0.15" stroke="#2c3e6b" strokeWidth="0.8" />
        <path d="M164 62 C172 65, 175 73, 174 81 C167 78, 164 71, 164 62 Z" fill="#3a4f7a" fillOpacity="0.2" stroke="#3a4f7a" strokeWidth="0.6" />
        <path d="M171 78 C177 82, 179 90, 177 98 C170 94, 168 87, 171 78 Z" fill="#2c3e6b" fillOpacity="0.15" stroke="#2c3e6b" strokeWidth="0.8" />
        <path d="M173 95 C178 100, 178 108, 175 116 C169 111, 168 103, 173 95 Z" fill="#3a4f7a" fillOpacity="0.2" stroke="#3a4f7a" strokeWidth="0.6" />
        
        {/* Bottom & Right side leaves */}
        <path d="M171 113 C175 121, 172 129, 166 134 C161 128, 164 120, 171 113 Z" fill="#2c3e6b" fillOpacity="0.15" stroke="#2c3e6b" strokeWidth="0.8" />
        <path d="M163 128 C166 137, 161 144, 153 148 C149 141, 154 134, 163 128 Z" fill="#3a4f7a" fillOpacity="0.2" stroke="#3a4f7a" strokeWidth="0.6" />
        <path d="M150 142 C152 151, 145 158, 137 161 C134 153, 141 147, 150 142 Z" fill="#2c3e6b" fillOpacity="0.15" stroke="#2c3e6b" strokeWidth="0.8" />
        <path d="M135 153 C135 163, 127 169, 119 171 C117 163, 124 158, 135 153 Z" fill="#3a4f7a" fillOpacity="0.2" stroke="#3a4f7a" strokeWidth="0.6" />
        <path d="M118 162 C116 171, 108 176, 100 176 C100 168, 108 164, 118 162 Z" fill="#2c3e6b" fillOpacity="0.15" stroke="#2c3e6b" strokeWidth="0.8" />

        {/* Bottom & Left side leaves */}
        <path d="M100 175 C92 176, 84 171, 82 162 C90 164, 98 168, 100 175 Z" fill="#2c3e6b" fillOpacity="0.15" stroke="#2c3e6b" strokeWidth="0.8" />
        <path d="M81 171 C73 169, 65 163, 65 153 C76 158, 83 163, 81 171 Z" fill="#3a4f7a" fillOpacity="0.2" stroke="#3a4f7a" strokeWidth="0.6" />
        <path d="M63 161 C55 158, 48 151, 50 142 C59 147, 66 153, 63 161 Z" fill="#2c3e6b" fillOpacity="0.15" stroke="#2c3e6b" strokeWidth="0.8" />
        <path d="M47 148 C39 144, 34 137, 37 128 C46 134, 51 141, 47 148 Z" fill="#3a4f7a" fillOpacity="0.2" stroke="#3a4f7a" strokeWidth="0.6" />
        <path d="M34 134 C28 129, 25 121, 29 113 C36 120, 39 128, 34 134 Z" fill="#2c3e6b" fillOpacity="0.15" stroke="#2c3e6b" strokeWidth="0.8" />
        <path d="M25 116 C22 108, 22 100, 27 95 C32 103, 31 111, 25 116 Z" fill="#3a4f7a" fillOpacity="0.2" stroke="#3a4f7a" strokeWidth="0.6" />

        {/* Top & Left side leaves */}
        <path d="M23 98 C21 90, 23 82, 29 78 C32 87, 30 94, 23 98 Z" fill="#2c3e6b" fillOpacity="0.15" stroke="#2c3e6b" strokeWidth="0.8" />
        <path d="M26 81 C25 73, 28 65, 36 62 C36 71, 33 78, 26 81 Z" fill="#3a4f7a" fillOpacity="0.2" stroke="#3a4f7a" strokeWidth="0.6" />
        <path d="M29 64 C30 56, 35 49, 44 48 C42 56, 37 62, 29 64 Z" fill="#2c3e6b" fillOpacity="0.15" stroke="#2c3e6b" strokeWidth="0.8" />
        <path d="M37 48 C39 40, 45 35, 55 36 C51 43, 45 47, 37 48 Z" fill="#3a4f7a" fillOpacity="0.2" stroke="#3a4f7a" strokeWidth="0.6" />
        <path d="M49 34 C52 27, 60 24, 70 27 C64 32, 57 35, 49 34 Z" fill="#2c3e6b" fillOpacity="0.15" stroke="#2c3e6b" strokeWidth="0.8" />
        <path d="M64 24 C68 18, 75 18, 85 23 C79 26, 72 26, 64 24 Z" fill="#3a4f7a" fillOpacity="0.2" stroke="#3a4f7a" strokeWidth="0.6" />
        <path d="M78 22 C85 18, 92 20, 100 25 C92 27, 84 26, 78 22 Z" fill="#2c3e6b" fillOpacity="0.15" stroke="#2c3e6b" strokeWidth="0.8" />

        {/* Small delicate branches/stems shooting off the main circle */}
        <path d="M120 22 C125 15, 135 12, 142 16" stroke="#2c3e6b" strokeWidth="0.6" strokeLinecap="round" opacity="0.6" />
        <path d="M151 34 C160 28, 168 32, 172 38" stroke="#2c3e6b" strokeWidth="0.6" strokeLinecap="round" opacity="0.6" />
        <path d="M171 64 C180 62, 185 70, 188 77" stroke="#2c3e6b" strokeWidth="0.6" strokeLinecap="round" opacity="0.6" />
        <path d="M175 116 C183 122, 181 132, 177 138" stroke="#2c3e6b" strokeWidth="0.6" strokeLinecap="round" opacity="0.6" />
        <path d="M137 161 C139 170, 131 178, 125 182" stroke="#2c3e6b" strokeWidth="0.6" strokeLinecap="round" opacity="0.6" />
        <path d="M63 161 C59 170, 50 176, 42 178" stroke="#2c3e6b" strokeWidth="0.6" strokeLinecap="round" opacity="0.6" />
        <path d="M29 113 C20 115, 14 109, 10 102" stroke="#2c3e6b" strokeWidth="0.6" strokeLinecap="round" opacity="0.6" />
        <path d="M29 64 C20 62, 15 54, 12 47" stroke="#2c3e6b" strokeWidth="0.6" strokeLinecap="round" opacity="0.6" />

        {/* Delicate gold berries / flower buds placed organically (not in a perfect circle) */}
        <circle cx="118" cy="18" r="2" fill="#b8963e" />
        <circle cx="140" cy="14" r="1.5" fill="#b8963e" />
        <circle cx="146" cy="30" r="2" fill="#b8963e" />
        <circle cx="168" cy="32" r="1.5" fill="#b8963e" />
        <circle cx="168" cy="56" r="2.2" fill="#b8963e" />
        <circle cx="184" cy="72" r="1.8" fill="#b8963e" />
        <circle cx="178" cy="88" r="2" fill="#b8963e" />
        <circle cx="180" cy="106" r="1.5" fill="#b8963e" />
        <circle cx="178" cy="126" r="2" fill="#b8963e" />
        <circle cx="158" cy="144" r="1.5" fill="#b8963e" />
        <circle cx="142" cy="154" r="2" fill="#b8963e" />
        <circle cx="120" cy="176" r="1.5" fill="#b8963e" />
        <circle cx="94" cy="180" r="2" fill="#b8963e" />
        <circle cx="68" cy="178" r="1.5" fill="#b8963e" />
        <circle cx="48" cy="168" r="2.2" fill="#b8963e" />
        <circle cx="34" cy="152" r="1.5" fill="#b8963e" />
        <circle cx="24" cy="132" r="2" fill="#b8963e" />
        <circle cx="12" cy="108" r="1.5" fill="#b8963e" />
        <circle cx="22" cy="88" r="2.2" fill="#b8963e" />
        <circle cx="16" cy="54" r="1.5" fill="#b8963e" />
        <circle cx="38" cy="38" r="2" fill="#b8963e" />
        <circle cx="56" cy="24" r="1.5" fill="#b8963e" />
        <circle cx="78" cy="18" r="2" fill="#b8963e" />
      </svg>

      {/* Perfectly centered 13 overlay */}
      <div
        className="absolute font-bold text-[#b8963e] flex items-center justify-center"
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "48px",
          lineHeight: "1",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          margin: 0,
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "48px",
          width: "100px",
          textAlign: "center"
        }}
      >
        13
      </div>
    </div>
  )
}


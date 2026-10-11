import React from 'react'

/**
 * LeafBackground
 * Fixed, full-viewport backdrop featuring soft mint gradient,
 * depth blobs, and original inline SVG botanicals (monstera, ferns, oval foliage).
 * Fully decorative (aria-hidden, pointer-events-none).
 */
export const LeafBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden select-none"
      style={{
        background: 'linear-gradient(135deg, #f7fcf8 0%, #edf7f0 50%, #e3f2e8 100%)',
      }}
    >
      {/* Soft blurred pastel ambient blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="absolute top-1/4 -right-24 w-80 h-80 rounded-full bg-teal-200/35 blur-3xl" />
      <div className="absolute -bottom-24 left-1/3 w-96 h-96 rounded-full bg-green-200/30 blur-3xl" />
      <div className="absolute top-2/3 right-1/4 w-72 h-72 rounded-full bg-emerald-100/50 blur-2xl" />

      {/* Decorative botanical vector artwork */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 900"
      >
        <defs>
          <filter id="soft-depth" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Top-Left Monstera Silhouette (Cropped at edge) */}
        <g transform="translate(-80, -60) rotate(25)" opacity="0.18" fill="#2d6a4f">
          <path d="M220 50 C290 80, 360 170, 370 270 C380 370, 320 460, 220 490 C120 460, 60 370, 70 270 C80 170, 150 80, 220 50 Z" />
          {/* Characteristic monstera side cutouts */}
          <ellipse cx="140" cy="220" rx="40" ry="12" transform="rotate(-30 140 220)" fill="#f7fcf8" />
          <ellipse cx="130" cy="310" rx="45" ry="14" transform="rotate(-15 130 310)" fill="#f7fcf8" />
          <ellipse cx="150" cy="390" rx="38" ry="12" transform="rotate(10 150 390)" fill="#f7fcf8" />
          <ellipse cx="290" cy="220" rx="40" ry="12" transform="rotate(30 290 220)" fill="#f7fcf8" />
          <ellipse cx="300" cy="310" rx="45" ry="14" transform="rotate(15 300 310)" fill="#f7fcf8" />
          <ellipse cx="280" cy="390" rx="38" ry="12" transform="rotate(-10 280 390)" fill="#f7fcf8" />
          {/* Midrib */}
          <line x1="220" y1="50" x2="220" y2="520" stroke="#1b4332" strokeWidth="6" strokeLinecap="round" />
        </g>

        {/* Bottom-Right Botanical Monstera Silhouette */}
        <g transform="translate(1180, 520) rotate(-35)" opacity="0.16" fill="#1b4332" filter="url(#soft-depth)">
          <path d="M220 50 C290 80, 360 170, 370 270 C380 370, 320 460, 220 490 C120 460, 60 370, 70 270 C80 170, 150 80, 220 50 Z" />
          <ellipse cx="140" cy="220" rx="40" ry="12" transform="rotate(-30 140 220)" fill="#edf7f0" />
          <ellipse cx="130" cy="310" rx="45" ry="14" transform="rotate(-15 130 310)" fill="#edf7f0" />
          <ellipse cx="150" cy="390" rx="38" ry="12" transform="rotate(10 150 390)" fill="#edf7f0" />
          <ellipse cx="290" cy="220" rx="40" ry="12" transform="rotate(30 290 220)" fill="#edf7f0" />
          <ellipse cx="300" cy="310" rx="45" ry="14" transform="rotate(15 300 310)" fill="#edf7f0" />
          <ellipse cx="280" cy="390" rx="38" ry="12" transform="rotate(-10 280 390)" fill="#edf7f0" />
          <line x1="220" y1="50" x2="220" y2="520" stroke="#102e21" strokeWidth="6" strokeLinecap="round" />
        </g>

        {/* Top-Right Oval Leaf Branch */}
        <g transform="translate(1250, 40) rotate(-15)" opacity="0.22" fill="#40916c">
          <path d="M0 250 Q60 150 140 50 Q120 180 0 250 Z" />
          <path d="M-40 200 Q20 100 90 20 Q80 140 -40 200 Z" />
          <path d="M60 220 Q120 120 180 30 Q160 160 60 220 Z" />
          {/* Stalk */}
          <path d="M-60 310 Q40 180 150 40" stroke="#2d6a4f" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>

        {/* Fern Frond on Middle Left */}
        <g transform="translate(-40, 420) rotate(45)" opacity="0.20">
          <path d="M0 350 Q80 200 200 40" stroke="#2d6a4f" strokeWidth="5" fill="none" strokeLinecap="round" />
          {/* Fern Pinnae Pairs */}
          <path d="M40 280 C70 270, 95 240, 100 220 C85 245, 60 270, 40 280 Z" fill="#52b788" />
          <path d="M35 285 C5 275, -20 245, -25 225 C-10 250, 15 275, 35 285 Z" fill="#52b788" />
          <path d="M75 220 C105 210, 130 180, 135 160 C120 185, 95 210, 75 220 Z" fill="#40916c" />
          <path d="M70 225 C40 215, 15 185, 10 165 C25 190, 50 215, 70 225 Z" fill="#40916c" />
          <path d="M110 160 C140 150, 160 120, 165 105 C150 130, 130 150, 110 160 Z" fill="#2d6a4f" />
          <path d="M105 165 C75 155, 55 125, 50 110 C65 135, 85 155, 105 165 Z" fill="#2d6a4f" />
          <path d="M145 105 C170 95, 185 75, 190 60 C175 80, 160 98, 145 105 Z" fill="#2d6a4f" />
        </g>

        {/* Center-Top Subtle Floating Oval Leaves */}
        <g transform="translate(620, -20) rotate(10)" opacity="0.14" fill="#52b788">
          <path d="M0 0 C50 30, 80 90, 70 140 C20 130, -20 70, 0 0 Z" />
          <line x1="0" y1="0" x2="45" y2="135" stroke="#2d6a4f" strokeWidth="2.5" />
          <line x1="15" y1="40" x2="35" y2="30" stroke="#2d6a4f" strokeWidth="1.5" />
          <line x1="28" y1="75" x2="52" y2="65" stroke="#2d6a4f" strokeWidth="1.5" />
        </g>

        {/* Bottom-Center Small Branch */}
        <g transform="translate(560, 780) rotate(-8)" opacity="0.18" fill="#40916c">
          <path d="M0 0 Q80 -30 160 -40 Q140 30 0 0 Z" />
          <path d="M130 -35 Q200 -70 260 -90 Q230 -20 130 -35 Z" />
          <line x1="-30" y1="20" x2="260" y2="-90" stroke="#1b4332" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  )
}

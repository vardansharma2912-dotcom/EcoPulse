import React from 'react'

/**
 * LeafBackground
 * Full-viewport decorative background layer.
 * Features vibrant SVG botanicals (monstera, ferns, oval foliage) at 40-70% opacity
 * and rich ambient pastel blobs (emerald, lime, teal, pale yellow)
 * specifically positioned directly behind cards & panels to produce deep glass refraction.
 */
export const LeafBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden select-none"
      style={{
        background: 'linear-gradient(135deg, #f2faf4 0%, #e5f5ea 45%, #daf0e2 100%)',
      }}
    >
      {/* 4 Large blurred colored blobs behind content for vivid chromatic refraction */}
      <div className="absolute top-10 left-1/4 w-[520px] h-[520px] rounded-full bg-emerald-300/40 blur-3xl" />
      <div className="absolute top-1/3 right-10 w-[480px] h-[480px] rounded-full bg-lime-300/35 blur-3xl" />
      <div className="absolute bottom-10 left-10 w-[550px] h-[550px] rounded-full bg-teal-300/40 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] rounded-full bg-amber-200/30 blur-3xl" />

      {/* Large SVG Botanical Vector Artwork spread across entire viewport */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 900"
      >
        <defs>
          {/* Reusable Monstera Leaf definition */}
          <g id="monstera-leaf">
            <path
              d="M200 40 C280 75, 360 170, 365 280 C370 390, 310 490, 200 520 C90 490, 30 390, 35 280 C40 170, 120 75, 200 40 Z"
            />
            {/* Cutouts */}
            <ellipse cx="120" cy="220" rx="42" ry="14" transform="rotate(-30 120 220)" fill="#daf0e2" />
            <ellipse cx="105" cy="320" rx="48" ry="16" transform="rotate(-15 105 320)" fill="#daf0e2" />
            <ellipse cx="130" cy="410" rx="42" ry="14" transform="rotate(10 130 410)" fill="#daf0e2" />
            <ellipse cx="280" cy="220" rx="42" ry="14" transform="rotate(30 280 220)" fill="#daf0e2" />
            <ellipse cx="295" cy="320" rx="48" ry="16" transform="rotate(15 295 320)" fill="#daf0e2" />
            <ellipse cx="270" cy="410" rx="42" ry="14" transform="rotate(-10 270 410)" fill="#daf0e2" />
            {/* Inner slits */}
            <ellipse cx="160" cy="280" rx="28" ry="7" transform="rotate(-40 160 280)" fill="#daf0e2" />
            <ellipse cx="240" cy="280" rx="28" ry="7" transform="rotate(40 240 280)" fill="#daf0e2" />
            {/* Center Midrib */}
            <line x1="200" y1="40" x2="200" y2="550" stroke="#1b4332" strokeWidth="7" strokeLinecap="round" />
          </g>

          {/* Reusable Large Oval Leaf with veins */}
          <g id="oval-leaf">
            <path d="M0 0 C70 45, 110 130, 95 210 C35 190, -35 110, 0 0 Z" />
            <line x1="0" y1="0" x2="65" y2="205" stroke="#1b4332" strokeWidth="4" />
            <line x1="20" y1="50" x2="55" y2="38" stroke="#1b4332" strokeWidth="2.5" />
            <line x1="38" y1="95" x2="78" y2="82" stroke="#1b4332" strokeWidth="2.5" />
            <line x1="50" y1="145" x2="88" y2="132" stroke="#1b4332" strokeWidth="2.5" />
            <line x1="10" y1="65" x2="-18" y2="78" stroke="#1b4332" strokeWidth="2.5" />
            <line x1="25" y1="115" x2="-5" y2="130" stroke="#1b4332" strokeWidth="2.5" />
            <line x1="42" y1="165" x2="15" y2="178" stroke="#1b4332" strokeWidth="2.5" />
          </g>

          {/* Reusable Fern Frond */}
          <g id="fern-frond">
            <path d="M0 450 Q90 260 220 50" stroke="#2f7d4f" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M45 360 C80 345, 115 310, 120 280 C100 315, 70 345, 45 360 Z" fill="#4caf7a" />
            <path d="M40 365 C5 350, -30 315, -35 285 C-15 320, 15 350, 40 365 Z" fill="#4caf7a" />
            <path d="M90 280 C125 265, 160 230, 165 200 C145 235, 115 265, 90 280 Z" fill="#2f7d4f" />
            <path d="M85 285 C50 270, 15 235, 10 205 C30 240, 60 270, 85 285 Z" fill="#2f7d4f" />
            <path d="M135 200 C170 185, 200 150, 205 125 C185 155, 160 185, 135 200 Z" fill="#86c99a" />
            <path d="M130 205 C95 190, 65 155, 60 130 C80 160, 105 190, 130 205 Z" fill="#86c99a" />
            <path d="M175 125 C205 110, 230 85, 235 65 C215 90, 195 115, 175 125 Z" fill="#b7e4c7" />
            <path d="M170 130 C140 115, 115 90, 110 70 C130 95, 150 120, 170 130 Z" fill="#b7e4c7" />
          </g>
        </defs>

        {/* 1. Large Top-Left Monstera (cropped by edge) */}
        <use
          href="#monstera-leaf"
          x="-100"
          y="-80"
          transform="rotate(18 -100 -80) scale(1.4)"
          fill="#2f7d4f"
          opacity="0.65"
        />

        {/* 2. Big Monstera directly behind Center/Dashboard area */}
        <use
          href="#monstera-leaf"
          x="320"
          y="110"
          transform="rotate(-22 320 110) scale(1.3)"
          fill="#4caf7a"
          opacity="0.55"
        />

        {/* 3. Large Monstera behind Right Content / Cards */}
        <use
          href="#monstera-leaf"
          x="880"
          y="260"
          transform="rotate(32 880 260) scale(1.45)"
          fill="#2f7d4f"
          opacity="0.60"
        />

        {/* 4. Bottom-Center Monstera */}
        <use
          href="#monstera-leaf"
          x="520"
          y="480"
          transform="rotate(-15 520 480) scale(1.35)"
          fill="#86c99a"
          opacity="0.50"
        />

        {/* 5. Top-Center Large Fern Frond */}
        <use
          href="#fern-frond"
          x="620"
          y="-60"
          transform="rotate(25 620 -60) scale(1.5)"
          opacity="0.65"
        />

        {/* 6. Middle-Left Fern Frond crossing into sidebar area */}
        <use
          href="#fern-frond"
          x="120"
          y="340"
          transform="rotate(-35 120 340) scale(1.4)"
          opacity="0.58"
        />

        {/* 7. Bottom-Right Fern Frond */}
        <use
          href="#fern-frond"
          x="1080"
          y="420"
          transform="rotate(40 1080 420) scale(1.4)"
          opacity="0.62"
        />

        {/* 8. Top-Right Big Oval Leaf with Midrib */}
        <use
          href="#oval-leaf"
          x="1150"
          y="-30"
          transform="rotate(-25 1150 -30) scale(2.2)"
          fill="#2f7d4f"
          opacity="0.68"
        />

        {/* 9. Center-Right Oval Leaf directly behind metric cards */}
        <use
          href="#oval-leaf"
          x="750"
          y="80"
          transform="rotate(45 750 80) scale(1.8)"
          fill="#b7e4c7"
          opacity="0.55"
        />

        {/* 10. Center-Left Oval Foliage Leaf */}
        <use
          href="#oval-leaf"
          x="260"
          y="360"
          transform="rotate(-50 260 360) scale(1.9)"
          fill="#4caf7a"
          opacity="0.60"
        />

        {/* 11. Bottom-Left Lush Oval Leaf */}
        <use
          href="#oval-leaf"
          x="-40"
          y="620"
          transform="rotate(60 -40 620) scale(2.0)"
          fill="#2f7d4f"
          opacity="0.65"
        />

        {/* 12. Bottom-Center Lime Oval Leaf */}
        <use
          href="#oval-leaf"
          x="420"
          y="720"
          transform="rotate(-18 420 720) scale(1.7)"
          fill="#86c99a"
          opacity="0.52"
        />
      </svg>
    </div>
  )
}

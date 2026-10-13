import React from 'react'
import leafBgImg from '../../assets/leaf-bg.webp'

/**
 * LeafBackground
 * Uses the user-provided botanical watercolor leaf artwork as the fixed backdrop.
 * Perfectly framed for glassmorphic refraction with rich leaves along the perimeter
 * and a glowing soft mint center behind the main content area.
 */
export const LeafBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 h-[100dvh] min-h-[100dvh] -z-10 pointer-events-none overflow-x-clip overflow-y-clip select-none"
    >
      <img
        src={leafBgImg}
        alt=""
        width={1920}
        height={1080}
        className="w-full h-full object-cover object-center"
      />
      {/* Soft ambient tint to blend beautifully with the light glass surfaces */}
      <div className="absolute inset-0 bg-emerald-900/[0.03] pointer-events-none" />
    </div>
  )
}

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
      {/* Ambient tint overlay: soft mint in light mode, deep green subdued leaves in dark mode */}
      <div
        className="absolute inset-0 pointer-events-none transition-colors duration-300"
        style={{ backgroundColor: 'var(--leaf-overlay-bg)' }}
      />
    </div>
  )
}

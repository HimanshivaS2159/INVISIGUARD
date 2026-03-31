import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassEffectProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: string;
}

export default function GlassEffect({
  children,
  className = '',
  hover = true,
  onClick,
  padding = 'p-6',
}: GlassEffectProps) {
  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl
        bg-[rgba(15,12,40,0.7)]
        backdrop-blur-xl
        border border-[rgba(168,85,247,0.2)]
        shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(168,85,247,0.1)]
        ${padding}
        ${hover ? 'cursor-pointer' : ''}
        ${className}
      `}
      whileHover={
        hover
          ? {
              scale: 1.01,
              borderColor: 'rgba(168, 85, 247, 0.35)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.08), 0 16px 60px rgba(168,85,247,0.25), 0 0 0 1px rgba(168,85,247,0.2)',
            }
          : undefined
      }
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={onClick}
    >
      {/* SVG glass distortion filter */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="glass-distortion">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015"
              numOctaves="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="3"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Top highlight edge with purple tint */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(168,85,247,0.4)] to-transparent" />

      {children}
    </motion.div>
  );
}

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
        bg-[rgba(255,255,255,0.07)]
        backdrop-blur-xl
        border border-[rgba(255,255,255,0.12)]
        shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_32px_rgba(0,0,0,0.3)]
        ${padding}
        ${hover ? 'cursor-pointer' : ''}
        ${className}
      `}
      whileHover={
        hover
          ? {
              scale: 1.01,
              borderColor: 'rgba(168, 85, 247, 0.3)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.12), 0 12px 40px rgba(168,85,247,0.15), 0 0 0 1px rgba(168,85,247,0.1)',
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

      {/* Top highlight edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.15)] to-transparent" />

      {children}
    </motion.div>
  );
}

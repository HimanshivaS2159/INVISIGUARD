import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const images = [
  'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
  'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80',
];

const targetScales = [4, 5, 6, 5, 6, 8, 9];

const positions: Array<{ top: string; left: string; width: string; height: string }> = [
  { top: '0%', left: '25%', width: '50%', height: '50%' },
  { top: '0%', left: '0%', width: '30%', height: '45%' },
  { top: '0%', left: '70%', width: '30%', height: '45%' },
  { top: '55%', left: '5%', width: '25%', height: '40%' },
  { top: '55%', left: '70%', width: '28%', height: '40%' },
  { top: '55%', left: '32%', width: '18%', height: '35%' },
  { top: '55%', left: '52%', width: '16%', height: '35%' },
];

// Each image gets its own component so hooks are called at top level
function ParallaxImage({
  src, index, scrollYProgress,
}: {
  src: string;
  index: number;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  const scale = useTransform(scrollYProgress, [0, 1], [1, targetScales[index]]);
  return (
    <motion.div
      style={{ scale, position: 'absolute', ...positions[index] }}
      className="flex items-center justify-center"
    >
      <div className="relative w-full h-full rounded-xl overflow-hidden border border-[rgba(255,255,255,0.08)] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <img
          src={src}
          alt={`INVISIGUARD feature ${index + 1}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(10,10,26,0.6)]" />
      </div>
    </motion.div>
  );
}

export default function ZoomParallax() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  return (
    <div ref={containerRef} className="h-[300vh] relative">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
        {images.map((src, i) => (
          <ParallaxImage key={i} src={src} index={i} scrollYProgress={scrollYProgress} />
        ))}
      </div>
    </div>
  );
}

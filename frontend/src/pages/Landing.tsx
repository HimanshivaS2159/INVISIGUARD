import { motion } from 'framer-motion';
import { ArrowRight, Shield, Activity, Eye, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Features from '../components/Features';

const stats = [
  { icon: <Shield size={22} />, value: '99.2%', label: 'Accuracy' },
  { icon: <Activity size={22} />, value: '<100ms', label: 'Latency' },
  { icon: <Eye size={22} />, value: '0 PII', label: 'Stored' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative">

      {/* ═══════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">

        {/* Strong dark overlay — kills the bright shader bleed */}
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(10,10,26,0.82)] via-[rgba(10,10,26,0.72)] to-[rgba(10,10,26,0.90)] pointer-events-none z-0" />

        {/* Subtle grid lines */}
        <div className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(168,85,247,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating accent orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none z-0 opacity-20"
          style={{ background: 'radial-gradient(circle, #6633CC, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none z-0 opacity-15"
          style={{ background: 'radial-gradient(circle, #A855F7, transparent 70%)', filter: 'blur(80px)' }} />

        {/* Content */}
        <motion.div
          className="relative z-10 max-w-5xl mx-auto text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Live badge */}
          <motion.div
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-10
              bg-[rgba(15,12,40,0.9)] border border-[rgba(168,85,247,0.35)]
              shadow-[0_4px_20px_rgba(168,85,247,0.15)]"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
          >
            <span className="relative flex w-2.5 h-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            <span className="text-sm font-semibold text-white tracking-wide">AI-Powered Behavioral Fraud Detection</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            className="font-black tracking-tight mb-6 leading-none"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <span
              className="block text-7xl md:text-9xl lg:text-[10rem]"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #C084FC 40%, #A855F7 70%, #6366F1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 40px rgba(168,85,247,0.4))',
              }}
            >
              INVISIGUARD
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            className="text-xl md:text-2xl font-medium text-white max-w-2xl mx-auto mb-4 leading-relaxed"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,1)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Detecting fraud through{' '}
            <span className="relative inline-block">
              <span className="relative z-10 font-black text-[#C084FC]">behavior</span>
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-[#A855F7] to-[#6366F1] rounded-full" />
            </span>
            , not just transactions.
          </motion.p>

          <motion.p
            className="text-base text-white/65 max-w-xl mx-auto mb-12 leading-relaxed"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
          >
            Advanced ML models analyze device fingerprints, behavioral patterns, and transaction
            anomalies to catch fraud before it happens — in real time.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.button
              onClick={() => navigate('/predict')}
              className="group relative flex items-center gap-2.5 px-9 py-4 rounded-full
                text-white font-bold text-lg overflow-hidden
                shadow-[0_8px_32px_rgba(168,85,247,0.4)]"
              style={{ background: 'linear-gradient(135deg, #A855F7, #6366F1)' }}
              whileHover={{ scale: 1.06, boxShadow: '0 12px 48px rgba(168,85,247,0.6)' }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="relative z-10 flex items-center gap-2.5">
                Try Live Demo
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
              </span>
              {/* Shimmer */}
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                initial={{ x: '-100%' }}
                whileHover={{ x: '200%' }}
                transition={{ duration: 0.6 }}
              />
            </motion.button>

            <motion.button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2.5 px-9 py-4 rounded-full font-bold text-lg
                bg-[rgba(255,255,255,0.08)] backdrop-blur-md
                border border-[rgba(255,255,255,0.18)] text-white
                hover:bg-[rgba(255,255,255,0.13)] hover:border-[rgba(168,85,247,0.5)]
                transition-all duration-300"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              View Dashboard
            </motion.button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            className="flex items-center justify-center gap-2 md:gap-0"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center px-8 md:px-12">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl
                    bg-[rgba(168,85,247,0.15)] border border-[rgba(168,85,247,0.25)] mb-2 text-[#A855F7]">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-black text-white" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
                    {stat.value}
                  </div>
                  <div className="text-xs font-semibold text-white/60 uppercase tracking-widest mt-0.5">
                    {stat.label}
                  </div>
                </div>
                {i < stats.length - 1 && (
                  <div className="w-px h-12 bg-[rgba(255,255,255,0.1)]" />
                )}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">Scroll</span>
          <ChevronDown size={18} className="text-white/40" />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════════════════════ */}
      <div className="relative">
        {/* Dark section background */}
        <div className="absolute inset-0 bg-[rgba(8,6,24,0.88)] pointer-events-none" />
        <Features />
      </div>

      {/* ═══════════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════════ */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0 bg-[rgba(8,6,24,0.88)] pointer-events-none" />
        <motion.div
          className="relative z-10 max-w-3xl mx-auto text-center
            p-12 rounded-3xl
            bg-[rgba(15,12,40,0.9)] backdrop-blur-xl
            border border-[rgba(168,85,247,0.2)]
            shadow-[0_24px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.07)]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Glow */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.12), transparent 70%)' }} />

          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            Ready to Detect Fraud{' '}
            <span className="bg-gradient-to-r from-[#A855F7] to-[#6366F1] bg-clip-text text-transparent">
              Intelligently?
            </span>
          </h2>
          <p className="text-[#9B8EC4] text-lg mb-10 leading-relaxed">
            Start analyzing transactions in real-time with our AI-powered behavioral engine.
            No setup required — just plug in and protect.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <motion.button
              onClick={() => navigate('/predict')}
              className="inline-flex items-center gap-2.5 px-9 py-4 rounded-full
                text-white font-bold text-lg
                shadow-[0_8px_32px_rgba(168,85,247,0.4)]"
              style={{ background: 'linear-gradient(135deg, #A855F7, #6366F1)' }}
              whileHover={{ scale: 1.05, boxShadow: '0 12px 48px rgba(168,85,247,0.6)' }}
              whileTap={{ scale: 0.97 }}
            >
              Try Live Demo <ArrowRight size={20} />
            </motion.button>
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2.5 px-9 py-4 rounded-full
                text-white font-bold text-lg
                bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.15)]
                hover:bg-[rgba(255,255,255,0.12)] transition-all duration-300"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              View Analytics
            </motion.button>
          </div>
        </motion.div>
      </section>

      <div className="h-24" />
    </div>
  );
}

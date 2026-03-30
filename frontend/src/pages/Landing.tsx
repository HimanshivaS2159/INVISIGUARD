import { motion } from 'framer-motion';
import { ArrowRight, Shield, Activity, Eye, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Features from '../components/Features';

const stats = [
  { icon: <Shield size={20} />, value: '99.2%', label: 'Accuracy' },
  { icon: <Activity size={20} />, value: '<100ms', label: 'Latency' },
  { icon: <Eye size={20} />, value: '0 PII', label: 'Stored' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="w-full">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden">

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(10,10,26,0.85)] via-[rgba(10,10,26,0.75)] to-[rgba(10,10,26,0.92)] pointer-events-none z-0" />
        <div className="absolute inset-0 pointer-events-none z-0" style={{
          backgroundImage: 'linear-gradient(rgba(168,85,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(168,85,247,0.04) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full pointer-events-none z-0"
          style={{ background: 'radial-gradient(circle,rgba(102,51,204,0.25),transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full pointer-events-none z-0"
          style={{ background: 'radial-gradient(circle,rgba(168,85,247,0.2),transparent 70%)', filter: 'blur(100px)' }} />

        {/* All hero content — centered column */}
        <div className="relative z-10 w-full flex flex-col items-center text-center px-4">

          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-8
              bg-[rgba(15,12,40,0.9)] border border-[rgba(168,85,247,0.4)]
              shadow-[0_4px_24px_rgba(168,85,247,0.2)]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <span className="relative flex w-2.5 h-2.5">
              <span className="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-60" />
              <span className="relative rounded-full w-2.5 h-2.5 bg-emerald-400" />
            </span>
            <span className="text-sm font-semibold text-white">AI-Powered Behavioral Fraud Detection</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="font-black tracking-tight leading-none mb-6 w-full"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            <span className="text-[clamp(3rem,12vw,9rem)]" style={{
              background: 'linear-gradient(135deg,#ffffff 0%,#C084FC 40%,#A855F7 70%,#6366F1 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              filter: 'drop-shadow(0 0 48px rgba(168,85,247,0.5))',
            }}>
              INVISIGUARD
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            className="text-xl md:text-2xl font-medium text-white max-w-2xl mb-3 leading-relaxed"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.9)' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            Detecting fraud through{' '}
            <span className="font-black text-[#C084FC] underline decoration-[#A855F7]/50 underline-offset-4">
              behavior
            </span>
            , not just transactions.
          </motion.p>

          <motion.p
            className="text-base text-white/60 max-w-lg mb-10 leading-relaxed"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Advanced ML models analyze device fingerprints, behavioral patterns, and transaction
            anomalies to catch fraud before it happens — in real time.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              onClick={() => navigate('/predict')}
              className="group relative flex items-center gap-2.5 px-8 py-4 rounded-full
                text-white font-bold text-base overflow-hidden
                shadow-[0_8px_32px_rgba(168,85,247,0.45)]"
              style={{ background: 'linear-gradient(135deg,#A855F7,#6366F1)' }}
              whileHover={{ scale: 1.05, boxShadow: '0 12px 48px rgba(168,85,247,0.65)' }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Try Live Demo
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <motion.span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                initial={{ x: '-100%' }} whileHover={{ x: '200%' }} transition={{ duration: 0.55 }} />
            </motion.button>

            <motion.button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base text-white
                bg-[rgba(255,255,255,0.08)] backdrop-blur-md border border-[rgba(255,255,255,0.18)]
                hover:bg-[rgba(255,255,255,0.13)] hover:border-[rgba(168,85,247,0.5)] transition-all duration-300"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              View Dashboard
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            {stats.map((s, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center px-8 md:px-14">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(168,85,247,0.15)] border border-[rgba(168,85,247,0.3)]
                    flex items-center justify-center text-[#A855F7] mb-2">
                    {s.icon}
                  </div>
                  <div className="text-2xl font-black text-white">{s.value}</div>
                  <div className="text-[11px] font-semibold text-white/50 uppercase tracking-widest mt-0.5">{s.label}</div>
                </div>
                {i < stats.length - 1 && <div className="w-px h-14 bg-[rgba(255,255,255,0.1)]" />}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
          animate={{ y: [0, 7, 0] }} transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-[10px] font-semibold text-white/35 uppercase tracking-widest">Scroll</span>
          <ChevronDown size={16} className="text-white/35" />
        </motion.div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <div style={{ width: '100%', background: 'rgba(8,6,24,0.9)' }}>
        <Features />
      </div>

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      <div style={{ width: '100%', background: 'rgba(8,6,24,0.9)', padding: '7rem 1.5rem' }}>
        <motion.div
          style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }}
          className="p-10 md:p-14 rounded-3xl relative
            bg-[rgba(15,12,40,0.92)] backdrop-blur-xl
            border border-[rgba(168,85,247,0.2)]
            shadow-[0_24px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.07)]"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%,rgba(168,85,247,0.14),transparent 65%)' }} />
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            Ready to Detect Fraud{' '}
            <span style={{
              background: 'linear-gradient(135deg,#A855F7,#6366F1)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Intelligently?</span>
          </h2>
          <p className="text-[#9B8EC4] text-lg mb-10 leading-relaxed max-w-xl mx-auto">
            Start analyzing transactions in real-time with our AI-powered behavioral engine.
            No setup required — just plug in and protect.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <motion.button
              onClick={() => navigate('/predict')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-base
                shadow-[0_8px_32px_rgba(168,85,247,0.4)]"
              style={{ background: 'linear-gradient(135deg,#A855F7,#6366F1)' }}
              whileHover={{ scale: 1.05, boxShadow: '0 12px 48px rgba(168,85,247,0.6)' }}
              whileTap={{ scale: 0.97 }}
            >
              Try Live Demo <ArrowRight size={18} />
            </motion.button>
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-base
                bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.15)]
                hover:bg-[rgba(255,255,255,0.12)] transition-all duration-300"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            >
              View Analytics
            </motion.button>
          </div>
        </motion.div>
      </div>

      <div style={{ height: '6rem', background: 'rgba(8,6,24,0.9)' }} />
    </div>
  );
}

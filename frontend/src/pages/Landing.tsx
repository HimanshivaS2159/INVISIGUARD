import { motion } from 'framer-motion';
import { ArrowRight, Shield, Activity, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ZoomParallax from '../components/ZoomParallax';
import Features from '../components/Features';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* ─── Hero Section ──────────────────────────────────────── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-accent/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}

        <motion.div
          className="max-w-5xl mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8
              bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.2)]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative w-2 h-2">
              <div className="absolute inset-0 rounded-full bg-success animate-ping opacity-40" />
              <div className="absolute inset-0 rounded-full bg-success" />
            </div>
            <span className="text-sm text-accent font-medium">AI-Powered Behavioral Analysis</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <span className="brand-gradient">INVISIGUARD</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            className="text-xl md:text-2xl text-text-muted max-w-2xl mx-auto mb-4 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Detecting fraud through{' '}
            <span className="text-text-primary font-semibold">behavior</span>, not just
            transactions.
          </motion.p>

          <motion.p
            className="text-base text-text-muted/70 max-w-xl mx-auto mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Advanced ML models analyze device fingerprints, behavioral patterns, and transaction
            anomalies to catch fraud before it happens.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.button
              onClick={() => navigate('/predict')}
              className="group flex items-center gap-2 px-8 py-4 rounded-full
                bg-gradient-to-r from-accent to-[#6366F1]
                text-white font-semibold text-lg
                shadow-[0_8px_32px_rgba(168,85,247,0.3)]
                hover:shadow-[0_12px_40px_rgba(168,85,247,0.5)]
                transition-shadow duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              Try Live Demo
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </motion.button>

            <motion.button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-8 py-4 rounded-full
                bg-[rgba(255,255,255,0.07)] backdrop-blur-sm
                border border-[rgba(255,255,255,0.12)]
                text-text-primary font-semibold text-lg
                hover:bg-[rgba(255,255,255,0.1)] hover:border-[rgba(168,85,247,0.3)]
                transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              View Dashboard
            </motion.button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            className="grid grid-cols-3 gap-8 mt-20 max-w-lg mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            {[
              { icon: <Shield size={20} />, value: '99.2%', label: 'Accuracy' },
              { icon: <Activity size={20} />, value: '<100ms', label: 'Latency' },
              { icon: <Eye size={20} />, value: '0 PII', label: 'Stored' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="flex justify-center text-accent mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
                <div className="text-xs text-text-muted">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-text-muted/30 flex items-start justify-center p-1.5">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-accent"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* ─── Zoom Parallax ──────────────────────────────────────── */}
      <ZoomParallax />

      {/* ─── Features Bento Grid ────────────────────────────────── */}
      <Features />

      {/* ─── Final CTA ──────────────────────────────────────────── */}
      <section className="py-32 px-6">
        <motion.div
          className="max-w-3xl mx-auto text-center
            p-12 rounded-3xl
            bg-[rgba(255,255,255,0.05)] backdrop-blur-xl
            border border-[rgba(255,255,255,0.1)]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Detect Fraud <span className="brand-gradient">Intelligently?</span>
          </h2>
          <p className="text-text-muted mb-8">
            Start analyzing transactions in real-time with our AI-powered behavioral engine.
          </p>
          <motion.button
            onClick={() => navigate('/predict')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full
              bg-gradient-to-r from-accent to-[#6366F1]
              text-white font-semibold text-lg
              shadow-[0_8px_32px_rgba(168,85,247,0.3)]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Try Live Demo <ArrowRight size={20} />
          </motion.button>
        </motion.div>
      </section>

      {/* Bottom spacing for dock */}
      <div className="h-24" />
    </div>
  );
}

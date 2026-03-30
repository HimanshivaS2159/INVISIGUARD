import { motion } from 'framer-motion';
import { Zap, Fingerprint, Activity, Target, Globe, ShieldCheck } from 'lucide-react';

const cards = [
  {
    title: 'Real-Time Detection',
    description: 'Analyze transactions in under 100ms with streaming behavioral analysis.',
    icon: <Zap size={26} className="text-[#A855F7]" />,
    span: 'md:col-span-2',
    accent: '#A855F7',
    extra: (
      <div className="mt-5 flex items-center gap-3">
        <div className="relative w-3 h-3 shrink-0">
          <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50" />
          <div className="absolute inset-0 rounded-full bg-emerald-400" />
        </div>
        <span className="text-emerald-400 text-sm font-semibold">Live — 0.3ms avg latency</span>
      </div>
    ),
  },
  {
    title: 'Behavioral Engine',
    description: 'Deep device fingerprinting, typing patterns, mouse dynamics, and session analysis.',
    icon: <Fingerprint size={26} className="text-[#A855F7]" />,
    span: 'md:col-span-2',
    accent: '#A855F7',
    extra: (
      <div className="mt-5 grid grid-cols-2 gap-2">
        {['Device ID', 'Typing Speed', 'Mouse Path', 'Session Time'].map((t) => (
          <div key={t} className="text-xs px-2 py-1.5 rounded-lg bg-[rgba(168,85,247,0.12)] text-[#C084FC] border border-[rgba(168,85,247,0.2)] text-center font-medium">
            {t}
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Explainable AI',
    description: 'Every prediction comes with human-readable reasoning and SHAP-style feature attribution.',
    icon: <Activity size={26} className="text-[#A855F7]" />,
    span: 'md:col-span-2',
    accent: '#A855F7',
    extra: (
      <div className="mt-5 flex items-end gap-1 h-10">
        {[40, 65, 30, 80, 55, 70, 45, 90, 35, 60, 75, 50].map((h, i) => (
          <motion.div key={i} className="flex-1 rounded-sm bg-[rgba(168,85,247,0.5)]"
            initial={{ height: 0 }} whileInView={{ height: `${h}%` }}
            transition={{ delay: i * 0.04, duration: 0.5 }} style={{ maxHeight: 40 }} />
        ))}
      </div>
    ),
  },
  {
    title: 'Risk Score 0–100',
    description: 'Calibrated probability score backed by gradient-boosted ensemble models.',
    icon: <Target size={26} className="text-[#A855F7]" />,
    span: 'md:col-span-3',
    accent: '#A855F7',
    extra: (
      <div className="mt-5 text-center">
        <div className="text-6xl font-black" style={{
          background: 'linear-gradient(135deg,#A855F7,#6366F1)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>99.2%</div>
        <p className="text-[#9B8EC4] text-sm mt-1 font-medium">Model Accuracy</p>
      </div>
    ),
  },
  {
    title: 'Multi-Platform',
    description: 'Works across UPI, Net Banking, E-commerce, and Wallet transactions seamlessly.',
    icon: <Globe size={26} className="text-[#A855F7]" />,
    span: 'md:col-span-3',
    accent: '#A855F7',
    extra: (
      <div className="mt-5 flex flex-wrap gap-2">
        {['UPI', 'Net Banking', 'E-commerce', 'Wallets', 'Cards'].map((p) => (
          <span key={p} className="px-3 py-1.5 text-xs font-semibold rounded-full bg-[rgba(168,85,247,0.15)] text-[#C084FC] border border-[rgba(168,85,247,0.25)]">
            {p}
          </span>
        ))}
      </div>
    ),
  },
  {
    title: 'Privacy First',
    description: 'Zero PII storage. All behavioral analysis runs on anonymized feature vectors. GDPR compliant by design.',
    icon: <ShieldCheck size={26} className="text-emerald-400" />,
    span: 'md:col-span-6',
    accent: '#10B981',
    extra: (
      <div className="mt-4 flex flex-wrap gap-3">
        {['No PII stored', 'GDPR Compliant', 'Anonymized Vectors'].map((t) => (
          <div key={t} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/25">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span className="text-emerald-400 text-sm font-semibold">{t}</span>
          </div>
        ))}
      </div>
    ),
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function Features() {
  return (
    <section style={{ width: '100%' }} className="py-28">
      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem' }}>

        {/* Header — fully centered */}
        <motion.div
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5
            bg-[rgba(168,85,247,0.12)] border border-[rgba(168,85,247,0.25)]">
            <span className="text-xs font-bold text-[#C084FC] uppercase tracking-widest">Core Capabilities</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Powered by{' '}
            <span style={{
              background: 'linear-gradient(135deg,#A855F7,#6366F1)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Intelligence</span>
          </h2>
          <p className="text-[#9B8EC4] text-lg max-w-xl leading-relaxed">
            Six core capabilities that make INVISIGUARD the most advanced behavioral fraud detection platform.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {cards.map((card, i) => (
            <motion.div key={i} className={`col-span-1 ${card.span}`}
              custom={i} variants={cardVariants} initial="hidden"
              whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
              <motion.div
                className="h-full rounded-2xl p-6 relative overflow-hidden
                  bg-[rgba(15,12,40,0.88)] backdrop-blur-xl
                  border border-[rgba(255,255,255,0.09)]
                  shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.07)]"
                whileHover={{
                  y: -4,
                  borderColor: `${card.accent}50`,
                  boxShadow: `0 20px 48px rgba(0,0,0,0.5),0 0 0 1px ${card.accent}30,inset 0 1px 0 rgba(255,255,255,0.1)`,
                }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.1)] to-transparent" />
                <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-[0.08]"
                  style={{ background: `radial-gradient(circle,${card.accent},transparent)` }} />
                <div className="mb-3">{card.icon}</div>
                <h3 className="text-[15px] font-bold text-white mb-2 leading-snug">{card.title}</h3>
                <p className="text-sm text-[#9B8EC4] leading-relaxed">{card.description}</p>
                {card.extra}
              </motion.div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

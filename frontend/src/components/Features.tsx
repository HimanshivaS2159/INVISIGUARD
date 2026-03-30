import { motion } from 'framer-motion';
import {
  Zap,
  Fingerprint,
  Activity,
  Target,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import GlassEffect from './GlassEffect';

const cards = [
  {
    title: 'Real-Time Detection',
    description: 'Analyze transactions in under 100ms with streaming behavioral analysis.',
    icon: <Zap size={28} />,
    span: 'col-span-1 md:col-span-2',
    extra: (
      <div className="mt-4 flex items-center gap-3">
        <div className="relative w-4 h-4">
          <div className="absolute inset-0 rounded-full bg-success animate-ping opacity-40" />
          <div className="absolute inset-0.5 rounded-full bg-success" />
        </div>
        <span className="text-success text-sm font-medium">Live — 0.3ms avg latency</span>
      </div>
    ),
  },
  {
    title: 'Behavioral Engine',
    description: 'Deep device fingerprinting, typing patterns, mouse dynamics, and session analysis.',
    icon: <Fingerprint size={28} />,
    span: 'col-span-1 md:col-span-2',
    extra: null,
  },
  {
    title: 'Explainable AI',
    description: 'Every prediction comes with human-readable reasoning and SHAP-style feature attribution.',
    icon: <Activity size={28} />,
    span: 'col-span-1 md:col-span-2',
    extra: (
      <div className="mt-4 flex gap-1">
        {[40, 65, 30, 80, 55, 70, 45, 90, 35, 60, 75, 50].map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-sm bg-accent/40"
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            style={{ maxHeight: 48 }}
          />
        ))}
      </div>
    ),
  },
  {
    title: 'Risk Score 0–100',
    description: 'Calibrated probability score backed by gradient-boosted ensemble models.',
    icon: <Target size={28} />,
    span: 'col-span-1 md:col-span-3',
    extra: (
      <div className="mt-4 text-center">
        <span className="text-5xl font-bold brand-gradient">99.2%</span>
        <p className="text-text-muted text-sm mt-1">Model Accuracy</p>
      </div>
    ),
  },
  {
    title: 'Multi-Platform',
    description: 'Works across UPI, Net Banking, E-commerce, and Wallet transactions.',
    icon: <Globe size={28} />,
    span: 'col-span-1 md:col-span-3',
    extra: (
      <div className="mt-4 flex flex-wrap gap-2">
        {['UPI', 'Bank', 'E-commerce', 'Wallets', 'Cards'].map((p) => (
          <span
            key={p}
            className="px-3 py-1 text-xs font-medium rounded-full bg-[rgba(168,85,247,0.15)] text-accent border border-[rgba(168,85,247,0.2)]"
          >
            {p}
          </span>
        ))}
      </div>
    ),
  },
  {
    title: 'Privacy First',
    description: 'Zero PII storage. All behavioral analysis runs on anonymized feature vectors.',
    icon: <ShieldCheck size={28} />,
    span: 'col-span-1 md:col-span-6',
    extra: (
      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
        <ShieldCheck size={14} className="text-success" />
        <span className="text-success text-xs font-medium">No PII stored — GDPR compliant</span>
      </div>
    ),
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function Features() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Powered by <span className="brand-gradient">Intelligence</span>
        </h2>
        <p className="text-text-muted text-lg max-w-2xl mx-auto">
          Six core capabilities that make INVISIGUARD the most advanced behavioral fraud detection platform.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-6 gap-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {cards.map((card, i) => (
          <motion.div key={i} className={card.span} variants={cardVariants}>
            <GlassEffect className="h-full">
              <div className="text-accent mb-3">{card.icon}</div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">{card.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{card.description}</p>
              {card.extra}
            </GlassEffect>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

import { motion, type Variants } from 'framer-motion';
import { Zap, Fingerprint, Activity, Globe, ShieldCheck, Code, Cpu, Lock, TrendingUp, Database, Layers } from 'lucide-react';

const cards = [
  {
    title: 'Real-Time Detection',
    description: 'Analyze transactions in under 100ms with streaming behavioral analysis and ML inference pipeline.',
    icon: <Zap size={36} className="text-[#A855F7]" />,
    span: 'md:col-span-3',
    accent: '#A855F7',
    tech: ['WebSocket', 'Stream Processing', 'Edge Computing'],
    metrics: { latency: '< 100ms', throughput: '10K TPS' },
  },
  {
    title: 'Behavioral Engine',
    description: 'Deep device fingerprinting, biometric patterns, session analysis, and anomaly detection using ensemble models.',
    icon: <Fingerprint size={36} className="text-[#6366F1]" />,
    span: 'md:col-span-3',
    accent: '#6366F1',
    tech: ['Neural Networks', 'Pattern Recognition', 'Biometrics'],
    metrics: { accuracy: '99.2%', features: '150+' },
  },
  {
    title: 'Multi-Platform',
    description: 'Seamless integration across web, mobile, API, and IoT endpoints with unified fraud scoring.',
    icon: <Globe size={36} className="text-[#8B5CF6]" />,
    span: 'md:col-span-2',
    accent: '#8B5CF6',
    tech: ['REST API', 'GraphQL', 'WebHooks'],
    metrics: { platforms: '15+', uptime: '99.99%' },
  },
  {
    title: 'Score 0-100',
    description: 'Gradient-boosted probability scores with SHAP explainability and confidence intervals.',
    icon: <Activity size={36} className="text-[#A855F7]" />,
    span: 'md:col-span-2',
    accent: '#A855F7',
    tech: ['XGBoost', 'SHAP', 'Calibration'],
    metrics: { precision: '97.8%', recall: '96.4%' },
  },
  {
    title: 'Privacy First',
    description: 'Zero PII storage. All behavioral analysis runs on encrypted, anonymized feature vectors with GDPR compliance.',
    icon: <Lock size={36} className="text-[#6366F1]" />,
    span: 'md:col-span-2',
    accent: '#6366F1',
    tech: ['AES-256', 'Zero-Knowledge', 'GDPR'],
    metrics: { encryption: 'E2E', compliance: '100%' },
  },
  {
    title: 'Adaptive Learning',
    description: 'Continuous model retraining with federated learning and automated drift detection.',
    icon: <TrendingUp size={36} className="text-[#8B5CF6]" />,
    span: 'md:col-span-3',
    accent: '#8B5CF6',
    tech: ['AutoML', 'Federated Learning', 'A/B Testing'],
    metrics: { updates: 'Real-time', drift: '< 0.5%' },
  },
  {
    title: 'Explainable AI',
    description: 'SHAP-based feature attribution with human-readable explanations for every prediction.',
    icon: <Code size={36} className="text-[#A855F7]" />,
    span: 'md:col-span-3',
    accent: '#A855F7',
    tech: ['SHAP', 'LIME', 'Attention Maps'],
    metrics: { transparency: '100%', audit: 'Full' },
  },
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.1,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function Features() {
  return (
    <section style={{ width: '100%', position: 'relative', overflow: 'hidden' }} className="py-32">
      {/* Animated gradient wave background - same as hero */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        background: 'linear-gradient(180deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.15) 50%, rgba(139,92,246,0.15) 100%)',
        animation: 'gradientWave 8s ease-in-out infinite'
      }} />
      
      {/* Floating orbs */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(168,85,247,0.6) 0%, rgba(168,85,247,0.2) 40%, transparent 70%)',
          filter: 'blur(100px)', animation: 'float 15s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, rgba(99,102,241,0.2) 40%, transparent 70%)',
          filter: 'blur(100px)', animation: 'float 18s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '700px', height: '700px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 60%)',
          filter: 'blur(120px)', animation: 'pulse 10s ease-in-out infinite' }} />
      </div>

      {/* Floating particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {[...Array(15)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            background: 'rgba(168,85,247,0.6)',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `floatParticle ${Math.random() * 10 + 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
            boxShadow: '0 0 10px rgba(168,85,247,0.8)'
          }} />
        ))}
      </div>

      {/* Grid overlay */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        backgroundImage: 'linear-gradient(rgba(168,85,247,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.03) 1px, transparent 1px)',
        backgroundSize: '100px 100px', 
        opacity: 0.3 
      }} />

      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.5rem 1.25rem', borderRadius: '9999px', marginBottom: '1.5rem',
            background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <Cpu size={16} className="text-[#A855F7]" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#C084FC',
              textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              Core Capabilities
            </span>
          </div>
          
          <h2 style={{
            fontSize: 'clamp(2.5rem,6vw,4rem)', fontWeight: 900, lineHeight: 1.1,
            marginBottom: '1.5rem', fontFamily: 'Space Grotesk, sans-serif'
          }}>
            <span style={{ color: '#fff' }}>Powered by </span>
            <span style={{
              background: 'linear-gradient(135deg,#A855F7,#6366F1)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Intelligence</span>
          </h2>
          
          <p style={{
            color: '#9B8EC4', fontSize: 'clamp(1rem,2vw,1.25rem)', maxWidth: '48rem',
            margin: '0 auto', lineHeight: 1.7, fontWeight: 400
          }}>
            Seven core capabilities that make INVISIGUARD the most advanced behavioral fraud detection platform.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              className={`col-span-1 ${card.span}`}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <motion.div
                className="h-full rounded-2xl p-8 relative overflow-hidden group"
                style={{
                  background: 'rgba(15,12,40,0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
                whileHover={{
                  y: -6,
                  borderColor: `${card.accent}40`,
                  boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${card.accent}30, inset 0 1px 0 rgba(255,255,255,0.1)`,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                {/* Top gradient line */}
                <div style={{
                  position: 'absolute', inset: 0, top: 0, height: '2px',
                  background: `linear-gradient(90deg, transparent, ${card.accent}60, transparent)`,
                  opacity: 0.5
                }} />

                {/* Glow effect on hover */}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '1rem',
                  background: `radial-gradient(circle at 50% 0%, ${card.accent}15, transparent 60%)`,
                  opacity: 0, transition: 'opacity 0.4s'
                }} className="group-hover:opacity-100" />

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  {/* Icon with glow */}
                  <motion.div
                    style={{
                      width: '4.5rem', height: '4.5rem', borderRadius: '1rem',
                      background: `${card.accent}15`, border: `1px solid ${card.accent}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '1.5rem', boxShadow: `0 0 30px ${card.accent}20`
                    }}
                    whileHover={{ scale: 1.1, boxShadow: `0 0 40px ${card.accent}40` }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    {card.icon}
                  </motion.div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: '1.5rem', fontWeight: 800, color: '#fff',
                    marginBottom: '0.75rem', fontFamily: 'Space Grotesk, sans-serif',
                    letterSpacing: '-0.02em'
                  }}>
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p style={{
                    color: 'rgba(155,142,196,0.9)', fontSize: '0.9375rem',
                    lineHeight: 1.7, marginBottom: '1.5rem', fontWeight: 400
                  }}>
                    {card.description}
                  </p>

                  {/* Tech stack tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    {card.tech.map((tech, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.75rem', fontWeight: 600, padding: '0.375rem 0.75rem',
                          borderRadius: '0.5rem', background: `${card.accent}12`,
                          color: card.accent, border: `1px solid ${card.accent}25`,
                          fontFamily: 'monospace', letterSpacing: '0.02em'
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Metrics */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem',
                    padding: '1rem', borderRadius: '0.75rem',
                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    {Object.entries(card.metrics).map(([key, value], idx) => (
                      <div key={idx} style={{ textAlign: idx === 0 ? 'left' : 'right' }}>
                        <div style={{
                          fontSize: '1.125rem', fontWeight: 900, color: card.accent,
                          fontFamily: 'Space Grotesk, sans-serif', marginBottom: '0.125rem'
                        }}>
                          {value}
                        </div>
                        <div style={{
                          fontSize: '0.6875rem', color: 'rgba(155,142,196,0.7)',
                          textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600
                        }}>
                          {key}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Corner accent */}
                <div style={{
                  position: 'absolute', bottom: 0, right: 0, width: '100px', height: '100px',
                  background: `radial-gradient(circle at 100% 100%, ${card.accent}08, transparent 70%)`,
                  pointerEvents: 'none'
                }} />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Bottom stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{
            marginTop: '5rem', padding: '2.5rem', borderRadius: '1.5rem',
            background: 'rgba(15,12,40,0.6)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(168,85,247,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}
        >
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2.5rem', textAlign: 'center'
          }}>
            {[
              { icon: <Database size={28} />, value: '150+', label: 'Behavioral Features', color: '#A855F7' },
              { icon: <Cpu size={28} />, value: '10K', label: 'Transactions/Sec', color: '#6366F1' },
              { icon: <ShieldCheck size={28} />, value: '99.2%', label: 'Model Accuracy', color: '#8B5CF6' },
              { icon: <Layers size={28} />, value: '< 2%', label: 'False Positive Rate', color: '#A855F7' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              >
                <div style={{
                  width: '4rem', height: '4rem', margin: '0 auto 1rem',
                  borderRadius: '1rem', background: `${stat.color}15`,
                  border: `1px solid ${stat.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: stat.color
                }}>
                  {stat.icon}
                </div>
                <div style={{
                  fontSize: '2.25rem', fontWeight: 900, color: stat.color,
                  fontFamily: 'Space Grotesk, sans-serif', marginBottom: '0.5rem'
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '0.875rem', color: 'rgba(155,142,196,0.8)',
                  fontWeight: 500, letterSpacing: '0.02em'
                }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

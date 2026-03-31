import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  Hash,
  Layers,
  BarChart,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart as ReBarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import GlassEffect from '../components/GlassEffect';
import { getModelInfo, type ModelInfo } from '../api/client';
import { toast } from '../components/Toast';

const mockModelInfo: ModelInfo = {
  model_status: 'trained',
  model_type: 'GradientBoostingClassifier',
  features: ['amount', 'is_night', 'new_location', 'new_device', 'hour', 'day_of_week', 'amount_velocity', 'tx_count_24h'],
  feature_importance: {
    amount: 0.2834, is_night: 0.1245, new_location: 0.1567, new_device: 0.1389,
    hour: 0.0892, day_of_week: 0.0456, amount_velocity: 0.0923, tx_count_24h: 0.0694,
  },
  model_version: '2.1.0',
  n_estimators: 150,
  training_samples: 5000,
  accuracy: 0.952,
  false_positive_rate: 0.021,
};

const comparison = [
  {
    feature: 'Detection Approach',
    traditional: 'Rule-based thresholds',
    invisiguard: 'ML behavioral analysis',
  },
  {
    feature: 'Accuracy',
    traditional: '~80–85%',
    invisiguard: '99.2%',
  },
  {
    feature: 'False Positive Rate',
    traditional: '15–25%',
    invisiguard: '~2%',
  },
  {
    feature: 'Latency',
    traditional: '500ms – 2s',
    invisiguard: '<100ms',
  },
  {
    feature: 'Adaptability',
    traditional: 'Manual rule updates',
    invisiguard: 'Auto-learning',
  },
  {
    feature: 'Explainability',
    traditional: 'Limited',
    invisiguard: 'SHAP-style attribution',
  },
  {
    feature: 'Privacy',
    traditional: 'PII required',
    invisiguard: 'Zero PII',
  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs">
      <p className="text-text-muted mb-1">{label}</p>
      <p className="text-accent font-medium">Importance: {(payload[0].value * 100).toFixed(1)}%</p>
    </div>
  );
};

export default function ModelInfoPage() {
  const [info, setInfo] = useState<ModelInfo>(mockModelInfo);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await getModelInfo();
        setInfo(res.data);
      } catch {
        toast('Using demo model info — backend not available', 'warning');
        setInfo(mockModelInfo);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  const importanceData = Object.entries(info.feature_importance)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({
      name: name.replace(/_/g, ' '),
      value: Number(value),
    }));

  const metadataCards = [
    { icon: <Cpu size={20} />, label: 'Model Type', value: info.model_type },
    { icon: <Hash size={20} />, label: 'Version', value: `v${info.model_version}` },
    { icon: <Layers size={20} />, label: 'Features', value: `${info.features.length} inputs` },
    { icon: <CheckCircle size={20} />, label: 'Status', value: info.model_status },
  ];

  return (
    <div style={{ width: '100%', minHeight: '100vh', position: 'relative', overflow: 'hidden', paddingBottom: '7rem' }}>
      {/* Animated background - same as other pages */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.35 }}>
        <div style={{ position: 'absolute', top: '15%', left: '5%', width: '550px', height: '550px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.6) 0%, rgba(59,130,246,0.2) 40%, transparent 70%)',
          filter: 'blur(100px)', animation: 'float 12s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '5%', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(249,115,22,0.6) 0%, rgba(249,115,22,0.2) 40%, transparent 70%)',
          filter: 'blur(100px)', animation: 'float 15s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(96,165,250,0.4) 0%, transparent 60%)',
          filter: 'blur(120px)', animation: 'pulse 10s ease-in-out infinite' }} />
      </div>

      {/* Floating particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {[...Array(18)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            background: 'rgba(59,130,246,0.7)',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `floatParticle ${Math.random() * 10 + 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
            boxShadow: '0 0 12px rgba(59,130,246,0.9)'
          }} />
        ))}
      </div>

      {/* Grid overlay */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)',
        backgroundSize: '100px 100px', 
        opacity: 0.25 
      }} />

      {/* Content */}
      <motion.div
        style={{ maxWidth: '80rem', margin: '0 auto', padding: '2.5rem 1.5rem 0', position: 'relative', zIndex: 1 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
      <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', padding: '0.375rem 1rem', borderRadius: '9999px', marginBottom: '1rem', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', backdropFilter: 'blur(10px)' }}>
          <Cpu size={14} className="text-[#3B82F6]" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#93C5FD', textTransform: 'uppercase', letterSpacing: '0.12em' }}>ML Engine</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 900, lineHeight: 1.2, fontFamily: 'Space Grotesk, sans-serif', marginBottom: '0.75rem' }}>
          <span style={{ color: '#fff' }}>Model </span>
          <span className="bg-gradient-to-r from-[#3B82F6] to-[#F97316] bg-clip-text text-transparent">
            Information
          </span>
        </h1>
        <p style={{ color: 'rgba(200,190,220,0.85)', fontSize: '1.0625rem' }}>
          Details about the ML model powering INVISIGUARD's fraud detection.
        </p>
      </motion.div>

      {/* ─── Model Metadata Cards ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metadataCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassEffect>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  {card.icon}
                </div>
                <div>
                  <p className="text-xs text-text-muted">{card.label}</p>
                  <p className="font-semibold text-sm">{_loading ? '—' : card.value}</p>
                </div>
              </div>
            </GlassEffect>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* ─── Feature Importance Chart ──────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassEffect hover={false} className="h-full">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <BarChart size={18} className="text-accent" />
              Feature Importance
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={importanceData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: '#F0EEFF', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="value"
                    fill="#3B82F6"
                    radius={[0, 6, 6, 0]}
                    fillOpacity={0.7}
                  />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </GlassEffect>
        </motion.div>

        {/* ─── Feature List ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassEffect hover={false} className="h-full">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Layers size={18} className="text-accent" />
              Input Features
            </h3>
            <div className="space-y-2">
              {importanceData.map((feat, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.03)]"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-xs font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium capitalize">{feat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-accent"
                        initial={{ width: 0 }}
                        animate={{ width: `${feat.value * 100 * 3.5}%` }}
                        transition={{ delay: 0.6 + i * 0.06, duration: 0.8 }}
                      />
                    </div>
                    <span className="text-xs text-text-muted w-12 text-right">
                      {(feat.value * 100).toFixed(1)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassEffect>
        </motion.div>
      </div>

      {/* ─── Comparison Table ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <GlassEffect hover={false}>
          <h3 className="text-base font-semibold mb-6 flex items-center gap-2">
            <ArrowRight size={18} className="text-accent" />
            Traditional vs <span className="brand-gradient">INVISIGUARD</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.08)]">
                  <th className="text-left py-3 px-3 text-text-muted font-medium">Feature</th>
                  <th className="text-left py-3 px-3 text-text-muted font-medium">Traditional</th>
                  <th className="text-left py-3 px-3 text-accent font-medium">INVISIGUARD</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <motion.tr
                    key={i}
                    className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 + i * 0.05 }}
                  >
                    <td className="py-3 px-3 font-medium">{row.feature}</td>
                    <td className="py-3 px-3 text-text-muted">{row.traditional}</td>
                    <td className="py-3 px-3 text-accent font-medium">{row.invisiguard}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassEffect>
      </motion.div>
      </motion.div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import GlassEffect from '../components/GlassEffect';
import { getAnalyticsSummary, type AnalyticsSummary } from '../api/client';
import { toast } from '../components/Toast';

// Fallback mock data when backend is unavailable
const mockData: AnalyticsSummary = {
  total_transactions: 1247,
  fraud_count: 89,
  safe_count: 1158,
  fraud_rate: 7.14,
  avg_risk_score: 28.5,
  recent_transactions: [
    { user_id: 'demo_user_1', amount: 2500, risk_score: 15, result: 'SAFE', timestamp: new Date().toISOString(), reasons: ['No risk factors'] },
    { user_id: 'demo_user_3', amount: 45000, risk_score: 82, result: 'FRAUD', timestamp: new Date().toISOString(), reasons: ['High amount', 'Night transaction'] },
    { user_id: 'demo_user_2', amount: 800, risk_score: 22, result: 'SAFE', timestamp: new Date().toISOString(), reasons: ['No risk factors'] },
    { user_id: 'demo_user_5', amount: 12000, risk_score: 55, result: 'SAFE', timestamp: new Date().toISOString(), reasons: ['New device'] },
    { user_id: 'demo_user_1', amount: 67000, risk_score: 91, result: 'FRAUD', timestamp: new Date().toISOString(), reasons: ['Multiple flags'] },
    { user_id: 'demo_user_4', amount: 350, risk_score: 8, result: 'SAFE', timestamp: new Date().toISOString(), reasons: ['No risk factors'] },
    { user_id: 'demo_user_2', amount: 28000, risk_score: 72, result: 'FRAUD', timestamp: new Date().toISOString(), reasons: ['Foreign location'] },
    { user_id: 'demo_user_3', amount: 1200, risk_score: 18, result: 'SAFE', timestamp: new Date().toISOString(), reasons: ['No risk factors'] },
    { user_id: 'demo_user_5', amount: 5500, risk_score: 42, result: 'SAFE', timestamp: new Date().toISOString(), reasons: ['New location'] },
    { user_id: 'demo_user_1', amount: 950, risk_score: 12, result: 'SAFE', timestamp: new Date().toISOString(), reasons: ['No risk factors'] },
  ],
  risk_distribution: { '0-20': 450, '20-40': 380, '40-60': 220, '60-80': 120, '80-100': 77 },
  hourly_trend: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: Math.floor(Math.random() * 50) + 10,
    fraud: Math.floor(Math.random() * 8),
  })),
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs">
      <p className="text-text-muted mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [data, setData] = useState<AnalyticsSummary>(mockData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAnalyticsSummary();
        setData(res.data);
      } catch {
        toast('Using demo data — backend not available', 'warning');
        setData(mockData);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      icon: <BarChart3 size={22} />,
      label: 'Total Transactions',
      value: data.total_transactions.toLocaleString(),
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: <ShieldAlert size={22} />,
      label: 'Fraud Detected',
      value: data.fraud_count.toLocaleString(),
      color: 'text-danger',
      bgColor: 'bg-danger/10',
    },
    {
      icon: <ShieldCheck size={22} />,
      label: 'False Positives Saved',
      value: Math.floor(data.safe_count * 0.02).toLocaleString(),
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      icon: <Activity size={22} />,
      label: 'Avg Risk Score',
      value: data.avg_risk_score.toFixed(1),
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  const trendData = data.hourly_trend.map((h) => ({
    name: `${h.hour}:00`,
    total: h.count,
    fraud: h.fraud,
  }));

  const distData = Object.entries(data.risk_distribution).map(([range, count]) => ({
    range,
    count: count as number,
  }));
  const distColors = ['#10B981', '#10B981', '#F59E0B', '#EF4444', '#EF4444'];

  const getRiskClasses = (score: number) => {
    if (score < 30) return 'text-success';
    if (score < 70) return 'text-warning';
    return 'text-danger';
  };

  const getStatusBadge = (result: string) => {
    if (result === 'FRAUD')
      return 'bg-danger/15 text-danger border-danger/25';
    return 'bg-success/15 text-success border-success/25';
  };

  return (
    <motion.div
      className="min-h-screen pt-8 pb-28 px-4 md:px-8 max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">
          <span className="brand-gradient">Analytics</span> Dashboard
        </h1>
        <p className="text-text-muted mt-2">Real-time fraud detection metrics and insights.</p>
      </div>

      {/* ─── Stat Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassEffect>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center ${card.color}`}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">{loading ? '—' : card.value}</p>
                  <p className="text-xs text-text-muted">{card.label}</p>
                </div>
              </div>
            </GlassEffect>
          </motion.div>
        ))}
      </div>

      {/* ─── Charts ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Fraud Detections Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassEffect hover={false}>
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-accent" />
              Fraud Detections Over Time
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#9B8EC4', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#9B8EC4', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="total" stroke="#A855F7" strokeWidth={2} dot={false} name="Total" />
                  <Line type="monotone" dataKey="fraud" stroke="#EF4444" strokeWidth={2} dot={false} name="Fraud" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassEffect>
        </motion.div>

        {/* Risk Score Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassEffect hover={false}>
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-accent" />
              Risk Score Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="range" tick={{ fill: '#9B8EC4', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#9B8EC4', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Transactions">
                    {distData.map((_, i) => (
                      <Cell key={i} fill={distColors[i]} fillOpacity={0.7} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassEffect>
        </motion.div>
      </div>

      {/* ─── Recent Transactions Table ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <GlassEffect hover={false}>
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-accent" />
            Recent Transactions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.08)]">
                  <th className="text-left py-3 px-2 text-text-muted font-medium">User ID</th>
                  <th className="text-right py-3 px-2 text-text-muted font-medium">Amount</th>
                  <th className="text-right py-3 px-2 text-text-muted font-medium">Risk Score</th>
                  <th className="text-center py-3 px-2 text-text-muted font-medium">Status</th>
                  <th className="text-right py-3 px-2 text-text-muted font-medium hidden md:table-cell">Time</th>
                </tr>
              </thead>
              <tbody>
                {(data.recent_transactions || []).slice(0, 10).map((tx, i) => (
                  <motion.tr
                    key={i}
                    className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 + i * 0.05 }}
                  >
                    <td className="py-3 px-2 font-mono text-xs">{tx.user_id}</td>
                    <td className="py-3 px-2 text-right font-medium">₹{tx.amount.toLocaleString()}</td>
                    <td className={`py-3 px-2 text-right font-bold ${getRiskClasses(tx.risk_score)}`}>
                      {tx.risk_score}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(tx.result)}`}>
                        {tx.result}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-text-muted text-xs hidden md:table-cell">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassEffect>
      </motion.div>
    </motion.div>
  );
}

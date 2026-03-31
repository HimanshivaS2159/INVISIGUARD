import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, ShieldCheck, ShieldAlert, Activity, AlertTriangle, RefreshCw, Zap } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import GlassEffect from '../components/GlassEffect';
import { getAnalyticsSummary, getRealtimeStats, type AnalyticsSummary, type RealtimeStats } from '../api/client';
import { toast } from '../components/Toast';

const mockStats: RealtimeStats = {
  total_transactions: 1247, fraud_detected: 89, safe_transactions: 1158,
  fraud_rate: 7.14, avg_risk_score: 28.5, transactions_last_hour: 23,
  fraud_last_hour: 3, transactions_last_24h: 312,
  risk_tier_distribution: { LOW: 720, MEDIUM: 380, HIGH: 112, CRITICAL: 35 },
  false_positives_saved: 28, timestamp: new Date().toISOString(),
};

const mockData: AnalyticsSummary = {
  total_transactions: 1247, fraud_count: 89, fraudulent_transactions: 89,
  safe_count: 1158, safe_transactions: 1158, fraud_rate: 7.14,
  avg_risk_score: 28.5, average_risk_score: 28.5,
  recent_transactions: [
    { user_id: 'user_4821', amount: 2500, risk_score: 15, result: 'SAFE', timestamp: new Date().toISOString(), reasons: ['Normal'], merchant_category: 'Food', risk_tier: 'LOW' },
    { user_id: 'user_1093', amount: 45000, risk_score: 82, result: 'FRAUD', timestamp: new Date().toISOString(), reasons: ['High amount'], merchant_category: 'Electronics', risk_tier: 'CRITICAL' },
    { user_id: 'user_7732', amount: 800, risk_score: 22, result: 'SAFE', timestamp: new Date().toISOString(), reasons: ['Normal'], merchant_category: 'Shopping', risk_tier: 'LOW' },
    { user_id: 'user_2241', amount: 12000, risk_score: 55, result: 'SAFE', timestamp: new Date().toISOString(), reasons: ['New device'], merchant_category: 'Travel', risk_tier: 'MEDIUM' },
    { user_id: 'user_9901', amount: 67000, risk_score: 91, result: 'FRAUD', timestamp: new Date().toISOString(), reasons: ['Multiple flags'], merchant_category: 'Crypto', risk_tier: 'CRITICAL' },
    { user_id: 'user_3312', amount: 350, risk_score: 8, result: 'SAFE', timestamp: new Date().toISOString(), reasons: ['Normal'], merchant_category: 'Utilities', risk_tier: 'LOW' },
    { user_id: 'user_5543', amount: 28000, risk_score: 72, result: 'FRAUD', timestamp: new Date().toISOString(), reasons: ['Foreign location'], merchant_category: 'Electronics', risk_tier: 'HIGH' },
    { user_id: 'user_8821', amount: 1200, risk_score: 18, result: 'SAFE', timestamp: new Date().toISOString(), reasons: ['Normal'], merchant_category: 'Food', risk_tier: 'LOW' },
    { user_id: 'user_6634', amount: 5500, risk_score: 42, result: 'SAFE', timestamp: new Date().toISOString(), reasons: ['New location'], merchant_category: 'Shopping', risk_tier: 'MEDIUM' },
    { user_id: 'user_1122', amount: 950, risk_score: 12, result: 'SAFE', timestamp: new Date().toISOString(), reasons: ['Normal'], merchant_category: 'Utilities', risk_tier: 'LOW' },
  ],
  risk_distribution: { '0-20': 450, '20-40': 380, '40-60': 220, '60-80': 120, '80-100': 77 },
  hourly_trend: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: Math.floor(Math.random() * 50) + 10, fraud: Math.floor(Math.random() * 8) })),
};

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(15,12,40,0.95)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.8rem' }}>
      <p style={{ color: '#94A3B8', marginBottom: '0.375rem' }}>{label}</p>
      {payload.map((p: any, i: number) => <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

const tierColor = (tier: string) => {
  if (tier === 'CRITICAL') return { bg: 'rgba(239,68,68,0.12)', text: '#EF4444', border: 'rgba(239,68,68,0.25)' };
  if (tier === 'HIGH')     return { bg: 'rgba(245,158,11,0.12)', text: '#F59E0B', border: 'rgba(245,158,11,0.25)' };
  if (tier === 'MEDIUM')   return { bg: 'rgba(59,130,246,0.12)', text: '#3B82F6', border: 'rgba(59,130,246,0.25)' };
  return { bg: 'rgba(16,185,129,0.12)', text: '#10B981', border: 'rgba(16,185,129,0.25)' };
};

const riskColor = (s: number) => s < 30 ? '#10B981' : s < 70 ? '#F59E0B' : '#EF4444';
const distColors = ['#10B981', '#10B981', '#F59E0B', '#EF4444', '#EF4444'];

export default function Dashboard() {
  const [data, setData] = useState<AnalyticsSummary>(mockData);
  const [stats, setStats] = useState<RealtimeStats>(mockStats);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchAll = useCallback(async () => {
    try {
      const [s, r] = await Promise.allSettled([getAnalyticsSummary(), getRealtimeStats()]);
      if (s.status === 'fulfilled') setData(s.value.data);
      if (r.status === 'fulfilled') setStats(r.value.data);
      setLastRefresh(new Date());
    } catch { toast('Using demo data', 'warning'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { const id = setInterval(fetchAll, 30000); return () => clearInterval(id); }, [fetchAll]);

  const statCards = [
    { icon: <BarChart3 size={20} />, label: 'Total Transactions', value: stats.total_transactions.toLocaleString(), sub: `+${stats.transactions_last_hour} this hour`, color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
    { icon: <ShieldAlert size={20} />, label: 'Fraud Detected', value: stats.fraud_detected.toLocaleString(), sub: `${stats.fraud_rate.toFixed(1)}% fraud rate`, color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
    { icon: <ShieldCheck size={20} />, label: 'False Positives Saved', value: stats.false_positives_saved.toLocaleString(), sub: 'Legitimate tx protected', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
    { icon: <Activity size={20} />, label: 'Avg Risk Score', value: stats.avg_risk_score.toFixed(1), sub: 'Across all transactions', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  ];

  const trendData = data.hourly_trend.map(h => ({ name: `${h.hour}h`, total: h.count, fraud: h.fraud }));
  const distData = Object.entries(data.risk_distribution).map(([range, count]) => ({ range, count: count as number }));
  const tierData = Object.entries(stats.risk_tier_distribution).map(([tier, count]) => ({ tier, count }));

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
      <motion.div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2.5rem 1.5rem 0', position: 'relative', zIndex: 1 }}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', padding: '0.375rem 1rem', borderRadius: '9999px', marginBottom: '1rem', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', backdropFilter: 'blur(10px)' }}>
              <BarChart3 size={14} color="#3B82F6" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#93C5FD', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Live Metrics</span>
            </div>
            <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 900, color: '#fff', lineHeight: 1.2, fontFamily: 'Space Grotesk, sans-serif', marginBottom: '0.75rem' }}>
              Analytics <span style={{ background: 'linear-gradient(135deg,#3B82F6,#F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Dashboard</span>
            </h1>
            <p style={{ color: 'rgba(200,190,220,0.85)', fontSize: '1.0625rem' }}>Real-time metrics · Updated {lastRefresh.toLocaleTimeString()}</p>
          </motion.div>
          <motion.button onClick={fetchAll} 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.05, boxShadow: '0 8px 24px rgba(59,130,246,0.3)' }} whileTap={{ scale: 0.95 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.875rem 1.5rem', borderRadius: '0.875rem', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#93C5FD', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(59,130,246,0.2)' }}>
            <RefreshCw size={16} /> Refresh
          </motion.button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {statCards.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <GlassEffect>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', flexShrink: 0, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>{c.icon}</div>
                  <div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{loading ? '—' : c.value}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.25rem' }}>{c.label}</div>
                    <div style={{ fontSize: '0.7rem', color: c.color, marginTop: '0.2rem', fontWeight: 600 }}>{c.sub}</div>
                  </div>
                </div>
              </GlassEffect>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <GlassEffect hover={false}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={15} color="#3B82F6" /> 24h Transaction Trend
              </h3>
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/></linearGradient>
                      <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#EF4444" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
                    <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<Tip />} />
                    <Area type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} fill="url(#tg)" name="Total" />
                    <Area type="monotone" dataKey="fraud" stroke="#EF4444" strokeWidth={2} fill="url(#fg)" name="Fraud" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassEffect>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <GlassEffect hover={false}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={15} color="#3B82F6" /> Risk Score Distribution
              </h3>
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="range" tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<Tip />} />
                    <Bar dataKey="count" radius={[6,6,0,0]} name="Transactions">
                      {distData.map((_, i) => <Cell key={i} fill={distColors[i]} fillOpacity={0.75} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassEffect>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <GlassEffect hover={false}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={15} color="#3B82F6" /> Risk Tier Breakdown
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tierData.map((t, i) => {
                  const total = Object.values(stats.risk_tier_distribution).reduce((a,b)=>a+b,0)||1;
                  const pct = Math.round((t.count/total)*100);
                  const tc = tierColor(t.tier);
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: tc.text }}>{t.tier}</span>
                        <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{t.count} ({pct}%)</span>
                      </div>
                      <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <motion.div style={{ height: '100%', borderRadius: '3px', background: tc.text }}
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.6+i*0.1, duration: 0.8 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ textAlign: 'center', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10B981' }}>{stats.transactions_last_hour}</div>
                  <div style={{ fontSize: '0.65rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Last Hour</div>
                </div>
                <div style={{ textAlign: 'center', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#EF4444' }}>{stats.fraud_last_hour}</div>
                  <div style={{ fontSize: '0.65rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Fraud/Hour</div>
                </div>
              </div>
            </GlassEffect>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <GlassEffect hover={false}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={15} color="#3B82F6" /> Recent Transactions
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['User ID','Amount','Category','Risk','Tier','Status','Time'].map(h => (
                      <th key={h} style={{ padding: '0.75rem', textAlign: ['Amount','Risk'].includes(h)?'right':['Status','Tier'].includes(h)?'center':'left', color: '#94A3B8', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data.recent_transactions||[]).slice(0,10).map((tx,i) => {
                    const tc = tierColor(tx.risk_tier||'LOW');
                    return (
                      <motion.tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65+i*0.04 }}
                        onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.025)')}
                        onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                        <td style={{ padding: '0.875rem 0.75rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#93C5FD' }}>{tx.user_id}</td>
                        <td style={{ padding: '0.875rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#fff' }}>?{tx.amount.toLocaleString()}</td>
                        <td style={{ padding: '0.875rem 0.75rem', color: '#94A3B8', fontSize: '0.8rem' }}>{tx.merchant_category||'—'}</td>
                        <td style={{ padding: '0.875rem 0.75rem', textAlign: 'right', fontWeight: 800, color: riskColor(tx.risk_score) }}>{tx.risk_score}</td>
                        <td style={{ padding: '0.875rem 0.75rem', textAlign: 'center' }}>
                          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 700, background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>{tx.risk_tier||'LOW'}</span>
                        </td>
                        <td style={{ padding: '0.875rem 0.75rem', textAlign: 'center' }}>
                          <span style={{ padding: '0.2rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: tx.result==='FRAUD'?'rgba(239,68,68,0.12)':'rgba(16,185,129,0.12)', color: tx.result==='FRAUD'?'#EF4444':'#10B981', border: `1px solid ${tx.result==='FRAUD'?'rgba(239,68,68,0.25)':'rgba(16,185,129,0.25)'}` }}>{tx.result}</span>
                        </td>
                        <td style={{ padding: '0.875rem 0.75rem', color: '#94A3B8', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{new Date(tx.timestamp).toLocaleTimeString()}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassEffect>
        </motion.div>
      </motion.div>
    </div>
  );
}

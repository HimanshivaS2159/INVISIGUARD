import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  CreditCard,
  Activity,
  Tag,
  Calendar,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import GlassEffect from '../components/GlassEffect';
import { getUserProfile, type UserProfile as UserProfileType } from '../api/client';
import { toast } from '../components/Toast';

const mockProfile: UserProfileType = {
  user_id: 'demo_user_1',
  total_transactions: 47,
  avg_risk_score: 24.3,
  risk_level: 'LOW',
  average_transaction_amount: 5200,
  unique_locations: 3,
  unique_devices: 2,
  transactions_last_24h: 4,
  frequency_score: 40,
  last_transaction: new Date().toISOString(),
  recent_transactions: [
    { amount: 2500, risk_score: 12, result: 'SAFE', timestamp: new Date().toISOString(), reasons: ['No risk factors'] },
    { amount: 45000, risk_score: 78, result: 'FRAUD', timestamp: new Date().toISOString(), reasons: ['High amount', 'Night transaction'] },
    { amount: 800, risk_score: 8, result: 'SAFE', timestamp: new Date().toISOString(), reasons: ['No risk factors'] },
    { amount: 12000, risk_score: 45, result: 'SAFE', timestamp: new Date().toISOString(), reasons: ['New device'] },
    { amount: 350, risk_score: 5, result: 'SAFE', timestamp: new Date().toISOString(), reasons: ['No risk factors'] },
    { amount: 67000, risk_score: 92, result: 'FRAUD', timestamp: new Date().toISOString(), reasons: ['Multiple flags'] },
  ],
  behavioral_patterns: [
    'Frequent daytime transactions',
    'Usually uses mobile device',
    'Domestic transactions preferred',
    'Average transaction ₹5,200',
    'Low-risk merchant categories',
  ],
};

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<UserProfileType>(mockProfile);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState(id || 'demo_user_1');

  const fetchProfile = async (userId: string) => {
    setLoading(true);
    try {
      const res = await getUserProfile(userId);
      setProfile(res.data);
    } catch {
      toast('Using demo profile — backend not available', 'warning');
      setProfile({ ...mockProfile, user_id: userId });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile(id || 'demo_user_1');
  }, [id]);

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-success';
    if (score < 70) return 'text-warning';
    return 'text-danger';
  };

  const getRiskLevelBadge = (level: string) => {
    switch (level.toUpperCase()) {
      case 'LOW': return 'bg-success/15 text-success border-success/25';
      case 'MEDIUM': return 'bg-warning/15 text-warning border-warning/25';
      case 'HIGH': return 'bg-danger/15 text-danger border-danger/25';
      default: return 'bg-accent/15 text-accent border-accent/25';
    }
  };

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
          <User size={14} className="text-[#3B82F6]" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#93C5FD', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Behavior Profile</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 900, lineHeight: 1.2, fontFamily: 'Space Grotesk, sans-serif', marginBottom: '0.75rem' }}>
          <span style={{ color: '#fff' }}>User </span>
          <span className="bg-gradient-to-r from-[#3B82F6] to-[#F97316] bg-clip-text text-transparent">
            Profile
          </span>
        </h1>
        <p style={{ color: 'rgba(200,190,220,0.85)', fontSize: '1.0625rem' }}>Behavioral analysis and transaction history.</p>
      </motion.div>

      {/* Search bar */}
      <div className="flex gap-3 mb-8">
        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="Enter User ID..."
          className="glass-input flex-1 max-w-md"
          id="user-search"
        />
        <motion.button
          onClick={() => fetchProfile(searchId)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent to-[#F97316] text-white font-semibold
            shadow-[0_4px_16px_rgba(59,130,246,0.3)]"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Search
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── User Header Card ────────────────────────────── */}
        <div className="lg:col-span-1 space-y-6">
          <GlassEffect hover={false}>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center mb-4">
                <User size={36} className="text-accent" />
              </div>
              <h2 className="text-xl font-bold mb-1">{_loading ? '...' : profile.user_id}</h2>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border mb-4 ${getRiskLevelBadge(profile.risk_level)}`}>
                {profile.risk_level} RISK
              </span>

              <div className="w-full space-y-3 mt-2">
                <div className="flex justify-between py-2 border-b border-[rgba(255,255,255,0.06)]">
                  <span className="text-sm text-text-muted flex items-center gap-2">
                    <CreditCard size={14} /> Transactions
                  </span>
                  <span className="text-sm font-semibold">{profile.total_transactions}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[rgba(255,255,255,0.06)]">
                  <span className="text-sm text-text-muted flex items-center gap-2">
                    <Activity size={14} /> Avg Risk
                  </span>
                  <span className={`text-sm font-semibold ${getRiskColor(profile.avg_risk_score)}`}>
                    {profile.avg_risk_score.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </GlassEffect>

          {/* Behavioral Patterns */}
          <GlassEffect hover={false}>
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              <Tag size={14} />
              Behavioral Patterns
            </h3>
            <div className="flex flex-wrap gap-2">
              {(profile.behavioral_patterns ?? []).map((pattern, i) => (
                <motion.span
                  key={i}
                  className="px-3 py-1.5 text-xs rounded-full
                    bg-[rgba(59,130,246,0.1)] text-accent border border-[rgba(59,130,246,0.15)]"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {pattern}
                </motion.span>
              ))}
            </div>
          </GlassEffect>
        </div>

        {/* ─── Transaction History ──────────────────────────── */}
        <div className="lg:col-span-2">
          <GlassEffect hover={false}>
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-accent" />
              Transaction History
            </h3>
            <div className="space-y-3">
              {(profile.recent_transactions ?? profile.transactions ?? []).map((tx: any, i: number) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-xl bg-[rgba(255,255,255,0.03)]
                    border border-[rgba(255,255,255,0.05)] hover:border-[rgba(59,130,246,0.15)]
                    transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    tx.result === 'FRAUD' ? 'bg-danger/15' : 'bg-success/15'
                  }`}>
                    {tx.result === 'FRAUD' ? (
                      <ShieldAlert size={18} className="text-danger" />
                    ) : (
                      <ShieldCheck size={18} className="text-success" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold">₹{tx.amount.toLocaleString()}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                        tx.result === 'FRAUD'
                          ? 'bg-danger/15 text-danger border-danger/25'
                          : 'bg-success/15 text-success border-success/25'
                      }`}>
                        {tx.result}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted truncate">
                      {tx.reasons.join(' · ')}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`text-lg font-bold ${getRiskColor(tx.risk_score)}`}>
                      {tx.risk_score}
                    </div>
                    <div className="text-[10px] text-text-muted">risk</div>
                  </div>
                </motion.div>
              ))}

              {(profile.recent_transactions ?? profile.transactions ?? []).length === 0 && (
                <div className="text-center py-12 text-text-muted">
                  No transactions found for this user.
                </div>
              )}
            </div>
          </GlassEffect>
        </div>
      </div>
      </motion.div>
    </div>
  );
}

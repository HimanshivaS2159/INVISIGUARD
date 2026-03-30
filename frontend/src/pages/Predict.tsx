import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Globe, Smartphone, Monitor, Tablet, HelpCircle,
  MapPin, Clock, CreditCard, AlertTriangle, CheckCircle,
  ShieldAlert, ChevronDown, Loader2,
} from 'lucide-react';
import Select from '../components/Select';
import { predictFraud, type PredictResponse } from '../api/client';
import { toast } from '../components/Toast';

const merchantOptions = [
  { value: 'Food',        label: 'Food & Dining',  description: 'Restaurants, grocery, delivery' },
  { value: 'Travel',      label: 'Travel',          description: 'Airlines, hotels, ride-sharing' },
  { value: 'Shopping',    label: 'Shopping',        description: 'Retail, fashion, online marketplace' },
  { value: 'Electronics', label: 'Electronics',     description: 'Gadgets, appliances, tech' },
  { value: 'Utilities',   label: 'Utilities',       description: 'Bills, subscriptions, payments' },
  { value: 'Other',       label: 'Other',           description: 'Miscellaneous transactions' },
];
const deviceOptions = [
  { value: 'Mobile',  label: 'Mobile',  icon: <Smartphone size={15} /> },
  { value: 'Desktop', label: 'Desktop', icon: <Monitor size={15} /> },
  { value: 'Tablet',  label: 'Tablet',  icon: <Tablet size={15} /> },
  { value: 'Unknown', label: 'Unknown', icon: <HelpCircle size={15} /> },
];
const timeOptions = [
  { value: 'Morning',   label: 'Morning',   description: '6 AM – 12 PM' },
  { value: 'Afternoon', label: 'Afternoon', description: '12 PM – 5 PM' },
  { value: 'Evening',   label: 'Evening',   description: '5 PM – 9 PM' },
  { value: 'Night',     label: 'Night',     description: '9 PM – 6 AM' },
];

type Status = 'idle' | 'loading' | 'result';

const getRiskColor  = (s: number) => s < 30 ? '#10B981' : s < 70 ? '#F59E0B' : '#EF4444';
const getRiskLabel  = (s: number) => s < 30 ? 'SAFE' : s < 70 ? 'SUSPICIOUS' : 'FRAUD';
const getRiskBadge  = (s: number) =>
  s < 30 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
  : s < 70 ? 'bg-amber-500/15 text-amber-400 border-amber-500/25'
  : 'bg-red-500/15 text-red-400 border-red-500/25';

function Toggle({ label, icon, checked, onChange }: {
  label: string; icon: React.ReactNode; checked: boolean; onChange: () => void;
}) {
  return (
    <div
      onClick={onChange}
      className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer select-none
        bg-[rgba(10,10,26,0.5)] border border-[rgba(255,255,255,0.08)]
        hover:border-[rgba(168,85,247,0.25)] transition-colors"
    >
      <span className="flex items-center gap-2.5 text-sm font-medium text-[#F0EEFF]">
        <span className="text-[#9B8EC4]">{icon}</span>
        {label}
      </span>
      <div className={`toggle-track ${checked ? 'active' : ''}`}>
        <div className="toggle-thumb" />
      </div>
    </div>
  );
}

function Gauge({ score }: { score: number }) {
  const r = 80;
  const circ = Math.PI * r;
  const color = getRiskColor(score);
  return (
    <svg width="220" height="130" viewBox="0 0 220 130" className="mx-auto block">
      <defs>
        <linearGradient id="gGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#10B981" />
          <stop offset="50%"  stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
      </defs>
      <path d="M 30 115 A 80 80 0 0 1 190 115" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="14" strokeLinecap="round" />
      <motion.path
        d="M 30 115 A 80 80 0 0 1 190 115"
        fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (score / 100) * circ }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ filter: `drop-shadow(0 0 10px ${color}60)` }}
      />
      <motion.text x="110" y="96" textAnchor="middle" fill={color}
        fontSize="40" fontWeight="800" fontFamily="Space Grotesk"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        {Math.round(score)}
      </motion.text>
      <text x="110" y="114" textAnchor="middle" fill="#9B8EC4" fontSize="11" fontFamily="Inter" letterSpacing="2">
        RISK SCORE
      </text>
    </svg>
  );
}

export default function Predict() {
  const [userId,            setUserId]            = useState('demo_user_1');
  const [amount,            setAmount]            = useState('2500');
  const [merchant,          setMerchant]          = useState('Shopping');
  const [location,          setLocation]          = useState('Mumbai, IN');
  const [device,            setDevice]            = useState('Mobile');
  const [timeOfDay,         setTimeOfDay]         = useState('Evening');
  const [isNewDevice,       setIsNewDevice]       = useState(false);
  const [isForeignLocation, setIsForeignLocation] = useState(false);
  const [status,            setStatus]            = useState<Status>('idle');
  const [result,            setResult]            = useState<PredictResponse | null>(null);
  const [showJson,          setShowJson]          = useState(false);

  const handleSubmit = async () => {
    setStatus('loading'); setResult(null);
    try {
      const res = await predictFraud({
        amount: parseFloat(amount) || 0,
        is_night: timeOfDay === 'Night' ? 1 : 0,
        new_location: isForeignLocation ? 1 : 0,
        new_device: isNewDevice ? 1 : 0,
        user_id: userId || 'anonymous',
      });
      setResult(res.data); setStatus('result');
      toast(res.data.result === 'FRAUD' ? 'High risk transaction detected!' : 'Transaction appears safe',
        res.data.result === 'FRAUD' ? 'error' : 'success');
    } catch {
      toast('Failed to analyze. Is the backend running?', 'error');
      setStatus('idle');
    }
  };

  const flags = result ? [
    isForeignLocation                              && { icon: <Globe size={15} />,      label: 'Foreign / New Location' },
    isNewDevice                                    && { icon: <Smartphone size={15} />, label: 'Unknown Device' },
    timeOfDay === 'Night'                          && { icon: <Clock size={15} />,      label: 'Unusual Hour (Night)' },
    parseFloat(amount) > 10000                     && { icon: <CreditCard size={15} />, label: 'Large Amount' },
    isForeignLocation && parseFloat(amount) > 5000 && { icon: <MapPin size={15} />,    label: 'High-Risk Region + Large Tx' },
  ].filter(Boolean) : [];

  return (
    <div className="min-h-screen pb-28">
      {/* Page header */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3
            bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.2)]">
            <Search size={12} className="text-[#A855F7]" />
            <span className="text-xs font-semibold text-[#C084FC] uppercase tracking-widest">Live Analysis</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
            Fraud{' '}
            <span className="bg-gradient-to-r from-[#A855F7] to-[#6366F1] bg-clip-text text-transparent">
              Prediction
            </span>
          </h1>
          <p className="text-[#9B8EC4] mt-2 text-base">
            Enter transaction details for real-time AI behavioral analysis.
          </p>
        </motion.div>
      </div>

      {/* Two-column layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* ── Left: Input Form ── */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="rounded-2xl p-6 bg-[rgba(15,12,40,0.85)] backdrop-blur-xl
              border border-[rgba(255,255,255,0.1)]
              shadow-[0_8px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.07)]">

              <h2 className="text-base font-bold text-white mb-6 flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-[rgba(168,85,247,0.15)] flex items-center justify-center">
                  <Search size={16} className="text-[#A855F7]" />
                </span>
                Transaction Details
              </h2>

              <div className="space-y-4">
                {/* User ID + Amount row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#9B8EC4] uppercase tracking-wider mb-2">User ID</label>
                    <input type="text" value={userId} onChange={e => setUserId(e.target.value)}
                      className="glass-input" placeholder="user_12345" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#9B8EC4] uppercase tracking-wider mb-2">Amount (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B8EC4] font-medium">₹</span>
                      <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                        className="glass-input pl-8" placeholder="2500" />
                    </div>
                  </div>
                </div>

                {/* Merchant + Location row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select label="Merchant Category" options={merchantOptions} value={merchant} onChange={setMerchant} />
                  <div>
                    <label className="block text-xs font-semibold text-[#9B8EC4] uppercase tracking-wider mb-2">Location</label>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                      className="glass-input" placeholder="Mumbai, IN" />
                  </div>
                </div>

                {/* Device + Time row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select label="Device Type" options={deviceOptions} value={device} onChange={setDevice} />
                  <Select label="Time of Day"  options={timeOptions}   value={timeOfDay} onChange={setTimeOfDay} />
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Toggle label="New / Unknown Device"    icon={<Smartphone size={15} />} checked={isNewDevice}       onChange={() => setIsNewDevice(!isNewDevice)} />
                  <Toggle label="Foreign / New Location"  icon={<Globe size={15} />}      checked={isForeignLocation} onChange={() => setIsForeignLocation(!isForeignLocation)} />
                </div>

                {/* Submit */}
                <motion.button
                  onClick={handleSubmit}
                  disabled={status === 'loading'}
                  className="w-full py-4 rounded-xl font-bold text-white text-base
                    flex items-center justify-center gap-2.5
                    shadow-[0_8px_24px_rgba(168,85,247,0.35)]
                    disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{ background: 'linear-gradient(135deg, #A855F7, #6366F1)' }}
                  whileHover={status !== 'loading' ? { scale: 1.02, boxShadow: '0 12px 32px rgba(168,85,247,0.5)' } : {}}
                  whileTap={status !== 'loading' ? { scale: 0.98 } : {}}
                >
                  {status === 'loading'
                    ? <><Loader2 size={18} className="animate-spin" /> Analyzing behavior...</>
                    : <><Search size={18} /> Analyze Transaction</>}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* ── Right: Results ── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
            <AnimatePresence mode="wait">

              {/* Idle */}
              {status === 'idle' && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="rounded-2xl p-8 flex flex-col items-center justify-center min-h-[420px] text-center
                    bg-[rgba(15,12,40,0.85)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)]
                    shadow-[0_8px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.07)]">
                    <div className="w-20 h-20 rounded-2xl bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.15)]
                      flex items-center justify-center mb-5">
                      <Search size={32} className="text-[#A855F7]/50" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Awaiting Analysis</h3>
                    <p className="text-sm text-[#9B8EC4] max-w-xs leading-relaxed">
                      Fill in the transaction details on the left and click "Analyze Transaction" to see the AI result.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Loading */}
              {status === 'loading' && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="rounded-2xl p-8 flex flex-col items-center justify-center min-h-[420px] text-center
                    bg-[rgba(15,12,40,0.85)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)]
                    shadow-[0_8px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.07)]">
                    <div className="relative w-24 h-24 mb-6">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="absolute inset-0 rounded-full border-2 border-[#A855F7]/30"
                          animate={{ scale: [1, 1.5 - i * 0.1, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} />
                      ))}
                      <div className="absolute inset-5 rounded-full bg-[rgba(168,85,247,0.15)] flex items-center justify-center">
                        <Loader2 size={26} className="text-[#A855F7] animate-spin" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-[#A855F7] mb-1">Analyzing behavior...</h3>
                    <p className="text-sm text-[#9B8EC4]">ML model + behavioral + location engine</p>
                  </div>
                </motion.div>
              )}

              {/* Result */}
              {status === 'result' && result && (
                <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="space-y-4">

                  {/* Gauge card */}
                  <div className="rounded-2xl p-6 bg-[rgba(15,12,40,0.85)] backdrop-blur-xl
                    border border-[rgba(255,255,255,0.1)] shadow-[0_8px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.07)]">
                    <Gauge score={result.risk_score} />
                    <div className="flex justify-center mt-5">
                      <motion.div
                        className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full border text-base font-bold ${getRiskBadge(result.risk_score)}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.9, type: 'spring', stiffness: 300 }}
                      >
                        {result.risk_score >= 70 ? <ShieldAlert size={18} />
                          : result.risk_score >= 30 ? <AlertTriangle size={18} />
                          : <CheckCircle size={18} />}
                        {getRiskLabel(result.risk_score)}
                      </motion.div>
                    </div>
                    {/* Score breakdown */}
                    <div className="grid grid-cols-3 gap-3 mt-5">
                      {[
                        { label: 'ML Score',       val: `${result.analysis.ml_model.score.toFixed(0)}%` },
                        { label: 'Behavior Score', val: `${result.analysis.behavioral.score}` },
                        { label: 'Confidence',     val: `${(result.confidence * 100).toFixed(0)}%` },
                      ].map((s, i) => (
                        <div key={i} className="text-center p-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)]">
                          <div className="text-lg font-black text-white">{s.val}</div>
                          <div className="text-[10px] text-[#9B8EC4] uppercase tracking-wider mt-0.5">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Behavioral flags */}
                  {flags.length > 0 && (
                    <div className="rounded-2xl p-5 bg-[rgba(15,12,40,0.85)] backdrop-blur-xl
                      border border-[rgba(255,255,255,0.1)] shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
                      <h3 className="text-xs font-bold text-[#9B8EC4] uppercase tracking-widest mb-3">Behavioral Flags</h3>
                      <div className="space-y-2">
                        {flags.map((f: any, i: number) => (
                          <motion.div key={i}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.15)]"
                            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 + i * 0.08 }}>
                            <span className="text-amber-400">{f.icon}</span>
                            <span className="text-sm font-medium text-white">{f.label}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Explainability */}
                  <div className="rounded-2xl p-5 bg-[rgba(15,12,40,0.85)] backdrop-blur-xl
                    border border-[rgba(255,255,255,0.1)] shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
                    <h3 className="text-xs font-bold text-[#9B8EC4] uppercase tracking-widest mb-3">Why flagged?</h3>
                    <div className="space-y-2">
                      {result.reasons.map((r, i) => (
                        <motion.div key={i}
                          className="flex items-start gap-3 py-2 border-b border-[rgba(255,255,255,0.05)] last:border-0"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 + i * 0.08 }}>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] mt-1.5 shrink-0" />
                          <span className="text-sm text-[#F0EEFF]/85 leading-relaxed">{r}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Raw JSON */}
                  <div className="rounded-2xl overflow-hidden bg-[rgba(15,12,40,0.85)] backdrop-blur-xl
                    border border-[rgba(255,255,255,0.1)] shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
                    <button onClick={() => setShowJson(!showJson)}
                      className="w-full flex items-center justify-between px-5 py-3.5 text-sm text-[#9B8EC4] hover:text-white transition-colors">
                      <span className="font-medium">Raw API Response</span>
                      <motion.span animate={{ rotate: showJson ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={15} />
                      </motion.span>
                    </button>
                    <AnimatePresence>
                      {showJson && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <pre className="px-5 pb-5 text-xs text-[#9B8EC4]/80 overflow-x-auto whitespace-pre-wrap break-all border-t border-[rgba(255,255,255,0.06)]">
                            {JSON.stringify(result, null, 2)}
                          </pre>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

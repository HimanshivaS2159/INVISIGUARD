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

const getRiskColor = (s: number) => s < 30 ? '#10B981' : s < 70 ? '#F59E0B' : '#EF4444';
const getRiskLabel = (s: number) => s < 30 ? 'SAFE' : s < 70 ? 'SUSPICIOUS' : 'FRAUD';
const getRiskBadge = (s: number) =>
  s < 30 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
  : s < 70 ? 'bg-amber-500/15 text-amber-400 border-amber-500/25'
  : 'bg-red-500/15 text-red-400 border-red-500/25';

function Toggle({ label, icon, checked, onChange }: {
  label: string; icon: React.ReactNode; checked: boolean; onChange: () => void;
}) {
  return (
    <div onClick={onChange} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.75rem 1rem', borderRadius: '0.75rem', cursor: 'pointer', userSelect: 'none',
      background: 'rgba(10,10,26,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem',
        fontWeight: 500, color: '#F0EEFF' }}>
        <span style={{ color: '#9B8EC4' }}>{icon}</span>{label}
      </span>
      <div className={`toggle-track ${checked ? 'active' : ''}`}><div className="toggle-thumb" /></div>
    </div>
  );
}

function Gauge({ score }: { score: number }) {
  const circ = Math.PI * 80;
  const color = getRiskColor(score);
  return (
    <svg width="220" height="130" viewBox="0 0 220 130" style={{ display: 'block', margin: '0 auto' }}>
      <path d="M 30 115 A 80 80 0 0 1 190 115" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="14" strokeLinecap="round" />
      <motion.path d="M 30 115 A 80 80 0 0 1 190 115" fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
        strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (score / 100) * circ }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ filter: `drop-shadow(0 0 10px ${color}60)` }} />
      <motion.text x="110" y="96" textAnchor="middle" fill={color} fontSize="40" fontWeight="800"
        fontFamily="Space Grotesk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        {Math.round(score)}
      </motion.text>
      <text x="110" y="114" textAnchor="middle" fill="#9B8EC4" fontSize="11" fontFamily="Inter" letterSpacing="2">
        RISK SCORE
      </text>
    </svg>
  );
}

const card = {
  background: 'rgba(15,12,40,0.88)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '1rem',
  boxShadow: '0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07)',
};

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

  const labelStyle = { display: 'block', fontSize: '0.7rem', fontWeight: 700,
    color: '#9B8EC4', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '0.5rem' };

  return (
    /* Full-width page with dark overlay */
    <div style={{ width: '100%', minHeight: '100vh', background: 'rgba(8,6,24,0.82)', paddingBottom: '7rem' }}>

      {/* Centered content wrapper */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2.5rem 1.5rem 0' }}>

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.25rem 0.75rem', borderRadius: '9999px', marginBottom: '0.75rem',
            background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)' }}>
            <Search size={11} color="#A855F7" />
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#C084FC',
              textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live Analysis</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>
            Fraud{' '}
            <span style={{ background: 'linear-gradient(135deg,#A855F7,#6366F1)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Prediction
            </span>
          </h1>
          <p style={{ color: '#9B8EC4', marginTop: '0.5rem', fontSize: '0.9375rem' }}>
            Enter transaction details for real-time AI behavioral analysis.
          </p>
        </motion.div>

        {/* Two-column grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '1.5rem', alignItems: 'start' }}>

          {/* ── LEFT: Form ── */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div style={{ ...card, padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', background: 'rgba(168,85,247,0.15)' }}>
                  <Search size={15} color="#A855F7" />
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#fff' }}>Transaction Details</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* User ID + Amount */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={labelStyle}>User ID</label>
                    <input type="text" value={userId} onChange={e => setUserId(e.target.value)}
                      className="glass-input" placeholder="user_12345" />
                  </div>
                  <div>
                    <label style={labelStyle}>Amount (₹)</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                        color: '#9B8EC4', fontWeight: 500 }}>₹</span>
                      <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                        className="glass-input" style={{ paddingLeft: '2rem' }} placeholder="2500" />
                    </div>
                  </div>
                </div>

                {/* Merchant + Location */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <Select label="Merchant Category" options={merchantOptions} value={merchant} onChange={setMerchant} />
                  <div>
                    <label style={labelStyle}>Location</label>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                      className="glass-input" placeholder="Mumbai, IN" />
                  </div>
                </div>

                {/* Device + Time */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <Select label="Device Type" options={deviceOptions} value={device} onChange={setDevice} />
                  <Select label="Time of Day"  options={timeOptions}   value={timeOfDay} onChange={setTimeOfDay} />
                </div>

                {/* Toggles */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <Toggle label="New Device"       icon={<Smartphone size={14} />} checked={isNewDevice}       onChange={() => setIsNewDevice(!isNewDevice)} />
                  <Toggle label="New Location"     icon={<Globe size={14} />}      checked={isForeignLocation} onChange={() => setIsForeignLocation(!isForeignLocation)} />
                </div>

                {/* Submit */}
                <motion.button onClick={handleSubmit} disabled={status === 'loading'}
                  style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', border: 'none',
                    background: 'linear-gradient(135deg,#A855F7,#6366F1)', color: '#fff',
                    fontWeight: 700, fontSize: '0.9375rem', cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    opacity: status === 'loading' ? 0.6 : 1, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '0.5rem',
                    boxShadow: '0 8px 24px rgba(168,85,247,0.35)' }}
                  whileHover={status !== 'loading' ? { scale: 1.02 } : {}}
                  whileTap={status !== 'loading' ? { scale: 0.98 } : {}}>
                  {status === 'loading'
                    ? <><Loader2 size={18} className="animate-spin" /> Analyzing...</>
                    : <><Search size={18} /> Analyze Transaction</>}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT: Results ── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
            <AnimatePresence mode="wait">

              {status === 'idle' && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div style={{ ...card, padding: '3rem 2rem', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center' }}>
                    <div style={{ width: '5rem', height: '5rem', borderRadius: '1rem', marginBottom: '1.25rem',
                      background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Search size={30} color="rgba(168,85,247,0.5)" />
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                      Awaiting Analysis
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#9B8EC4', maxWidth: '18rem', lineHeight: 1.6 }}>
                      Fill in the transaction details and click "Analyze Transaction" to see the AI result.
                    </p>
                  </div>
                </motion.div>
              )}

              {status === 'loading' && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div style={{ ...card, padding: '3rem 2rem', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center' }}>
                    <div style={{ position: 'relative', width: '6rem', height: '6rem', marginBottom: '1.5rem' }}>
                      {[0,1,2].map(i => (
                        <motion.div key={i} style={{ position: 'absolute', inset: 0, borderRadius: '50%',
                          border: '2px solid rgba(168,85,247,0.3)' }}
                          animate={{ scale: [1, 1.5 - i*0.1, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} />
                      ))}
                      <div style={{ position: 'absolute', inset: '1.25rem', borderRadius: '50%',
                        background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Loader2 size={24} color="#A855F7" className="animate-spin" />
                      </div>
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#A855F7', marginBottom: '0.375rem' }}>
                      Analyzing behavior...
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#9B8EC4' }}>ML + behavioral + location engine</p>
                  </div>
                </motion.div>
              )}

              {status === 'result' && result && (
                <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                  {/* Gauge */}
                  <div style={{ ...card, padding: '1.75rem' }}>
                    <Gauge score={result.risk_score} />
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.25rem' }}>
                      <motion.div className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full border text-base font-bold ${getRiskBadge(result.risk_score)}`}
                        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.9, type: 'spring', stiffness: 300 }}>
                        {result.risk_score >= 70 ? <ShieldAlert size={18} />
                          : result.risk_score >= 30 ? <AlertTriangle size={18} />
                          : <CheckCircle size={18} />}
                        {getRiskLabel(result.risk_score)}
                      </motion.div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '1.25rem' }}>
                      {[
                        { label: 'ML Score',   val: `${result.analysis.ml_model.score.toFixed(0)}%` },
                        { label: 'Behavior',   val: `${result.analysis.behavioral.score}` },
                        { label: 'Confidence', val: `${(result.confidence * 100).toFixed(0)}%` },
                      ].map((s, i) => (
                        <div key={i} style={{ textAlign: 'center', padding: '0.75rem', borderRadius: '0.75rem',
                          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>{s.val}</div>
                          <div style={{ fontSize: '0.65rem', color: '#9B8EC4', textTransform: 'uppercase',
                            letterSpacing: '0.08em', marginTop: '0.25rem' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Flags */}
                  {flags.length > 0 && (
                    <div style={{ ...card, padding: '1.25rem' }}>
                      <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#9B8EC4',
                        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                        Behavioral Flags
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {flags.map((f: any, i: number) => (
                          <motion.div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.625rem 0.875rem', borderRadius: '0.625rem',
                            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.18)' }}
                            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 + i * 0.08 }}>
                            <span style={{ color: '#F59E0B' }}>{f.icon}</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#fff' }}>{f.label}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reasons */}
                  <div style={{ ...card, padding: '1.25rem' }}>
                    <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#9B8EC4',
                      textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                      Why flagged?
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                      {result.reasons.map((r, i) => (
                        <motion.div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                          padding: '0.625rem 0', borderBottom: i < result.reasons.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 + i * 0.07 }}>
                          <span style={{ width: '0.375rem', height: '0.375rem', borderRadius: '50%',
                            background: '#A855F7', marginTop: '0.4rem', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.875rem', color: 'rgba(240,238,255,0.85)', lineHeight: 1.6 }}>{r}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Raw JSON */}
                  <div style={{ ...card, overflow: 'hidden' }}>
                    <button onClick={() => setShowJson(!showJson)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.875rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '0.875rem', color: '#9B8EC4' }}>
                      <span style={{ fontWeight: 500 }}>Raw API Response</span>
                      <motion.span animate={{ rotate: showJson ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={15} />
                      </motion.span>
                    </button>
                    <AnimatePresence>
                      {showJson && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                          <pre style={{ padding: '0 1.25rem 1.25rem', fontSize: '0.7rem', color: 'rgba(155,142,196,0.8)',
                            overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                            borderTop: '1px solid rgba(255,255,255,0.06)' }}>
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

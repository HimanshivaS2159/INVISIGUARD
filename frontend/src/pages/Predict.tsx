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
    <motion.div onClick={onChange} 
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.875rem 1.125rem', borderRadius: '0.875rem', cursor: 'pointer', userSelect: 'none',
        background: 'rgba(10,10,26,0.6)', border: '1px solid rgba(168,85,247,0.15)',
        transition: 'all 0.3s ease' }}
      whileHover={{ 
        background: 'rgba(10,10,26,0.8)', 
        borderColor: 'rgba(168,85,247,0.3)',
        boxShadow: '0 4px 16px rgba(168,85,247,0.15)' 
      }}
      whileTap={{ scale: 0.98 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9375rem',
        fontWeight: 600, color: '#F0EEFF' }}>
        <span style={{ color: checked ? '#A855F7' : '#9B8EC4', transition: 'color 0.3s' }}>{icon}</span>
        {label}
      </span>
      <div className={`toggle-track ${checked ? 'active' : ''}`}><div className="toggle-thumb" /></div>
    </motion.div>
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
  background: 'rgba(15,12,40,0.7)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(168,85,247,0.25)',
  borderRadius: '1.25rem',
  boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(168,85,247,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
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
    isForeignLocation                              && { icon: <Globe size={16} />,      label: 'Foreign / New Location' },
    isNewDevice                                    && { icon: <Smartphone size={16} />, label: 'Unknown Device' },
    timeOfDay === 'Night'                          && { icon: <Clock size={16} />,      label: 'Unusual Hour (Night)' },
    parseFloat(amount) > 10000                     && { icon: <CreditCard size={16} />, label: 'Large Amount' },
    isForeignLocation && parseFloat(amount) > 5000 && { icon: <MapPin size={16} />,    label: 'High-Risk Region + Large Tx' },
  ].filter(Boolean) : [];

  const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 700,
    color: '#A855F7', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '0.5rem' };

  return (
    <div style={{ width: '100%', minHeight: '100vh', position: 'relative', overflow: 'hidden', paddingBottom: '7rem' }}>
      {/* Animated background */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.35 }}>
        <div style={{ position: 'absolute', top: '15%', left: '5%', width: '550px', height: '550px',
          background: 'radial-gradient(circle, rgba(168,85,247,0.6) 0%, rgba(168,85,247,0.2) 40%, transparent 70%)',
          filter: 'blur(100px)', animation: 'float 12s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '5%', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, rgba(99,102,241,0.2) 40%, transparent 70%)',
          filter: 'blur(100px)', animation: 'float 15s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 60%)',
          filter: 'blur(120px)', animation: 'pulse 10s ease-in-out infinite' }} />
      </div>

      {/* Floating particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {[...Array(18)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            background: 'rgba(168,85,247,0.7)',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `floatParticle ${Math.random() * 10 + 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
            boxShadow: '0 0 12px rgba(168,85,247,0.9)'
          }} />
        ))}
      </div>

      {/* Grid overlay */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        backgroundImage: 'linear-gradient(rgba(168,85,247,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.03) 1px, transparent 1px)',
        backgroundSize: '100px 100px', 
        opacity: 0.25 
      }} />

      {/* Content */}
      <div style={{ maxWidth: '85rem', margin: '0 auto', padding: '2.5rem 1.5rem 0', position: 'relative', zIndex: 1 }}>

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.375rem 1rem', borderRadius: '9999px', marginBottom: '1rem',
            background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)',
            backdropFilter: 'blur(10px)' }}>
            <Search size={14} color="#A855F7" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#C084FC',
              textTransform: 'uppercase', letterSpacing: '0.12em' }}>Live Analysis</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 900, lineHeight: 1.2,
            fontFamily: 'Space Grotesk, sans-serif', marginBottom: '0.75rem' }}>
            <span style={{ color: '#fff' }}>Fraud </span>
            <span style={{ background: 'linear-gradient(135deg,#A855F7,#6366F1)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Prediction
            </span>
          </h1>
          <p style={{ color: 'rgba(200,190,220,0.85)', fontSize: '1.0625rem', maxWidth: '42rem' }}>
            Enter transaction details for real-time AI behavioral analysis.
          </p>
        </motion.div>

        {/* Two-column grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '1.5rem', alignItems: 'start' }}>

          {/* ── LEFT: Form ── */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <div style={{ ...card, padding: '2rem', position: 'relative', overflow: 'hidden' }}>
              {/* Top glow */}
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                height: '2px',
                background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.6), transparent)',
                opacity: 0.8
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
                <motion.div 
                  style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', 
                    background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.3)' }}
                  whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(168,85,247,0.4)' }}>
                  <Search size={16} color="#A855F7" />
                </motion.div>
                <span style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#fff', fontFamily: 'Space Grotesk, sans-serif' }}>
                  Transaction Details
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                {/* User ID + Amount */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  <div>
                    <label style={labelStyle}>User ID</label>
                    <input type="text" value={userId} onChange={e => setUserId(e.target.value)}
                      className="glass-input" placeholder="user_12345" />
                  </div>
                  <div>
                    <label style={labelStyle}>Amount (₹)</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                        color: '#A855F7', fontWeight: 700, fontSize: '0.9375rem' }}>₹</span>
                      <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                        className="glass-input" style={{ paddingLeft: '2rem' }} placeholder="2500" />
                    </div>
                  </div>
                </div>

                {/* Merchant + Location */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  <Select label="Merchant Category" options={merchantOptions} value={merchant} onChange={setMerchant} />
                  <div>
                    <label style={labelStyle}>Location</label>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                      className="glass-input" placeholder="Mumbai, IN" />
                  </div>
                </div>

                {/* Device + Time */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  <Select label="Device Type" options={deviceOptions} value={device} onChange={setDevice} />
                  <Select label="Time of Day"  options={timeOptions}   value={timeOfDay} onChange={setTimeOfDay} />
                </div>

                {/* Toggles */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  <Toggle label="New Device"       icon={<Smartphone size={15} />} checked={isNewDevice}       onChange={() => setIsNewDevice(!isNewDevice)} />
                  <Toggle label="New Location"     icon={<Globe size={15} />}      checked={isForeignLocation} onChange={() => setIsForeignLocation(!isForeignLocation)} />
                </div>

                {/* Submit */}
                <motion.button onClick={handleSubmit} disabled={status === 'loading'}
                  style={{ width: '100%', padding: '1.125rem', borderRadius: '0.875rem', border: 'none',
                    background: 'linear-gradient(135deg,#A855F7,#6366F1)', color: '#fff',
                    fontWeight: 800, fontSize: '1rem', cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    opacity: status === 'loading' ? 0.6 : 1, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '0.625rem', marginTop: '0.5rem',
                    boxShadow: '0 10px 30px rgba(168,85,247,0.4), 0 0 0 1px rgba(255,255,255,0.1)',
                    fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.02em' }}
                  whileHover={status !== 'loading' ? { 
                    scale: 1.02, 
                    boxShadow: '0 15px 40px rgba(168,85,247,0.6), 0 0 0 1px rgba(255,255,255,0.15)' 
                  } : {}}
                  whileTap={status !== 'loading' ? { scale: 0.98 } : {}}>
                  {status === 'loading'
                    ? <><Loader2 size={19} className="animate-spin" /> Analyzing...</>
                    : <><Search size={19} /> Analyze Transaction</>}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT: Results ── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
            <AnimatePresence mode="wait">

              {status === 'idle' && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div style={{ ...card, padding: '3.5rem 2.5rem', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', minHeight: '450px', textAlign: 'center', position: 'relative' }}>
                    {/* Subtle glow */}
                    <div style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      borderRadius: '1.25rem', 
                      background: 'radial-gradient(ellipse at 50% 50%, rgba(168,85,247,0.08), transparent 70%)',
                      pointerEvents: 'none'
                    }} />
                    
                    <motion.div 
                      style={{ width: '6rem', height: '6rem', borderRadius: '1.25rem', marginBottom: '1.5rem',
                        background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
                      animate={{ boxShadow: ['0 0 20px rgba(168,85,247,0.2)', '0 0 40px rgba(168,85,247,0.4)', '0 0 20px rgba(168,85,247,0.2)'] }}
                      transition={{ duration: 3, repeat: Infinity }}>
                      <Search size={36} color="rgba(168,85,247,0.6)" />
                    </motion.div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.625rem',
                      fontFamily: 'Space Grotesk, sans-serif' }}>
                      Awaiting Analysis
                    </h3>
                    <p style={{ fontSize: '0.9375rem', color: '#9B8EC4', maxWidth: '20rem', lineHeight: 1.7 }}>
                      Fill in the transaction details and click "Analyze Transaction" to see the AI result.
                    </p>
                  </div>
                </motion.div>
              )}

              {status === 'loading' && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div style={{ ...card, padding: '3.5rem 2.5rem', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', minHeight: '450px', textAlign: 'center', position: 'relative' }}>
                    {/* Animated glow */}
                    <motion.div style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      borderRadius: '1.25rem', 
                      background: 'radial-gradient(ellipse at 50% 50%, rgba(168,85,247,0.15), transparent 70%)',
                      pointerEvents: 'none'
                    }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }} />

                    <div style={{ position: 'relative', width: '7rem', height: '7rem', marginBottom: '2rem' }}>
                      {[0,1,2].map(i => (
                        <motion.div key={i} style={{ position: 'absolute', inset: 0, borderRadius: '50%',
                          border: '2px solid rgba(168,85,247,0.4)' }}
                          animate={{ scale: [1, 1.6 - i*0.15, 1], opacity: [0.7, 0, 0.7] }}
                          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }} />
                      ))}
                      <div style={{ position: 'absolute', inset: '1.5rem', borderRadius: '50%',
                        background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Loader2 size={28} color="#A855F7" className="animate-spin" />
                      </div>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#A855F7', marginBottom: '0.5rem',
                      fontFamily: 'Space Grotesk, sans-serif' }}>
                      Analyzing behavior...
                    </h3>
                    <p style={{ fontSize: '0.9375rem', color: '#9B8EC4' }}>ML + behavioral + location engine</p>
                  </div>
                </motion.div>
              )}

              {status === 'result' && result && (
                <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

                  {/* Gauge */}
                  <div style={{ ...card, padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                    {/* Top glow */}
                    <div style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      borderRadius: '1.25rem', 
                      background: `radial-gradient(ellipse at 50% 0%, ${getRiskColor(result.risk_score)}20, transparent 60%)`,
                      pointerEvents: 'none'
                    }} />

                    <Gauge score={result.risk_score} />
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                      <motion.div className={`inline-flex items-center gap-2 px-7 py-3 rounded-full border text-base font-bold ${getRiskBadge(result.risk_score)}`}
                        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.9, type: 'spring', stiffness: 300 }}
                        style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.05em' }}>
                        {result.risk_score >= 70 ? <ShieldAlert size={19} />
                          : result.risk_score >= 30 ? <AlertTriangle size={19} />
                          : <CheckCircle size={19} />}
                        {getRiskLabel(result.risk_score)}
                      </motion.div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.875rem', marginTop: '1.5rem' }}>
                      {[
                        { label: 'ML Score',   val: `${result.analysis.ml_model.score.toFixed(0)}%` },
                        { label: 'Behavior',   val: `${result.analysis.behavioral.score}` },
                        { label: 'Confidence', val: `${(result.confidence * 100).toFixed(0)}%` },
                      ].map((s, i) => (
                        <motion.div key={i} 
                          style={{ textAlign: 'center', padding: '0.875rem', borderRadius: '0.875rem',
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(168,85,247,0.15)' }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1 + i * 0.1 }}
                          whileHover={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(168,85,247,0.25)' }}>
                          <div style={{ fontSize: '1.375rem', fontWeight: 900, color: '#A855F7',
                            fontFamily: 'Space Grotesk, sans-serif' }}>{s.val}</div>
                          <div style={{ fontSize: '0.6875rem', color: '#9B8EC4', textTransform: 'uppercase',
                            letterSpacing: '0.1em', marginTop: '0.25rem', fontWeight: 700 }}>{s.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Flags */}
                  {flags.length > 0 && (
                    <div style={{ ...card, padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                      {/* Top accent line */}
                      <div style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        height: '2px',
                        background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.6), transparent)'
                      }} />

                      <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#F59E0B',
                        textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1rem',
                        fontFamily: 'Space Grotesk, sans-serif' }}>
                        Behavioral Flags
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        {flags.map((f: any, i: number) => (
                          <motion.div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem',
                            padding: '0.75rem 1rem', borderRadius: '0.75rem',
                            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}
                            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 + i * 0.08 }}
                            whileHover={{ background: 'rgba(245,158,11,0.15)', borderColor: 'rgba(245,158,11,0.35)' }}>
                            <span style={{ color: '#F59E0B' }}>{f.icon}</span>
                            <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#fff' }}>{f.label}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reasons */}
                  <div style={{ ...card, padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                    {/* Top accent line */}
                    <div style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      right: 0, 
                      height: '2px',
                      background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.6), transparent)'
                    }} />

                    <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#A855F7',
                      textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1rem',
                      fontFamily: 'Space Grotesk, sans-serif' }}>
                      Why flagged?
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                      {result.reasons.map((r, i) => (
                        <motion.div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
                          padding: '0.75rem 0', borderBottom: i < result.reasons.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 + i * 0.07 }}>
                          <span style={{ width: '0.4375rem', height: '0.4375rem', borderRadius: '50%',
                            background: '#A855F7', marginTop: '0.5rem', flexShrink: 0,
                            boxShadow: '0 0 8px rgba(168,85,247,0.6)' }} />
                          <span style={{ fontSize: '0.9375rem', color: 'rgba(240,238,255,0.9)', lineHeight: 1.7, fontWeight: 400 }}>{r}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Raw JSON */}
                  <div style={{ ...card, overflow: 'hidden' }}>
                    <button onClick={() => setShowJson(!showJson)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '1rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '0.9375rem', color: '#9B8EC4', fontWeight: 600,
                        transition: 'all 0.3s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#A855F7'; e.currentTarget.style.background = 'rgba(168,85,247,0.05)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#9B8EC4'; e.currentTarget.style.background = 'none'; }}>
                      <span style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Raw API Response</span>
                      <motion.span animate={{ rotate: showJson ? 180 : 0 }} transition={{ duration: 0.3 }}>
                        <ChevronDown size={16} />
                      </motion.span>
                    </button>
                    <AnimatePresence>
                      {showJson && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                          <pre style={{ padding: '0 1.5rem 1.5rem', fontSize: '0.75rem', color: 'rgba(155,142,196,0.85)',
                            overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                            borderTop: '1px solid rgba(255,255,255,0.06)', fontFamily: 'monospace' }}>
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

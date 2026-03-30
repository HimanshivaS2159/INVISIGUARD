import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  HelpCircle,
  MapPin,
  Clock,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import GlassEffect from '../components/GlassEffect';
import Select from '../components/Select';
import { predictFraud, type PredictResponse } from '../api/client';
import { toast } from '../components/Toast';

const merchantOptions = [
  { value: 'Food', label: 'Food & Dining', description: 'Restaurants, grocery, delivery' },
  { value: 'Travel', label: 'Travel', description: 'Airlines, hotels, ride-sharing' },
  { value: 'Shopping', label: 'Shopping', description: 'Retail, fashion, online marketplace' },
  { value: 'Electronics', label: 'Electronics', description: 'Gadgets, appliances, tech' },
  { value: 'Utilities', label: 'Utilities', description: 'Bills, subscriptions, payments' },
  { value: 'Other', label: 'Other', description: 'Miscellaneous transactions' },
];

const deviceOptions = [
  { value: 'Mobile', label: 'Mobile', icon: <Smartphone size={16} /> },
  { value: 'Desktop', label: 'Desktop', icon: <Monitor size={16} /> },
  { value: 'Tablet', label: 'Tablet', icon: <Tablet size={16} /> },
  { value: 'Unknown', label: 'Unknown', icon: <HelpCircle size={16} /> },
];

const timeOptions = [
  { value: 'Morning', label: 'Morning', description: '6 AM – 12 PM' },
  { value: 'Afternoon', label: 'Afternoon', description: '12 PM – 5 PM' },
  { value: 'Evening', label: 'Evening', description: '5 PM – 9 PM' },
  { value: 'Night', label: 'Night', description: '9 PM – 6 AM' },
];

type Status = 'idle' | 'loading' | 'result';

export default function Predict() {
  const [userId, setUserId] = useState('demo_user_1');
  const [amount, setAmount] = useState('2500');
  const [merchant, setMerchant] = useState('Shopping');
  const [location, setLocation] = useState('Mumbai, IN');
  const [device, setDevice] = useState('Mobile');
  const [timeOfDay, setTimeOfDay] = useState('Evening');
  const [isNewDevice, setIsNewDevice] = useState(false);
  const [isForeignLocation, setIsForeignLocation] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [showJson, setShowJson] = useState(false);

  const handleSubmit = async () => {
    setStatus('loading');
    setResult(null);

    try {
      const res = await predictFraud({
        amount: parseFloat(amount) || 0,
        is_night: timeOfDay === 'Night' ? 1 : 0,
        new_location: isForeignLocation ? 1 : 0,
        new_device: isNewDevice ? 1 : 0,
        user_id: userId || 'anonymous',
      });
      setResult(res.data);
      setStatus('result');
      toast(
        res.data.result === 'FRAUD' ? 'High risk transaction detected!' : 'Transaction appears safe',
        res.data.result === 'FRAUD' ? 'error' : 'success'
      );
    } catch {
      toast('Failed to analyze transaction. Is the backend running?', 'error');
      setStatus('idle');
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return '#10B981';
    if (score < 70) return '#F59E0B';
    return '#EF4444';
  };

  const getRiskLabel = (score: number) => {
    if (score < 30) return 'SAFE';
    if (score < 70) return 'SUSPICIOUS';
    return 'FRAUD';
  };

  const getRiskBadgeClasses = (score: number) => {
    if (score < 30) return 'bg-success/15 text-success border-success/25';
    if (score < 70) return 'bg-warning/15 text-warning border-warning/25';
    return 'bg-danger/15 text-danger border-danger/25';
  };

  // SVG arc gauge helper
  const renderGauge = (score: number) => {
    const radius = 80;
    const circumference = Math.PI * radius; // semicircle
    const progress = (score / 100) * circumference;
    const color = getRiskColor(score);

    return (
      <svg width="200" height="120" viewBox="0 0 200 120" className="mx-auto">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>
        {/* Background arc */}
        <path
          d="M 20 110 A 80 80 0 0 1 180 110"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <motion.path
          d="M 20 110 A 80 80 0 0 1 180 110"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${color}50)` }}
        />
        {/* Score text */}
        <motion.text
          x="100"
          y="90"
          textAnchor="middle"
          fill={color}
          fontSize="36"
          fontWeight="bold"
          fontFamily="Space Grotesk"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {Math.round(score)}
        </motion.text>
        <text
          x="100"
          y="108"
          textAnchor="middle"
          fill="#9B8EC4"
          fontSize="11"
          fontFamily="Inter"
        >
          RISK SCORE
        </text>
      </svg>
    );
  };

  const behavioralFlags = result
    ? [
        isForeignLocation && { icon: <Globe size={16} />, label: 'Foreign / New Location' },
        isNewDevice && { icon: <Smartphone size={16} />, label: 'Unknown Device' },
        timeOfDay === 'Night' && { icon: <Clock size={16} />, label: 'Unusual Hour (Night)' },
        parseFloat(amount) > 10000 && { icon: <CreditCard size={16} />, label: 'Large Amount' },
        isForeignLocation && parseFloat(amount) > 5000 && { icon: <MapPin size={16} />, label: 'High-Risk Region + Large Tx' },
      ].filter(Boolean)
    : [];

  return (
    <motion.div
      className="min-h-screen pt-8 pb-28 px-4 md:px-8 max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">
          <span className="brand-gradient">Fraud</span> Prediction
        </h1>
        <p className="text-text-muted mt-2">
          Enter transaction details for real-time AI behavioral analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── Left Panel: Input Form ──────────────────────── */}
        <GlassEffect hover={false} className="self-start">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Search size={20} className="text-accent" />
            Transaction Input
          </h2>

          <div className="space-y-5">
            {/* User ID */}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">User ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="glass-input"
                placeholder="e.g. user_12345"
                id="predict-user-id"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="glass-input pl-8"
                  placeholder="2500"
                  id="predict-amount"
                />
              </div>
            </div>

            {/* Merchant Category */}
            <Select
              label="Merchant Category"
              options={merchantOptions}
              value={merchant}
              onChange={setMerchant}
              id="predict-merchant"
            />

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="glass-input"
                placeholder="Mumbai, IN"
                id="predict-location"
              />
            </div>

            {/* Device & Time row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Device Type"
                options={deviceOptions}
                value={device}
                onChange={setDevice}
                id="predict-device"
              />
              <Select
                label="Time of Day"
                options={timeOptions}
                value={timeOfDay}
                onChange={setTimeOfDay}
                id="predict-time"
              />
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <div
                className="flex items-center justify-between p-3 rounded-xl
                  bg-[rgba(10,10,26,0.4)] border border-[rgba(255,255,255,0.08)]
                  cursor-pointer select-none"
                onClick={() => setIsNewDevice(!isNewDevice)}
              >
                <span className="text-sm text-text-primary flex items-center gap-2">
                  <Smartphone size={16} className="text-text-muted" />
                  New / Unknown Device
                </span>
                <div className={`toggle-track ${isNewDevice ? 'active' : ''}`}>
                  <div className="toggle-thumb" />
                </div>
              </div>

              <div
                className="flex items-center justify-between p-3 rounded-xl
                  bg-[rgba(10,10,26,0.4)] border border-[rgba(255,255,255,0.08)]
                  cursor-pointer select-none"
                onClick={() => setIsForeignLocation(!isForeignLocation)}
              >
                <span className="text-sm text-text-primary flex items-center gap-2">
                  <Globe size={16} className="text-text-muted" />
                  Foreign / New Location
                </span>
                <div className={`toggle-track ${isForeignLocation ? 'active' : ''}`}>
                  <div className="toggle-thumb" />
                </div>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              onClick={handleSubmit}
              disabled={status === 'loading'}
              className="w-full py-4 px-6 rounded-xl font-semibold text-white
                bg-gradient-to-r from-accent to-[#6366F1]
                shadow-[0_8px_24px_rgba(168,85,247,0.3)]
                hover:shadow-[0_12px_32px_rgba(168,85,247,0.4)]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-shadow duration-300
                flex items-center justify-center gap-2"
              whileHover={status !== 'loading' ? { scale: 1.02 } : {}}
              whileTap={status !== 'loading' ? { scale: 0.98 } : {}}
              id="predict-submit"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Analyze Transaction
                </>
              )}
            </motion.button>
          </div>
        </GlassEffect>

        {/* ─── Right Panel: Result Display ─────────────────── */}
        <div className="self-start">
          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <GlassEffect hover={false} className="flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-20 h-20 rounded-full bg-[rgba(168,85,247,0.1)] flex items-center justify-center mb-4">
                    <Search size={32} className="text-accent/50" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-muted mb-2">No Analysis Yet</h3>
                  <p className="text-sm text-text-muted/70 text-center max-w-xs">
                    Fill in the transaction details and click "Analyze Transaction" to see results.
                  </p>
                </GlassEffect>
              </motion.div>
            )}

            {status === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <GlassEffect hover={false} className="flex flex-col items-center justify-center min-h-[400px]">
                  <div className="relative w-24 h-24 mb-6">
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-accent/30"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-2 rounded-full border-2 border-accent/50"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                    />
                    <div className="absolute inset-4 rounded-full bg-accent/20 flex items-center justify-center">
                      <Loader2 size={28} className="text-accent animate-spin" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-accent mb-1">Analyzing behavior...</h3>
                  <p className="text-sm text-text-muted">
                    Running ML model + behavioral + location analysis
                  </p>
                </GlassEffect>
              </motion.div>
            )}

            {status === 'result' && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Risk Score Gauge */}
                <GlassEffect hover={false}>
                  {renderGauge(result.risk_score)}

                  {/* Classification Badge */}
                  <div className="flex justify-center mt-4">
                    <motion.div
                      className={`inline-flex items-center gap-2 px-6 py-2 rounded-full border text-lg font-bold ${getRiskBadgeClasses(result.risk_score)}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.8, type: 'spring', stiffness: 300 }}
                    >
                      {result.risk_score >= 70 ? (
                        <ShieldAlert size={20} />
                      ) : result.risk_score >= 30 ? (
                        <AlertTriangle size={20} />
                      ) : (
                        <CheckCircle size={20} />
                      )}
                      {getRiskLabel(result.risk_score)}
                    </motion.div>
                  </div>
                </GlassEffect>

                {/* Behavioral Flags */}
                {behavioralFlags.length > 0 && (
                  <GlassEffect hover={false}>
                    <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                      Behavioral Flags
                    </h3>
                    <div className="space-y-2">
                      {behavioralFlags.map((flag: any, i: number) => (
                        <motion.div
                          key={i}
                          className="flex items-center gap-3 p-2.5 rounded-lg bg-[rgba(255,255,255,0.03)]"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1 + i * 0.1 }}
                        >
                          <span className="text-warning">{flag.icon}</span>
                          <span className="text-sm text-text-primary">{flag.label}</span>
                        </motion.div>
                      ))}
                    </div>
                  </GlassEffect>
                )}

                {/* Reasons / Explainability */}
                <GlassEffect hover={false}>
                  <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                    Explainability
                  </h3>
                  <div className="space-y-2">
                    {result.reasons.map((reason, i) => (
                      <motion.p
                        key={i}
                        className="text-sm text-text-primary/80 pl-4 border-l-2 border-accent/30 py-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 + i * 0.1 }}
                      >
                        {reason}
                      </motion.p>
                    ))}
                  </div>
                </GlassEffect>

                {/* Raw JSON toggle */}
                <GlassEffect hover={false} padding="p-0">
                  <button
                    className="w-full flex items-center justify-between p-4 text-sm text-text-muted hover:text-text-primary transition-colors"
                    onClick={() => setShowJson(!showJson)}
                  >
                    <span>Raw API Response</span>
                    <motion.span animate={{ rotate: showJson ? 180 : 0 }}>
                      <ChevronDown size={16} />
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {showJson && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <pre className="p-4 pt-0 text-xs text-text-muted/80 overflow-x-auto whitespace-pre-wrap break-all">
                          {JSON.stringify(result, null, 2)}
                        </pre>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassEffect>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

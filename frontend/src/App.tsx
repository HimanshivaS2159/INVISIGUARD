import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import GlassDock, { MobileNav } from './components/GlassDock';
import ToastContainer from './components/Toast';
import Landing from './pages/Landing';
import Predict from './pages/Predict';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import ModelInfo from './pages/ModelInfo';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        className="w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user/:id" element={<UserProfile />} />
          <Route path="/model" element={<ModelInfo />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Enhanced animated background with gradient waves and orbs */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -2,
        background: 'linear-gradient(135deg, #0A0A1A 0%, #1A0A2E 50%, #0A0A1A 100%)',
        backgroundSize: '200% 200%',
        animation: 'gradientWave 15s ease-in-out infinite'
      }} />
      
      {/* Floating orbs overlay - enhanced */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, opacity: 0.35 }}>
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: '550px', height: '550px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.6) 0%, rgba(59,130,246,0.2) 40%, transparent 70%)',
          filter: 'blur(100px)', animation: 'float 12s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(249,115,22,0.6) 0%, rgba(249,115,22,0.2) 40%, transparent 70%)',
          filter: 'blur(100px)', animation: 'float 15s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(96,165,250,0.4) 0%, transparent 60%)',
          filter: 'blur(120px)', animation: 'pulse 10s ease-in-out infinite' }} />
      </div>

      {/* Floating particles */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden' }}>
        {[...Array(20)].map((_, i) => (
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
        position: 'fixed', 
        inset: 0, 
        zIndex: -1,
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)',
        backgroundSize: '100px 100px', 
        opacity: 0.25 
      }} />

      {/* Main content */}
      <div className="relative z-10 min-h-screen w-full">
        <AnimatedRoutes />
      </div>

      {/* Glass dock navigation */}
      <GlassDock />
      <MobileNav />

      {/* Toast notifications */}
      <ToastContainer />
    </BrowserRouter>
  );
}

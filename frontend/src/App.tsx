import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ShaderBackground from './components/ShaderBackground';
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
      {/* WebGL shader background — always visible behind everything */}
      <ShaderBackground />

      {/* Main content */}
      <div className="relative z-10 min-h-screen">
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

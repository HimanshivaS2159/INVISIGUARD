import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Features from '../components/Features';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="w-full">

      {/* ── HERO — Premium Animated Background ─────────────────────────── */}
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        
        {/* Animated mesh gradient background */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
          {/* Large orbs */}
          <div style={{ position: 'absolute', top: '10%', left: '5%', width: '600px', height: '600px',
            background: 'radial-gradient(circle, rgba(168,85,247,0.6) 0%, rgba(168,85,247,0.2) 40%, transparent 70%)',
            filter: 'blur(100px)', animation: 'float 12s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '500px', height: '500px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, rgba(99,102,241,0.2) 40%, transparent 70%)',
            filter: 'blur(100px)', animation: 'float 15s ease-in-out infinite reverse' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '700px', height: '700px',
            background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 60%)',
            filter: 'blur(120px)', animation: 'pulse 8s ease-in-out infinite' }} />
          
          {/* Grid overlay */}
          <div style={{ position: 'absolute', inset: 0, 
            backgroundImage: 'linear-gradient(rgba(168,85,247,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.03) 1px, transparent 1px)',
            backgroundSize: '100px 100px', opacity: 0.3 }} />
        </div>

        {/* Floating particles */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {[...Array(20)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              background: 'rgba(168,85,247,0.6)',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `floatParticle ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              boxShadow: '0 0 10px rgba(168,85,247,0.8)'
            }} />
          ))}
        </div>

        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 2rem', maxWidth: '1200px' }}>
          {/* Main title with enhanced styling */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ 
              fontSize: 'clamp(3rem,12vw,8rem)', 
              fontWeight: 900, 
              letterSpacing: '0.1em',
              background: 'linear-gradient(135deg,#fff 0%,#E9D5FF 30%,#C084FC 60%,#A855F7 100%)',
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent', 
              backgroundClip: 'text',
              marginBottom: '1.5rem', 
              filter: 'drop-shadow(0 0 30px rgba(168,85,247,0.8))',
              textShadow: '0 0 80px rgba(168,85,247,0.5)',
              fontFamily: 'Space Grotesk, sans-serif'
            }}>
            INVISIGUARD
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ 
              color: 'rgba(240,238,255,0.85)', 
              fontSize: 'clamp(1rem,2.5vw,1.5rem)', 
              marginBottom: '2rem',
              fontWeight: 500,
              letterSpacing: '0.02em',
              lineHeight: 1.6
            }}>
            Next-generation behavioral fraud detection powered by AI
          </motion.p>
          
          {/* Status indicator */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ 
              display: 'inline-flex',
              alignItems: 'center', 
              gap: '0.75rem', 
              marginBottom: '3rem',
              padding: '0.75rem 1.5rem',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: '9999px',
              backdropFilter: 'blur(10px)'
            }}>
            <div style={{ 
              width: '10px', 
              height: '10px', 
              borderRadius: '50%', 
              background: '#10B981', 
              animation: 'pulse 2s infinite',
              boxShadow: '0 0 20px rgba(16,185,129,0.8)'
            }} />
            <span style={{ 
              fontSize: '0.875rem', 
              color: '#10B981', 
              fontWeight: 700, 
              letterSpacing: '0.1em', 
              textTransform: 'uppercase' 
            }}>
              System Active • 99.2% Accuracy
            </span>
          </motion.div>
          
          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <motion.button onClick={() => navigate('/predict')}
              style={{ 
                background: 'linear-gradient(135deg,#A855F7,#6366F1)', 
                color: '#fff', 
                fontWeight: 700,
                fontSize: '1.0625rem', 
                padding: '1.125rem 2.5rem', 
                borderRadius: '9999px', 
                border: 'none',
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.625rem',
                boxShadow: '0 10px 40px rgba(168,85,247,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: '0 15px 60px rgba(168,85,247,0.7), 0 0 0 1px rgba(255,255,255,0.2)' 
              }}
              whileTap={{ scale: 0.98 }}>
              <span style={{ position: 'relative', zIndex: 1 }}>Try Live Demo</span>
              <ArrowRight size={20} style={{ position: 'relative', zIndex: 1 }} />
            </motion.button>
            
            <motion.button onClick={() => navigate('/dashboard')}
              style={{ 
                background: 'rgba(255,255,255,0.05)', 
                color: '#fff', 
                fontWeight: 700,
                fontSize: '1.0625rem', 
                padding: '1.125rem 2.5rem', 
                borderRadius: '9999px',
                border: '1px solid rgba(255,255,255,0.2)', 
                cursor: 'pointer', 
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
              }}
              whileHover={{ 
                scale: 1.05, 
                background: 'rgba(255,255,255,0.1)',
                borderColor: 'rgba(168,85,247,0.5)',
                boxShadow: '0 12px 48px rgba(168,85,247,0.3), inset 0 1px 0 rgba(255,255,255,0.15)'
              }}
              whileTap={{ scale: 0.98 }}>
              View Dashboard
            </motion.button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            style={{
              marginTop: '4rem',
              display: 'flex',
              gap: '3rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              opacity: 0.7
            }}>
            {[
              { label: '< 100ms', desc: 'Response Time' },
              { label: '2.1%', desc: 'False Positive' },
              { label: '24/7', desc: 'Real-time' }
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#A855F7', marginBottom: '0.25rem' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {stat.desc}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <Features />

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      <div style={{ width: '100%', position: 'relative', padding: '7rem 1.5rem', overflow: 'hidden' }}>
        {/* Animated background matching top sections */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.3 }}>
          <div style={{ position: 'absolute', top: '20%', left: '10%', width: '400px', height: '400px',
            background: 'radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)',
            filter: 'blur(100px)', animation: 'float 12s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '350px', height: '350px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)',
            filter: 'blur(100px)', animation: 'float 15s ease-in-out infinite reverse' }} />
        </div>

        <motion.div
          style={{ 
            maxWidth: '56rem', 
            margin: '0 auto', 
            textAlign: 'center', 
            padding: '4rem 3rem',
            borderRadius: '1.5rem', 
            background: 'rgba(20,15,45,0.7)', 
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(168,85,247,0.25)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(168,85,247,0.1), inset 0 1px 0 rgba(255,255,255,0.05)', 
            position: 'relative',
            overflow: 'hidden'
          }}
          initial={{ opacity: 0, y: 40 }} 
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} 
          transition={{ duration: 0.8 }}
        >
          {/* Top glow */}
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            borderRadius: '1.5rem', 
            pointerEvents: 'none',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.2), transparent 60%)' 
          }} />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ 
              fontSize: 'clamp(2rem,5vw,3rem)', 
              fontWeight: 900, 
              lineHeight: 1.2,
              marginBottom: '1.5rem',
              fontFamily: 'Space Grotesk, sans-serif'
            }}>
              <span style={{ color: '#fff' }}>Ready to Detect Fraud </span>
              <span style={{ 
                background: 'linear-gradient(135deg,#A855F7,#6366F1)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent', 
                backgroundClip: 'text' 
              }}>
                Intelligently?
              </span>
            </h2>
            
            <p style={{ 
              color: 'rgba(200,190,220,0.9)', 
              fontSize: 'clamp(1rem,2vw,1.125rem)', 
              marginBottom: '3rem', 
              lineHeight: 1.7, 
              maxWidth: '42rem', 
              margin: '0 auto 3rem',
              fontWeight: 400
            }}>
              Start analyzing transactions in real-time with our AI-powered behavioral engine.
              No setup required — just plug in and protect.
            </p>
            
            <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.button 
                onClick={() => navigate('/predict')}
                style={{ 
                  background: 'linear-gradient(135deg,#A855F7,#6366F1)', 
                  color: '#fff', 
                  fontWeight: 700,
                  fontSize: '1.0625rem', 
                  padding: '1.125rem 2.5rem', 
                  borderRadius: '9999px', 
                  border: 'none',
                  cursor: 'pointer', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.625rem',
                  boxShadow: '0 10px 40px rgba(168,85,247,0.5), 0 0 0 1px rgba(255,255,255,0.1)'
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 15px 60px rgba(168,85,247,0.7), 0 0 0 1px rgba(255,255,255,0.2)'
                }} 
                whileTap={{ scale: 0.98 }}>
                Try Live Demo <ArrowRight size={20} />
              </motion.button>
              
              <motion.button 
                onClick={() => navigate('/dashboard')}
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  color: '#fff', 
                  fontWeight: 700,
                  fontSize: '1.0625rem', 
                  padding: '1.125rem 2.5rem', 
                  borderRadius: '9999px',
                  border: '1px solid rgba(255,255,255,0.2)', 
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
                }}
                whileHover={{ 
                  scale: 1.05,
                  background: 'rgba(255,255,255,0.1)',
                  borderColor: 'rgba(168,85,247,0.5)',
                  boxShadow: '0 12px 48px rgba(168,85,247,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                }} 
                whileTap={{ scale: 0.98 }}>
                View Analytics
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      <div style={{ height: '4rem', background: 'transparent' }} />
    </div>
  );
}

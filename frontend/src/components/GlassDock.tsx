import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Search,
  BarChart3,
  User,
  Cpu,
} from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/predict', icon: Search, label: 'Predict' },
  { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  { path: '/user/demo_user_1', icon: User, label: 'Users' },
  { path: '/model', icon: Cpu, label: 'Model Info' },
];

export default function GlassDock() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.nav
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2
        hidden md:flex items-center gap-2
        px-4 py-3 rounded-full
        bg-[rgba(255,255,255,0.07)]
        backdrop-blur-xl
        border border-[rgba(255,255,255,0.12)]
        shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.5 }}
    >
      {navItems.map((item) => {
        const isActive =
          item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

        return (
          <motion.button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`
              relative flex items-center gap-2 px-4 py-2.5 rounded-full
              transition-colors duration-300 outline-none
              ${
                isActive
                  ? 'bg-[rgba(168,85,247,0.2)] text-accent'
                  : 'text-text-muted hover:text-text-primary'
              }
            `}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            title={item.label}
          >
            <item.icon size={20} />
            {isActive && (
              <motion.span
                className="text-sm font-medium"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {item.label}
              </motion.span>
            )}
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full bg-[rgba(168,85,247,0.15)]"
                layoutId="dock-active-bg"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </motion.nav>
  );
}

/* ─── Mobile hamburger nav ─────────────────────────────────── */
export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden
      flex items-center justify-around
      px-2 py-2
      bg-[rgba(10,10,26,0.9)]
      backdrop-blur-xl
      border-t border-[rgba(255,255,255,0.08)]">
      {navItems.map((item) => {
        const isActive =
          item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors
              ${isActive ? 'text-accent' : 'text-text-muted'}`}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

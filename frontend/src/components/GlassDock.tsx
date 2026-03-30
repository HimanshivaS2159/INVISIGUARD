import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, BarChart3, User, Cpu } from 'lucide-react';

const navItems = [
  { path: '/',                  icon: Home,     label: 'Home'       },
  { path: '/predict',           icon: Search,   label: 'Predict'    },
  { path: '/dashboard',         icon: BarChart3, label: 'Dashboard' },
  { path: '/user/demo_user_1',  icon: User,     label: 'Users'      },
  { path: '/model',             icon: Cpu,      label: 'Model'      },
];

export default function GlassDock() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.nav
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 hidden md:flex items-center gap-1
        px-3 py-2.5 rounded-full
        bg-[rgba(15,12,40,0.88)] backdrop-blur-2xl
        border border-[rgba(255,255,255,0.12)]
        shadow-[0_16px_48px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.5 }}
    >
      {navItems.map((item) => {
        const isActive = item.path === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(item.path);

        return (
          <motion.button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full
              font-semibold text-sm outline-none transition-colors duration-200
              ${isActive ? 'text-white' : 'text-[#9B8EC4] hover:text-white'}`}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            title={item.label}
          >
            {/* Active pill background */}
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(99,102,241,0.25))' }}
                layoutId="dock-pill"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <item.icon size={18} />
              <motion.span
                animate={{ width: isActive ? 'auto' : 0, opacity: isActive ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            </span>
          </motion.button>
        );
      })}
    </motion.nav>
  );
}

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden
      flex items-center justify-around px-2 py-2
      bg-[rgba(10,10,26,0.95)] backdrop-blur-2xl
      border-t border-[rgba(255,255,255,0.08)]
      shadow-[0_-8px_32px_rgba(0,0,0,0.4)]">
      {navItems.map((item) => {
        const isActive = item.path === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(item.path);
        return (
          <button key={item.path} onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors
              ${isActive ? 'text-[#A855F7]' : 'text-[#9B8EC4]'}`}>
            <item.icon size={20} />
            <span className="text-[10px] font-semibold">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

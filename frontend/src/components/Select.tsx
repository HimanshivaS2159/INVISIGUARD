import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
}

export default function Select({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  id,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative" id={id}>
      {label && (
        <label style={{ 
          display: 'block', 
          fontSize: '0.75rem', 
          fontWeight: 700,
          color: '#A855F7', 
          textTransform: 'uppercase', 
          letterSpacing: '0.1em', 
          marginBottom: '0.5rem' 
        }}>
          {label}
        </label>
      )}

      <motion.button
        type="button"
        className="w-full flex items-center justify-between gap-2
          bg-[rgba(10,10,26,0.6)] border border-[rgba(168,85,247,0.15)]
          rounded-xl px-4 py-3 text-left
          text-text-primary text-[0.9375rem]
          transition-all outline-none
          focus:border-accent focus:shadow-[0_0_0_3px_rgba(168,85,247,0.2)]
          hover:bg-[rgba(10,10,26,0.8)] hover:border-[rgba(168,85,247,0.25)]"
        onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.98 }}
        layoutId={id ? `select-trigger-${id}` : undefined}
      >
        <span className="flex items-center gap-2 truncate font-medium">
          {selected?.icon}
          {selected?.label || (
            <span className="text-text-muted opacity-60">{placeholder}</span>
          )}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-[#A855F7]" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute z-50 w-full mt-2
              bg-[rgba(15,12,40,0.98)] backdrop-blur-xl
              border border-[rgba(168,85,247,0.25)]
              rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(168,85,247,0.15)]
              overflow-hidden max-h-60 overflow-y-auto"
            initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{ transformOrigin: 'top' }}
          >
            {options.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                className={`w-full flex items-center gap-3 px-4 py-3 text-left
                  transition-colors font-medium
                  ${option.value === value
                    ? 'bg-[rgba(168,85,247,0.2)] text-accent border-l-2 border-l-[#A855F7]'
                    : 'text-text-primary hover:bg-[rgba(168,85,247,0.08)] border-l-2 border-l-transparent'
                  }`}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.15 }}
              >
                {option.icon && <span className="shrink-0">{option.icon}</span>}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-text-muted mt-0.5 truncate opacity-80">
                      {option.description}
                    </div>
                  )}
                </div>
                {option.value === value && (
                  <Check size={16} className="shrink-0 text-accent" />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

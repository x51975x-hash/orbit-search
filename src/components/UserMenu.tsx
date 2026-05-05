import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookmarkCheck, Layers, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';

const AVATAR_COLORS = [
  '#e8710a', '#1a73e8', '#34a853', '#ea4335',
  '#fbbc04', '#9334e6', '#00897b', '#e91e63',
];

function getAvatarColor(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function Avatar({ email, size = 'sm' }: { email: string; size?: 'sm' | 'lg' }) {
  const color = getAvatarColor(email);
  const initial = email[0].toUpperCase();
  const cls = size === 'lg' ? 'w-16 h-16 text-2xl' : 'w-9 h-9 text-base';
  return (
    <div
      className={`${cls} rounded-full flex items-center justify-center font-medium text-white flex-shrink-0 select-none`}
      style={{ backgroundColor: color }}
    >
      {initial}
    </div>
  );
}

export default function UserMenu({
  user,
  logout,
  onSignIn,
}: {
  user: { name?: string; email: string } | null;
  logout: () => void;
  onSignIn: () => void;
}) {
  const { darkMode } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!user) {
    return (
      <button
        onClick={onSignIn}
        className="px-4 py-1.5 rounded-full text-sm font-semibold bg-[#4285f4] text-white hover:bg-[#3367d6] transition-colors shadow-sm"
      >
        Sign In
      </button>
    );
  }

  const navItem = `w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
    darkMode
      ? 'text-white/70 hover:bg-white/8 hover:text-white'
      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
  }`;

  const close = () => setOpen(false);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`rounded-full transition-all focus:outline-none ${
          darkMode ? 'hover:ring-4 ring-white/15' : 'hover:ring-4 ring-gray-200'
        }`}
        aria-label="Account menu"
      >
        <Avatar email={user.email} size="sm" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -6 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className={`absolute right-0 mt-3 w-80 rounded-3xl shadow-xl border z-50 overflow-hidden ${
              darkMode ? 'bg-zinc-800 border-white/10' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex flex-col items-center px-6 pt-6 pb-4 gap-3">
              <Avatar email={user.email} size="lg" />
              <div className="text-center">
                <p className={`font-bold text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Hi, {user.name || user.email.split('@')[0]}!
                </p>
                <p className={`text-sm mt-0.5 ${darkMode ? 'text-white/45' : 'text-gray-500'}`}>
                  {user.email}
                </p>
              </div>
            </div>

            <div className={`mx-4 border-t ${darkMode ? 'border-white/8' : 'border-gray-100'}`} />

            <div className="px-2 py-2">
              <button onClick={() => { navigate('/saved'); close(); }} className={navItem}>
                <BookmarkCheck size={16} className="text-[#4285f4] flex-shrink-0" />
                Saved Cards
              </button>
              <button onClick={() => { navigate('/decks'); close(); }} className={navItem}>
                <Layers size={16} className="text-[#34a853] flex-shrink-0" />
                My Decks
              </button>
            </div>

            <div className={`mx-4 border-t ${darkMode ? 'border-white/8' : 'border-gray-100'}`} />

            <div className="px-2 py-2">
              <button
                onClick={() => { logout(); close(); }}
                className={`${navItem} text-red-400 hover:text-red-500`}
              >
                <LogOut size={16} className="flex-shrink-0" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

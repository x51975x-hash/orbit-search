import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const { darkMode } = useApp();

  const linkCls = `transition-colors ${darkMode ? 'text-white/35 hover:text-white/70' : 'text-gray-400 hover:text-gray-700'}`;

  return (
    <footer className={`w-full py-6 mt-auto border-t flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-[12px] ${
      darkMode ? 'border-white/8 bg-zinc-900/60' : 'border-gray-100 bg-gray-50/50'
    }`}>
      <span className={darkMode ? 'text-white/25' : 'text-gray-400'}>
        © 2026 Orbit. All rights reserved.
      </span>
      <span className={`hidden sm:block w-px h-3 ${darkMode ? 'bg-white/15' : 'bg-gray-300'}`} />
      <div className="flex items-center gap-4">
        <Link to="/terms" className={linkCls}>Terms of Service</Link>
        <Link to="/privacy" className={linkCls}>Privacy Policy</Link>
      </div>
    </footer>
  );
}

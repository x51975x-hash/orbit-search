import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon, Sun, BookmarkCheck,
  Search, ChevronLeft, BookmarkX,
} from 'lucide-react';
import Logo from '../components/Logo';
import { GridCard } from '../components/UniversalCard';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import UserMenu from '../components/UserMenu';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../hooks/useLibrary';
import { Result } from '../data/results';

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg }: { msg: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.94 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full text-sm font-medium text-white bg-black/80 backdrop-blur-sm shadow-xl pointer-events-none whitespace-nowrap"
    >
      {msg}
    </motion.div>
  );
}


export default function SavedCardsPage() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useApp();
  const { user, logout } = useAuth();
  const { savedCards, unsaveCard, decks, createDeck, addCardToDeck } = useLibrary();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [toast, setToast] = useState<{ id: number; msg: string } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  const showToast = (msg: string) => {
    const id = Date.now();
    setToast({ id, msg });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2200);
  };

  const handleRemove = (card: Result) => {
    unsaveCard(card.id);
    showToast('Removed from saved');
  };

  const bg = darkMode ? 'bg-zinc-900 text-white' : 'bg-gray-50 text-gray-900';
  const headerBg = darkMode
    ? 'bg-zinc-900/80 border-white/8 backdrop-blur-xl'
    : 'bg-white/80 border-gray-200 backdrop-blur-xl';
  const iconBtn = `p-2 rounded-full transition-colors ${
    darkMode ? 'text-white/40 hover:text-white/80 hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-black/5'
  }`;

  return (
    <div className={`min-h-screen flex flex-col ${bg}`}>
      {/* Header */}
      <header className={`sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 border-b ${headerBg}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className={iconBtn} title="Back">
            <ChevronLeft size={18} />
          </button>
          <Logo size="sm" />
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={toggleDarkMode} className={iconBtn}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className={`w-px h-5 mx-1 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
          <UserMenu user={user} logout={logout} onSignIn={() => setShowAuthModal(true)} />
        </div>
      </header>

      {/* Page title */}
      <div className="px-8 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Saved Cards</h1>
            <p className={`text-sm mt-1 ${darkMode ? 'text-white/35' : 'text-gray-400'}`}>
              {savedCards.length} card{savedCards.length !== 1 ? 's' : ''} bookmarked
            </p>
          </div>
          {savedCards.length > 0 && (
            <span className={`text-sm font-semibold px-4 py-1.5 rounded-full ${
              darkMode ? 'bg-white/8 text-white/50' : 'bg-gray-100 text-gray-500'
            }`}>
              {savedCards.length}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 pb-16">
        {savedCards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 gap-5"
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${darkMode ? 'bg-white/6' : 'bg-slate-100'}`}>
              <BookmarkCheck size={34} className={darkMode ? 'text-white/20' : 'text-slate-300'} />
            </div>
            <div className="text-center">
              <p className={`text-lg font-semibold mb-1 ${darkMode ? 'text-white/50' : 'text-slate-500'}`}>No saved cards yet</p>
              <p className={`text-sm ${darkMode ? 'text-white/25' : 'text-slate-400'}`}>Browse cards and swipe right or tap the bookmark to save them here.</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-[#4285f4] text-white rounded-full text-sm font-semibold hover:bg-[#3367d6] transition-colors shadow-md flex items-center gap-2"
            >
              <Search size={15} /> Browse Cards
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-8 max-w-[1600px] mx-auto mt-8"
          >
            {savedCards.map((card, i) => (
              <div key={card.id} className="group flex flex-col items-center gap-2">
                <GridCard
                  card={card}
                  darkMode={darkMode}
                  index={i}
                  saved={true}
                  onSave={() => handleRemove(card)}
                  decks={decks}
                  onAddToDeck={addCardToDeck}
                  onCreateAndAdd={(c, name) => {
                    const deck = createDeck(name);
                    addCardToDeck(deck.id, c);
                    showToast(`Added to new deck "${name}"`);
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleRemove(card)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all opacity-0 group-hover:opacity-100 ${
                    darkMode
                      ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                      : 'bg-red-50 text-red-500 hover:bg-red-100'
                  }`}
                >
                  <BookmarkX size={12} /> Remove
                </motion.button>
              </div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast key={toast.id} msg={toast.msg} />}
      </AnimatePresence>

      <AnimatePresence>
        {showAuthModal && <AuthModal darkMode={darkMode} onClose={() => setShowAuthModal(false)} />}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

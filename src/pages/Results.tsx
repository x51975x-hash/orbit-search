import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Moon, Sun, LayoutList, Layers, BookmarkPlus, BookmarkCheck, Share2, X, RotateCcw, ChevronDown } from 'lucide-react';
import UserMenu from '../components/UserMenu';
import Logo from '../components/Logo';
import { UniversalCard, StackCard, GridCard, CARD_SIZE_STYLE } from '../components/UniversalCard';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import { searchResults, Result } from '../data/results';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { playWhoosh } from '../utils/sound';
import { useLibrary } from '../hooks/useLibrary';

const BATCH_SIZE = 10;


// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg }: { msg: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.94 }}
      className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full text-sm font-medium text-white bg-black/80 backdrop-blur-sm shadow-xl pointer-events-none whitespace-nowrap"
    >
      {msg}
    </motion.div>
  );
}

// ─── Results Page ─────────────────────────────────────────────────────────────
export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode, soundEnabled, toggleSound } = useApp();
  const { user, logout } = useAuth();
  const library = useLibrary();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const state    = location.state as { results?: Result[]; query?: string; visual?: boolean } | null;
  const isVisual = state?.visual ?? false;
  const allCards = state?.results ?? searchResults(state?.query ?? '', isVisual);

  const [batchStart, setBatchStart] = useState(0);
  const [deck, setDeck]             = useState<Result[]>(() => allCards.slice(0, BATCH_SIZE));
  const [history, setHistory]       = useState<Result[]>([]);
  const [viewMode, setViewMode]     = useState<'deck' | 'list'>('deck');
  const [toast, setToast]           = useState<{ id: number; msg: string } | null>(null);

  const showToast = useCallback((msg: string) => {
    const id = Date.now();
    setToast({ id, msg });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 2000);
  }, []);

  const handleSwipe = useCallback((dir: 'left' | 'right' | 'up' | 'down', result: Result) => {
    if (dir === 'down') { setViewMode('list'); return; }

    setHistory((h) => [result, ...h]);
    setDeck((prev) => prev.slice(1));

    if (soundEnabled) playWhoosh();

    if (dir === 'right') {
      library.saveCard(result);
      showToast('Saved to library');
    } else if (dir === 'left') {
      showToast('Skipped');
    } else if (dir === 'up') {
      if (navigator.share) {
        navigator.share({ title: result.title, text: result.description, url: result.url }).catch(() => {});
      }
      showToast('Shared!');
    }
  }, [soundEnabled, library, showToast]);

  const handleUndo = () => {
    if (history.length === 0) return;
    const [last, ...rest] = history;
    setHistory(rest);
    setDeck((prev) => [last, ...prev]);
    showToast('Undone');
  };

  const loadNextBatch = () => {
    const next = batchStart + BATCH_SIZE;
    const slice = allCards.slice(next, next + BATCH_SIZE);
    if (slice.length === 0) { showToast('No more results'); return; }
    setBatchStart(next);
    setDeck(slice);
    setHistory([]);
    setViewMode('deck');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const restartDeck = () => {
    setBatchStart(0);
    setDeck(allCards.slice(0, BATCH_SIZE));
    setHistory([]);
    setViewMode('deck');
  };

  const hasNextBatch = batchStart + BATCH_SIZE < allCards.length;
  const topThree = deck.slice(0, 3);

  const iconBtn = `p-2 rounded-full transition-colors ${
    darkMode ? 'text-white/40 hover:text-white/80 hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-black/5'
  }`;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${
      darkMode ? 'bg-gradient-to-br from-slate-900 via-zinc-900 to-black' : 'bg-gradient-to-br from-[#f0f4f8] to-[#e6ecef]'
    }`}>
      {/* ── Header ── */}
      <header className={`sticky top-0 z-30 flex items-center justify-between px-5 py-3 border-b transition-colors ${
        darkMode ? 'bg-zinc-900/80 backdrop-blur-xl border-white/8' : 'bg-white/80 backdrop-blur-xl border-gray-200/80'
      }`}>
        <div className="flex items-center gap-3">
          <Logo size="sm" />
        </div>

        {state?.query && (
          <p className={`text-sm hidden sm:block truncate max-w-xs ${darkMode ? 'text-white/40' : 'text-slate-400'}`}>
            {isVisual ? 'Visual search' : `"${state.query}"`}
          </p>
        )}

        <div className="flex items-center gap-1">
          <button onClick={() => setViewMode(viewMode === 'deck' ? 'list' : 'deck')} className={iconBtn}
            title={viewMode === 'deck' ? 'Switch to grid view' : 'Switch to deck view'}>
            {viewMode === 'deck' ? <LayoutList size={18} /> : <Layers size={18} />}
          </button>
          <button onClick={() => navigate('/saved')} title="Saved Cards" className={`${iconBtn} relative`}>
            <BookmarkCheck size={18} />
            {library.savedCards.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {library.savedCards.length}
              </span>
            )}
          </button>
          <button onClick={() => navigate('/decks')} title="My Decks" className={`${iconBtn} relative`}>
            <Layers size={18} />
            {library.decks.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#4285f4] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {library.decks.length}
              </span>
            )}
          </button>
          <button onClick={() => navigate('/')} title="Search" className={iconBtn}>
            <Search size={18} />
          </button>
          <button onClick={toggleDarkMode} className={iconBtn}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Auth controls */}
          <div className={`w-px h-5 mx-1 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
          <UserMenu user={user} logout={logout} onSignIn={() => setShowAuthModal(true)} />
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col items-center pb-32">
        <AnimatePresence mode="wait">

          {/* ── DECK VIEW ── */}
          {viewMode === 'deck' && (
            <motion.div key="deck"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center gap-5 w-full pt-8"
            >
              {deck.length > 0 ? (
                <>
                  {/* Gesture hint row */}
                  <div className={`flex gap-5 text-[11px] font-medium ${darkMode ? 'text-white/20' : 'text-slate-400'}`}>
                    <span className="flex items-center gap-1 text-[#ea4335]"><X size={10} /> Skip</span>
                    <span className="flex items-center gap-1 text-[#4285f4]"><Share2 size={10} /> Share</span>
                    <span className="flex items-center gap-1 text-[#34a853]"><BookmarkPlus size={10} /> Save</span>
                    <span className="flex items-center gap-1 text-[#fbbc05]"><ChevronDown size={10} /> Grid</span>
                  </div>

                  {/* Card stack */}
                  <div className="relative" style={{ ...CARD_SIZE_STYLE, perspective: '1400px' }}>
                    {/* Background cards */}
                    {topThree.slice(1).map((result, i) => (
                      <StackCard
                        key={result.id}
                        card={result}
                        stackIndex={i + 1}
                        darkMode={darkMode}
                      />
                    ))}

                    {/* Top card */}
                    <AnimatePresence>
                      {topThree[0] && (
                        <UniversalCard
                          key={topThree[0].id}
                          card={topThree[0]}
                          onSwipe={handleSwipe}
                          darkMode={darkMode}
                          saved={!!library.savedCards.find((c) => c.id === topThree[0].id)}
                          onSave={(r) => library.savedCards.find((c) => c.id === r.id) ? library.unsaveCard(r.id) : library.saveCard(r)}
                          decks={library.decks}
                          onAddToDeck={library.addCardToDeck}
                          onCreateAndAdd={(card, name) => {
                            const d = library.createDeck(name);
                            library.addCardToDeck(d.id, card);
                          }}
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Progress dots */}
                  <div className={`flex flex-col items-center gap-1 ${darkMode ? 'text-white/20' : 'text-slate-400'}`}>
                    <div className="flex gap-1">
                      {deck.slice(0, Math.min(deck.length, 10)).map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          i === 0
                            ? darkMode ? 'bg-white/50' : 'bg-slate-500'
                            : darkMode ? 'bg-white/15' : 'bg-slate-200'
                        }`} />
                      ))}
                    </div>
                    <p className="text-[11px]">{deck.length} remaining · {allCards.length} total</p>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col items-center gap-4 mt-24 text-center ${darkMode ? 'text-white/50' : 'text-slate-500'}`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${darkMode ? 'bg-white/8' : 'bg-slate-100'}`}>
                    <Layers size={28} className="opacity-50" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold mb-1">All caught up</p>
                    <p className="text-sm">You've gone through this batch.</p>
                  </div>
                  <div className="flex flex-col gap-3 w-full max-w-xs">
                    {hasNextBatch && (
                      <button onClick={loadNextBatch}
                        className="px-6 py-2.5 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors shadow-md">
                        Load Next Deck
                      </button>
                    )}
                    <button onClick={restartDeck}
                      className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                        darkMode ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}>
                      Restart Deck
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── GRID VIEW ── */}
          {viewMode === 'list' && (
            <motion.div key="list"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <div className="flex items-center justify-between mb-6 px-8 pt-6">
                <h2 className={`font-semibold text-sm ${darkMode ? 'text-white/50' : 'text-slate-500'}`}>
                  {allCards.length} results{isVisual ? ' · Visual' : state?.query ? ` · "${state.query}"` : ''}
                </h2>
                <button
                  onClick={() => setViewMode('deck')}
                  className="flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors">
                  <Layers size={13} /> Deck view
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-8 max-w-[1600px] mx-auto mt-8">
                {allCards.map((r, i) => (
                  <GridCard
                    key={r.id}
                    card={r}
                    darkMode={darkMode}
                    index={i}
                    saved={!!library.savedCards.find((c) => c.id === r.id)}
                    onSave={(card) => {
                      const isSaved = !!library.savedCards.find((c) => c.id === card.id);
                      isSaved ? library.unsaveCard(card.id) : library.saveCard(card);
                      showToast(isSaved ? 'Removed from saved' : 'Saved to library');
                    }}
                    decks={library.decks}
                    onAddToDeck={library.addCardToDeck}
                    onCreateAndAdd={(card, name) => {
                      const d = library.createDeck(name);
                      library.addCardToDeck(d.id, card);
                      showToast(`Added to "${name}"`);
                    }}
                  />
                ))}
              </div>

              {hasNextBatch && (
                <div className="mt-10 flex justify-center">
                  <button onClick={loadNextBatch}
                    className="px-8 py-3 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors shadow-md flex items-center gap-2">
                    <Layers size={15} /> Load Next Deck
                  </button>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── Undo FAB ── */}
      <AnimatePresence>
        {history.length > 0 && viewMode === 'deck' && (
          <motion.button
            key="undo-fab"
            initial={{ opacity: 0, scale: 0.7, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleUndo}
            className={`fixed bottom-8 left-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full shadow-xl font-medium text-sm transition-colors ${
              darkMode
                ? 'bg-zinc-700 text-white/80 hover:bg-zinc-600 ring-1 ring-white/10'
                : 'bg-white text-slate-700 hover:bg-slate-50 ring-1 ring-slate-200 shadow-lg'
            }`}
            title="Undo last swipe"
          >
            <RotateCcw size={15} />
            <span>Undo</span>
            <span className={`ml-0.5 w-5 h-5 text-[10px] font-bold rounded-full flex items-center justify-center ${
              darkMode ? 'bg-amber-500/80 text-black' : 'bg-amber-400 text-black'
            }`}>
              {history.length}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && <Toast key={toast.id} msg={toast.msg} />}
      </AnimatePresence>

      <AnimatePresence>
        {showAuthModal && (
          <AuthModal darkMode={darkMode} onClose={() => setShowAuthModal(false)} />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

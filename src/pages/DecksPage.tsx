import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon, Sun, Layers, Plus, Trash2, Share2, ChevronLeft,
  FolderOpen, Search,
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

// ─── User dropdown ────────────────────────────────────────────────────────────
// ─── Confirm dialog ───────────────────────────────────────────────────────────
function ConfirmDeleteModal({
  deckName, darkMode, onConfirm, onCancel,
}: {
  deckName: string;
  darkMode: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 12 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl ${
          darkMode ? 'bg-zinc-800 border border-white/10' : 'bg-white border border-gray-100'
        }`}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${darkMode ? 'bg-red-500/15' : 'bg-red-50'}`}>
          <Trash2 size={22} className="text-red-500" />
        </div>
        <h3 className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Delete Deck?</h3>
        <p className={`text-sm mb-6 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
          "{deckName}" and all its cards will be permanently removed. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className={`flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-colors ${
              darkMode ? 'bg-white/8 text-white/60 hover:bg-white/12' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-2xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Single Deck Section ──────────────────────────────────────────────────────
function DeckSection({
  deck, darkMode, onDelete, onShare, onRemoveCard, allDecks, onAddToDeck, onCreateAndAdd,
}: {
  deck: ReturnType<typeof useLibrary>['decks'][number];
  darkMode: boolean;
  onDelete: () => void;
  onShare: () => void;
  onRemoveCard: (cardId: string) => void;
  allDecks: ReturnType<typeof useLibrary>['decks'];
  onAddToDeck: (deckId: string, card: Result) => void;
  onCreateAndAdd: (card: Result, name: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const surface = darkMode
    ? 'bg-zinc-800/60 border border-white/8'
    : 'bg-white border border-gray-100 shadow-sm';

  return (
    <>
      <motion.section
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className={`rounded-3xl overflow-hidden ${surface}`}
      >
        {/* Deck header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode ? 'border-white/8' : 'border-gray-100'}`}>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex items-center gap-3 flex-1 min-w-0 text-left group"
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
              darkMode ? 'bg-[#34a853]/15 group-hover:bg-[#34a853]/25' : 'bg-green-50 group-hover:bg-green-100'
            }`}>
              <FolderOpen size={18} className="text-[#34a853]" />
            </div>
            <div className="min-w-0">
              <h2 className={`text-base font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{deck.name}</h2>
              <p className={`text-[12px] ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
                {deck.cards.length} card{deck.cards.length !== 1 ? 's' : ''}
                {collapsed ? ' · tap to expand' : ''}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <button
              onClick={onShare}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-colors ${
                darkMode
                  ? 'bg-[#4285f4]/15 text-[#4285f4] hover:bg-[#4285f4]/25'
                  : 'bg-blue-50 text-[#4285f4] hover:bg-blue-100'
              }`}
            >
              <Share2 size={13} /> Share
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-colors ${
                darkMode
                  ? 'bg-red-500/12 text-red-400 hover:bg-red-500/22'
                  : 'bg-red-50 text-red-500 hover:bg-red-100'
              }`}
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>

        {/* Cards grid */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              {deck.cards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Layers size={28} className={darkMode ? 'text-white/15' : 'text-slate-300'} />
                  <p className={`text-sm ${darkMode ? 'text-white/25' : 'text-gray-400'}`}>No cards in this deck yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-8 max-w-[1600px] mx-auto">
                  {deck.cards.map((card, i) => (
                    <div key={card.id} className="group flex flex-col items-center gap-2">
                      <GridCard
                        card={card}
                        darkMode={darkMode}
                        index={i}
                        saved={false}
                        onSave={() => {}}
                        decks={allDecks}
                        onAddToDeck={onAddToDeck}
                        onCreateAndAdd={onCreateAndAdd}
                      />
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onRemoveCard(card.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all opacity-0 group-hover:opacity-100 ${
                          darkMode
                            ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                            : 'bg-red-50 text-red-500 hover:bg-red-100'
                        }`}
                      >
                        <Trash2 size={11} /> Remove
                      </motion.button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <AnimatePresence>
        {confirmDelete && (
          <ConfirmDeleteModal
            deckName={deck.name}
            darkMode={darkMode}
            onConfirm={() => { setConfirmDelete(false); onDelete(); }}
            onCancel={() => setConfirmDelete(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default function DecksPage() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useApp();
  const { user, logout } = useAuth();
  const { decks, savedCards, createDeck, deleteDeck, addCardToDeck, removeCardFromDeck } = useLibrary();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [toast, setToast] = useState<{ id: number; msg: string } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  const showToast = (msg: string) => {
    const id = Date.now();
    setToast({ id, msg });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2200);
  };

  const handleCreateDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;
    createDeck(newDeckName.trim());
    showToast(`Deck "${newDeckName.trim()}" created`);
    setNewDeckName('');
  };

  const handleShareDeck = (deck: ReturnType<typeof useLibrary>['decks'][number]) => {
    const url = `${window.location.origin}/decks/${deck.id}`;
    const shareData = {
      title: deck.name,
      text: `Check out my deck "${deck.name}" — ${deck.cards.length} card${deck.cards.length !== 1 ? 's' : ''} on Orbit.`,
      url,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url).catch(() => {});
      showToast('Link copied to clipboard');
    }
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

      {/* Page title + create form */}
      <div className="px-8 pt-8 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>My Decks</h1>
            <p className={`text-sm mt-1 ${darkMode ? 'text-white/35' : 'text-gray-400'}`}>
              {decks.length} deck{decks.length !== 1 ? 's' : ''} &middot; {savedCards.length} saved card{savedCards.length !== 1 ? 's' : ''}
            </p>
          </div>

          <form onSubmit={handleCreateDeck} className="flex items-center gap-2">
            <input
              type="text"
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              placeholder="Name your new deck…"
              className={`w-52 px-4 py-2 text-sm rounded-xl border outline-none transition-colors ${
                darkMode
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/25 focus:border-white/30 focus:ring-1 focus:ring-white/20'
                  : 'bg-white border-gray-200 text-gray-700 placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400'
              }`}
            />
            <button
              type="submit"
              disabled={!newDeckName.trim()}
              className="px-4 py-2 bg-[#4285f4] text-white text-sm font-semibold rounded-xl hover:bg-[#3367d6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
            >
              <Plus size={15} /> Create
            </button>
          </form>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 pb-16 space-y-6 px-8">
        {decks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-28 gap-5"
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${darkMode ? 'bg-white/6' : 'bg-slate-100'}`}>
              <Layers size={34} className={darkMode ? 'text-white/20' : 'text-slate-300'} />
            </div>
            <div className="text-center">
              <p className={`text-lg font-semibold mb-1 ${darkMode ? 'text-white/50' : 'text-slate-500'}`}>No decks yet</p>
              <p className={`text-sm ${darkMode ? 'text-white/25' : 'text-slate-400'}`}>
                Create a deck above, or add cards to a deck from the Results or Saved pages.
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-[#4285f4] text-white rounded-full text-sm font-semibold hover:bg-[#3367d6] transition-colors shadow-md flex items-center gap-2"
            >
              <Search size={15} /> Browse Cards
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {decks.map((deck) => (
              <DeckSection
                key={deck.id}
                deck={deck}
                darkMode={darkMode}
                onDelete={() => { deleteDeck(deck.id); showToast(`Deck "${deck.name}" deleted`); }}
                onShare={() => handleShareDeck(deck)}
                onRemoveCard={(cardId) => { removeCardFromDeck(deck.id, cardId); showToast('Card removed from deck'); }}
                allDecks={decks}
                onAddToDeck={addCardToDeck}
                onCreateAndAdd={(card, name) => {
                  const d = createDeck(name);
                  addCardToDeck(d.id, card);
                  showToast(`Added to new deck "${name}"`);
                }}
              />
            ))}
          </AnimatePresence>
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

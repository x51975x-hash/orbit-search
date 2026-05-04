import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'react-qr-code';
import { Moon, Sun, BookmarkCheck, FolderOpen, Plus, X, Share2, Trash2, ExternalLink, Layers, Search, RotateCcw, LayoutList, RefreshCw, CircleUser as UserCircle2, LogOut } from 'lucide-react';
import Logo from '../components/Logo';
import { UniversalCard, StackCard, GridCard, DeckMenu, CARD_SIZE_STYLE } from '../components/UniversalCard';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../hooks/useLibrary';
import { useDragTracking } from '../hooks/useDragTracking';
import { Result } from '../data/results';

type Tab = 'saved' | 'decks';

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

// ─── Saved Cards Stack View ───────────────────────────────────────────────────
function SavedStackView({
  savedCards, decks, darkMode,
  onDelete, onAddToDeck, onCreateAndAdd,
  onSwitchToGrid, showToast,
}: {
  savedCards: Result[];
  decks: ReturnType<typeof useLibrary>['decks'];
  darkMode: boolean;
  onDelete: (id: string) => void;
  onAddToDeck: (deckId: string, card: Result) => void;
  onCreateAndAdd: (card: Result, name: string) => void;
  onSwitchToGrid: () => void;
  showToast: (msg: string) => void;
}) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [history, setHistory]     = useState<{ card: Result; action: 'skip' | 'delete' | 'share' }[]>([]);

  const cards  = savedCards.filter((c) => !dismissed.includes(c.id));
  const top    = cards[0] ?? null;

  const popTop = (action: 'skip' | 'delete' | 'share') => {
    if (!top) return;
    setHistory((h) => [...h, { card: top, action }]);
    setDismissed((d) => [...d, top.id]);
  };

  const handleSwipe = (dir: 'left' | 'right' | 'up' | 'down', card: Result) => {
    if (dir === 'down') { onSwitchToGrid(); return; }
    if (dir === 'left')  { popTop('skip');   showToast('Skipped'); }
    if (dir === 'right') { onDelete(card.id); popTop('delete'); showToast('Removed from saved'); }
    if (dir === 'up') {
      if (navigator.share) {
        navigator.share({ title: card.title, text: card.description, url: card.url }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(card.url).catch(() => {});
      }
      popTop('share');
      showToast('Shared!');
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    if (last.action !== 'delete') {
      setDismissed((d) => d.filter((id) => id !== last.card.id));
    }
  };

  const label = darkMode ? 'text-white/30' : 'text-gray-400';

  if (savedCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${darkMode ? 'bg-white/8' : 'bg-slate-100'}`}>
          <BookmarkCheck size={28} className="opacity-30" />
        </div>
        <p className={`text-sm ${label}`}>No saved cards yet. Swipe right on a result to save it.</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${darkMode ? 'bg-white/8' : 'bg-slate-100'}`}>
          <BookmarkCheck size={28} className="opacity-30" />
        </div>
        <p className={`text-sm ${label}`}>You've reviewed all your saved cards!</p>
        {history.some((h) => h.action !== 'delete') && (
          <button onClick={handleUndo}
            className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-600 transition-colors">
            <RotateCcw size={13} /> Undo last
          </button>
        )}
      </div>
    );
  }

  const topThree = cards.slice(0, 3);

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      {/* Gesture hints */}
      <div className={`flex gap-5 text-[11px] font-medium ${darkMode ? 'text-white/20' : 'text-slate-400'}`}>
        <span className="flex items-center gap-1 text-[#ea4335]"><X size={10} /> Skip</span>
        <span className="flex items-center gap-1 text-[#4285f4]"><Share2 size={10} /> Share</span>
        <span className="flex items-center gap-1 text-red-500"><Trash2 size={10} /> Delete</span>
        <span className="flex items-center gap-1 text-[#fbbc05]"><LayoutList size={10} /> Grid</span>
      </div>

      {/* Stack */}
      <div className="relative" style={{ ...CARD_SIZE_STYLE, perspective: '1400px' }}>
        {topThree.slice(1).map((card, i) => (
          <StackCard key={card.id} card={card} stackIndex={i + 1} darkMode={darkMode} />
        ))}
        <AnimatePresence>
          {top && (
            <UniversalCard
              key={top.id}
              card={top}
              darkMode={darkMode}
              decks={decks}
              onAddToDeck={onAddToDeck}
              onCreateAndAdd={onCreateAndAdd}
              onSwipe={handleSwipe}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Progress */}
      <p className={`text-[11px] ${darkMode ? 'text-white/20' : 'text-slate-400'}`}>
        {cards.length} of {savedCards.length} remaining
      </p>

      {/* Undo FAB */}
      <AnimatePresence>
        {history.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleUndo}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg font-medium text-sm transition-colors ${
              darkMode
                ? 'bg-zinc-700 text-white/80 hover:bg-zinc-600 ring-1 ring-white/10'
                : 'bg-white text-slate-700 hover:bg-slate-50 ring-1 ring-slate-200 shadow-md'
            }`}
          >
            <RotateCcw size={14} />
            Undo Last Swipe
            <span className={`w-5 h-5 text-[10px] font-bold rounded-full flex items-center justify-center ${
              darkMode ? 'bg-amber-500/80 text-black' : 'bg-amber-400 text-black'
            }`}>
              {history.filter((h) => h.action !== 'delete').length || history.length}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Saved Cards Grid ─────────────────────────────────────────────────────────
function SavedGrid({
  savedCards, decks, darkMode,
  onRemove, onAddToDeck, onCreateAndAdd,
}: {
  savedCards: Result[];
  decks: ReturnType<typeof useLibrary>['decks'];
  darkMode: boolean;
  onRemove: (id: string) => void;
  onAddToDeck: (deckId: string, card: Result) => void;
  onCreateAndAdd: (card: Result, name: string) => void;
}) {
  const label = darkMode ? 'text-white/30' : 'text-gray-500';

  if (savedCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${darkMode ? 'bg-white/8' : 'bg-slate-100'}`}>
          <BookmarkCheck size={28} className="opacity-30" />
        </div>
        <p className={`text-sm ${label}`}>No saved cards yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-8 max-w-[1600px] mx-auto mt-8">
      {savedCards.map((card, i) => (
        <GridCard
          key={card.id}
          card={card}
          darkMode={darkMode}
          index={i}
          saved={true}
          onSave={() => onRemove(card.id)}
          decks={decks}
          onAddToDeck={onAddToDeck}
          onCreateAndAdd={onCreateAndAdd}
        />
      ))}
    </div>
  );
}

// ─── Deck card swipe badges (same glassmorphic style as UniversalCard) ─────────
function DeckSwipeBadges({ dragDir }: { dragDir: string | null }) {
  return (
    <>
      <div className={`absolute inset-0 rounded-[2rem] z-10 pointer-events-none flex items-start justify-start p-5 transition-opacity duration-100 ${dragDir === 'right' ? 'opacity-100' : 'opacity-0'}`}>
        <span className="bg-white/40 backdrop-blur-md border-2 border-[#34a853] shadow-sm px-6 py-2 rounded-full text-[13px] font-extrabold tracking-widest uppercase text-[#34a853]" style={{ transform: 'rotate(12deg)' }}>KEEP</span>
      </div>
      <div className={`absolute inset-0 rounded-[2rem] z-10 pointer-events-none flex items-start justify-end p-5 transition-opacity duration-100 ${dragDir === 'left' ? 'opacity-100' : 'opacity-0'}`}>
        <span className="bg-white/40 backdrop-blur-md border-2 border-[#ea4335] shadow-sm px-6 py-2 rounded-full text-[13px] font-extrabold tracking-widest uppercase text-[#ea4335]" style={{ transform: 'rotate(-12deg)' }}>SKIP</span>
      </div>
      <div className={`absolute inset-0 rounded-[2rem] z-10 pointer-events-none flex items-start justify-center pt-5 transition-opacity duration-100 ${dragDir === 'up' ? 'opacity-100' : 'opacity-0'}`}>
        <span className="bg-white/40 backdrop-blur-md border-2 border-[#4285f4] shadow-sm px-6 py-2 rounded-full text-[13px] font-extrabold tracking-widest uppercase text-[#4285f4]">SHARE</span>
      </div>
      <div className={`absolute inset-0 rounded-[2rem] z-10 pointer-events-none flex items-end justify-center pb-5 transition-opacity duration-100 ${dragDir === 'down' ? 'opacity-100' : 'opacity-0'}`}>
        <span className="bg-white/40 backdrop-blur-md border-2 border-[#fbbc05] shadow-sm px-6 py-2 rounded-full text-[13px] font-extrabold tracking-widest uppercase text-[#fbbc05]">GRID</span>
      </div>
    </>
  );
}

// ─── Deck Universal Card (top draggable card — matches UniversalCard exactly) ─
function DeckUniversalCard({
  deck, darkMode, onSwipe, onShare, onDelete,
}: {
  deck: ReturnType<typeof useLibrary>['decks'][number];
  darkMode: boolean;
  onSwipe: (dir: 'left' | 'right' | 'up' | 'down') => void;
  onShare: () => void;
  onDelete: () => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const didDragRef = useRef(false);
  const deckUrl = `${window.location.origin}/results?deck=${encodeURIComponent(deck.name)}`;
  const createdDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const cardCountLabel = `${deck.cards.length} ${deck.cards.length === 1 ? 'card' : 'cards'}`;
  const includesText = deck.cards.length > 0
    ? 'Includes: ' + deck.cards.slice(0, 3).map((c) => c.title).join(', ') + (deck.cards.length > 3 ? `… +${deck.cards.length - 3} more` : '')
    : 'This deck is empty.';

  const { handlers, offset, isDragging, dragDir } = useDragTracking({
    onSwipeLeft:  () => onSwipe('left'),
    onSwipeRight: () => onSwipe('right'),
    onSwipeUp:    () => onSwipe('up'),
    onSwipeDown:  () => onSwipe('down'),
    threshold: 90,
  });

  const wrappedHandlers = {
    ...handlers,
    onMouseDown: (e: React.MouseEvent) => { didDragRef.current = false; handlers.onMouseDown(e); },
    onTouchStart: (e: React.TouchEvent) => { didDragRef.current = false; handlers.onTouchStart(e); },
    onMouseMove: (e: React.MouseEvent) => {
      if (Math.abs(offset.x) > 6 || Math.abs(offset.y) > 6) didDragRef.current = true;
      handlers.onMouseMove(e);
    },
    onTouchMove: (e: React.TouchEvent) => {
      if (Math.abs(offset.x) > 6 || Math.abs(offset.y) > 6) didDragRef.current = true;
      handlers.onTouchMove(e);
    },
  };

  const handleClick = (e: React.MouseEvent) => {
    if (didDragRef.current) return;
    if ((e.target as HTMLElement).closest('a, button')) return;
    setFlipped((f) => !f);
  };

  const rotation = isDragging ? offset.x / 18 : 0;
  const label = darkMode ? 'text-[#5f6368]' : 'text-[#3c4043]';

  return (
    <div
      {...wrappedHandlers}
      onClick={handleClick}
      className={`absolute inset-x-0 mx-auto rounded-[2rem] border overflow-hidden select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      } ${darkMode ? 'bg-zinc-800/95 border-white/10' : 'bg-white/95 border-gray-100'}`}
      style={{
        ...CARD_SIZE_STYLE,
        transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
        transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)',
        zIndex: 30,
        boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
        transformOrigin: 'bottom center',
      }}
    >
      <DeckSwipeBadges dragDir={dragDir} />

      {/* 3D flip container */}
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 28 }}
        style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%', position: 'relative' }}
      >
        {/* ── Front face ── */}
        <div
          className="absolute inset-0 flex flex-col"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          {/* QR header */}
          <div className={`relative flex items-center justify-center py-5 flex-shrink-0 border-b ${
            darkMode ? 'bg-slate-800/60 border-white/10' : 'bg-gray-50/80 border-gray-100'
          }`}>
            <div className="bg-white p-3 rounded-2xl shadow-sm">
              <QRCode value={deckUrl} size={118} level="H" includeMargin={false} />
            </div>

            {/* Top-right actions: Share, Delete, Flip */}
            <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5">
              <button
                onClick={(e) => { e.stopPropagation(); onShare(); }}
                title="Copy share link"
                className={`p-1.5 rounded-full transition-colors backdrop-blur-sm shadow-sm ${
                  darkMode ? 'text-white/30 bg-white/8 hover:text-blue-400 hover:bg-blue-500/20' : 'text-slate-400 bg-white/90 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Share2 size={15} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                title="Delete deck"
                className={`p-1.5 rounded-full transition-colors backdrop-blur-sm shadow-sm ${
                  darkMode ? 'text-white/30 bg-white/8 hover:text-red-400 hover:bg-red-500/20' : 'text-slate-400 bg-white/90 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setFlipped(true); }}
                title="View details"
                className={`p-1.5 rounded-full transition-colors backdrop-blur-sm shadow-sm ${
                  darkMode ? 'text-white/30 bg-white/8 hover:text-white/70 hover:bg-white/15' : 'text-slate-400 bg-white/90 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>

          {/* Text content */}
          <div className="flex flex-col flex-1 px-5 pt-4 pb-3 min-h-0">
            <p className={`text-[11px] mb-0.5 truncate font-medium ${label}`}>
              DECK &bull; {cardCountLabel.toUpperCase()}
            </p>
            <p className={`text-[17px] font-normal leading-snug mb-2 truncate ${
              darkMode ? 'text-[#8ab4f8]' : 'text-[#1a0dab]'
            }`}>
              {deck.name}
            </p>
            <p className={`text-[13px] leading-relaxed line-clamp-3 flex-1 ${darkMode ? 'text-[#9aa0a6]' : 'text-[#4d5156]'}`}>
              {includesText}
            </p>
          </div>

          {/* Footer */}
          <div className={`flex items-center gap-0.5 px-3 py-3 border-t ${darkMode ? 'border-white/8' : 'border-gray-100'}`}>
            <button
              onClick={(e) => { e.stopPropagation(); onShare(); }}
              className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                darkMode ? 'text-white/30 hover:text-white/70 hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ExternalLink size={14} />
            </button>
          </div>

          <p className={`text-[10px] text-center pb-2 select-none ${darkMode ? 'text-white/15' : 'text-slate-300'}`}>
            tap to see more &middot; drag to interact
          </p>
        </div>

        {/* ── Back face ── */}
        <div
          className="absolute inset-0 flex flex-col rounded-[2rem] overflow-hidden bg-[#4285f4]"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/20 flex-shrink-0">
            <p className="text-xs font-bold uppercase tracking-widest text-white/60">Deck Details</p>
            <button
              onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
              className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors pointer-events-auto"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Date Created</p>
              <p className="text-[13px] text-white/90">{createdDate}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Total Cards</p>
              <p className="text-[13px] text-white/90">{cardCountLabel}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Cards in Deck</p>
              {deck.cards.length === 0 ? (
                <p className="text-[13px] text-white/60 italic">No cards yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {deck.cards.map((c) => (
                    <li key={c.id} className="flex items-start gap-1.5">
                      <span className="text-white/40 flex-shrink-0 mt-0.5">·</span>
                      <span className="text-[13px] text-white/85 line-clamp-1">{c.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1.5">Notes</p>
              <DeckCardNotes />
            </div>
          </div>

          <div className="px-5 pb-5 pt-3 flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onShare(); }}
              className="w-full py-3 rounded-2xl bg-white text-[#4285f4] font-bold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 shadow-lg pointer-events-auto"
            >
              <Share2 size={15} /> Share This Deck
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function DeckCardNotes() {
  const [notes, setNotes] = useState('');
  return (
    <textarea
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      placeholder="Add a note about this deck…"
      rows={3}
      className="w-full text-[12px] px-3 py-2 rounded-xl bg-white/15 border border-white/20 text-white placeholder-white/40 outline-none focus:bg-white/20 focus:border-white/40 resize-none transition-colors pointer-events-auto"
    />
  );
}

// ─── Deck background stack card (matches StackCard dimensions) ─────────────────
function DeckBgCard({
  deck, stackIndex, darkMode,
}: {
  deck: ReturnType<typeof useLibrary>['decks'][number];
  stackIndex: number;
  darkMode: boolean;
}) {
  const { scale, yOffset, shadow, zIndex } = { scale: 1 - stackIndex * 0.07, yOffset: stackIndex * 18, shadow: '0 12px 30px rgba(0,0,0,0.10)', zIndex: 20 - stackIndex * 10 };
  const deckUrl = `${window.location.origin}/results?deck=${encodeURIComponent(deck.name)}`;
  const label = darkMode ? 'text-[#5f6368]' : 'text-[#3c4043]';

  return (
    <div
      className={`absolute inset-x-0 mx-auto rounded-[2rem] border pointer-events-none select-none overflow-hidden ${
        darkMode ? 'bg-zinc-800/95 border-white/10' : 'bg-white/95 border-gray-100'
      }`}
      style={{
        ...CARD_SIZE_STYLE,
        transform: `translateY(${yOffset}px) scale(${scale})`,
        boxShadow: shadow,
        zIndex,
        opacity: 1 - stackIndex * 0.1,
      }}
    >
      <div className={`flex items-center justify-center py-5 border-b ${
        darkMode ? 'bg-slate-800/60 border-white/10' : 'bg-gray-50/80 border-gray-100'
      }`}>
        <div className="bg-white p-3 rounded-2xl shadow-sm">
          <QRCode value={deckUrl} size={118} level="H" includeMargin={false} />
        </div>
      </div>
      <div className="px-5 pt-4">
        <p className={`text-[11px] mb-0.5 truncate font-medium ${label}`}>
          DECK &bull; {deck.cards.length} CARDS
        </p>
        <p className={`text-[17px] font-normal leading-snug truncate ${darkMode ? 'text-[#8ab4f8]' : 'text-[#1a0dab]'}`}>
          {deck.name}
        </p>
      </div>
    </div>
  );
}

// ─── Deck Stack Card (grid view) ──────────────────────────────────────────────
function DeckStackCard({
  deck, darkMode, onDelete, onShare, onRemoveFromDeck,
}: {
  deck: ReturnType<typeof useLibrary>['decks'][number];
  darkMode: boolean;
  onDelete: (id: string) => void;
  onShare: (name: string) => void;
  onRemoveFromDeck: (deckId: string, cardId: string) => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const label    = darkMode ? 'text-[#5f6368]' : 'text-[#3c4043]';
  const deckUrl  = `${window.location.origin}/results?deck=${encodeURIComponent(deck.name)}`;
  const createdDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const layerBg  = darkMode ? 'bg-zinc-700 border-white/8' : 'bg-gray-100 border-gray-200';
  const includesText = deck.cards.length > 0
    ? 'Includes: ' + deck.cards.slice(0, 3).map((c) => c.title).join(', ') + (deck.cards.length > 3 ? `… +${deck.cards.length - 3} more` : '')
    : 'This deck is empty.';

  return (
    <div
      className="relative"
      style={{ ...CARD_SIZE_STYLE, perspective: '1000px' }}
    >
      {/* Stacked layer shadows */}
      <div className={`absolute -bottom-2 -left-2 w-full h-full rounded-[2rem] border ${layerBg} transition-transform duration-200`} style={{ zIndex: 0 }} />
      <div className={`absolute -bottom-1 -left-1 w-full h-full rounded-[2rem] border ${layerBg} ${darkMode ? '' : 'bg-gray-50'} transition-transform duration-200`} style={{ zIndex: 1 }} />

      {/* Flip container */}
      <div
        className="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d]"
        style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)', zIndex: 2 }}
      >
        {/* ── Front ── */}
        <div
          className={`absolute inset-0 rounded-[2rem] border overflow-hidden shadow-sm hover:shadow-md transition-shadow [backface-visibility:hidden] ${
            darkMode ? 'bg-zinc-800 border-white/10' : 'bg-white border-gray-100'
          }`}
        >
          {/* Top 50%: QR */}
          <div
            className={`relative flex items-center justify-center border-b flex-shrink-0 ${
              darkMode ? 'bg-slate-800/60 border-white/10' : 'bg-gray-50/70 border-gray-100'
            }`}
            style={{ height: 240 }}
          >
            <div className="bg-white p-3 rounded-2xl shadow-sm">
              <QRCode value={deckUrl} size={118} level="H" includeMargin={false} />
            </div>
            <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
              <button
                onClick={() => onShare(deck.name)}
                title="Copy share link"
                className={`p-1.5 rounded-full transition-colors shadow-sm ${
                  darkMode ? 'text-white/30 bg-white/8 hover:text-blue-400 hover:bg-blue-500/20' : 'text-slate-400 bg-white/90 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Share2 size={15} />
              </button>
              <button
                onClick={() => onDelete(deck.id)}
                title="Delete deck"
                className={`p-1.5 rounded-full transition-colors shadow-sm ${
                  darkMode ? 'text-white/30 bg-white/8 hover:text-red-400 hover:bg-red-500/20' : 'text-slate-400 bg-white/90 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={() => setIsFlipped(true)}
                title="View details"
                className={`p-1.5 rounded-full transition-colors shadow-sm ${
                  darkMode ? 'text-white/30 bg-white/8 hover:text-white/70 hover:bg-white/15' : 'text-slate-400 bg-white/90 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>

          {/* Bottom 50%: text + footer */}
          <div className="flex flex-col overflow-hidden" style={{ height: 240 }}>
            <div className="flex flex-col flex-1 px-5 pt-4 pb-2 overflow-hidden">
              <p className={`text-[11px] mb-0.5 truncate font-medium flex-shrink-0 ${label}`}>
                DECK &bull; {deck.cards.length} {deck.cards.length === 1 ? 'CARD' : 'CARDS'}
              </p>
              <h3 className={`text-[17px] font-normal leading-snug mb-2 line-clamp-2 flex-shrink-0 ${
                darkMode ? 'text-[#8ab4f8]' : 'text-[#1a0dab]'
              }`}>{deck.name}</h3>
              <p className={`text-[13px] leading-relaxed line-clamp-3 ${darkMode ? 'text-[#9aa0a6]' : 'text-[#4d5156]'}`}>
                {includesText}
              </p>
            </div>

            <div className={`flex items-center gap-0.5 px-3 py-2 border-t flex-shrink-0 ${darkMode ? 'border-white/8' : 'border-gray-100'}`}>
              {deck.cards.slice(0, 3).map((c) => (
                <button key={c.id}
                  onClick={() => onRemoveFromDeck(deck.id, c.id)}
                  title={`Remove "${c.title}"`}
                  className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                    darkMode ? 'text-white/20 hover:text-red-400 hover:bg-white/10' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <X size={12} />
                </button>
              ))}
              <button
                onClick={() => onShare(deck.name)}
                className={`p-2 rounded-full transition-colors flex-shrink-0 ml-auto ${
                  darkMode ? 'text-white/30 hover:text-white/70 hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ExternalLink size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Back ── */}
        <div
          className="absolute inset-0 rounded-[2rem] overflow-hidden [backface-visibility:hidden] bg-[#4285f4] flex flex-col"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/20 flex-shrink-0">
            <p className="text-xs font-bold uppercase tracking-widest text-white/60">Deck Details</p>
            <button
              onClick={() => setIsFlipped(false)}
              className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Date Created</p>
              <p className="text-[13px] text-white/90">{createdDate}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Total Cards</p>
              <p className="text-[13px] text-white/90">{deck.cards.length} {deck.cards.length === 1 ? 'card' : 'cards'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Cards in Deck</p>
              {deck.cards.length === 0 ? (
                <p className="text-[13px] text-white/60 italic">No cards yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {deck.cards.map((c) => (
                    <li key={c.id} className="flex items-start gap-1.5">
                      <span className="text-white/40 flex-shrink-0 mt-0.5">·</span>
                      <span className="text-[13px] text-white/85 line-clamp-1">{c.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1.5">Notes</p>
              <DeckGridCardNotes />
            </div>
          </div>

          <div className="px-5 pb-5 pt-3 flex-shrink-0">
            <button
              onClick={() => onShare(deck.name)}
              className="w-full py-3 rounded-2xl bg-white text-[#4285f4] font-bold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <Share2 size={15} /> Share This Deck
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeckGridCardNotes() {
  const [notes, setNotes] = useState('');
  return (
    <textarea
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      placeholder="Add a note about this deck…"
      rows={3}
      className="w-full text-[12px] px-3 py-2 rounded-xl bg-white/15 border border-white/20 text-white placeholder-white/40 outline-none focus:bg-white/20 focus:border-white/40 resize-none transition-colors"
    />
  );
}

// ─── Deck Swipe Stack ─────────────────────────────────────────────────────────
function DeckSwipeView({
  decks, darkMode,
  onDelete, onShare, onSwitchToGrid,
  showToast,
}: {
  decks: ReturnType<typeof useLibrary>['decks'];
  darkMode: boolean;
  onDelete: (id: string) => void;
  onShare: (name: string) => void;
  onSwitchToGrid: () => void;
  showToast: (msg: string) => void;
}) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [history, setHistory]     = useState<string[]>([]);

  const visibleDecks = decks.filter((d) => !dismissed.includes(d.id));
  const top = visibleDecks[0] ?? null;

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastId = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setDismissed((d) => d.filter((id) => id !== lastId));
  };

  const handleSwipe = (dir: 'left' | 'right' | 'up' | 'down') => {
    if (!top) return;
    if (dir === 'down') { onSwitchToGrid(); return; }
    if (dir === 'left')  { setHistory((h) => [...h, top.id]); setDismissed((d) => [...d, top.id]); showToast('Skipped'); }
    if (dir === 'right') { setHistory((h) => [...h, top.id]); setDismissed((d) => [...d, top.id]); showToast('Kept'); }
    if (dir === 'up')    { onShare(top.name); setHistory((h) => [...h, top.id]); setDismissed((d) => [...d, top.id]); showToast('Share link copied!'); }
  };

  const label = darkMode ? 'text-white/30' : 'text-gray-400';

  if (decks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${darkMode ? 'bg-white/8' : 'bg-slate-100'}`}>
          <FolderOpen size={28} className="opacity-30" />
        </div>
        <p className={`text-sm ${label}`}>No decks yet. Create one above to organise your saved cards.</p>
      </div>
    );
  }

  if (visibleDecks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${darkMode ? 'bg-white/8' : 'bg-slate-100'}`}>
          <FolderOpen size={28} className="opacity-30" />
        </div>
        <p className={`text-sm ${label}`}>You've reviewed all your decks!</p>
        {history.length > 0 && (
          <button onClick={handleUndo}
            className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-600 transition-colors">
            <RotateCcw size={13} /> Undo last
          </button>
        )}
      </div>
    );
  }

  const topThree = visibleDecks.slice(0, 3);

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      {/* Gesture hints */}
      <div className={`flex gap-5 text-[11px] font-medium ${darkMode ? 'text-white/20' : 'text-slate-400'}`}>
        <span className="flex items-center gap-1 text-[#ea4335]"><X size={10} /> Skip</span>
        <span className="flex items-center gap-1 text-[#4285f4]"><Share2 size={10} /> Share</span>
        <span className="flex items-center gap-1 text-[#34a853]"><FolderOpen size={10} /> Keep</span>
        <span className="flex items-center gap-1 text-[#fbbc05]"><LayoutList size={10} /> Grid</span>
      </div>

      {/* Stack */}
      <div className="relative" style={{ ...CARD_SIZE_STYLE, perspective: '1400px' }}>
        {topThree.slice(1).map((deck, i) => (
          <DeckBgCard key={deck.id} deck={deck} stackIndex={i + 1} darkMode={darkMode} />
        ))}
        <AnimatePresence>
          {top && (
            <DeckUniversalCard
              key={top.id}
              deck={top}
              darkMode={darkMode}
              onSwipe={handleSwipe}
              onShare={() => { onShare(top.name); showToast('Share link copied!'); }}
              onDelete={() => { onDelete(top.id); showToast('Deck deleted'); }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Progress */}
      <p className={`text-[11px] ${darkMode ? 'text-white/20' : 'text-slate-400'}`}>
        {visibleDecks.length} of {decks.length} remaining
      </p>

      {/* Undo FAB */}
      <AnimatePresence>
        {history.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleUndo}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg font-medium text-sm transition-colors ${
              darkMode
                ? 'bg-zinc-700 text-white/80 hover:bg-zinc-600 ring-1 ring-white/10'
                : 'bg-white text-slate-700 hover:bg-slate-50 ring-1 ring-slate-200 shadow-md'
            }`}
          >
            <RotateCcw size={14} />
            Undo Last Swipe
            <span className={`w-5 h-5 text-[10px] font-bold rounded-full flex items-center justify-center ${
              darkMode ? 'bg-amber-500/80 text-black' : 'bg-amber-400 text-black'
            }`}>
              {history.length}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Decks Grid ───────────────────────────────────────────────────────────────
function DecksGrid({
  decks, darkMode, onDelete, onShare, onRemoveFromDeck,
}: {
  decks: ReturnType<typeof useLibrary>['decks'];
  darkMode: boolean;
  onDelete: (id: string) => void;
  onShare: (name: string) => void;
  onRemoveFromDeck: (deckId: string, cardId: string) => void;
}) {
  const label = darkMode ? 'text-white/30' : 'text-gray-400';

  if (decks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${darkMode ? 'bg-white/8' : 'bg-slate-100'}`}>
          <FolderOpen size={28} className="opacity-30" />
        </div>
        <p className={`text-sm ${label}`}>No decks yet. Create one above to organise your cards.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-8 max-w-[1600px] mx-auto mt-8">
      {decks.map((deck, i) => (
        <motion.div key={deck.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(i * 0.04, 0.3), type: 'spring', stiffness: 260, damping: 24 }}>
          <DeckStackCard
            deck={deck} darkMode={darkMode}
            onDelete={onDelete} onShare={onShare}
            onRemoveFromDeck={onRemoveFromDeck}
          />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Library Page ─────────────────────────────────────────────────────────────
export default function Library() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useApp();
  const { user, logout } = useAuth();
  const library = useLibrary();

  const [tab, setTab]                     = useState<Tab>('saved');
  const [savedViewMode, setSavedViewMode] = useState<'stack' | 'grid'>('stack');
  const [deckViewMode,  setDeckViewMode]  = useState<'stack' | 'grid'>('stack');
  const [newDeckName, setNewDeckName]     = useState('');
  const [toast, setToast]                 = useState<{ id: number; msg: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { savedCards, decks, unsaveCard, deleteDeck, addCardToDeck, removeCardFromDeck, createDeck } = library;

  const showToast = (msg: string) => {
    const id = Date.now();
    setToast({ id, msg });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 2200);
  };

  const handleCreateDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;
    createDeck(newDeckName.trim());
    showToast(`Deck "${newDeckName.trim()}" created`);
    setNewDeckName('');
    setTab('decks');
  };

  const handleShare = (name: string) => {
    const url = `${window.location.origin}/results?deck=${encodeURIComponent(name)}`;
    if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
    showToast('Share link copied!');
  };

  const bg      = darkMode ? 'bg-gradient-to-br from-slate-900 via-zinc-900 to-black' : 'bg-gradient-to-br from-[#f0f4f8] to-[#e6ecef]';
  const side    = darkMode ? 'bg-zinc-900/90 border-r border-white/8' : 'bg-white/70 border-r border-[#dde4ea] backdrop-blur-sm';
  const mainBg  = darkMode ? '' : 'bg-transparent';
  const navActive = darkMode ? 'bg-blue-500/20 text-blue-300 font-semibold' : 'bg-blue-50 text-blue-700 font-semibold';
  const navIdle   = darkMode ? 'text-white/40 hover:text-white/70 hover:bg-white/8' : 'text-gray-600 hover:bg-gray-100';

  const currentViewMode = tab === 'saved' ? savedViewMode : deckViewMode;
  const setCurrentViewMode = tab === 'saved'
    ? (m: 'stack' | 'grid') => setSavedViewMode(m)
    : (m: 'stack' | 'grid') => setDeckViewMode(m);

  return (
    <div className={`flex h-screen transition-colors duration-500 ${bg}`}>

      {/* ── Sidebar ── */}
      <aside className={`w-60 flex flex-col flex-shrink-0 ${side}`}>
        <div className="px-5 py-5 border-b border-inherit">
          <button onClick={() => navigate('/')} className="hover:opacity-80 transition-opacity">
            <Logo size="sm" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <button onClick={() => setTab('saved')}
            className={`w-full flex items-center gap-3 text-left px-4 py-2.5 rounded-xl text-sm transition-colors ${tab === 'saved' ? navActive : navIdle}`}>
            <BookmarkCheck size={16} />
            Saved Cards
            {savedCards.length > 0 && (
              <span className={`ml-auto text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                tab === 'saved'
                  ? darkMode ? 'bg-blue-400/30 text-blue-300' : 'bg-blue-100 text-blue-600'
                  : darkMode ? 'bg-white/10 text-white/30' : 'bg-gray-100 text-gray-500'
              }`}>{savedCards.length}</span>
            )}
          </button>
          <button onClick={() => setTab('decks')}
            className={`w-full flex items-center gap-3 text-left px-4 py-2.5 rounded-xl text-sm transition-colors ${tab === 'decks' ? navActive : navIdle}`}>
            <FolderOpen size={16} />
            Decks
            {decks.length > 0 && (
              <span className={`ml-auto text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                tab === 'decks'
                  ? darkMode ? 'bg-blue-400/30 text-blue-300' : 'bg-blue-100 text-blue-600'
                  : darkMode ? 'bg-white/10 text-white/30' : 'bg-gray-100 text-gray-500'
              }`}>{decks.length}</span>
            )}
          </button>
        </nav>

        <div className={`px-3 py-4 border-t ${darkMode ? 'border-white/8' : 'border-gray-100'} space-y-1`}>
          <button onClick={() => navigate('/results', { state: { query: '' } })}
            className={`w-full flex items-center gap-3 text-left px-4 py-2.5 rounded-xl text-sm transition-colors ${navIdle}`}>
            <Search size={16} />
            Browse Cards
          </button>
          <button onClick={() => navigate('/')}
            className={`w-full flex items-center gap-3 text-left px-4 py-2.5 rounded-xl text-sm transition-colors ${navIdle}`}>
            <Search size={16} />
            Search
          </button>
          <button onClick={toggleDarkMode}
            className={`w-full flex items-center gap-3 text-left px-4 py-2.5 rounded-xl text-sm transition-colors ${navIdle}`}>
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {/* Auth section */}
        <div className={`px-4 py-4 border-t ${darkMode ? 'border-white/8' : 'border-gray-100'}`}>
          {user ? (
            <div className="space-y-2">
              <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                <UserCircle2 size={18} className="text-[#4285f4] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={`text-[12px] font-semibold truncate ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                    {user.name || 'User'}
                  </p>
                  <p className={`text-[11px] truncate ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className={`w-full flex items-center gap-3 text-left px-4 py-2.5 rounded-xl text-sm transition-colors ${navIdle}`}
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#4285f4] text-white hover:bg-[#3367d6] transition-colors"
            >
              <UserCircle2 size={15} />
              Sign In
            </button>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className={`flex-1 flex flex-col overflow-hidden ${mainBg}`}>

        {/* Page header */}
        <header className={`flex items-center justify-between px-8 py-5 border-b flex-shrink-0 ${
          darkMode ? 'border-white/8 bg-zinc-900/60 backdrop-blur-xl' : 'border-gray-200 bg-white/80 backdrop-blur-xl'
        }`}>
          <div>
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {tab === 'saved' ? 'Saved Cards' : 'Library'}
            </h1>
            <p className={`text-sm mt-0.5 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
              {tab === 'saved'
                ? 'Manage your bookmarked links and resources.'
                : 'Create and share curated collections of cards.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Deck creation form — only on Decks tab */}
            <AnimatePresence>
              {tab === 'decks' && (
                <motion.form key="deck-form"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  onSubmit={handleCreateDeck}
                  className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    placeholder="Name your new deck…"
                    className={`w-52 px-4 py-2 text-sm rounded-xl border outline-none transition-colors ${
                      darkMode
                        ? 'bg-white/5 border-white/10 text-white placeholder-white/25 focus:border-white/30 focus:ring-1 focus:ring-white/20'
                        : 'bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400'
                    }`}
                  />
                  <button type="submit" disabled={!newDeckName.trim()}
                    className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5">
                    <Plus size={15} /> Create Deck
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* View mode toggle */}
            {((tab === 'saved' && savedCards.length > 0) || (tab === 'decks' && decks.length > 0)) && (
              <div className={`flex p-1 rounded-xl gap-0.5 ${darkMode ? 'bg-white/8' : 'bg-gray-100'}`}>
                <button onClick={() => setCurrentViewMode('stack')} title="Stack view"
                  className={`p-1.5 rounded-lg transition-colors ${
                    currentViewMode === 'stack'
                      ? darkMode ? 'bg-zinc-700 text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                      : darkMode ? 'text-white/30 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'
                  }`}>
                  <Layers size={15} />
                </button>
                <button onClick={() => setCurrentViewMode('grid')} title="Grid view"
                  className={`p-1.5 rounded-lg transition-colors ${
                    currentViewMode === 'grid'
                      ? darkMode ? 'bg-zinc-700 text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                      : darkMode ? 'text-white/30 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'
                  }`}>
                  <LayoutList size={15} />
                </button>
              </div>
            )}

            {tab === 'saved' && (
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                darkMode ? 'bg-white/8 text-white/40' : 'bg-gray-100 text-gray-500'
              }`}>
                {savedCards.length} card{savedCards.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">

            {tab === 'saved' && (
              <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AnimatePresence mode="wait">
                  {savedViewMode === 'stack' ? (
                    <motion.div key="saved-stack" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <SavedStackView
                        savedCards={savedCards}
                        decks={decks}
                        darkMode={darkMode}
                        onDelete={unsaveCard}
                        onAddToDeck={addCardToDeck}
                        onCreateAndAdd={(card, name) => {
                          const deck = createDeck(name);
                          addCardToDeck(deck.id, card);
                          showToast(`Added to new deck "${name}"`);
                        }}
                        onSwitchToGrid={() => setSavedViewMode('grid')}
                        showToast={showToast}
                      />
                    </motion.div>
                  ) : (
                    <motion.div key="saved-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <SavedGrid
                        savedCards={savedCards}
                        decks={decks}
                        darkMode={darkMode}
                        onRemove={(id) => { unsaveCard(id); showToast('Removed from saved'); }}
                        onAddToDeck={addCardToDeck}
                        onCreateAndAdd={(card, name) => {
                          const deck = createDeck(name);
                          addCardToDeck(deck.id, card);
                          showToast(`Added to new deck "${name}"`);
                          setTab('decks');
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {tab === 'decks' && (
              <motion.div key="decks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AnimatePresence mode="wait">
                  {deckViewMode === 'stack' ? (
                    <motion.div key="deck-stack" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <DeckSwipeView
                        decks={decks}
                        darkMode={darkMode}
                        onDelete={(id) => { deleteDeck(id); showToast('Deck deleted'); }}
                        onShare={handleShare}
                        onSwitchToGrid={() => setDeckViewMode('grid')}
                        showToast={showToast}
                      />
                    </motion.div>
                  ) : (
                    <motion.div key="deck-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <DecksGrid
                        decks={decks}
                        darkMode={darkMode}
                        onDelete={(id) => { deleteDeck(id); showToast('Deck deleted'); }}
                        onShare={handleShare}
                        onRemoveFromDeck={removeCardFromDeck}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && <Toast key={toast.id} msg={toast.msg} />}
      </AnimatePresence>

      {/* Empty-state CTA */}
      {savedCards.length === 0 && decks.length === 0 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="pointer-events-auto flex flex-col items-center gap-5 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${darkMode ? 'bg-white/6' : 'bg-slate-100'}`}>
              <Layers size={34} className={darkMode ? 'text-white/20' : 'text-slate-300'} />
            </div>
            <div>
              <p className={`text-lg font-semibold mb-1 ${darkMode ? 'text-white/50' : 'text-slate-500'}`}>Your library is empty</p>
              <p className={`text-sm ${darkMode ? 'text-white/25' : 'text-slate-400'}`}>Browse cards and swipe right to save them here.</p>
            </div>
            <button onClick={() => navigate('/results', { state: { query: '' } })}
              className="px-6 py-2.5 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors shadow-md">
              Browse Cards
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showAuthModal && (
          <AuthModal darkMode={darkMode} onClose={() => setShowAuthModal(false)} />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

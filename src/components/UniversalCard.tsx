import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCodeGen from 'qrcode';
import {
  FolderPlus, Check, ExternalLink, Mail, Phone, MapPin,
  Twitter, Github, Share2, X, BookmarkPlus, LayoutList, RefreshCw,
} from 'lucide-react';
import { Result } from '../data/results';
import { useLibrary } from '../hooks/useLibrary';
import { useDragTracking } from '../hooks/useDragTracking';

// ─── Canonical card dimensions (single source of truth) ──────────────────────
export const CARD_W = 340;
export const CARD_H = 480;
// Tailwind equivalents used inline via style= to guarantee pixel-perfect sizing
export const CARD_SIZE_STYLE = { width: CARD_W, height: CARD_H, minWidth: CARD_W, maxWidth: CARD_W, minHeight: CARD_H, maxHeight: CARD_H } as const;
const HALF_H = CARD_H / 2; // 240px — each section exactly 50%

// ─── Branded dot-matrix QR (functional + scannable) ──────────────────────────
function BrandedQR({ url, size = 118 }: { url: string; size?: number }) {
  const matrix = useMemo<boolean[][] | null>(() => {
    if (!url) return null;
    try {
      const qr = QRCodeGen.create(url, { errorCorrectionLevel: 'H' });
      const data = qr.modules.data as Uint8Array;
      const side = qr.modules.size as number;
      const rows: boolean[][] = [];
      for (let r = 0; r < side; r++) {
        const row: boolean[] = [];
        for (let c = 0; c < side; c++) {
          row.push(data[r * side + c] === 1);
        }
        rows.push(row);
      }
      return rows;
    } catch {
      return null;
    }
  }, [url]);

  const S = size;

  if (!matrix) {
    return <div style={{ width: S, height: S }} className="rounded-lg bg-gray-100 animate-pulse" />;
  }

  const cols = matrix.length;
  const cell = S / cols;
  const dotR = cell * 0.42;

  const inFinder = (c: number, r: number) =>
    (c < 7 && r < 7) ||
    (c >= cols - 7 && r < 7) ||
    (c < 7 && r >= cols - 7);

  const mid = Math.floor(cols / 2);
  const inLogoZone = (c: number, r: number) =>
    Math.abs(c - mid) <= 2 && Math.abs(r - mid) <= 2;

  const Finder = ({ x, y }: { x: number; y: number }) => {
    const W = cell * 7;
    const rx = cell * 1.1;
    return (
      <>
        <rect x={x} y={y} width={W} height={W}
          rx={rx} ry={rx} fill="none" stroke="#1a1a2e" strokeWidth={cell * 0.9} />
        <rect x={x + cell * 2} y={y + cell * 2} width={cell * 3} height={cell * 3}
          rx={rx * 0.5} ry={rx * 0.5} fill="#1a1a2e" />
      </>
    );
  };

  const logoR = cell * 2.55;
  const cx = S / 2;
  const cy = S / 2;

  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} xmlns="http://www.w3.org/2000/svg">
      {matrix.map((row, r) =>
        row.map((on, c) => {
          if (!on || inFinder(c, r) || inLogoZone(c, r)) return null;
          return (
            <circle
              key={`${c}-${r}`}
              cx={(c + 0.5) * cell}
              cy={(r + 0.5) * cell}
              r={dotR}
              fill="#1a1a2e"
            />
          );
        })
      )}
      <Finder x={0} y={0} />
      <Finder x={(cols - 7) * cell} y={0} />
      <Finder x={0} y={(cols - 7) * cell} />
      <circle cx={cx} cy={cy} r={logoR + cell * 0.6} fill="white" />
      <circle cx={cx} cy={cy} r={logoR} fill="none" stroke="#4285f4" strokeWidth={cell * 0.55} />
      <text
        x={cx} y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize={cell * 2.2}
        fontWeight="700"
        fill="#4285f4"
      >
        O
      </text>
    </svg>
  );
}

// ─── STACK visual parameters ──────────────────────────────────────────────────
export const STACK_PARAMS = [
  { scale: 1,    yOffset: 0,  shadow: '0 24px 60px rgba(0,0,0,0.18)', zIndex: 30 },
  { scale: 0.93, yOffset: 18, shadow: '0 12px 30px rgba(0,0,0,0.10)', zIndex: 20 },
  { scale: 0.86, yOffset: 34, shadow: '0 6px 16px rgba(0,0,0,0.07)',  zIndex: 10 },
];

// ─── Deck Menu ────────────────────────────────────────────────────────────────
export function DeckMenu({
  card, decks, darkMode, onAddToDeck, onCreateAndAdd,
}: {
  card: Result;
  decks: ReturnType<typeof useLibrary>['decks'];
  darkMode: boolean;
  onAddToDeck: (deckId: string, card: Result) => void;
  onCreateAndAdd: (card: Result, name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateAndAdd(card, newName.trim());
    setNewName('');
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        title="Add to deck"
        className={`p-1.5 rounded-full transition-colors backdrop-blur-sm shadow-sm ${
          darkMode
            ? 'text-white/30 bg-white/8 hover:text-blue-400 hover:bg-blue-500/20'
            : 'text-slate-400 bg-white/90 hover:text-blue-600 hover:bg-blue-50'
        }`}
      >
        <FolderPlus size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className={`absolute right-0 mt-1.5 w-56 rounded-xl border shadow-xl z-50 overflow-hidden ${
              darkMode ? 'bg-zinc-800 border-white/10' : 'bg-white border-gray-100'
            }`}
          >
            <div className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider border-b ${
              darkMode ? 'text-white/25 border-white/8' : 'text-gray-400 border-gray-50'
            }`}>
              Save to Deck
            </div>
            <div className="max-h-40 overflow-y-auto">
              {decks.length === 0 ? (
                <p className={`px-4 py-3 text-[13px] italic ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
                  No decks yet.
                </p>
              ) : decks.map((d) => {
                const inDeck = !!d.cards.find((c) => c.id === card.id);
                return (
                  <button key={d.id} disabled={inDeck}
                    onClick={() => { onAddToDeck(d.id, card); setOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-[13px] flex items-center justify-between transition-colors ${
                      inDeck
                        ? darkMode ? 'text-white/20 cursor-not-allowed' : 'text-gray-300 bg-gray-50 cursor-not-allowed'
                        : darkMode ? 'text-white/60 hover:bg-white/8 hover:text-blue-300' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}>
                    <span className="truncate">{d.name}</span>
                    {inDeck && <Check size={11} className="flex-shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
            <div className={`px-3 pt-2.5 pb-2.5 border-t ${darkMode ? 'border-white/8 bg-white/4' : 'border-gray-50 bg-gray-50/50'}`}>
              <form onSubmit={handleCreate} className="flex flex-col gap-2">
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="New deck name…"
                  className={`w-full text-[13px] px-3 py-1.5 rounded-lg border outline-none transition-colors ${
                    darkMode
                      ? 'bg-white/5 border-white/10 text-white placeholder-white/25 focus:border-white/30'
                      : 'bg-white border-gray-200 text-gray-700 placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400'
                  }`}
                />
                <button type="submit" disabled={!newName.trim()}
                  className={`w-full text-[12px] font-medium py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    darkMode ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}>
                  Create &amp; Add
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Footer link button ───────────────────────────────────────────────────────
function FooterBtn({
  href, darkMode, children, className = '',
}: {
  href: string; darkMode: boolean; children: React.ReactNode; className?: string;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`p-2 rounded-full transition-colors flex-shrink-0 ${className} ${
        darkMode
          ? 'text-white/30 hover:text-white/70 hover:bg-white/10'
          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
      }`}>
      {children}
    </a>
  );
}

// ─── Swipe direction overlay badges ──────────────────────────────────────────
function SwipeBadges({ dragDir }: { dragDir: string | null }) {
  return (
    <>
      <div className={`absolute inset-0 rounded-[2rem] z-10 pointer-events-none flex items-start justify-start p-5 transition-opacity duration-100 ${dragDir === 'right' ? 'opacity-100' : 'opacity-0'}`}>
        <span className="bg-white/40 backdrop-blur-md border-2 border-[#34a853] shadow-sm px-6 py-2 rounded-full text-[13px] font-extrabold tracking-widest uppercase text-[#34a853]" style={{ transform: 'rotate(12deg)' }}>SAVE</span>
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

// ─── Shared card front face content ──────────────────────────────────────────
// Top half: QR section (exact 240px). Bottom half: text + footer (exact 240px).
function CardFront({
  card, darkMode, saved, onSave, decks, onAddToDeck, onCreateAndAdd,
  onFlip, isStack = false,
}: {
  card: Result;
  darkMode: boolean;
  saved?: boolean;
  onSave?: (card: Result) => void;
  decks?: ReturnType<typeof useLibrary>['decks'];
  onAddToDeck?: (deckId: string, card: Result) => void;
  onCreateAndAdd?: (card: Result, name: string) => void;
  onFlip?: () => void;
  isStack?: boolean;
}) {
  const domain = useMemo(
    () => card.displayUrl || card.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0],
    [card.displayUrl, card.url],
  );

  return (
    <div className="flex flex-col w-full h-full">
      {/* ── Top 50%: QR section ── */}
      <div
        className={`relative flex items-center justify-center border-b flex-shrink-0 h-1/2 w-full ${
          darkMode ? 'bg-slate-800/60 border-white/10' : 'bg-gray-50/80 border-gray-100'
        }`}
      >
        <div className="bg-white p-3 rounded-2xl shadow-sm">
          {isStack
            ? <div style={{ width: 118, height: 118 }} className="rounded-lg bg-gray-100/60" />
            : <BrandedQR url={card.url} size={118} />
          }
        </div>

        {/* Top-right actions — only on interactive cards */}
        {!isStack && (
          <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5">
            {onAddToDeck && onCreateAndAdd && decks && (
              <DeckMenu
                card={card}
                decks={decks}
                darkMode={darkMode}
                onAddToDeck={onAddToDeck}
                onCreateAndAdd={onCreateAndAdd}
              />
            )}
            {onSave && (
              <button
                onClick={(e) => { e.stopPropagation(); onSave(card); }}
                title={saved ? 'Remove from saved' : 'Save card'}
                className={`p-1.5 rounded-full transition-colors backdrop-blur-sm shadow-sm ${
                  saved
                    ? darkMode ? 'text-blue-400 bg-blue-500/20 hover:text-red-400 hover:bg-red-500/20' : 'text-blue-500 bg-blue-50 hover:text-red-400 hover:bg-red-50'
                    : darkMode ? 'text-white/30 bg-white/8 hover:text-blue-400 hover:bg-blue-500/20' : 'text-slate-300 bg-white/90 hover:text-blue-500 hover:bg-blue-50'
                }`}
              >
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" fill={saved ? 'currentColor' : 'none'}>
                  <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            )}
            {onFlip && (
              <button
                onClick={(e) => { e.stopPropagation(); onFlip(); }}
                title="View details"
                className={`p-1.5 rounded-full transition-colors backdrop-blur-sm shadow-sm ${
                  darkMode ? 'text-white/30 bg-white/8 hover:text-white/70 hover:bg-white/15' : 'text-slate-400 bg-white/90 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <RefreshCw size={15} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom 50%: text + footer ── */}
      <div className="flex flex-col overflow-hidden flex-1">
        {/* Text block — grows to fill, text clamped so it never overflows */}
        <div className="flex flex-col flex-1 px-5 pt-4 pb-2 overflow-hidden">
          <p className={`text-[11px] mb-0.5 truncate font-medium flex-shrink-0 ${darkMode ? 'text-[#5f6368]' : 'text-[#3c4043]'}`}>
            {domain}
          </p>
          <a
            href={card.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`text-[17px] font-normal leading-snug mb-2 hover:underline line-clamp-2 flex-shrink-0 ${
              darkMode ? 'text-[#8ab4f8]' : 'text-[#1a0dab]'
            }`}
          >
            {card.title}
          </a>
          <p className={`text-[13px] leading-relaxed line-clamp-3 ${darkMode ? 'text-[#9aa0a6]' : 'text-[#4d5156]'}`}>
            {card.description}
          </p>
        </div>

        {/* Footer icons */}
        <div className={`flex items-center gap-0.5 px-3 py-2 border-t flex-shrink-0 ${darkMode ? 'border-white/8' : 'border-gray-100'}`}>
          {card.mapsUrl && <FooterBtn href={card.mapsUrl} darkMode={darkMode}><MapPin size={13} /></FooterBtn>}
          {card.phone   && <FooterBtn href={`tel:${card.phone}`} darkMode={darkMode}><Phone size={13} /></FooterBtn>}
          {card.email   && <FooterBtn href={`mailto:${card.email}`} darkMode={darkMode}><Mail size={13} /></FooterBtn>}
          {card.twitter && <FooterBtn href={card.twitter} darkMode={darkMode}><Twitter size={13} /></FooterBtn>}
          {card.github  && <FooterBtn href={card.github} darkMode={darkMode}><Github size={13} /></FooterBtn>}
          <FooterBtn href={card.url} darkMode={darkMode} className="ml-auto"><ExternalLink size={13} /></FooterBtn>
        </div>

        {!isStack && (
          <p className={`text-[10px] text-center pb-2 flex-shrink-0 select-none ${darkMode ? 'text-white/15' : 'text-slate-300'}`}>
            tap to see more · drag to interact
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Card Back (shared) ───────────────────────────────────────────────────────
function CardBack({
  card, onClose, style,
}: {
  card: Result;
  onClose: () => void;
  style?: React.CSSProperties;
}) {
  const [notes, setNotes] = useState('');
  const savedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: card.title, text: card.description, url: card.url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(card.url).catch(() => {});
    }
  };

  return (
    <div
      className="absolute inset-0 flex flex-col rounded-[2rem] overflow-hidden bg-[#4285f4]"
      style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', ...style }}
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/20 flex-shrink-0">
        <p className="text-xs font-bold uppercase tracking-widest text-white/60">Card Details</p>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors pointer-events-auto">
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Source URL</p>
          <a href={card.url} target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[13px] text-white/90 break-all hover:text-white transition-colors pointer-events-auto leading-snug">
            {card.url}
          </a>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Date Saved</p>
          <p className="text-[13px] text-white/90">{savedDate}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">About</p>
          <p className="text-[12px] text-white/80 leading-relaxed line-clamp-4">{card.longDescription}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1.5">Notes</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder="Add a personal note…"
            rows={3}
            className="w-full text-[12px] px-3 py-2 rounded-xl bg-white/15 border border-white/20 text-white placeholder-white/40 outline-none focus:bg-white/20 focus:border-white/40 resize-none transition-colors pointer-events-auto"
          />
        </div>
      </div>

      <div className="px-5 pb-5 pt-3 flex-shrink-0">
        <button
          onClick={handleShare}
          className="w-full py-3 rounded-2xl bg-white text-[#4285f4] font-bold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 shadow-lg pointer-events-auto"
        >
          <Share2 size={15} /> Share This Card
        </button>
      </div>
    </div>
  );
}

// ─── Universal Card (top card — draggable) ────────────────────────────────────
export interface UniversalCardProps {
  card: Result;
  darkMode: boolean;
  saved?: boolean;
  onSave?: (card: Result) => void;
  decks?: ReturnType<typeof useLibrary>['decks'];
  onAddToDeck?: (deckId: string, card: Result) => void;
  onCreateAndAdd?: (card: Result, name: string) => void;
  onSwipe: (dir: 'left' | 'right' | 'up' | 'down', card: Result) => void;
}

export function UniversalCard({
  card, darkMode, saved, onSave, decks = [], onAddToDeck, onCreateAndAdd, onSwipe,
}: UniversalCardProps) {
  const [flipped, setFlipped] = useState(false);
  const didDragRef = useRef(false);

  const { handlers, offset, isDragging, dragDir } = useDragTracking({
    onSwipeLeft:  () => onSwipe('left',  card),
    onSwipeRight: () => onSwipe('right', card),
    onSwipeUp:    () => onSwipe('up',    card),
    onSwipeDown:  () => onSwipe('down',  card),
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
        zIndex: STACK_PARAMS[0].zIndex,
        boxShadow: STACK_PARAMS[0].shadow,
        transformOrigin: 'bottom center',
      }}
    >
      <SwipeBadges dragDir={dragDir} />

      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 28 }}
        style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%', position: 'relative' }}
      >
        {/* Front face */}
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <CardFront
            card={card}
            darkMode={darkMode}
            saved={saved}
            onSave={onSave}
            decks={decks}
            onAddToDeck={onAddToDeck}
            onCreateAndAdd={onCreateAndAdd}
            onFlip={() => setFlipped(true)}
          />
        </div>

        <CardBack card={card} onClose={() => setFlipped(false)} />
      </motion.div>
    </div>
  );
}

// ─── Stack Card (non-interactive background card) ─────────────────────────────
export function StackCard({
  card, stackIndex, darkMode,
}: {
  card: Result; stackIndex: number; darkMode: boolean;
}) {
  const s = STACK_PARAMS[stackIndex];

  return (
    <div
      className={`absolute inset-x-0 mx-auto rounded-[2rem] border pointer-events-none select-none overflow-hidden ${
        darkMode ? 'bg-zinc-800/95 border-white/10' : 'bg-white/95 border-gray-100'
      }`}
      style={{
        ...CARD_SIZE_STYLE,
        transform: `translateY(${s.yOffset}px) scale(${s.scale})`,
        boxShadow: s.shadow,
        zIndex: s.zIndex,
        opacity: 1 - stackIndex * 0.1,
      }}
    >
      <CardFront card={card} darkMode={darkMode} isStack />
    </div>
  );
}

// ─── Grid Card ────────────────────────────────────────────────────────────────
export function GridCard({
  card, darkMode, index, saved, onSave, decks, onAddToDeck, onCreateAndAdd,
}: {
  card: Result; darkMode: boolean; index: number; saved: boolean;
  onSave: (r: Result) => void;
  decks: ReturnType<typeof useLibrary>['decks'];
  onAddToDeck: (deckId: string, card: Result) => void;
  onCreateAndAdd: (card: Result, name: string) => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.32), type: 'spring', stiffness: 260, damping: 24 }}
      className="relative w-full mx-auto"
      style={{ maxWidth: CARD_W, height: CARD_H, minHeight: CARD_H, perspective: '1000px' }}
    >
      <div
        className="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d]"
        style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* ── Front face ── */}
        <div
          className={`absolute inset-0 rounded-[2rem] border overflow-hidden shadow-sm hover:shadow-md transition-shadow [backface-visibility:hidden] ${
            darkMode ? 'bg-zinc-800 border-white/10' : 'bg-white border-gray-100'
          }`}
        >
          <CardFront
            card={card}
            darkMode={darkMode}
            saved={saved}
            onSave={onSave}
            decks={decks}
            onAddToDeck={onAddToDeck}
            onCreateAndAdd={onCreateAndAdd}
            onFlip={() => setIsFlipped(true)}
          />
        </div>

        {/* ── Back face ── */}
        <CardBack
          card={card}
          onClose={() => setIsFlipped(false)}
        />
      </div>
    </motion.div>
  );
}

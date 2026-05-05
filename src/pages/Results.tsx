import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Moon, Sun, Grid, Bookmark, Folder, 
  Share2, RotateCcw, ExternalLink, Trash2, 
  Plus, SlidersHorizontal, FolderPlus, Undo2,
  Mail, Twitter, Github
} from 'lucide-react';
import Logo from '../components/Logo';
import { useApp } from '../context/AppContext';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useApp();
  // Get live results and the query string from Home page
  const { results: initialResults, query } = location.state || { results: [], query: '' };
  
  const [deck, setDeck] = useState(initialResults);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissedCount, setDismissedCount] = useState(0);
  const [exitDirection, setExitDirection] = useState(0);

  // --- SWIPE & BUTTON LOGIC ---
  const handleDismiss = () => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setDismissedCount(prev => prev + 1);
    } else {
      alert("You've reached the end of the deck!");
    }
  };

  const handleSkip = () => {
    setExitDirection(-500);
    handleDismiss();
  };

  const handleSave = () => {
    setExitDirection(500);
    alert("Card saved to bookmarks!");
    handleDismiss();
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setDismissedCount(prev => prev - 1);
    }
  };

  const handleShare = async () => {
    if (!currentCard) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentCard.title,
          text: currentCard.snippet,
          url: currentCard.link,
        });
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      navigator.clipboard.writeText(currentCard.link);
      alert("Link copied to clipboard!");
    }
  };

  const handleComingSoon = (feature: string) => {
    alert(`${feature} coming soon!`);
  };
  // --------------------------------

  const currentCard = deck[currentIndex];

  if (!currentCard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] dark:bg-slate-900">
        <button onClick={() => navigate('/')} className="text-blue-500 underline font-medium">No results. Back to home.</button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen overflow-hidden flex flex-col transition-colors duration-500 ${darkMode ? 'bg-slate-900 text-white' : 'bg-[#f0f4f8] text-gray-800'}`}>
      
      {/* 1. TOP NAV BAR */}
      <header className="px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <Logo size="sm" />
        </div>
        
        {/* Shows the live search query */}
        <div className="flex-1 text-center cursor-pointer" onClick={() => navigate('/')}>
          <span className="text-sm text-gray-400 hover:text-blue-500 transition-colors font-medium">"{query}"</span>
        </div>

        <div className="flex items-center gap-5 text-gray-400">
          <Grid size={18} className="cursor-pointer hover:text-blue-500" onClick={() => handleComingSoon('Grid View')} />
          <div className="relative">
             <Folder size={18} className="cursor-pointer hover:text-blue-500" onClick={() => handleComingSoon('Folders')} />
             <span className="absolute -top-2 -right-2 bg-green-500 text-[10px] text-white px-1.5 py-0.5 rounded-full border-2 border-[#f0f4f8] dark:border-slate-900">2</span>
          </div>
          <Search size={18} className="cursor-pointer hover:text-blue-500" onClick={() => navigate('/')} />
          <button onClick={toggleDarkMode} className="hover:text-blue-500 transition-colors">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <div className="flex items-center gap-2 bg-white dark:bg-white/10 px-3 py-1.5 rounded-full shadow-sm cursor-pointer hover:bg-gray-50 border border-gray-100 dark:border-white/5">
            <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold">U</div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300 hidden sm:block">Google User</span>
          </div>
        </div>
      </header>

      {/* 2. SUB-MENU ACTIONS */}
      <div className="flex justify-center gap-6 py-2 text-[11px] font-bold uppercase tracking-widest text-red-400/80 z-10">
        <button onClick={handleSkip} className="flex items-center gap-1 hover:text-red-500 transition-colors"><X size={12} /> Skip</button>
        <button onClick={handleShare} className="flex items-center gap-1 text-blue-400 hover:text-blue-500 transition-colors"><Share2 size={12} /> Share</button>
        <button onClick={handleSave} className="flex items-center gap-1 text-green-500 hover:text-green-600 transition-colors"><Bookmark size={12} /> Save</button>
        <button onClick={() => handleComingSoon('Grid View')} className="flex items-center gap-1 text-orange-400 hover:text-orange-500 transition-colors text-opacity-50">Grid</button>
      </div>

      {/* 3. MAIN AREA */}
      <main className="flex-1 relative flex items-center justify-center p-4">
        
        {/* FLOATING ACTION: UNDO */}
        <AnimatePresence>
          {dismissedCount > 0 && (
            <motion.button 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={handleUndo}
              className="absolute bottom-10 left-10 flex items-center gap-2 bg-gray-200/60 dark:bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-300/60 transition-colors z-20"
            >
              <Undo2 size={16} />
              <span className="text-sm font-semibold">Undo</span>
              <div className="w-5 h-5 bg-yellow-400 text-black rounded-full flex items-center justify-center text-[10px] font-bold">
                {dismissedCount}
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* FLOATING ACTION: SHARE */}
        <div className="absolute bottom-10 left-1/4 flex flex-col items-center text-gray-400 hover:text-blue-500 cursor-pointer z-0 transition-colors hidden sm:flex" onClick={handleShare}>
          <Share2 size={24} strokeWidth={1.5} />
          <span className="text-[10px] font-bold mt-2">Share</span>
        </div>

        {/* FLOATING ACTION: BIN */}
        <div className="absolute bottom-10 right-1/4 flex flex-col items-center text-gray-400 hover:text-red-500 cursor-pointer z-0 transition-colors hidden sm:flex" onClick={() => handleComingSoon('Move to Bin')}>
          <Trash2 size={24} strokeWidth={1.5} />
          <span className="text-[10px] font-bold mt-2">Bin</span>
        </div>

        {/* SWIPING CARD */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            drag 
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} 
            dragElastic={0.7} 
            onDragEnd={(_, info) => {
              const dx = info.offset.x;
              const dy = info.offset.y;
              const absX = Math.abs(dx);
              const absY = Math.abs(dy);

              if (Math.max(absX, absY) > 80) {
                if (absX > absY) {
                  if (dx > 0) handleSave(); 
                  else handleSkip();        
                } else {
                  if (dy < 0) handleShare();                   
                  else handleComingSoon('Grid View'); 
                }
              }
            }}
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ x: exitDirection, opacity: 0, rotate: exitDirection > 0 ? 8 : -8 }} 
            className="relative w-full max-w-[400px] bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl border border-gray-100 dark:border-white/5 flex flex-col overflow-hidden cursor-grab active:cursor-grabbing z-10"
            style={{ height: '580px' }}
          >
            {/* Top Right Card Icons */}
            <div className="absolute top-6 right-6 flex gap-4 text-gray-300">
               <FolderPlus size={18} className="hover:text-blue-500 cursor-pointer transition-colors" onClick={() => handleComingSoon('Add to Deck')} />
               <Bookmark size={18} className="text-blue-500 fill-blue-500 cursor-pointer transition-colors" />
               <RotateCcw size={18} className="hover:text-blue-500 cursor-pointer transition-colors" onClick={() => handleComingSoon('Refresh Card')} />
            </div>

            {/* Custom Orbit QR Code */}
            <div className="flex justify-center mt-12 mb-4 pointer-events-none">
              <div className="relative">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(currentCard.link)}`} 
                  alt="QR Code"
                  className="w-48 h-48 rounded-2xl p-1"
                />
                <div className="absolute inset-0 m-auto w-10 h-10 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                  <div className="w-8 h-8 rounded-full border-[3px] border-blue-500"></div>
                </div>
              </div>
            </div>

            {/* Content Text */}
            <div className="px-8 flex-1 flex flex-col pointer-events-none">
              <p className="text-[11px] text-gray-400 mb-2 truncate">{currentCard.source}</p>
              <h2 className="text-xl font-medium text-[#1a40b3] dark:text-blue-400 leading-snug mb-3 line-clamp-2">
                {currentCard.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-4">
                {currentCard.snippet}
              </p>
            </div>

            {/* Bottom Card Actions */}
            <div className="px-8 pb-10 pt-4 flex items-center justify-between text-gray-300 relative">
              <div className="flex flex-col items-center cursor-pointer hover:text-blue-500 transition-colors" onClick={() => handleComingSoon('Edit')}>
                <SlidersHorizontal size={20} strokeWidth={1.5} />
                <span className="text-[9px] font-bold mt-1 text-gray-400">Edit</span>
              </div>
              
              <div className="flex flex-col items-center cursor-pointer hover:text-blue-500 transition-colors" onClick={() => handleComingSoon('Add to')}>
                <Plus size={20} strokeWidth={1.5} />
                <span className="text-[9px] font-bold mt-1 text-gray-400">Add to</span>
              </div>

              {/* Bottom Social Icons inside Card */}
              <div className="absolute bottom-3 left-8 flex gap-3 text-gray-400">
                <Mail size={14} className="hover:text-blue-500 cursor-pointer" />
                <Twitter size={14} className="hover:text-blue-500 cursor-pointer" />
                <Github size={14} className="hover:text-blue-500 cursor-pointer" />
              </div>

              {/* Floating External Link Icon */}
              <a href={currentCard.link} target="_blank" rel="noreferrer" className="absolute right-8 bottom-3 text-gray-400 hover:text-blue-500 transition-colors z-20">
                 <ExternalLink size={16} />
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function X({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
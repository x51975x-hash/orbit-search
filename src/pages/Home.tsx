import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Camera, Search, Moon, Sun, QrCode, Upload, X, Circle } from 'lucide-react';
import Logo from '../components/Logo';
import VisionScanner from '../components/VisionScanner';
import AuthModal from '../components/AuthModal';
import Footer from '../components/Footer';
import UserMenu from '../components/UserMenu';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { playTick } from '../utils/sound';

// --- LIVE REAL-TIME SEARCH BRAIN ---
interface Result {
  title: string;
  link: string;
  snippet: string;
  source?: string;
}

async function fetchLiveResults(query: string): Promise<Result[]> {
  const API_KEY = '9193c3a86de5db51c2e55ee6a0b82a5b69daa08d'; 
  
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': API_KEY,
    },
    body: JSON.stringify({ 
      q: query,
      gl: 'au',
      hl: 'en',
      num: 12 
    }),
  });

  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  const data = await res.json();
  
  return (data.organic || []).map((item: any) => {
    let host = 'link';
    try { host = new URL(item.link).hostname.replace('www.', ''); } catch (e) {}
    return {
      title: item.title || 'No Title',
      link: item.link || '#',
      snippet: item.snippet || '',
      source: host
    };
  });
}
// ------------------------------------

export default function Home() {
  const [query, setQuery] = useState('');
  const [listening, setListening] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showCameraMenu, setShowCameraMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode, soundEnabled } = useApp();
  const { user, logout } = useAuth();

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = Array.from(e.results).map((r) => r[0].transcript).join('');
      setQuery(transcript);
      if (e.results[e.results.length - 1].isFinal) {
        setListening(false);
        handleSearch(transcript);
      }
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
  }, []);

  const handleSearch = async (q = query) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    
    setIsSearching(true);
    try {
      const results = await fetchLiveResults(trimmed);
      navigate('/results', { state: { results, query: trimmed } });
    } catch (err: any) {
      console.error(err);
      alert(`Search Error: ${err.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleMic = () => {
    if (soundEnabled) playTick();
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      setListening(true);
      recognitionRef.current?.start();
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${darkMode ? 'bg-slate-900' : 'bg-[#f0f4f8]'}`}>
      <header className="flex justify-end items-center px-6 py-4 gap-2">
        <button onClick={toggleDarkMode} className={`p-2 rounded-full transition-colors ${darkMode ? 'text-white/40 hover:text-white/80' : 'text-slate-400 hover:text-slate-700'}`}>
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className={`w-px h-5 mx-1 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
        <UserMenu user={user} logout={logout} onSignIn={() => setShowAuthModal(true)} />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 gap-10">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
          <Logo size="lg" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="w-full max-w-3xl">
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className={`relative flex items-center w-full h-14 rounded-full border transition-all duration-200 ${darkMode ? 'bg-white/10 backdrop-blur-xl border-white/15 shadow-[0_8px_30px_rgba(0,0,0,0.3)] focus-within:border-white/30' : 'bg-white border-gray-200 shadow-sm focus-within:shadow-md'}`}>
            <button type="submit" disabled={isSearching} className={`absolute left-3 p-1.5 rounded-full transition-colors ${darkMode ? 'text-white/60 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600'}`}>
              {isSearching ? <Circle size={20} className="animate-spin text-blue-500" /> : <Search size={20} />}
            </button>

            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the web..." disabled={isSearching} className={`flex-1 h-full bg-transparent outline-none text-base pl-14 pr-4 ${darkMode ? 'text-white' : 'text-gray-700'}`} />

            <div className="flex items-center gap-1 ml-2 mr-2">
              <button type="button" onClick={handleMic} className={`p-1.5 rounded-full transition-colors ${listening ? 'text-blue-500 bg-blue-50' : darkMode ? 'text-blue-400 hover:bg-white/10' : 'text-blue-500 hover:bg-gray-100'}`}>
                <Mic size={18} />
              </button>
              <button type="button" onClick={() => setShowCameraMenu(!showCameraMenu)} className={`p-1.5 rounded-full transition-colors ${darkMode ? 'text-white/50 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'}`}>
                <Camera size={18} />
              </button>
              <button type="button" onClick={() => setShowScanner(true)} className={`p-1.5 rounded-full transition-colors ${darkMode ? 'text-white/50 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'}`}>
                <QrCode size={18} />
              </button>
            </div>
          </form>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className={`text-sm ${darkMode ? 'text-white/30' : 'text-slate-400'}`}>
          Search anything — or point your camera at the world
        </motion.p>
      </main>

      <AnimatePresence>
        {showScanner && <VisionScanner onClose={() => setShowScanner(false)} />}
        {showAuthModal && <AuthModal darkMode={darkMode} onClose={() => setShowAuthModal(false)} />}
      </AnimatePresence>
      <Footer />
    </div>
  );
}
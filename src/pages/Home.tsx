import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Camera, Search, Moon, Sun, QrCode, Upload, X, Circle } from 'lucide-react';
import Logo from '../components/Logo';
import VisionScanner from '../components/VisionScanner';
import AuthModal from '../components/AuthModal';
import Footer from '../components/Footer';
import UserMenu from '../components/UserMenu';
import { searchResults } from '../data/results';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { playTick } from '../utils/sound';


export default function Home() {
  const [query, setQuery] = useState('');
  const [listening, setListening] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showCameraMenu, setShowCameraMenu] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const cameraMenuRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode, soundEnabled, toggleSound } = useApp();
  const { user, logout } = useAuth();

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join('');
      setQuery(transcript);
      if (e.results[e.results.length - 1].isFinal) {
        setListening(false);
        handleSearch(transcript);
      }
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
  }, []);

  const handleSearch = (q = query) => {
    const results = searchResults(q);
    navigate('/results', { state: { results, query: q } });
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

  // Close camera menu on outside click
  useEffect(() => {
    if (!showCameraMenu) return;
    const handler = (e: MouseEvent) => {
      if (cameraMenuRef.current && !cameraMenuRef.current.contains(e.target as Node)) {
        setShowCameraMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showCameraMenu]);

  // Start camera stream when modal opens
  useEffect(() => {
    if (!showCameraModal) return;
    let cancelled = false;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [showCameraModal]);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const handleCameraClick = () => {
    if (soundEnabled) playTick();
    setShowCameraMenu((v) => !v);
  };

  const handleUploadImage = () => {
    setShowCameraMenu(false);
    cameraInputRef.current?.click();
  };

  const handleTakePhoto = () => {
    setShowCameraMenu(false);
    setShowCameraModal(true);
  };

  const handleCapture = () => {
    stopStream();
    setShowCameraModal(false);
    navigate('/results', { state: { results: searchResults('', true), visual: true } });
  };

  const handleCloseCamera = () => {
    stopStream();
    setShowCameraModal(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    navigate('/results', { state: { results: searchResults('', true), visual: true } });
    e.target.value = '';
  };

  const handleQrScan = () => {
    if (soundEnabled) playTick();
    setShowScanner(true);
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        darkMode
          ? 'bg-gradient-to-br from-slate-900 via-zinc-900 to-black'
          : 'bg-gradient-to-br from-[#f0f4f8] to-[#e6ecef]'
      }`}
    >
      {/* Top nav */}
      <header className="flex justify-end items-center px-6 py-4 gap-2">
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-full transition-colors ${
            darkMode
              ? 'text-white/40 hover:text-white/80 hover:bg-white/10'
              : 'text-slate-400 hover:text-slate-700 hover:bg-black/5'
          }`}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Auth controls */}
        <div className={`w-px h-5 mx-1 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
        <UserMenu user={user} logout={logout} onSignIn={() => setShowAuthModal(true)} />
      </header>

      {/* Center content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 gap-10">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Logo size="lg" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          className="w-full max-w-3xl"
        >
          {/* Integrated search bar */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            className={`relative flex items-center w-full h-14 rounded-full border transition-all duration-200 ${
              darkMode
                ? 'bg-white/10 backdrop-blur-xl border-white/15 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)] focus-within:border-white/30'
                : 'bg-white border-gray-200 shadow-sm hover:shadow-md focus-within:shadow-md'
            }`}
          >
            {/* Left search icon — absolutely positioned submit button */}
            <button
              type="submit"
              aria-label="Search"
              className={`absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full cursor-pointer transition-colors ${darkMode ? 'text-white/60 hover:text-blue-400 hover:bg-white/10' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'}`}
            >
              <Search size={20} />
            </button>

            {/* Text input */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or enter URL"
              className={`flex-1 h-full bg-transparent outline-none text-base placeholder:text-gray-400 pl-14 pr-4 ${
                darkMode ? 'text-white' : 'text-gray-700'
              }`}
            />

            {/* Listening indicator */}
            <AnimatePresence>
              {listening && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-xs text-blue-500 font-medium flex items-center gap-1 mr-2"
                >
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="inline-block w-2 h-2 rounded-full bg-blue-500"
                  />
                  Listening
                </motion.span>
              )}
            </AnimatePresence>

            {/* Right action icons */}
            <div className="flex items-center gap-1 ml-2">
              {/* Search submit button */}
              <button
                type="submit"
                title="Search"
                className={`p-1.5 rounded-full transition-colors ${
                  darkMode ? 'text-blue-400 hover:bg-white/10' : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Search size={18} />
              </button>

              {/* Voice search */}
              <button
                onClick={handleMic}
                title="Voice search"
                className={`p-1.5 rounded-full transition-colors ${
                  listening
                    ? 'text-blue-500 bg-blue-50'
                    : darkMode
                    ? 'text-blue-400 hover:bg-white/10'
                    : 'text-blue-500 hover:bg-gray-100'
                }`}
              >
                <Mic size={18} />
              </button>

              {/* Camera / image search — popover menu */}
              <div ref={cameraMenuRef} className="relative">
                <button
                  type="button"
                  onClick={handleCameraClick}
                  title="Image search"
                  className={`p-1.5 rounded-full transition-colors ${
                    showCameraMenu
                      ? darkMode ? 'text-blue-400 bg-white/10' : 'text-blue-600 bg-blue-50'
                      : darkMode ? 'text-white/50 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <Camera size={18} />
                </button>

                <AnimatePresence>
                  {showCameraMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: -6 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      className={`absolute bottom-full mb-2 right-0 w-44 rounded-xl overflow-hidden shadow-xl border z-50 ${
                        darkMode
                          ? 'bg-zinc-800/90 backdrop-blur-xl border-white/10'
                          : 'bg-white/90 backdrop-blur-xl border-gray-200/80'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={handleUploadImage}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                          darkMode
                            ? 'text-white/80 hover:bg-white/8 hover:text-white'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Upload size={15} className="flex-shrink-0 text-blue-500" />
                        Upload Image
                      </button>
                      <div className={`mx-4 h-px ${darkMode ? 'bg-white/8' : 'bg-gray-100'}`} />
                      <button
                        type="button"
                        onClick={handleTakePhoto}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                          darkMode
                            ? 'text-white/80 hover:bg-white/8 hover:text-white'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Camera size={15} className="flex-shrink-0 text-blue-500" />
                        Take Photo
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Hidden file input for upload */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* QR scanner */}
              <button
                onClick={handleQrScan}
                title="Scan QR"
                className={`p-1.5 rounded-full transition-colors ${
                  darkMode ? 'text-white/50 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <QrCode size={18} />
              </button>
            </div>
          </form>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`text-sm ${darkMode ? 'text-white/30' : 'text-slate-400'}`}
        >
          Search anything — or point your camera at the world
        </motion.p>
      </main>

      <AnimatePresence>
        {showScanner && <VisionScanner onClose={() => setShowScanner(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showAuthModal && (
          <AuthModal darkMode={darkMode} onClose={() => setShowAuthModal(false)} />
        )}
      </AnimatePresence>

      <Footer />

      {/* Live camera modal */}
      <AnimatePresence>
        {showCameraModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm"
          >
            {/* Close button */}
            <button
              onClick={handleCloseCamera}
              className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close camera"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <p className="absolute top-6 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium tracking-wide">
              Take Photo
            </p>

            {/* Video feed */}
            <div className="relative w-full max-w-lg mx-4 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full aspect-[4/3] object-cover bg-zinc-900"
              />
            </div>

            {/* Capture button */}
            <div className="mt-10 flex items-center justify-center">
              <button
                onClick={handleCapture}
                className="relative w-18 h-18 flex items-center justify-center group"
                aria-label="Capture photo"
              >
                <span className="absolute inset-0 rounded-full border-4 border-white/60 group-hover:border-white transition-colors" />
                <Circle size={54} className="text-white fill-white group-hover:scale-95 transition-transform" strokeWidth={0} />
              </button>
            </div>

            <p className="mt-5 text-white/30 text-xs">Tap the button to capture</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

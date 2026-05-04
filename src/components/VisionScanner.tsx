import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { playBeep } from '../utils/sound';

interface VisionScannerProps {
  onClose: () => void;
}

export default function VisionScanner({ onClose }: VisionScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraAvailable, setCameraAvailable] = useState(true);
  const [phase, setPhase] = useState<'scanning' | 'analyzing' | 'done'>('scanning');
  const navigate = useNavigate();
  const { soundEnabled } = useApp();

  useEffect(() => {
    let active = true;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => { if (active) setCameraAvailable(false); });

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleSnap = () => {
    if (soundEnabled) playBeep();
    setPhase('analyzing');
    setTimeout(() => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      navigate('/results', { state: { visual: true, query: 'visual search' } });
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex flex-col items-center justify-center"
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
      >
        <X size={28} />
      </button>

      <p className="text-white/50 text-sm uppercase tracking-widest mb-8 font-medium">
        Vision Scanner
      </p>

      {/* Viewfinder */}
      <div className="relative w-72 h-72">
        {/* Glowing corners */}
        {['top-0 left-0', 'top-0 right-0 rotate-90', 'bottom-0 right-0 rotate-180', 'bottom-0 left-0 -rotate-90'].map(
          (pos, i) => (
            <span
              key={i}
              className={`absolute ${pos} w-8 h-8 border-t-2 border-l-2 border-cyan-400`}
              style={{ boxShadow: '0 0 8px #22d3ee' }}
            />
          )
        )}

        {/* Video or fallback */}
        <div className="absolute inset-0 overflow-hidden rounded-sm bg-black">
          {cameraAvailable ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-white/40 text-sm text-center px-6">
              <Camera size={32} className="opacity-30" />
              <p>Camera unavailable</p>
              <button className="flex items-center gap-2 border border-white/20 rounded-full px-4 py-2 text-xs text-white/60 hover:text-white hover:border-white/40 transition-all">
                <Upload size={14} /> Upload Image
              </button>
            </div>
          )}
        </div>

        {/* Laser line */}
        <AnimatePresence>
          {phase === 'scanning' && (
            <motion.div
              className="absolute left-0 right-0 h-px bg-cyan-400"
              style={{ boxShadow: '0 0 6px 2px #22d3ee' }}
              initial={{ top: 0, opacity: 0 }}
              animate={{ top: ['0%', '100%', '0%'], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </AnimatePresence>

        {/* Analyzing overlay */}
        {phase === 'analyzing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full"
            />
            <p className="text-cyan-400 text-xs uppercase tracking-widest font-mono">
              Analyzing spatial data...
            </p>
          </motion.div>
        )}
      </div>

      {/* Snap button */}
      {phase === 'scanning' && (
        <motion.button
          onClick={handleSnap}
          className="mt-10 px-8 py-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm tracking-wide transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          style={{ boxShadow: '0 0 20px rgba(34,211,238,0.4)' }}
        >
          Snap &amp; Search
        </motion.button>
      )}
    </motion.div>
  );
}

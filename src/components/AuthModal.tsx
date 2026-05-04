import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth, SocialProvider } from '../context/AuthContext';
import Logo from './Logo';

interface Props {
  onClose: () => void;
  darkMode: boolean;
  initialMode?: 'signin' | 'signup';
}

export default function AuthModal({ onClose, darkMode, initialMode = 'signin' }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, loginWithProvider } = useAuth();

  const handleSocial = (provider: SocialProvider) => {
    loginWithProvider(provider);
    onClose();
  };
  const backdropRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus first field on open
  useEffect(() => {
    const t = setTimeout(() => firstInputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, [mode]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const switchMode = (next: 'signin' | 'signup') => {
    setMode(next);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password, name.trim());
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const surface = darkMode
    ? 'bg-zinc-900 border border-white/10'
    : 'bg-white border border-gray-200';
  const inputBase = `w-full h-11 pl-10 pr-4 rounded-xl text-sm outline-none transition-all duration-200 ${
    darkMode
      ? 'bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-blue-500/60 focus:bg-white/8'
      : 'bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:bg-white'
  }`;

  return (
    <motion.div
      ref={backdropRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        className={`relative w-full max-w-sm rounded-2xl shadow-2xl ${surface}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors ${
            darkMode ? 'text-white/30 hover:text-white/70 hover:bg-white/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
        >
          <X size={16} />
        </button>

        <div className="px-8 pt-8 pb-7">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Logo size="sm" />
          </div>

          {/* Mode toggle pills */}
          <div className={`flex p-1 rounded-xl mb-7 ${darkMode ? 'bg-white/6' : 'bg-gray-100'}`}>
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  mode === m
                    ? darkMode
                      ? 'bg-zinc-700 text-white shadow-sm'
                      : 'bg-white text-gray-800 shadow-sm'
                    : darkMode
                    ? 'text-white/35 hover:text-white/60'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            {/* Name — signup only */}
            <AnimatePresence initial={false}>
              {mode === 'signup' && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="relative">
                    <User size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${darkMode ? 'text-white/25' : 'text-gray-400'}`} />
                    <input
                      ref={mode === 'signup' ? firstInputRef : undefined}
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      autoComplete="name"
                      className={inputBase}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="relative">
              <Mail size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${darkMode ? 'text-white/25' : 'text-gray-400'}`} />
              <input
                ref={mode === 'signin' ? firstInputRef : undefined}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                autoComplete={mode === 'signin' ? 'email' : 'email'}
                className={inputBase}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${darkMode ? 'text-white/25' : 'text-gray-400'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Create password (min. 6 chars)' : 'Password'}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                className={`${inputBase} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors ${
                  darkMode ? 'text-white/25 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20"
                >
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                  <p className="text-[13px] text-red-500 leading-snug">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-1 rounded-xl bg-[#4285f4] hover:bg-[#3367d6] active:bg-[#2a56c6] text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mt-5">
            <div className={`flex-1 h-px ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
            <span className={`text-[11px] font-medium flex-shrink-0 ${darkMode ? 'text-white/25' : 'text-gray-400'}`}>
              Or continue with
            </span>
            <div className={`flex-1 h-px ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
          </div>

          {/* Social buttons */}
          <div className="mt-3 space-y-2.5">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocial('google')}
              className={`w-full flex items-center gap-3 h-11 px-4 rounded-xl border text-sm font-medium transition-colors ${
                darkMode
                  ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-[18px] h-[18px] flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="flex-1 text-center">Continue with Google</span>
            </button>

            {/* Apple */}
            <button
              type="button"
              onClick={() => handleSocial('apple')}
              className={`w-full flex items-center gap-3 h-11 px-4 rounded-xl border text-sm font-medium transition-colors ${
                darkMode
                  ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-[18px] h-[18px] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.39.07 2.34.74 3.15.8 1.17-.24 2.29-.93 3.55-.84 1.51.12 2.65.72 3.39 1.84-3.1 1.86-2.38 5.96.48 7.13-.57 1.52-1.32 3.01-2.57 3.95zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className="flex-1 text-center">Continue with Apple</span>
            </button>

            {/* GitHub */}
            <button
              type="button"
              onClick={() => handleSocial('github')}
              className={`w-full flex items-center gap-3 h-11 px-4 rounded-xl border text-sm font-medium transition-colors ${
                darkMode
                  ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-[18px] h-[18px] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span className="flex-1 text-center">Continue with GitHub</span>
            </button>
          </div>

          {/* Footer hint */}
          <p className={`mt-5 text-center text-[12px] ${darkMode ? 'text-white/25' : 'text-gray-400'}`}>
            {mode === 'signin' ? (
              <>No account yet?{' '}
                <button type="button" onClick={() => switchMode('signup')} className="text-[#4285f4] hover:underline font-medium">Create one</button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button type="button" onClick={() => switchMode('signin')} className="text-[#4285f4] hover:underline font-medium">Sign in</button>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

import { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Search, Moon, Sun, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SearchResult {
  title: string;
  url: string;
  displayUrl: string;
  content: string;
}

const MOCK_RESULTS: Record<string, SearchResult[]> = {
  youtube: [
    {
      title: 'YouTube',
      url: 'https://www.youtube.com',
      displayUrl: 'youtube.com',
      content:
        'Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on YouTube.',
    },
    {
      title: 'YouTube Studio – Manage Your Channel',
      url: 'https://studio.youtube.com',
      displayUrl: 'studio.youtube.com',
      content:
        'YouTube Studio is the place to manage your posts, edit video details, review comments, get channel analytics, and grow your audience.',
    },
    {
      title: 'YouTube Music – Free Streaming',
      url: 'https://music.youtube.com',
      displayUrl: 'music.youtube.com',
      content:
        'A new music service with official albums, singles, videos, remixes, live performances and more for Android, iOS and desktop.',
    },
    {
      title: 'YouTube Premium – Ad-Free Experience',
      url: 'https://www.youtube.com/premium',
      displayUrl: 'youtube.com › premium',
      content:
        'Get YouTube Premium to watch without ads, download videos for offline viewing, and enjoy YouTube Music Premium — all in one subscription.',
    },
    {
      title: 'YouTube Help Center',
      url: 'https://support.google.com/youtube',
      displayUrl: 'support.google.com › youtube',
      content:
        'Official YouTube Help Center where you can find tips and tutorials on using YouTube and other answers to frequently asked questions.',
    },
  ],
};

const DEFAULT_RESULTS: SearchResult[] = [
  {
    title: 'NovaSearch – Metasearch Engine',
    url: 'https://novasearch.io',
    displayUrl: 'novasearch.io',
    content:
      'NovaSearch aggregates results from multiple search engines while respecting your privacy. No tracking, no filter bubbles.',
  },
  {
    title: 'How Metasearch Engines Work',
    url: 'https://en.wikipedia.org/wiki/Metasearch_engine',
    displayUrl: 'en.wikipedia.org › wiki › Metasearch_engine',
    content:
      'A metasearch engine is a search tool that sends queries to several other search engines and aggregates the results into a single list.',
  },
  {
    title: 'SearXNG – Privacy-respecting Search',
    url: 'https://searxng.org',
    displayUrl: 'searxng.org',
    content:
      'SearXNG is a free internet metasearch engine which aggregates results from various search services and databases, with no user profiling.',
  },
];

const SKELETON_COUNT = 5;

async function mockFetch(query: string): Promise<SearchResult[]> {
  await new Promise((r) => setTimeout(r, 1500));
  return MOCK_RESULTS[query.trim().toLowerCase()] ?? DEFAULT_RESULTS;
}

function SkeletonCard({ dark }: { dark: boolean }) {
  const pulse = dark ? 'bg-white/8' : 'bg-gray-200';
  return (
    <div className={`rounded-2xl p-5 animate-pulse ${dark ? 'bg-white/4' : 'bg-gray-50'}`}>
      <div className={`h-3 w-24 rounded-full mb-3 ${pulse}`} />
      <div className={`h-5 w-3/4 rounded-full mb-3 ${pulse}`} />
      <div className={`h-3.5 w-full rounded-full mb-2 ${pulse}`} />
      <div className={`h-3.5 w-5/6 rounded-full ${pulse}`} />
    </div>
  );
}

function ResultCard({ result, dark }: { result: SearchResult; dark: boolean }) {
  return (
    <article className={`group rounded-2xl p-5 border transition-colors ${
      dark
        ? 'bg-white/3 border-white/8 hover:bg-white/6 hover:border-white/15'
        : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md'
    }`}>
      <p className={`text-xs mb-1.5 font-medium ${dark ? 'text-emerald-400/80' : 'text-emerald-600'}`}>
        {result.displayUrl}
      </p>
      <a
        href={result.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-start gap-1.5 group/link"
      >
        <h2 className={`text-base font-semibold leading-snug transition-colors ${
          dark
            ? 'text-blue-400 group-hover/link:text-blue-300'
            : 'text-blue-700 group-hover/link:text-blue-800'
        }`}>
          {result.title}
        </h2>
        <ExternalLink
          size={12}
          className={`mt-1 flex-shrink-0 opacity-0 group-hover/link:opacity-60 transition-opacity ${
            dark ? 'text-blue-400' : 'text-blue-700'
          }`}
        />
      </a>
      <p className={`mt-2 text-sm leading-relaxed ${dark ? 'text-white/55' : 'text-gray-600'}`}>
        {result.content}
      </p>
    </article>
  );
}

function SearchBar({
  value,
  onChange,
  onSubmit,
  dark,
  compact = false,
  autoFocus = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  dark: boolean;
  compact?: boolean;
  autoFocus?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center gap-2 ${compact ? 'w-full max-w-2xl' : 'w-full max-w-xl'}`}
    >
      <div className={`flex flex-1 items-center gap-3 rounded-2xl border transition-all px-4 ${
        compact ? 'py-2.5' : 'py-3.5'
      } ${
        dark
          ? 'bg-white/8 border-white/12 focus-within:border-white/30 focus-within:bg-white/12'
          : 'bg-white border-gray-200 focus-within:border-gray-400 shadow-sm focus-within:shadow-md'
      }`}>
        <Search
          size={compact ? 16 : 18}
          className={`flex-shrink-0 ${dark ? 'text-white/40' : 'text-gray-400'}`}
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search anything…"
          className={`flex-1 bg-transparent outline-none placeholder:transition-colors ${
            compact ? 'text-sm' : 'text-base'
          } ${dark ? 'text-white placeholder:text-white/30' : 'text-gray-900 placeholder:text-gray-400'}`}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className={`text-xs transition-opacity ${dark ? 'text-white/30 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'}`}
          >
            ✕
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={!value.trim()}
        className={`flex-shrink-0 rounded-xl font-semibold transition-all ${
          compact ? 'px-4 py-2.5 text-sm' : 'px-5 py-3.5 text-sm'
        } bg-blue-600 text-white hover:bg-blue-500 active:scale-95 shadow-sm disabled:opacity-40`}
      >
        Search
      </button>
    </form>
  );
}

export default function NovaSearch() {
  const { darkMode: dark, toggleDarkMode } = useApp();
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const handleSearch = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setActiveQuery(trimmed);
    setResults(null);
    setLoading(true);
    const data = await mockFetch(trimmed);
    if (!mountedRef.current) return;
    setLoading(false);
    setResults(data);
  };

  const inResults = activeQuery !== '' && (loading || results !== null);

  const DarkToggle = ({ size = 18 }: { size?: number }) => (
    <button
      onClick={toggleDarkMode}
      className={`p-2.5 rounded-xl transition-colors ${
        dark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-gray-200 text-gray-500'
      }`}
      aria-label="Toggle dark mode"
    >
      {dark ? <Sun size={size} /> : <Moon size={size} />}
    </button>
  );

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      dark ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <AnimatePresence>
        {inResults && (
          <motion.header
            initial={{ y: -64, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -64, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className={`sticky top-0 z-20 border-b backdrop-blur-xl ${
              dark ? 'bg-slate-900/85 border-white/8' : 'bg-gray-50/85 border-gray-200'
            }`}
          >
            <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
              <button
                onClick={() => { setActiveQuery(''); setResults(null); setQuery(''); }}
                className="flex items-center gap-1.5 flex-shrink-0"
              >
                <Compass size={20} className="text-blue-500" />
                <span className="font-bold text-sm tracking-tight">NovaSearch</span>
              </button>
              <SearchBar
                value={query}
                onChange={setQuery}
                onSubmit={() => handleSearch(query)}
                dark={dark}
                compact
              />
              <DarkToggle size={16} />
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!inResults && (
          <motion.main
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col items-center justify-center px-4 pb-24"
          >
            <div className="absolute top-5 right-5">
              <DarkToggle />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="flex flex-col items-center gap-4 mb-10"
            >
              <div className={`p-4 rounded-2xl ${dark ? 'bg-blue-500/15' : 'bg-blue-50'}`}>
                <Compass size={40} className="text-blue-500" strokeWidth={1.75} />
              </div>
              <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight">NovaSearch</h1>
                <p className={`mt-1.5 text-sm ${dark ? 'text-white/40' : 'text-gray-500'}`}>
                  Privacy-respecting metasearch
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full flex justify-center"
            >
              <SearchBar
                value={query}
                onChange={setQuery}
                onSubmit={() => handleSearch(query)}
                dark={dark}
                autoFocus
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`mt-5 text-xs ${dark ? 'text-white/25' : 'text-gray-400'}`}
            >
              Try searching for "YouTube"
            </motion.p>
          </motion.main>
        )}
      </AnimatePresence>

      {inResults && (
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
          {!loading && results && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-xs mb-5 ${dark ? 'text-white/35' : 'text-gray-400'}`}
            >
              {results.length} result{results.length !== 1 ? 's' : ''} for{' '}
              <span className={`font-medium ${dark ? 'text-white/60' : 'text-gray-600'}`}>
                "{activeQuery}"
              </span>
            </motion.p>
          )}

          <div className="flex flex-col gap-3">
            {loading
              ? Array.from({ length: SKELETON_COUNT }, (_, i) => (
                  <SkeletonCard key={i} dark={dark} />
                ))
              : results?.map((r, i) => (
                  <motion.div
                    key={r.url}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <ResultCard result={r} dark={dark} />
                  </motion.div>
                ))}
          </div>
        </main>
      )}

      {!inResults && (
        <footer className={`py-6 text-center text-xs ${dark ? 'text-white/20' : 'text-gray-400'}`}>
          NovaSearch · No tracking · No filter bubbles
        </footer>
      )}
    </div>
  );
}

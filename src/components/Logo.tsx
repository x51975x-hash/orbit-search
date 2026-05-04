import { Globe } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { text: 'text-2xl', icon: 16 },
  md: { text: 'text-4xl', icon: 24 },
  lg: { text: 'text-6xl', icon: 36 },
};

const letters: { char: string; color: string }[] = [
  { char: 'O', color: '#4285F4' },
  { char: 'r', color: '#EA4335' },
  { char: 'b', color: '#FBBC05' },
  { char: 'i', color: '#34A853' },
  { char: 't', color: '#4285F4' },
];

export default function Logo({ size = 'md' }: LogoProps) {
  const { text, icon } = sizes[size];
  return (
    <div className="flex items-center gap-2 select-none">
      <span className={`font-extrabold tracking-tight ${text}`} aria-label="Orbit">
        {letters.map(({ char, color }, i) => (
          <span key={i} style={{ color }}>
            {char}
          </span>
        ))}
      </span>
      <Globe
        size={icon}
        strokeWidth={1.5}
        className="text-slate-400 opacity-40"
        aria-hidden
      />
    </div>
  );
}

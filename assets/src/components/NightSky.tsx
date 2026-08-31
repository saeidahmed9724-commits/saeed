import { useState, useEffect } from 'react';
import { Star, Sparkles, X, Heart } from 'lucide-react';
import { Language, Memory } from '../types';
import { DataStore } from '../dataStore';
import { translations } from '../translations';

interface NightSkyProps {
  lang: Language;
  onSelectMemory?: (memory: Memory) => void;
}

interface StarNode {
  id: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  memory: Memory;
}

export default function NightSky({ lang, onSelectMemory }: NightSkyProps) {
  const t = translations[lang];
  const [memories, setMemories] = useState<Memory[]>([]);
  const [stars, setStars] = useState<StarNode[]>([]);
  const [selectedStar, setSelectedStar] = useState<Memory | null>(null);

  useEffect(() => {
    const loadStars = () => {
      const items = DataStore.getMemories();
      setMemories(items);

      const generatedStars = items.map((mem, index) => {
        const angle = (index / items.length) * 2 * Math.PI + Math.random() * 0.2;
        const radiusX = 30 + Math.random() * 50;
        const radiusY = 25 + Math.random() * 45;
        
        const x = 50 + radiusX * Math.cos(angle) * 0.4;
        const y = 45 + radiusY * Math.sin(angle) * 0.4;

        return {
          id: mem.id,
          x: Math.min(Math.max(x, 10), 90),
          y: Math.min(Math.max(y, 10), 80),
          size: Math.random() * 10 + 12,
          opacity: Math.random() * 0.4 + 0.6,
          memory: mem
        };
      });

      setStars(generatedStars);
    };

    loadStars();
    window.addEventListener('datastore_synced', loadStars);
    return () => window.removeEventListener('datastore_synced', loadStars);
  }, []);

  const handleStarClick = (mem: Memory) => {
    if (onSelectMemory) {
      onSelectMemory(mem);
    } else {
      setSelectedStar(mem);
    }
  };

  return (
    <div className="relative w-full overflow-hidden min-h-[420px] flex flex-col justify-between py-2">
      
      {/* Background Star twinkle simulation */}
      <div className="absolute inset-0 pointer-events-none -z-10 bg-radial-gradient from-rose-gold-50/10 to-transparent dark:from-rose-gold-950/10">
        <div className="absolute top-[20%] left-[30%] w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-60" />
        <div className="absolute top-[60%] left-[80%] w-1 h-1 bg-white rounded-full animate-ping opacity-40 duration-1000" />
        <div className="absolute top-[40%] left-[70%] w-2 h-2 bg-white rounded-full animate-ping opacity-30 duration-700" />
      </div>

      <div className="text-center z-10 mb-4">
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
          {t.nightSkyIntro}
        </p>
      </div>

      {stars.length === 0 ? (
        // Beautiful Empty Constellation Star Sky
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="relative mb-4">
            <Star className="text-rose-gold-200 dark:text-rose-gold-900 animate-spin opacity-40 duration-3000" size={54} />
            <Heart className="absolute inset-0 m-auto text-rose-gold-400 fill-rose-gold-400 animate-pulse" size={20} />
          </div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 max-w-sm">
            {t.starEmpty}
          </p>
        </div>
      ) : (
        // Constellation Map
        <div className="relative flex-1 min-h-[260px] cursor-crosshair">
          {/* Connector paths for premium look */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            {stars.map((star, i) => {
              if (i === 0) return null;
              const prev = stars[i - 1];
              return (
                <line
                  key={`line-${i}`}
                  x1={`${prev.x}%`}
                  y1={`${prev.y}%`}
                  x2={`${star.x}%`}
                  y2={`${star.y}%`}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-rose-gold-400 dark:text-rose-gold-700 stroke-dasharray-[4,4] animate-pulse"
                />
              );
            })}
          </svg>

          {/* Star Nodes */}
          {stars.map((star, idx) => (
            <button
              key={`star-${star.id || idx}-${idx}`}
              onClick={() => handleStarClick(star.memory)}
              style={{ left: `${star.x}%`, top: `${star.y}%` }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group focus:outline-none z-10 transition-transform duration-300 hover:scale-125"
            >
              <div className="relative flex items-center justify-center">
                <Star
                  size={star.size}
                  className="text-rose-gold-400 hover:text-rose-gold-500 fill-rose-gold-200 dark:fill-rose-gold-900 transition-all duration-300 filter drop-shadow-[0_0_8px_rgba(184,84,74,0.6)]"
                />
                <span className="absolute bottom-[-18px] scale-0 group-hover:scale-100 transition-all duration-300 text-[10px] font-bold bg-rose-gold-500 text-white py-0.5 px-2 rounded-md shadow-xs whitespace-nowrap">
                  {star.memory.title}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Embedded star details popup if no callback provided */}
      {selectedStar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-white/20 relative animate-fade-in">
            <button
              onClick={() => setSelectedStar(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/10 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 hover:bg-black/20 z-10 transition-colors"
            >
              <X size={18} />
            </button>

            {selectedStar.imageUrl && (
              <div className="w-full h-48 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                <img
                  src={selectedStar.imageUrl}
                  alt={selectedStar.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6">
              <span className="text-xs font-semibold text-rose-gold-500 dark:text-rose-gold-300 font-mono block mb-1">
                {selectedStar.date}
              </span>
              <h4 className="font-serif text-xl font-bold text-neutral-950 dark:text-neutral-100 mb-3">
                {selectedStar.title}
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed max-h-[140px] overflow-y-auto">
                {selectedStar.content}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

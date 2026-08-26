import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Heart, Volume2, VolumeX, Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import { Language, VideoItem } from '../types';
import { DataStore } from '../dataStore';
import { translations } from '../translations';

interface MemoryReelProps {
  lang: Language;
}

export default function MemoryReel({ lang }: MemoryReelProps) {
  const t = translations[lang];
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  
  // Track detected aspect ratios of each video index
  const [videoRatios, setVideoRatios] = useState<{[key: number]: 'landscape' | 'portrait'}>({});
  // Track manual sizing overrides by user
  const [userFitOverrides, setUserFitOverrides] = useState<{[key: number]: 'cover' | 'contain'}>({});

  useEffect(() => {
    const loadVideos = () => {
      const items = [...DataStore.getVideos()];
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = items[i];
        items[i] = items[j];
        items[j] = temp;
      }
      setVideos(items);
    };

    loadVideos();
    window.addEventListener('datastore_synced', loadVideos);
    return () => window.removeEventListener('datastore_synced', loadVideos);
  }, []);

  const handleVideoClick = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(err => console.log('Autoplay blocked:', err));
      setIsPlaying(true);
    }
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    const activeVideo = videoRefs.current[activeIdx];
    if (activeVideo) {
      activeVideo.currentTime = newTime;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isContainMode = (index: number) => {
    if (userFitOverrides[index] !== undefined) {
      return userFitOverrides[index] === 'contain';
    }
    return videoRatios[index] === 'landscape';
  };

  const toggleFitMode = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const currentMode = isContainMode(index) ? 'contain' : 'cover';
    const newMode = currentMode === 'cover' ? 'contain' : 'cover';
    setUserFitOverrides(prev => ({
      ...prev,
      [index]: newMode
    }));
  };

  // Handle active video change
  useEffect(() => {
    // Pause all videos except active one
    videoRefs.current.forEach((video, idx) => {
      if (video) {
        if (idx === activeIdx) {
          if (isPlaying) {
            video.play().catch(err => console.log('Autoplay blocked:', err));
          }
          setCurrentTime(video.currentTime || 0);
          setDuration(video.duration || 0);
        } else {
          video.pause();
        }
      }
    });
  }, [activeIdx, isPlaying, videos]);

  if (videos.length === 0) {
    return (
      <div className="w-full max-w-sm mx-auto h-[540px] rounded-[36px] glass overflow-hidden border border-white/50 dark:border-white/10 flex flex-col items-center justify-center p-8 text-center shadow-md relative">
        <div className="absolute inset-0 pointer-events-none -z-10 bg-radial-gradient from-rose-gold-50/10 to-transparent dark:from-rose-gold-950/10" />
        <div className="p-4 rounded-full bg-rose-gold-100 dark:bg-rose-gold-950/30 text-rose-gold-500 animate-pulse mb-4">
          <Play fill="currentColor" size={32} className="ml-1" />
        </div>
        <h3 className="font-serif text-lg font-bold text-neutral-800 dark:text-neutral-100 mb-2 flex items-center justify-center gap-2">
          <Sparkles className="text-rose-gold-400" size={16} />
          {lang === 'ar' ? 'بكرة ذكرياتنا (ريلز)' : 'Our Memory Reel'}
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-[240px]">
          {lang === 'ar'
            ? 'بكرة فيديوهات قصيرة مخصصة لكم. تظهر فارغة حتى تقوموا برفع فيديوهاتكم الخاصة من بوابة الإعدادات بالأسفل.'
            : 'A beautiful vertical short video stream designed for you. Empty until you add your custom romantic video URLs in Settings.'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto h-[580px] rounded-[36px] bg-black overflow-hidden border border-white/10 shadow-2xl relative">
      
      {/* Scroll container */}
      <div 
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-none"
        onScroll={(e) => {
          const container = e.currentTarget;
          const index = Math.round(container.scrollTop / container.clientHeight);
          if (index !== activeIdx && index >= 0 && index < videos.length) {
            setActiveIdx(index);
            setIsPlaying(true);
          }

          // When reaching near the end of current shuffled list, append a new randomized copy to make it infinite
          if (index >= videos.length - 2 && videos.length > 0) {
            const extraItems = [...DataStore.getVideos()];
            // Shuffle the extra set
            for (let i = extraItems.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              const temp = extraItems[i];
              extraItems[i] = extraItems[j];
              extraItems[j] = temp;
            }
            // Append with unique loop-IDs to avoid key collision
            setVideos(prev => [
              ...prev,
              ...extraItems.map(v => ({
                ...v,
                id: `${v.id}-loop-${Math.random()}`
              }))
            ]);
          }
        }}
      >
        {videos.map((vid, idx) => (
          <div 
            key={vid.id} 
            className="w-full h-full snap-start shrink-0 relative flex items-center justify-center bg-black cursor-pointer"
            onClick={() => handleVideoClick(idx)}
          >
            {/* Blurred background video behind contain-mode videos */}
            {isContainMode(idx) && (
              <video
                src={vid.url}
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-40 blur-2xl pointer-events-none"
              />
            )}

            <video
              ref={(el) => (videoRefs.current[idx] = el)}
              src={vid.url}
              loop
              muted={isMuted}
              playsInline
              onTimeUpdate={(e) => {
                if (idx === activeIdx) {
                  setCurrentTime(e.currentTarget.currentTime);
                }
              }}
              onLoadedMetadata={(e) => {
                const video = e.currentTarget;
                if (idx === activeIdx) {
                  setDuration(video.duration);
                }
                const ratio = video.videoWidth / video.videoHeight;
                setVideoRatios(prev => ({
                  ...prev,
                  [idx]: ratio > 1.15 ? 'landscape' : 'portrait'
                }));
              }}
              className={`w-full h-full transition-all duration-300 relative z-10 ${
                isContainMode(idx) ? 'object-contain' : 'object-cover'
              }`}
            />

            {/* Sizing override toggle button */}
            <button
              onClick={(e) => toggleFitMode(e, idx)}
              className="absolute top-6 left-6 p-3 rounded-full bg-black/40 text-white backdrop-blur-md z-20 border border-white/10 hover:bg-black/60 transition-colors"
              title={lang === 'ar' ? 'تغيير مقاس الفيديو' : 'Toggle Aspect Ratio'}
            >
              {isContainMode(idx) ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>

            {/* Muted indicator */}
            <button
              onClick={handleMuteToggle}
              className="absolute top-6 right-6 p-3 rounded-full bg-black/40 text-white backdrop-blur-md z-20 border border-white/10 hover:bg-black/60 transition-colors"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            {/* Play overlay button if paused */}
            {!isPlaying && idx === activeIdx && (
              <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 flex items-center justify-center animate-pulse z-10">
                <Play fill="currentColor" size={24} className="ml-1" />
              </div>
            )}

            {/* Side Hearts Floating Layer */}
            <div className="absolute right-4 bottom-20 flex flex-col items-center gap-4 z-20">
              <div className="flex flex-col items-center gap-1.5">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add interactive heart burst animation
                  }}
                  className="w-13 h-13 rounded-full bg-black/50 text-rose-500 backdrop-blur-md border border-white/20 hover:scale-110 active:scale-90 transition-all flex items-center justify-center shadow-lg"
                >
                  <Heart fill="currentColor" size={26} className="animate-pulse" />
                </button>
                <span className="text-[11px] font-bold text-white font-mono tracking-wider drop-shadow-md">S&S</span>
              </div>
            </div>

            {/* Bottom Progress/Timeline Scrubber Overlay */}
            {idx === activeIdx && (
              <div 
                className="absolute bottom-6 left-5 right-20 z-30 bg-black/60 backdrop-blur-md p-3 px-4 rounded-2xl border border-white/15 flex items-center gap-3 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Play/Pause Toggle */}
                <button 
                  onClick={() => handleVideoClick(idx)}
                  className="text-white hover:text-rose-gold-400 active:scale-95 transition-all p-1"
                >
                  {isPlaying ? (
                    <Pause size={14} fill="currentColor" />
                  ) : (
                    <Play size={14} fill="currentColor" />
                  )}
                </button>
                
                {/* Custom timeline range slider */}
                <input 
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1.5 rounded-lg bg-white/30 appearance-none cursor-pointer accent-rose-gold-500 outline-none"
                  style={{
                    background: `linear-gradient(to right, #d4af37 0%, #d4af37 ${(currentTime / (duration || 1)) * 100}%, rgba(255, 255, 255, 0.3) ${(currentTime / (duration || 1)) * 100}%, rgba(255, 255, 255, 0.3) 100%)`
                  }}
                />

                {/* Time Display */}
                <span className="text-[11px] font-mono text-white/90 shrink-0 font-bold">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

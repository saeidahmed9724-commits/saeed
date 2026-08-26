import React, { useState, useEffect } from 'react';
import { Play, Pause, Music, Sparkles, Mic, Volume2, Calendar, SkipForward, SkipBack, Image, Film, Music2 } from 'lucide-react';
import { Language, Song, VoiceMessage, Memory, GalleryItem, VideoItem, UserRole } from '../types';
import { DataStore } from '../dataStore';
import { translations } from '../translations';

interface MusicSectionProps {
  lang: Language;
  currentSong: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  shuffledSongs: Song[];
  onSelectSong: (song: Song) => void;
  shuffledVideos: VideoItem[];
  shuffledGallery: GalleryItem[];
  globalVolume: number;
  onVolumeChange: (vol: number) => void;
  currentUserRole?: UserRole;
  setActiveTab?: (tab: any) => void;
  onDataChanged?: () => void;
}

export default function MusicSection({
  lang,
  currentSong,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  shuffledSongs,
  onSelectSong,
  shuffledVideos,
  shuffledGallery,
  globalVolume,
  onVolumeChange,
  currentUserRole,
  setActiveTab,
  onDataChanged,
}: MusicSectionProps) {
  const t = translations[lang];

  // States
  const [voices, setVoices] = useState<VoiceMessage[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [linkedMemory, setLinkedMemory] = useState<Memory | null>(null);

  const [currentArtwork, setCurrentArtwork] = useState<{ type: 'photo' | 'video'; url: string } | null>(null);

  useEffect(() => {
    const handleSync = () => {
      setVoices(DataStore.getVoiceMessages());
      setMemories(DataStore.getMemories());
    };
    handleSync();
    window.addEventListener('datastore_synced', handleSync);
    return () => window.removeEventListener('datastore_synced', handleSync);
  }, []);

  // Dynamic randomized artwork loop (photos and videos mix)
  useEffect(() => {
    const hasPhotos = shuffledGallery.length > 0;
    const hasVideos = shuffledVideos.length > 0;

    const changeArtwork = () => {
      if (!hasPhotos && !hasVideos) {
        if (currentSong) {
          setCurrentArtwork({ type: 'video', url: currentSong.url });
        }
        return;
      }

      // Choose randomly between photo and video if both exist
      let chosenType: 'photo' | 'video' = 'photo';
      if (hasPhotos && hasVideos) {
        chosenType = Math.random() > 0.5 ? 'photo' : 'video';
      } else if (hasVideos) {
        chosenType = 'video';
      }

      if (chosenType === 'photo') {
        const randomPhoto = shuffledGallery[Math.floor(Math.random() * shuffledGallery.length)];
        setCurrentArtwork({ type: 'photo', url: randomPhoto.url });
      } else {
        const randomVideo = shuffledVideos[Math.floor(Math.random() * shuffledVideos.length)];
        setCurrentArtwork({ type: 'video', url: randomVideo.url });
      }
    };

    // Set first artwork
    changeArtwork();

    // Set interval to change every 8 seconds
    const interval = setInterval(changeArtwork, 8000);
    return () => clearInterval(interval);
  }, [shuffledGallery, shuffledVideos, currentSong]);

  // Set the video's start point to a random small snippet when loaded
  const handleArtworkVideoLoaded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration > 0) {
      // Pick a random start time ensuring at least a 6-second snippet can play
      const maxStart = Math.max(0, video.duration - 6);
      video.currentTime = Math.random() * maxStart;
    }
  };

  // Handle song linked memory popups
  useEffect(() => {
    if (!currentSong) {
      setLinkedMemory(null);
      return;
    }
    const related = memories.find((m) => m.id === currentSong.linkedMemoryId || m.songId === currentSong.id);
    if (related) {
      setLinkedMemory(related);
      const timer = setTimeout(() => {
        setLinkedMemory(null);
      }, 8000);
      return () => clearTimeout(timer);
    } else {
      setLinkedMemory(null);
    }
  }, [currentSong, memories]);

  return (
    <div className="space-y-10 max-w-4xl mx-auto px-4 py-2 animate-fade-in">
      
      {/* Linked Memory Popup Card Overlay */}
      {linkedMemory && (
        <div className="fixed bottom-28 left-4 right-4 md:left-auto md:right-8 md:max-w-xs bg-cream-50/95 dark:bg-neutral-900/95 backdrop-blur-md border border-rose-gold-200 dark:border-rose-gold-950 p-4 rounded-2xl shadow-2xl z-50 animate-bounce flex gap-3 items-start max-w-sm ml-auto">
          {linkedMemory.imageUrl && (
            <img src={linkedMemory.imageUrl} referrerPolicy="no-referrer" alt="" className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/50" />
          )}
          <div className="flex-1">
            <span className="flex items-center gap-1 text-[9px] font-bold text-rose-gold-500 uppercase tracking-widest mb-1 font-mono">
              <Sparkles size={10} />
              {lang === 'ar' ? 'ذكرى مرتبطة بهذا اللحن' : 'Song Linked Memory'}
            </span>
            <h5 className="font-serif text-xs font-bold text-neutral-950 dark:text-neutral-50">{linkedMemory.title}</h5>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
              {linkedMemory.content}
            </p>
          </div>
          <button onClick={() => setLinkedMemory(null)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs font-bold font-mono">×</button>
        </div>
      )}

      {/* --- PREMIUM PLAYER DASHBOARD --- */}
      {currentSong && (
        <div className="rounded-[36px] bg-white/45 dark:bg-black/35 backdrop-blur-xl border border-white/50 dark:border-white/5 p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
          
          {/* ARTWORK DISPLAY COMPONENT */}
          <div className="w-full md:w-56 aspect-square rounded-3xl overflow-hidden relative shadow-lg bg-neutral-950 flex items-center justify-center shrink-0">
            {currentArtwork?.type === 'video' ? (
              <video
                key={currentArtwork.url}
                src={currentArtwork.url}
                muted
                autoPlay
                playsInline
                onLoadedMetadata={handleArtworkVideoLoaded}
                className="w-full h-full object-cover rounded-3xl animate-fade-in"
              />
            ) : currentArtwork?.type === 'photo' ? (
              <img
                key={currentArtwork.url}
                src={currentArtwork.url}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-3xl animate-fade-in"
                alt=""
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-rose-gold-400 p-4 text-center">
                <Music2 size={36} className="animate-pulse mb-2" />
                <span className="text-[10px] font-bold uppercase">{lang === 'ar' ? 'أجواء الحب' : 'Our Love Vibes'}</span>
              </div>
            )}

            {/* Glowing active animation indicator */}
            {isPlaying && (
              <div className="absolute bottom-3 right-3 flex gap-1 items-end h-4 px-2 py-1 rounded-full bg-black/40 backdrop-blur-xs z-10">
                <span className="w-0.5 bg-rose-gold-400 animate-pulse h-3" style={{ animationDelay: '0.1s' }} />
                <span className="w-0.5 bg-rose-gold-400 animate-pulse h-2.5" style={{ animationDelay: '0.3s' }} />
                <span className="w-0.5 bg-rose-gold-400 animate-pulse h-4" style={{ animationDelay: '0.5s' }} />
              </div>
            )}
          </div>

          {/* PLAYER METRICS & CONTROLS */}
          <div className="flex-1 w-full flex flex-col justify-between self-stretch py-1">
            <div>
              {/* Automated Artwork Badge - replacing manual toggle buttons */}
              <div className="flex gap-2 mb-4 justify-center md:justify-start flex-wrap">
                <span className="text-[9px] font-bold px-3 py-1 rounded-full bg-rose-gold-500/10 text-rose-gold-500 dark:text-rose-gold-400 border border-rose-gold-500/20 flex items-center gap-1">
                  <Sparkles size={10} className="animate-pulse" />
                  {lang === 'ar' ? 'لوحة الذكريات العشوائية' : 'Randomized Memory Canvas'}
                </span>
                {currentUserRole && setActiveTab && onDataChanged && (
                  <button
                    onClick={async () => {
                      try {
                        await fetch('/api/chat/message', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            sender: currentUserRole,
                            text: lang === 'ar' ? `شاركت معكِ الأغنية الحالية: "${currentSong?.title}"` : `Shared current song: "${currentSong?.title}"`,
                            sharedItem: {
                              type: 'song',
                              id: currentSong?.id,
                              title: currentSong?.title,
                              subtitle: lang === 'ar' ? 'أغنية من أرشيفنا 🎵' : 'Song from our vault 🎵',
                              image: currentArtwork?.url || ''
                            }
                          })
                        });
                        onDataChanged();
                        setActiveTab('chat');
                      } catch (err) {
                        console.error('Error sharing song:', err);
                      }
                    }}
                    className="text-[9px] font-bold px-3 py-1 rounded-full bg-rose-gold-500 text-white hover:bg-rose-gold-600 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>💬</span>
                    <span>{lang === 'ar' ? 'مشاركة الأغنية في المحادثة' : 'Share Song in Chat'}</span>
                  </button>
                )}
              </div>

              <div className="text-center md:text-left rtl:md:text-right">
                <h3 className="font-serif text-xl font-bold text-neutral-950 dark:text-neutral-50 leading-tight">
                  {currentSong ? (currentSong.title ? currentSong.title : '') : (lang === 'ar' ? 'لحن من قبو حبنا' : 'A Melody From Our Love Vault')}
                </h3>
                <p className="text-xs text-rose-gold-500 dark:text-rose-gold-400 font-bold mt-1 uppercase tracking-wider">
                  {currentSong?.artist ? currentSong.artist : (lang === 'ar' ? 'سعيد وسهيلة' : 'Saeed & Sohila')}
                </p>
              </div>
            </div>

            {/* Audio Controls Grid */}
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex items-center justify-center md:justify-start gap-5">
                <button
                  onClick={onPrev}
                  className="p-2.5 rounded-full bg-white/50 dark:bg-black/15 text-neutral-700 dark:text-neutral-300 hover:scale-110 active:scale-95 transition-all shadow-xs cursor-pointer border border-white/40 dark:border-white/5"
                >
                  <SkipBack size={18} fill="currentColor" />
                </button>
                <button
                  onClick={onPlayPause}
                  className="w-14 h-14 rounded-full bg-rose-gold-500 hover:bg-rose-gold-600 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>
                <button
                  onClick={onNext}
                  className="p-2.5 rounded-full bg-white/50 dark:bg-black/15 text-neutral-700 dark:text-neutral-300 hover:scale-110 active:scale-95 transition-all shadow-xs cursor-pointer border border-white/40 dark:border-white/5"
                >
                  <SkipForward size={18} fill="currentColor" />
                </button>
              </div>

              {/* Volume Controller Slider */}
              <div className="flex items-center gap-2 max-w-xs mx-auto md:mx-0 w-full bg-white/20 dark:bg-black/10 px-3.5 py-2 rounded-2xl border border-white/20 dark:border-white/5">
                <Volume2 size={14} className="text-rose-gold-500 shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={globalVolume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-1 bg-neutral-300 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-gold-500 focus:outline-hidden"
                />
                <span className="text-[10px] font-mono font-bold text-neutral-500 dark:text-neutral-400 w-8 text-right">
                  {Math.round(globalVolume * 100)}%
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- SONGS PLAYLIST SECTION --- */}
      <div className="space-y-4 pt-6 border-t border-rose-gold-100/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-2xl font-bold text-neutral-950 dark:text-neutral-50 flex items-center gap-2">
              <Music2 className="text-rose-gold-500" size={24} />
              {lang === 'ar' ? 'قائمة الأغاني والموسيقى 🎶' : 'Songs & Music Library 🎶'}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {lang === 'ar' ? `إجمالي الأغاني والألحان: ${shuffledSongs.length}` : `Total Tracks: ${shuffledSongs.length}`}
            </p>
          </div>
        </div>

        {shuffledSongs.length === 0 ? (
          <div className="p-8 text-center rounded-3xl border border-dashed border-rose-gold-100 dark:border-rose-gold-950/40 bg-white/20 dark:bg-black/10 text-neutral-400 text-xs font-bold">
            {lang === 'ar' ? 'لا توجد أغاني في القائمة بعد' : 'No songs in playlist yet'}
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
            {shuffledSongs.map((song, index) => {
              const isSelected = currentSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  onClick={() => {
                    if (isSelected) {
                      onPlayPause();
                    } else {
                      onSelectSong(song);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-rose-gold-500/10 dark:bg-rose-gold-950/40 border-rose-gold-400 shadow-xs ring-1 ring-rose-gold-400/30'
                      : 'bg-white/40 dark:bg-neutral-900/40 border-white/40 dark:border-white/5 hover:bg-white/60 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                        isSelected
                          ? 'bg-rose-gold-500 text-white shadow-xs'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                      }`}
                    >
                      {isSelected && isPlaying ? (
                        <Pause size={18} fill="currentColor" />
                      ) : (
                        <Play size={18} fill="currentColor" className="ml-0.5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-serif text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                        {song.title ? song.title : ''}
                      </h4>
                      {song.artist ? (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                          {song.artist}
                        </p>
                      ) : (
                        <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                          #{index + 1}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-gold-500 text-white animate-pulse">
                        {isPlaying ? (lang === 'ar' ? 'شغالة الآن' : 'Playing') : (lang === 'ar' ? 'موقوفة' : 'Paused')}
                      </span>
                    )}

                    {currentUserRole && setActiveTab && onDataChanged && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fetch('/api/chat/message', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              sender: currentUserRole,
                              text: lang === 'ar' ? `شاركت معكِ أغنية: "${song.title || 'بدون عنوان'}"` : `Shared song: "${song.title || 'Untitled'}"`,
                              sharedItem: {
                                type: 'song',
                                id: song.id,
                                title: song.title || '',
                                subtitle: song.artist || '',
                                image: song.coverUrl || ''
                              }
                            })
                          }).then(() => {
                            onDataChanged();
                            setActiveTab('chat');
                          });
                        }}
                        className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-rose-gold-100 dark:hover:bg-rose-gold-900/50 text-neutral-500 dark:text-neutral-400 hover:text-rose-gold-600 transition-colors"
                        title={lang === 'ar' ? 'مشاركة في المحادثة' : 'Share in Chat'}
                      >
                        <span>💬</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- VOICE MESSAGES SECTION --- */}
      <div className="space-y-6 pt-6 border-t border-rose-gold-100/20">
        <div className="text-center md:text-left rtl:md:text-right">
          <h3 className="font-serif text-2xl font-bold text-neutral-950 dark:text-neutral-50 flex items-center justify-center md:justify-start gap-2">
            <Mic className="text-rose-gold-500" size={24} />
            {t.voiceNotesTitle}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {t.voiceNotesIntro}
          </p>
        </div>

        {voices.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-rose-gold-100 dark:border-rose-gold-950/40 p-8 text-center bg-white/20 dark:bg-black/10">
            <Mic className="text-rose-gold-200 dark:text-rose-gold-950 mx-auto mb-3 animate-pulse" size={40} />
            <h4 className="font-serif text-sm font-bold text-neutral-700 dark:text-neutral-400 mb-1">{lang === 'ar' ? 'الهمسات الصوتية فارغة' : 'Whisper Library is Empty'}</h4>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-sm mx-auto">
              {lang === 'ar' ? 'لم ترفع أي همسات صوتية بعد. سيتكمن سعيد وسهيلة من رفعها لاحقاً.' : 'Future uploads only.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {voices.map((voice) => (
              <div
                key={voice.id}
                className="p-5 rounded-3xl glass border border-white/50 dark:border-white/10 flex flex-col justify-between min-h-[140px] shadow-xs relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-rose-gold-100 dark:bg-rose-gold-950/20 text-rose-gold-500">
                      <Mic size={18} />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-neutral-900 dark:text-neutral-100">{voice.title}</h4>
                      <span className="text-[10px] font-bold text-rose-gold-400 font-mono block mt-1 uppercase tracking-wider">
                        {lang === 'ar' ? `بواسطة ${voice.sender === 'Dodo' ? t.dodo : t.so}` : `Whisper by ${voice.sender === 'Dodo' ? t.dodo : t.so}`}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-semibold text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
                    <Calendar size={10} />
                    {voice.date}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-col gap-3">
                  <audio src={voice.url} controls className="w-full h-8" />
                  {currentUserRole && setActiveTab && onDataChanged && (
                    <div className="flex justify-end">
                      <button
                        onClick={async () => {
                          try {
                            await fetch('/api/chat/message', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                sender: currentUserRole,
                                text: lang === 'ar' ? `شاركت معكِ همسة صوتية: "${voice.title}"` : `Shared a voice whisper: "${voice.title}"`,
                                sharedItem: {
                                  type: 'voice',
                                  id: voice.id,
                                  title: voice.title,
                                  subtitle: lang === 'ar' ? `همسة صوتية من ${voice.sender === 'Dodo' ? 'سعيد' : 'سهيلة'} 🎙️` : `Voice note by ${voice.sender === 'Dodo' ? 'Saeed' : 'Sohila'} 🎙️`
                                }
                              })
                            });
                            onDataChanged();
                            setActiveTab('chat');
                          } catch (err) {
                            console.error('Error sharing voice note:', err);
                          }
                        }}
                        className="text-[9px] font-bold text-rose-gold-600 dark:text-rose-gold-400 hover:text-rose-gold-700 bg-rose-gold-500/10 hover:bg-rose-gold-500/20 px-3 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>💬</span>
                        <span>{lang === 'ar' ? 'مشاركة في المحادثة' : 'Share in Chat'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

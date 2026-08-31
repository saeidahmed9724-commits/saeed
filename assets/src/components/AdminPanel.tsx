import React, { useState, useEffect } from 'react';
import { Settings, Save, Plus, Trash2, Heart, Shield, Edit3, Image, Music, FileText, Sparkles, HelpCircle, User, Mic } from 'lucide-react';
import { Language, Profile, Memory, GalleryItem, VideoItem, Song, Quote, Envelope, DailyQuestion, QuizQuestion, VoiceMessage, DateActivity, UserRole } from '../types';
import { DataStore } from '../dataStore';
import { translations } from '../translations';

interface AdminPanelProps {
  lang: Language;
  onDataChanged: () => void;
}

type AdminTab = 'profile' | 'memories' | 'gallery' | 'songs' | 'quotes' | 'envelopes' | 'questions' | 'quiz' | 'activities' | 'voices';

export default function AdminPanel({ lang, onDataChanged }: AdminPanelProps) {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<AdminTab>('profile');

  // Database States
  const [saeedProf, setSaeedProf] = useState<Profile | null>(null);
  const [sohilaProf, setSohilaProf] = useState<Profile | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [dailyQs, setDailyQs] = useState<DailyQuestion[]>([]);
  const [quizQs, setQuizQs] = useState<QuizQuestion[]>([]);
  const [activities, setActivities] = useState<DateActivity[]>([]);
  const [voices, setVoices] = useState<VoiceMessage[]>([]);

  // Load database on start and sync from remote
  useEffect(() => {
    const loadAll = () => {
      setSaeedProf(DataStore.getSaeedProfile());
      setSohilaProf(DataStore.getSohilaProfile());
      setMemories(DataStore.getMemories());
      setGallery(DataStore.getGallery());
      setSongs(DataStore.getSongs());
      setQuotes(DataStore.getQuotes());
      setEnvelopes(DataStore.getEnvelopes());
      setDailyQs(DataStore.getDailyQuestions());
      setQuizQs(DataStore.getQuizQuestions());
      setActivities(DataStore.getDateActivities());
      setVoices(DataStore.getVoiceMessages());
    };

    loadAll();
    window.addEventListener('datastore_synced', loadAll);
    return () => window.removeEventListener('datastore_synced', loadAll);
  }, []);

  const notifyChange = () => {
    onDataChanged();
  };

  // --- PROFILE EDIT ---
  const saveProfiles = () => {
    if (saeedProf && sohilaProf) {
      DataStore.saveSaeedProfile(saeedProf);
      DataStore.saveSohilaProfile(sohilaProf);
      notifyChange();
      alert(lang === 'ar' ? 'تم حفظ الملفات بنجاح!' : 'Profiles saved successfully!');
    }
  };

  // --- MEMORIES FORM ---
  const [memForm, setMemForm] = useState({ title: '', date: '', content: '', image: '', video: '' });
  const addMemory = (e: React.FormEvent) => {
    e.preventDefault();
    const newMem: Memory = {
      id: 'mem-' + Date.now(),
      title: memForm.title,
      date: memForm.date || new Date().toISOString().split('T')[0],
      content: memForm.content,
      imageUrl: memForm.image || undefined,
      videoUrl: memForm.video || undefined,
    };
    const updated = [...memories, newMem];
    setMemories(updated);
    DataStore.saveMemories(updated);
    setMemForm({ title: '', date: '', content: '', image: '', video: '' });
    notifyChange();
  };
  const deleteMemory = (id: string) => {
    const updated = memories.filter(m => m.id !== id);
    setMemories(updated);
    DataStore.saveMemories(updated);
    notifyChange();
  };

  // --- GALLERY FORM ---
  const [galForm, setGalForm] = useState({ url: '', caption: '', date: '' });
  const addGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: GalleryItem = {
      id: 'gal-' + Date.now(),
      url: galForm.url,
      caption: galForm.caption || undefined,
      date: galForm.date || new Date().toISOString().split('T')[0],
    };
    const updated = [...gallery, newItem];
    setGallery(updated);
    DataStore.saveGallery(updated);
    setGalForm({ url: '', caption: '', date: '' });
    notifyChange();
  };
  const deleteGalleryItem = (id: string) => {
    const updated = gallery.filter(g => g.id !== id);
    setGallery(updated);
    DataStore.saveGallery(updated);
    notifyChange();
  };

  // --- VIDEOS FORM ---
  const [vidForm, setVidForm] = useState({ url: '', title: '', date: '' });
  const addVideoItem = (e: React.FormEvent) => {
    e.preventDefault();
    const videos = DataStore.getVideos();
    const newItem: VideoItem = {
      id: 'vid-' + Date.now(),
      url: vidForm.url,
      title: vidForm.title || undefined,
      date: vidForm.date || new Date().toISOString().split('T')[0],
    };
    const updated = [...videos, newItem];
    DataStore.saveVideos(updated);
    setVidForm({ url: '', title: '', date: '' });
    notifyChange();
  };
  const deleteVideoItem = (id: string) => {
    const videos = DataStore.getVideos();
    const updated = videos.filter(v => v.id !== id);
    DataStore.saveVideos(updated);
    notifyChange();
  };

  // --- SONGS FORM ---
  const [songForm, setSongForm] = useState({ title: '', artist: '', url: '', cover: '' });
  const addSong = (e: React.FormEvent) => {
    e.preventDefault();
    const newSong: Song = {
      id: 'song-' + Date.now(),
      title: songForm.title,
      artist: songForm.artist,
      url: songForm.url,
      coverUrl: songForm.cover || undefined,
    };
    const updated = [...songs, newSong];
    setSongs(updated);
    DataStore.saveSongs(updated);
    setSongForm({ title: '', artist: '', url: '', cover: '' });
    notifyChange();
  };
  const deleteSong = (id: string) => {
    const updated = songs.filter(s => s.id !== id);
    setSongs(updated);
    DataStore.saveSongs(updated);
    notifyChange();
  };

  // --- QUOTES FORM ---
  const [quoteForm, setQuoteForm] = useState({ text: '', author: 'Dodo' as 'Dodo' | 'SO' });
  const addQuote = (e: React.FormEvent) => {
    e.preventDefault();
    const newQuote: Quote = {
      id: 'quote-' + Date.now(),
      text: quoteForm.text,
      author: quoteForm.author,
      date: new Date().toISOString().split('T')[0],
    };
    const updated = [...quotes, newQuote];
    setQuotes(updated);
    DataStore.saveQuotes(updated);
    setQuoteForm({ text: '', author: 'Dodo' });
    notifyChange();
  };
  const deleteQuote = (id: string) => {
    const updated = quotes.filter(q => q.id !== id);
    setQuotes(updated);
    DataStore.saveQuotes(updated);
    notifyChange();
  };

  // --- ENVELOPES EDIT ---
  const saveEnvelopes = () => {
    DataStore.saveEnvelopes(envelopes);
    notifyChange();
    alert(lang === 'ar' ? 'تم حفظ رسائل افتح عندما بنجاح!' : 'Open When letters saved successfully!');
  };

  // --- DAILY QUESTIONS FORM ---
  const [dqForm, setDqForm] = useState({ qEn: '', qAr: '' });
  const addDailyQ = (e: React.FormEvent) => {
    e.preventDefault();
    const newQ: DailyQuestion = {
      id: 'dq-' + Date.now(),
      dateStr: new Date().toISOString().split('T')[0],
      questionEn: dqForm.qEn,
      questionAr: dqForm.qAr,
    };
    const updated = [...dailyQs, newQ];
    setDailyQs(updated);
    DataStore.saveDailyQuestions(updated);
    setDqForm({ qEn: '', qAr: '' });
    notifyChange();
  };
  const deleteDailyQ = (id: string) => {
    const updated = dailyQs.filter(q => q.id !== id);
    setDailyQs(updated);
    DataStore.saveDailyQuestions(updated);
    notifyChange();
  };

  // --- QUIZ QUESTIONS FORM ---
  const [qqForm, setQqForm] = useState({ qEn: '', qAr: '', optEn1: '', optEn2: '', optEn3: '', optEn4: '', optAr1: '', optAr2: '', optAr3: '', optAr4: '', correct: 0 });
  const addQuizQ = (e: React.FormEvent) => {
    e.preventDefault();
    const newQ: QuizQuestion = {
      id: 'qq-' + Date.now(),
      questionEn: qqForm.qEn,
      questionAr: qqForm.qAr,
      optionsEn: [qqForm.optEn1, qqForm.optEn2, qqForm.optEn3, qqForm.optEn4].filter(Boolean),
      optionsAr: [qqForm.optAr1, qqForm.optAr2, qqForm.optAr3, qqForm.optAr4].filter(Boolean),
      correctIndex: Number(qqForm.correct),
    };
    const updated = [...quizQs, newQ];
    setQuizQs(updated);
    DataStore.saveQuizQuestions(updated);
    setQqForm({ qEn: '', qAr: '', optEn1: '', optEn2: '', optEn3: '', optEn4: '', optAr1: '', optAr2: '', optAr3: '', optAr4: '', correct: 0 });
    notifyChange();
  };
  const deleteQuizQ = (id: string) => {
    const updated = quizQs.filter(q => q.id !== id);
    setQuizQs(updated);
    DataStore.saveQuizQuestions(updated);
    notifyChange();
  };

  // --- ACTIVITIES FORM ---
  const [actForm, setActForm] = useState({ nameEn: '', nameAr: '', category: '' });
  const addActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const newAct: DateActivity = {
      id: 'act-' + Date.now(),
      nameEn: actForm.nameEn,
      nameAr: actForm.nameAr,
      category: actForm.category || 'Cozy'
    };
    const updated = [...activities, newAct];
    setActivities(updated);
    DataStore.saveDateActivities(updated);
    setActForm({ nameEn: '', nameAr: '', category: '' });
    notifyChange();
  };
  const deleteActivity = (id: string) => {
    const updated = activities.filter(a => a.id !== id);
    setActivities(updated);
    DataStore.saveDateActivities(updated);
    notifyChange();
  };

  // --- VOICE MESSAGES FORM ---
  const [voiceForm, setVoiceForm] = useState({ title: '', url: '', sender: 'Dodo' as 'Dodo' | 'SO' });
  const addVoice = (e: React.FormEvent) => {
    e.preventDefault();
    const newVoice: VoiceMessage = {
      id: 'voice-' + Date.now(),
      title: voiceForm.title,
      url: voiceForm.url,
      date: new Date().toISOString().split('T')[0],
      sender: voiceForm.sender,
    };
    const updated = [...voices, newVoice];
    setVoices(updated);
    DataStore.saveVoiceMessages(updated);
    setVoiceForm({ title: '', url: '', sender: 'Dodo' });
    notifyChange();
  };
  const deleteVoice = (id: string) => {
    const updated = voices.filter(v => v.id !== id);
    setVoices(updated);
    DataStore.saveVoiceMessages(updated);
    notifyChange();
  };

  const navBtnClass = (tab: AdminTab) => `px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
    activeTab === tab
      ? 'bg-rose-gold-500 text-white shadow-xs'
      : 'bg-white/40 dark:bg-black/10 text-neutral-600 dark:text-neutral-300 border border-white/20 hover:bg-white/60 dark:hover:bg-black/25'
  }`;

  const labelClass = "text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 block";
  const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/20 focus:ring-2 focus:ring-rose-gold-500/20 text-xs font-medium text-neutral-800 dark:text-neutral-100 mb-4";

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="rounded-[36px] glass p-6 md:p-10 border border-white/50 dark:border-white/10 shadow-lg relative">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-rose-gold-100/30">
          <div className="p-3 bg-rose-gold-100 dark:bg-rose-gold-950/20 text-rose-gold-500 rounded-2xl">
            <Settings className="animate-spin duration-5000" size={24} />
          </div>
          <div>
            <h2 className="font-serif text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
              {t.settings}
              <Shield className="text-emerald-500 fill-emerald-500/10" size={16} />
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {lang === 'ar' ? 'قم بإضافة المحتوى، والذكريات، وإعداد ملفاتكما الشخصية لتخصيص عالمكما الخاص.' : 'Populate, configure, and customize Saeed & Sohila\'s private digital realm.'}
            </p>
          </div>
        </div>

        {/* Sidebar Nav (horizontal wrap on small screens) */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setActiveTab('profile')} className={navBtnClass('profile')}>{t.profile}</button>
          <button onClick={() => setActiveTab('memories')} className={navBtnClass('memories')}>{t.memories}</button>
          <button onClick={() => setActiveTab('gallery')} className={navBtnClass('gallery')}>{t.gallery}</button>
          <button onClick={() => setActiveTab('songs')} className={navBtnClass('songs')}>{t.music}</button>
          <button onClick={() => setActiveTab('quotes')} className={navBtnClass('quotes')}>{lang === 'ar' ? 'الاقتباسات' : 'Quotes'}</button>
          <button onClick={() => setActiveTab('envelopes')} className={navBtnClass('envelopes')}>{lang === 'ar' ? 'الرسائل' : 'Envelopes'}</button>
          <button onClick={() => setActiveTab('questions')} className={navBtnClass('questions')}>{lang === 'ar' ? 'الأسئلة' : 'Questions'}</button>
          <button onClick={() => setActiveTab('quiz')} className={navBtnClass('quiz')}>{lang === 'ar' ? 'الاختبار' : 'Quiz'}</button>
          <button onClick={() => setActiveTab('activities')} className={navBtnClass('activities')}>{lang === 'ar' ? 'العجلة' : 'Wheel'}</button>
          <button onClick={() => setActiveTab('voices')} className={navBtnClass('voices')}>{lang === 'ar' ? 'الصوتيات' : 'Voices'}</button>
        </div>

        {/* --- PROFILE TAB --- */}
        {activeTab === 'profile' && saeedProf && sohilaProf && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Saeed Profile */}
            <div className="p-6 rounded-3xl bg-white/30 dark:bg-black/10 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <img src={saeedProf.avatarUrl} referrerPolicy="no-referrer" className="w-12 h-12 rounded-full object-cover border-2 border-rose-gold-200" alt="" />
                <div>
                  <h4 className="font-serif text-base font-bold text-neutral-900 dark:text-neutral-50">{t.saeed} ({t.dodo})</h4>
                  <span className="text-[10px] text-neutral-400 font-mono">20 March 2006</span>
                </div>
              </div>
              
              <label className={labelClass}>{t.bio}</label>
              <textarea value={saeedProf.bio} onChange={(e) => setSaeedProf({...saeedProf, bio: e.target.value})} className={inputClass} rows={3} />

              <label className={labelClass}>{t.zodiac}</label>
              <input type="text" value={saeedProf.zodiac} onChange={(e) => setSaeedProf({...saeedProf, zodiac: e.target.value})} className={inputClass} />

              <label className={labelClass}>{t.favoriteSong}</label>
              <input type="text" value={saeedProf.favoriteSong} onChange={(e) => setSaeedProf({...saeedProf, favoriteSong: e.target.value})} className={inputClass} />

              <label className={labelClass}>{t.loveLanguage}</label>
              <input type="text" value={saeedProf.loveLanguage} onChange={(e) => setSaeedProf({...saeedProf, loveLanguage: e.target.value})} className={inputClass} />
            </div>

            {/* Sohila Profile */}
            <div className="p-6 rounded-3xl bg-white/30 dark:bg-black/10 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <img src={sohilaProf.avatarUrl} referrerPolicy="no-referrer" className="w-12 h-12 rounded-full object-cover border-2 border-rose-gold-200" alt="" />
                <div>
                  <h4 className="font-serif text-base font-bold text-neutral-900 dark:text-neutral-50">{t.sohila} ({t.so})</h4>
                  <span className="text-[10px] text-neutral-400 font-mono">15 August 2006</span>
                </div>
              </div>
              
              <label className={labelClass}>{t.bio}</label>
              <textarea value={sohilaProf.bio} onChange={(e) => setSohilaProf({...sohilaProf, bio: e.target.value})} className={inputClass} rows={3} />

              <label className={labelClass}>{t.zodiac}</label>
              <input type="text" value={sohilaProf.zodiac} onChange={(e) => setSohilaProf({...sohilaProf, zodiac: e.target.value})} className={inputClass} />

              <label className={labelClass}>{t.favoriteSong}</label>
              <input type="text" value={sohilaProf.favoriteSong} onChange={(e) => setSohilaProf({...sohilaProf, favoriteSong: e.target.value})} className={inputClass} />

              <label className={labelClass}>{t.loveLanguage}</label>
              <input type="text" value={sohilaProf.loveLanguage} onChange={(e) => setSohilaProf({...sohilaProf, loveLanguage: e.target.value})} className={inputClass} />
            </div>

            <div className="md:col-span-2 text-center mt-4">
              <button onClick={saveProfiles} className="px-8 py-3.5 bg-rose-gold-500 text-white rounded-full font-bold text-xs uppercase tracking-widest shadow-md flex items-center gap-2 mx-auto">
                <Save size={14} />
                {t.saveProfile}
              </button>
            </div>
          </div>
        )}

        {/* --- MEMORIES TAB --- */}
        {activeTab === 'memories' && (
          <div className="space-y-6">
            <form onSubmit={addMemory} className="p-6 rounded-3xl bg-white/30 dark:bg-black/10 border border-white/20">
              <h4 className="font-serif text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-1.5">
                <Sparkles size={14} className="text-rose-gold-500" />
                {t.addMemory}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t.titleLabel}</label>
                  <input type="text" required value={memForm.title} onChange={(e) => setMemForm({...memForm, title: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t.date}</label>
                  <input type="date" value={memForm.date} onChange={(e) => setMemForm({...memForm, date: e.target.value})} className={inputClass} />
                </div>
              </div>
              <label className={labelClass}>{t.contentLabel}</label>
              <textarea required value={memForm.content} onChange={(e) => setMemForm({...memForm, content: e.target.value})} className={inputClass} rows={3} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t.imageOptional}</label>
                  <input type="text" value={memForm.image} onChange={(e) => setMemForm({...memForm, image: e.target.value})} className={inputClass} placeholder="https://example.com/image.jpg" />
                </div>
                <div>
                  <label className={labelClass}>{t.videoOptional}</label>
                  <input type="text" value={memForm.video} onChange={(e) => setMemForm({...memForm, video: e.target.value})} className={inputClass} placeholder="https://example.com/video.mp4" />
                </div>
              </div>

              <button type="submit" className="w-full py-3 rounded-full bg-rose-gold-500 text-white font-bold text-xs uppercase tracking-widest shadow-md">
                {t.addBtn}
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {memories.map((mem, idx) => (
                <div key={`adm-mem-${mem.id || idx}-${idx}`} className="p-4 rounded-2xl bg-white/40 dark:bg-black/25 border border-white/20 flex items-center justify-between">
                  <div>
                    <h5 className="font-serif text-sm font-bold text-neutral-900 dark:text-neutral-100">{mem.title}</h5>
                    <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">{mem.date}</span>
                  </div>
                  <button onClick={() => deleteMemory(mem.id)} className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/20 text-rose-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- GALLERY TAB --- */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <form onSubmit={addGalleryItem} className="p-6 rounded-3xl bg-white/30 dark:bg-black/10 border border-white/20">
              <h4 className="font-serif text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-1.5">
                <Image size={14} className="text-rose-gold-500" />
                {t.addGallery}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Image URL</label>
                  <input type="text" required value={galForm.url} onChange={(e) => setGalForm({...galForm, url: e.target.value})} className={inputClass} placeholder="https://example.com/photo.jpg" />
                </div>
                <div>
                  <label className={labelClass}>{t.caption}</label>
                  <input type="text" value={galForm.caption} onChange={(e) => setGalForm({...galForm, caption: e.target.value})} className={inputClass} />
                </div>
              </div>
              <label className={labelClass}>{t.date}</label>
              <input type="date" value={galForm.date} onChange={(e) => setGalForm({...galForm, date: e.target.value})} className={inputClass} />

              <button type="submit" className="w-full py-3 rounded-full bg-rose-gold-500 text-white font-bold text-xs uppercase tracking-widest shadow-md">
                {t.addBtn}
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {gallery.map((item) => (
                <div key={item.id} className="rounded-2xl overflow-hidden bg-white/40 dark:bg-black/25 border border-white/20 p-2">
                  <img src={item.url} referrerPolicy="no-referrer" alt="" className="w-full h-28 object-cover rounded-xl" />
                  <div className="p-2 flex items-center justify-between">
                    <p className="text-[10px] text-neutral-500 truncate max-w-[120px]">{item.caption || item.date}</p>
                    <button onClick={() => deleteGalleryItem(item.id)} className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/20 text-rose-500">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Videos/Reels form in same tab to keep simple */}
            <div className="pt-6 border-t border-rose-gold-100/20">
              <form onSubmit={addVideoItem} className="p-6 rounded-3xl bg-white/30 dark:bg-black/10 border border-white/20">
                <h4 className="font-serif text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-1.5">
                  <Music size={14} className="text-rose-gold-500" />
                  {lang === 'ar' ? 'أضف فيديو / ريل' : 'Add Short Video / Reel'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Video URL</label>
                    <input type="text" required value={vidForm.url} onChange={(e) => setVidForm({...vidForm, url: e.target.value})} className={inputClass} placeholder="https://example.com/video.mp4" />
                  </div>
                  <div>
                    <label className={labelClass}>{t.titleLabel}</label>
                    <input type="text" value={vidForm.title} onChange={(e) => setVidForm({...vidForm, title: e.target.value})} className={inputClass} />
                  </div>
                </div>
                <button type="submit" className="w-full py-3 rounded-full bg-rose-gold-500 text-white font-bold text-xs uppercase tracking-widest shadow-md">
                  {t.addBtn}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- SONGS TAB --- */}
        {activeTab === 'songs' && (
          <div className="space-y-6">
            <form onSubmit={addSong} className="p-6 rounded-3xl bg-white/30 dark:bg-black/10 border border-white/20">
              <h4 className="font-serif text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-1.5">
                <Music size={14} className="text-rose-gold-500" />
                {t.addSong}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t.titleLabel}</label>
                  <input type="text" required value={songForm.title} onChange={(e) => setSongForm({...songForm, title: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t.artist}</label>
                  <input type="text" required value={songForm.artist} onChange={(e) => setSongForm({...songForm, artist: e.target.value})} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t.audioUrl}</label>
                  <input type="text" required value={songForm.url} onChange={(e) => setSongForm({...songForm, url: e.target.value})} className={inputClass} placeholder="https://example.com/music.mp3" />
                </div>
                <div>
                  <label className={labelClass}>Cover Image URL (Optional)</label>
                  <input type="text" value={songForm.cover} onChange={(e) => setSongForm({...songForm, cover: e.target.value})} className={inputClass} />
                </div>
              </div>

              <button type="submit" className="w-full py-3 rounded-full bg-rose-gold-500 text-white font-bold text-xs uppercase tracking-widest shadow-md">
                {t.addBtn}
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {songs.map((song) => (
                <div key={song.id} className="p-4 rounded-2xl bg-white/40 dark:bg-black/25 border border-white/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-gold-100 dark:bg-rose-gold-950/20 text-rose-gold-500 rounded-lg flex items-center justify-center">
                      <Music size={18} />
                    </div>
                    <div>
                      <h5 className="font-serif text-xs font-bold text-neutral-900 dark:text-neutral-100">{song.title}</h5>
                      <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">{song.artist}</span>
                    </div>
                  </div>
                  <button onClick={() => deleteSong(song.id)} className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/20 text-rose-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- QUOTES TAB --- */}
        {activeTab === 'quotes' && (
          <div className="space-y-6">
            <form onSubmit={addQuote} className="p-6 rounded-3xl bg-white/30 dark:bg-black/10 border border-white/20">
              <h4 className="font-serif text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-1.5">
                <FileText size={14} className="text-rose-gold-500" />
                {lang === 'ar' ? 'أضف اقتباس رومانسي' : 'Add Romantic Quote'}
              </h4>
              <label className={labelClass}>{t.contentLabel}</label>
              <textarea required value={quoteForm.text} onChange={(e) => setQuoteForm({...quoteForm, text: e.target.value})} className={inputClass} rows={3} />

              <label className={labelClass}>{lang === 'ar' ? 'الكاتب' : 'Author'}</label>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  <input type="radio" checked={quoteForm.author === 'Dodo'} onChange={() => setQuoteForm({...quoteForm, author: 'Dodo'})} />
                  {t.saeed} ({t.dodo})
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  <input type="radio" checked={quoteForm.author === 'SO'} onChange={() => setQuoteForm({...quoteForm, author: 'SO'})} />
                  {t.sohila} ({t.so})
                </label>
              </div>

              <button type="submit" className="w-full py-3 rounded-full bg-rose-gold-500 text-white font-bold text-xs uppercase tracking-widest shadow-md">
                {t.addBtn}
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quotes.map((quote) => (
                <div key={quote.id} className="p-4 rounded-2xl bg-white/40 dark:bg-black/25 border border-white/20 flex items-center justify-between">
                  <div className="max-w-[85%]">
                    <p className="font-serif text-xs italic text-neutral-800 dark:text-neutral-200">"{quote.text}"</p>
                    <span className="text-[10px] text-rose-gold-500 font-mono font-bold block mt-1">— {quote.author === 'Dodo' ? t.dodo : quote.author === 'SO' ? t.so : quote.author}</span>
                  </div>
                  <button onClick={() => deleteQuote(quote.id)} className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/20 text-rose-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- ENVELOPES TAB --- */}
        {activeTab === 'envelopes' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white/30 dark:bg-black/10 border border-white/20">
              <h4 className="font-serif text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-1.5">
                <FileText size={14} className="text-rose-gold-500" />
                {t.addEnvelopeText}
              </h4>
              
              {envelopes.map((env, idx) => (
                <div key={env.id} className="p-4 rounded-2xl bg-white/20 dark:bg-black/15 border border-white/10 mb-6">
                  <h5 className="font-serif text-xs font-bold text-rose-gold-500 mb-3">{lang === 'ar' ? env.titleAr : env.titleEn} {env.emoji}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>English Message</label>
                      <textarea value={env.contentEn} onChange={(e) => {
                        const updated = [...envelopes];
                        updated[idx].contentEn = e.target.value;
                        setEnvelopes(updated);
                      }} className={inputClass} rows={3} />
                    </div>
                    <div>
                      <label className={labelClass}>Arabic Message (العربية)</label>
                      <textarea value={env.contentAr} onChange={(e) => {
                        const updated = [...envelopes];
                        updated[idx].contentAr = e.target.value;
                        setEnvelopes(updated);
                      }} className={inputClass} rows={3} />
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={saveEnvelopes} className="w-full py-3 rounded-full bg-rose-gold-500 text-white font-bold text-xs uppercase tracking-widest shadow-md">
                {t.saveProfile}
              </button>
            </div>
          </div>
        )}

        {/* --- QUESTIONS TAB --- */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            <form onSubmit={addDailyQ} className="p-6 rounded-3xl bg-white/30 dark:bg-black/10 border border-white/20">
              <h4 className="font-serif text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-1.5">
                <HelpCircle size={14} className="text-rose-gold-500" />
                {t.addDailyQ}
              </h4>
              <label className={labelClass}>English Question</label>
              <input type="text" required value={dqForm.qEn} onChange={(e) => setDqForm({...dqForm, qEn: e.target.value})} className={inputClass} />

              <label className={labelClass}>Arabic Question (العربية)</label>
              <input type="text" required value={dqForm.qAr} onChange={(e) => setDqForm({...dqForm, qAr: e.target.value})} className={inputClass} />

              <button type="submit" className="w-full py-3 rounded-full bg-rose-gold-500 text-white font-bold text-xs uppercase tracking-widest shadow-md">
                {t.addBtn}
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dailyQs.map((q) => (
                <div key={q.id} className="p-4 rounded-2xl bg-white/40 dark:bg-black/25 border border-white/20 flex items-center justify-between">
                  <div>
                    <h5 className="font-serif text-xs font-bold text-neutral-900 dark:text-neutral-100">{q.questionEn}</h5>
                    <p className="text-[10px] text-neutral-400 mt-1">{q.questionAr}</p>
                  </div>
                  <button onClick={() => deleteDailyQ(q.id)} className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/20 text-rose-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- QUIZ TAB --- */}
        {activeTab === 'quiz' && (
          <div className="space-y-6">
            <form onSubmit={addQuizQ} className="p-6 rounded-3xl bg-white/30 dark:bg-black/10 border border-white/20">
              <h4 className="font-serif text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-1.5">
                <HelpCircle size={14} className="text-rose-gold-500" />
                {t.addQuizQ}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>English Question</label>
                  <input type="text" required value={qqForm.qEn} onChange={(e) => setQqForm({...qqForm, qEn: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Arabic Question (العربية)</label>
                  <input type="text" required value={qqForm.qAr} onChange={(e) => setQqForm({...qqForm, qAr: e.target.value})} className={inputClass} />
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>English Option 1</label>
                  <input type="text" required value={qqForm.optEn1} onChange={(e) => setQqForm({...qqForm, optEn1: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Arabic Option 1 (العربية)</label>
                  <input type="text" required value={qqForm.optAr1} onChange={(e) => setQqForm({...qqForm, optAr1: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>English Option 2</label>
                  <input type="text" required value={qqForm.optEn2} onChange={(e) => setQqForm({...qqForm, optEn2: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Arabic Option 2 (العربية)</label>
                  <input type="text" required value={qqForm.optAr2} onChange={(e) => setQqForm({...qqForm, optAr2: e.target.value})} className={inputClass} />
                </div>
              </div>

              <label className={labelClass}>Correct Option Index (0 to 1)</label>
              <select value={qqForm.correct} onChange={(e) => setQqForm({...qqForm, correct: Number(e.target.value)})} className={inputClass}>
                <option value={0}>Option 1</option>
                <option value={1}>Option 2</option>
              </select>

              <button type="submit" className="w-full py-3 rounded-full bg-rose-gold-500 text-white font-bold text-xs uppercase tracking-widest shadow-md">
                {t.addBtn}
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizQs.map((q) => (
                <div key={q.id} className="p-4 rounded-2xl bg-white/40 dark:bg-black/25 border border-white/20 flex items-center justify-between">
                  <div>
                    <h5 className="font-serif text-xs font-bold text-neutral-900 dark:text-neutral-100">{q.questionEn}</h5>
                    <p className="text-[10px] text-neutral-400 mt-1">{q.questionAr}</p>
                  </div>
                  <button onClick={() => deleteQuizQ(q.id)} className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/20 text-rose-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- WHEEL ACTIVITIES TAB --- */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            <form onSubmit={addActivity} className="p-6 rounded-3xl bg-white/30 dark:bg-black/10 border border-white/20">
              <h4 className="font-serif text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-1.5">
                <Plus size={14} className="text-rose-gold-500" />
                {t.manageDateAct}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>English Activity Name</label>
                  <input type="text" required value={actForm.nameEn} onChange={(e) => setActForm({...actForm, nameEn: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Arabic Activity Name (العربية)</label>
                  <input type="text" required value={actForm.nameAr} onChange={(e) => setActForm({...actForm, nameAr: e.target.value})} className={inputClass} />
                </div>
              </div>

              <button type="submit" className="w-full py-3 rounded-full bg-rose-gold-500 text-white font-bold text-xs uppercase tracking-widest shadow-md">
                {t.addBtn}
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activities.map((act) => (
                <div key={act.id} className="p-3 rounded-2xl bg-white/40 dark:bg-black/25 border border-white/20 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-neutral-800 dark:text-neutral-100">{act.nameEn}</h5>
                    <p className="text-[10px] text-neutral-500 mt-0.5">{act.nameAr}</p>
                  </div>
                  <button onClick={() => deleteActivity(act.id)} className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/20 text-rose-500">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- VOICE TAB --- */}
        {activeTab === 'voices' && (
          <div className="space-y-6">
            <form onSubmit={addVoice} className="p-6 rounded-3xl bg-white/30 dark:bg-black/10 border border-white/20">
              <h4 className="font-serif text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-1.5">
                <Mic size={14} className="text-rose-gold-500" />
                {t.addVoice}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t.titleLabel}</label>
                  <input type="text" required value={voiceForm.title} onChange={(e) => setVoiceForm({...voiceForm, title: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Voice Audio MP3 URL</label>
                  <input type="text" required value={voiceForm.url} onChange={(e) => setVoiceForm({...voiceForm, url: e.target.value})} className={inputClass} placeholder="https://example.com/voice.mp3" />
                </div>
              </div>
              <label className={labelClass}>Recorded By / Sender</label>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  <input type="radio" checked={voiceForm.sender === 'Dodo'} onChange={() => setVoiceForm({...voiceForm, sender: 'Dodo'})} />
                  {t.saeed} ({t.dodo})
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  <input type="radio" checked={voiceForm.sender === 'SO'} onChange={() => setVoiceForm({...voiceForm, sender: 'SO'})} />
                  {t.sohila} ({t.so})
                </label>
              </div>

              <button type="submit" className="w-full py-3 rounded-full bg-rose-gold-500 text-white font-bold text-xs uppercase tracking-widest shadow-md">
                {t.addBtn}
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {voices.map((voice) => (
                <div key={voice.id} className="p-4 rounded-2xl bg-white/40 dark:bg-black/25 border border-white/20 flex items-center justify-between">
                  <div>
                    <h5 className="font-serif text-xs font-bold text-neutral-900 dark:text-neutral-100">{voice.title}</h5>
                    <span className="text-[10px] text-rose-gold-500 font-mono font-bold block mt-1">{lang === 'ar' ? `بواسطة ${voice.sender === 'Dodo' ? t.dodo : t.so}` : `By ${voice.sender === 'Dodo' ? t.dodo : t.so}`}</span>
                  </div>
                  <button onClick={() => deleteVoice(voice.id)} className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/20 text-rose-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

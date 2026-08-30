import { useState, useEffect, ReactNode, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Globe, Sun, Moon, Sparkles, Image as ImageIcon, MessageSquare, MessageCircle, Plus, User, HelpCircle, ArrowRight, Settings, X, Film, Music, Trophy, Maximize, Minimize, Upload, Trash2, Brain, Edit3 } from 'lucide-react';

import { Language, Memory, GalleryItem, Profile, Song, VideoItem, UserRole } from './types';
import { DataStore } from './dataStore';
import { translations } from './translations';

// Components
import ParallaxBackground from './components/ParallaxBackground';
import TimelineCards from './components/TimelineCards';
import OpenWhenEnvelope from './components/OpenWhenEnvelope';
import NightSky from './components/NightSky';
import DateGenerator from './components/DateGenerator';
import DailyQuestionSection from './components/DailyQuestionSection';
import DailyMoodSection from './components/DailyMoodSection';
import GamesSection from './components/GamesSection';
import PlayerCardSection from './components/PlayerCardSection';
import MemoryReel from './components/MemoryReel';
import SurpriseMe from './components/SurpriseMe';
import BirthdayConfetti from './components/BirthdayConfetti';
import MusicSection from './components/MusicSection';
import AdminPanel from './components/AdminPanel';
import AchievementsSection from './components/AchievementsSection';
import DirectUploaderModal from './components/DirectUploaderModal';
import GalleryToMemoryModal from './components/GalleryToMemoryModal';
import ChatSection from './components/ChatSection';
import { KnowledgeBaseModal, getPartnerKnowledgeScores } from './components/KnowledgeBaseModal';

// Shuffling helper function
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatTimeAgo(timestamp: number, lang: 'en' | 'ar') {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  
  if (diffSec < 60) {
    return lang === 'ar' ? 'الآن' : 'now';
  }
  if (diffMin < 60) {
    return lang === 'ar' ? `منذ ${diffMin} د` : `${diffMin}m ago`;
  }
  if (diffHr < 24) {
    return lang === 'ar' ? `منذ ${diffHr} س` : `${diffHr}h ago`;
  }
  const date = new Date(timestamp);
  return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });
}

const ARABIC_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const ENGLISH_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface GalleryAlbum {
  key: string;
  location: string;
  monthYearLabelAr: string;
  monthYearLabelEn: string;
  items: GalleryItem[];
}

function groupGalleryIntoAlbums(items: GalleryItem[]): GalleryAlbum[] {
  const albumsMap = new Map<string, GalleryAlbum>();

  items.forEach((item) => {
    const location = (item.location && item.location.trim()) || 'بدون مكان';
    const d = item.date ? new Date(item.date) : new Date();
    const monthIndex = isNaN(d.getMonth()) ? new Date().getMonth() : d.getMonth();
    const year = isNaN(d.getFullYear()) ? new Date().getFullYear() : d.getFullYear();
    const key = `${location}__${year}-${monthIndex}`;

    if (!albumsMap.has(key)) {
      albumsMap.set(key, {
        key,
        location,
        monthYearLabelAr: `${ARABIC_MONTHS[monthIndex]} ${year}`,
        monthYearLabelEn: `${ENGLISH_MONTHS[monthIndex]} ${year}`,
        items: []
      });
    }
    albumsMap.get(key)!.items.push(item);
  });

  // Sort albums by most recent first
  return Array.from(albumsMap.values()).sort((a, b) => {
    const aDate = a.items[0]?.date || '';
    const bDate = b.items[0]?.date || '';
    return bDate.localeCompare(aDate);
  });
}

export default function App() {
  // Master States
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('app_lang') as Language) || 'ar');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isAutoTheme, setIsAutoTheme] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'memories' | 'reels' | 'gallery' | 'music' | 'profile' | 'chat'>('home');
  const [isLanding, setIsLanding] = useState(true);
  const [activeWidgetModal, setActiveWidgetModal] = useState<'envelope' | 'wheel' | 'stars' | 'question' | 'timeline' | 'achievements' | 'stats' | 'mood-tracker' | 'games' | 'player-card' | null>(null);
  const [anniversaryText, setAnniversaryText] = useState('');
  const [countdownUnits, setCountdownUnits] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => (localStorage.getItem('user_role') as UserRole) || 'Dodo');
  const [showUserSelector, setShowUserSelector] = useState<boolean>(() => !localStorage.getItem('user_role'));
  const [isDirectUploadOpen, setIsDirectUploadOpen] = useState(false);
  const [isGalleryToMemoryOpen, setIsGalleryToMemoryOpen] = useState(false);
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(false);
  const [selectedGalleryItemForMemory, setSelectedGalleryItemForMemory] = useState<GalleryItem | null>(null);
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);
  const [brokenMemoryImageIds, setBrokenMemoryImageIds] = useState<Set<string>>(new Set());

  // Deep linking and highlighting states
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedEnvelopeId, setSelectedEnvelopeId] = useState<string | null>(null);
  const [selectedWheelItemName, setSelectedWheelItemName] = useState<string | null>(null);
  const [selectedAchievementId, setSelectedAchievementId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [surpriseSignal, setSurpriseSignal] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [readActivityIds, setReadActivityIds] = useState<string[]>(() => 
    JSON.parse(localStorage.getItem('read_activity_ids') || '[]')
  );
  
  // Real-time synchronization & notifications
  const [liveState, setLiveState] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notificationPerm, setNotificationPerm] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  const enterFullScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.log('Error entering full screen:', err);
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleFullScreen = enterFullScreen;
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const markActivityAsRead = (id: string) => {
    if (!readActivityIds.includes(id)) {
      const updated = [...readActivityIds, id];
      setReadActivityIds(updated);
      localStorage.setItem('read_activity_ids', JSON.stringify(updated));
    }
  };

  const handleNotificationClick = (act: any) => {
    markActivityAsRead(act.id);
    
    // Close any currently active modal first
    setActiveWidgetModal(null);
    
    const textAr = act.descAr || '';
    const textEn = act.descEn || '';

    // Route based on type or content
    if (act.type === 'daily_question') {
      const allQs = DataStore.getDailyQuestions();
      const matchedQ = allQs.find(q => 
        textAr.includes(q.questionAr) || 
        textEn.includes(q.questionEn) ||
        q.questionAr.includes(textAr) ||
        q.questionEn.includes(textEn)
      );
      if (matchedQ) {
        setSelectedQuestionId(matchedQ.id);
      } else {
        setSelectedQuestionId(null);
      }
      setActiveWidgetModal('question');
    } 
    else if (act.type === 'wheel_spin') {
      let itemName: string | null = null;
      const matchEn = textEn.match(/got:\s*["'«]([^"'»]+)["'»]/);
      const matchAr = textAr.match(/وربح:\s*["'«]([^"'»]+)["'»]/);
      if (matchEn) itemName = matchEn[1];
      else if (matchAr) itemName = matchAr[1];
      
      setSelectedWheelItemName(itemName);
      setActiveWidgetModal('wheel');
    }
    else if (act.type === 'envelope' || textAr.includes('خطاب') || textEn.includes('letter') || textEn.includes('envelope')) {
      const allEnvs = DataStore.getEnvelopes();
      const matchedEnv = allEnvs.find(e => 
        textAr.includes(e.titleAr) || 
        textEn.includes(e.titleEn)
      );
      if (matchedEnv) {
        setSelectedEnvelopeId(matchedEnv.id);
      } else {
        setSelectedEnvelopeId(null);
      }
      setActiveWidgetModal('envelope');
    }
    else if (act.type === 'achievement') {
      let achId = '';
      if (textAr.includes('نبضة حب') || textEn.includes('Heartbeat')) achId = 'ach-first-buzz';
      else if (textAr.includes('لاصقة') || textEn.includes('Sticky')) achId = 'ach-sticky-note';
      else if (textAr.includes('عجلة') || textEn.includes('Wheel')) achId = 'ach-wheel-spin';
      else if (textAr.includes('سؤال اليوم') || textEn.includes('Question')) achId = 'ach-daily-question';
      else if (textAr.includes('اختبار') || textEn.includes('Quiz')) achId = 'ach-love-quiz';
      else if (textAr.includes('ذكرى') || textEn.includes('Memory')) achId = 'ach-memory';
      else if (textAr.includes('صورة') || textEn.includes('photo') || textEn.includes('Gallery')) achId = 'ach-gallery';
      else if (textAr.includes('أغنية') || textEn.includes('song') || textEn.includes('Music')) achId = 'ach-music';
      
      setSelectedAchievementId(achId);
      setActiveWidgetModal('achievements');
      
      // Celebrate
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
    else if (act.type === 'sticky_note') {
      setActiveTab('home');
      setTimeout(() => {
        const el = document.getElementById('interactive-board');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
    else if (act.type === 'buzz') {
      setActiveWidgetModal('interactive');
    }
    else if (act.type === 'quiz') {
      setActiveWidgetModal('quiz');
    }
    else if (textAr.includes('مفاجأة') || textEn.includes('Surprise') || textEn.includes('surprise')) {
      setActiveTab('home');
      setSurpriseSignal(prev => prev + 1);
    }
    else if (textAr.includes('ذكرى') || textEn.includes('memory') || textEn.includes('Memory')) {
      setActiveTab('memories');
      const allMemories = DataStore.getMemories();
      const matchedMem = allMemories.find(m => 
        textAr.includes(m.title) || 
        textEn.includes(m.title) ||
        (m.content && (textAr.includes(m.content.substring(0, 15)) || textEn.includes(m.content.substring(0, 15))))
      );
      if (matchedMem) {
        setHighlightedId(matchedMem.id);
        setTimeout(() => {
          const el = document.getElementById('memory-' + matchedMem.id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 400);
        setTimeout(() => setHighlightedId(null), 3500);
      }
    }
    else if (textAr.includes('صورة') || textEn.includes('photo') || textEn.includes('Gallery') || textEn.includes('Image')) {
      setActiveTab('gallery');
      const allG = DataStore.getGallery();
      const matchedG = allG.find(g => g.caption && (textAr.includes(g.caption) || textEn.includes(g.caption)));
      if (matchedG) {
        setHighlightedId(matchedG.id);
        setTimeout(() => {
          const el = document.getElementById('gallery-' + matchedG.id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 400);
        setTimeout(() => setHighlightedId(null), 3500);
      }
    }
    else if (textAr.includes('أغنية') || textEn.includes('song') || textEn.includes('Song') || textEn.includes('Music')) {
      setActiveTab('music');
      const allS = DataStore.getSongs();
      const matchedS = allS.find(s => textAr.includes(s.title) || textEn.includes(s.title));
      if (matchedS) {
        setCurrentSong(matchedS);
        setIsPlaying(true);
        setHighlightedId(matchedS.id);
        setTimeout(() => {
          const el = document.getElementById('song-' + matchedS.id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 400);
        setTimeout(() => setHighlightedId(null), 3500);
      }
    }
    else {
      setActiveTab('home');
    }
  };

  const logPartnerActivity = async (type: string, titleAr: string, titleEn: string, descAr: string, descEn: string) => {
    try {
      await fetch('/api/interaction-state/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: currentUserRole,
          type,
          titleAr,
          titleEn,
          descAr,
          descEn
        })
      });
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  };

  // Periodically ping user's presence (active status) to the server
  useEffect(() => {
    if (!currentUserRole) return;
    
    const pingPresence = async () => {
      try {
        await fetch('/api/interaction-state/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: currentUserRole })
        });
      } catch (err) {
        console.log('Error pinging presence:', err);
      }
    };

    pingPresence(); // Ping immediately on load
    const interval = setInterval(pingPresence, 15000); // Ping every 15 seconds
    return () => clearInterval(interval);
  }, [currentUserRole]);

  const lastLoggedTabRef = useRef<{ [key: string]: number }>({});
  const lastLoggedSongRef = useRef<string>('');

  useEffect(() => {
    if (!currentUserRole) return;
    
    const now = Date.now();
    const partnerNameAr = currentUserRole === 'Dodo' ? 'سعيد' : 'سهيلة';
    const partnerNameEn = currentUserRole === 'Dodo' ? 'Saeed' : 'Sohila';

    if (activeTab === 'reels') {
      const lastLogged = lastLoggedTabRef.current['reels'] || 0;
      if (now - lastLogged > 300000) { // 5 minutes throttle
        lastLoggedTabRef.current['reels'] = now;
        logPartnerActivity(
          'wheel_spin',
          lang === 'ar' ? 'مشاهدة الذكريات 📽' : 'Watching Reels 📽',
          lang === 'ar' ? 'Watching Reels 📽' : 'Watching Reels 📽',
          lang === 'ar' ? `شاهد ${partnerNameAr} لقطات الذكريات القصيرة (الريلز) 📽` : `${partnerNameEn} watched the love reels! 📽`,
          lang === 'ar' ? `شاهد ${partnerNameAr} لقطات الذكريات القصيرة (الريلز) 📽` : `${partnerNameEn} watched the love reels! 📽`
        );
      }
    }
    
    if (activeTab === 'music') {
      const lastLogged = lastLoggedTabRef.current['music'] || 0;
      if (now - lastLogged > 300000) { // 5 minutes throttle
        lastLoggedTabRef.current['music'] = now;
        logPartnerActivity(
          'buzz',
          lang === 'ar' ? 'قسم الموسيقى المشتركة 🎵' : 'Shared Music 🎵',
          lang === 'ar' ? 'Shared Music 🎵' : 'Shared Music 🎵',
          lang === 'ar' ? `دخل ${partnerNameAr} إلى قسم الموسيقى للاستماع للأغاني الرومانسية 🎵` : `${partnerNameEn} entered the shared music zone! 🎵`,
          lang === 'ar' ? `دخل ${partnerNameAr} إلى قسم الموسيقى للاستماع للأغاني الرومانسية 🎵` : `${partnerNameEn} entered the shared music zone! 🎵`
        );
      }
    }
  }, [activeTab, currentUserRole]);

  const getPartnerActivityStatus = () => {
    const partnerRole = currentUserRole === 'Dodo' ? 'SO' : 'Dodo';
    const isPartnerFemale = partnerRole === 'SO';
    
    const partnerName = currentUserRole === 'Dodo' 
      ? (lang === 'ar' ? 'سهيلة' : 'Sohila') 
      : (lang === 'ar' ? 'سعيد' : 'Saeed');

    const partnerLastActiveStr = partnerRole === 'Dodo' ? liveState?.dodoLastActive : liveState?.soLastActive;
    
    const partnerActivities = liveState?.activityFeed?.filter((act: any) => act.sender === partnerRole) || [];
    const latestAct = partnerActivities[0];

    const now = Date.now();
    const activeTime = partnerLastActiveStr ? new Date(partnerLastActiveStr).getTime() : 0;
    const activeDiffMins = activeTime > 0 ? Math.floor((now - activeTime) / 60000) : 999999;

    const actTime = latestAct ? latestAct.timestamp : 0;
    const actDiffMins = actTime > 0 ? Math.floor((now - actTime) / 60000) : 999999;

    const isOnline = activeDiffMins < 1;
    const showPresence = (activeDiffMins <= 30 && activeDiffMins <= actDiffMins) || !latestAct;

    if (showPresence && activeTime > 0) {
      if (isOnline) {
        return {
          emoji: '🟢',
          textAr: isPartnerFemale 
            ? `${partnerName} موجوده دلوقتي على التطبيق معك 💕` 
            : `${partnerName} موجود دلوقتي على التطبيق معك 💕`,
          textEn: `${partnerName} is online in the app with you 💕`,
          clickable: false,
          act: null
        };
      } else {
        const timeTextAr = activeDiffMins === 1 
          ? 'من دقيقة' 
          : activeDiffMins === 2 
            ? 'من دقيقتين' 
            : activeDiffMins <= 10 
              ? `من ${activeDiffMins} دقائق` 
              : `من ${activeDiffMins} دقيقة`;
        
        const timeTextEn = activeDiffMins === 1 
          ? '1 min ago' 
          : `${activeDiffMins} mins ago`;

        return {
          emoji: '❤️',
          textAr: isPartnerFemale
            ? `${partnerName} كانت هنا ${timeTextAr}.`
            : `${partnerName} كان هنا ${timeTextAr}.`,
          textEn: `${partnerName} was here ${timeTextEn}.`,
          clickable: false,
          act: null
        };
      }
    }

    if (latestAct) {
      const timeTextAr = formatTimeAgo(latestAct.timestamp, 'ar');
      const timeTextEn = formatTimeAgo(latestAct.timestamp, 'en');
      
      let customEmoji = '💭';
      if (latestAct.type === 'buzz') customEmoji = '❤️';
      if (latestAct.type === 'sticky_note') customEmoji = '📌';
      if (latestAct.type === 'wheel_spin') customEmoji = '🎡';
      if (latestAct.type === 'quiz') customEmoji = '🏆';
      if (latestAct.type === 'daily_question') customEmoji = '💭';
      if (latestAct.type === 'achievement') customEmoji = '⭐';

      let textAr = '';
      let textEn = '';

      if (isPartnerFemale) {
        // Partner is Sohila (female)
        if (latestAct.type === 'buzz') {
          textAr = `سهيلة بتبعتلك سلام!`;
          textEn = `${partnerName} sent you a heartbeat pulse!`;
        } else if (latestAct.type === 'mood') {
          textAr = `سهيلة غيرت المود بتاعها.`;
          textEn = `${partnerName} updated her mood.`;
        } else if (latestAct.type === 'sticky_note') {
          textAr = `سهيلة كتبت نوتة جديدة.`;
          textEn = `${partnerName} pinned a sticky note on the wall.`;
        } else if (latestAct.type === 'daily_question') {
          textAr = `سهيلة جاوبت على سؤال اليوم.`;
          textEn = `${partnerName} responded to the daily question.`;
        } else if (latestAct.type === 'wheel_spin') {
          textAr = `سهيلة لفّت عجلة الأفكار.`;
          textEn = `${partnerName} spun the wheel of ideas.`;
        } else if (latestAct.type === 'achievement') {
          textAr = `سهيلة كسبت وسام جديد!`;
          textEn = `${partnerName} unlocked a new trophy!`;
        } else {
          textAr = latestAct.descAr;
          textEn = latestAct.descEn;
        }
      } else {
        // Partner is Saeed (male)
        if (latestAct.type === 'buzz') {
          textAr = `سعيد بيبعتلك سلام!`;
          textEn = `${partnerName} sent you a heartbeat pulse!`;
        } else if (latestAct.type === 'mood') {
          textAr = `سعيد غير المود بتاعه.`;
          textEn = `${partnerName} updated his mood.`;
        } else if (latestAct.type === 'sticky_note') {
          textAr = `سعيد كتب نوتة جديدة.`;
          textEn = `${partnerName} pinned a sticky note on the wall.`;
        } else if (latestAct.type === 'daily_question') {
          textAr = `سعيد جاوب على سؤال اليوم.`;
          textEn = `${partnerName} responded to the daily question.`;
        } else if (latestAct.type === 'wheel_spin') {
          textAr = `سعيد لفّ عجلة الأفكار.`;
          textEn = `${partnerName} spun the wheel of ideas.`;
        } else if (latestAct.type === 'achievement') {
          textAr = `سعيد كسب وسام جديد!`;
          textEn = `${partnerName} unlocked a new trophy!`;
        } else {
          // If custom description from background logs
          let modifiedDescAr = latestAct.descAr;
          // Apply male modifications if necessary
          if (modifiedDescAr.includes('شاهدت')) {
            modifiedDescAr = modifiedDescAr.replace('شاهدت', 'شاهد');
          }
          if (modifiedDescAr.includes('استمعت')) {
            modifiedDescAr = modifiedDescAr.replace('استمعت', 'استمع');
          }
          if (modifiedDescAr.includes('دخلت')) {
            modifiedDescAr = modifiedDescAr.replace('دخلت', 'دخل');
          }
          textAr = modifiedDescAr;
          textEn = latestAct.descEn.replace(/\bher\b/g, 'his');
        }
      }

      return {
        emoji: customEmoji,
        textAr: `${textAr} (${timeTextAr})`,
        textEn: `${textEn} (${timeTextEn})`,
        clickable: true,
        act: latestAct
      };
    }

    return {
      emoji: '💕',
      textAr: isPartnerFemale 
        ? `مستنيين سهيلة تدخل التطبيق...` 
        : `مستنيين سعيد يدخل التطبيق...`,
      textEn: `Waiting for your partner to join...`,
      clickable: false,
      act: null
    };
  };

  // Request browser native notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        setNotificationPerm(result);
      } catch (err) {
        console.error('Error requesting notification permission:', err);
      }
    }
  };

  // Request microphone & camera permission up front so the OS/browser
  // permission prompt appears once, right when the person enters the app,
  // instead of only later when they try to record a voice note.
  const requestMediaPermissions = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      // We only needed this call to trigger the permission prompt; stop the
      // tracks immediately so the mic/camera indicator doesn't stay active.
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      // User denied, or device has no camera/mic — fail silently, voice
      // notes will just re-prompt for audio only when actually used.
      console.log('Media permission not granted:', err);
    }
  };

  // Trigger browser native notification
  const triggerNativeNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        // Only trigger if document is not visible/focused to avoid annoying user while they're active
        new Notification(title, {
          body: body,
          icon: 'https://res.cloudinary.com/utefkiln/image/upload/v1784470919/WhatsApp_Image_2026-07-14_at_1.22.32_AM_rgtj6f.jpg'
        });
      } catch (err) {
        // Fallback for some mobile browsers that require a service worker for Notification
        console.log('Notification constructor failed, possibly requires ServiceWorker:', err);
      }
    }
  };

  // Custom synth for real-time romantic notifications
  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      osc.type = 'sine';
      // High-pitch sweet double ping (E5 -> G5)
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.08); // G5
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (err) {
      console.error('Audio synthesis failed:', err);
    }
  };

  // Poll server state for live notification feed
  useEffect(() => {
    const fetchLiveState = async () => {
      try {
        const res = await fetch('/api/interaction-state');
        if (res.ok) {
          const data = await res.json();
          setLiveState(data);
          DataStore.syncFromRemote(data);
          
          if (data.activityFeed && data.activityFeed.length > 0) {
            const newest = data.activityFeed[0];
            // If the notification was sent by partner and is brand new
            if (newest.sender !== currentUserRole && newest.id !== lastNotificationId) {
              setLastNotificationId(newest.id);
              
              // Trigger native browser notification
              const isPartnerFemale = newest.sender === 'SO';
              const partnerName = newest.sender === 'SO' 
                ? (lang === 'ar' ? 'سهيلة' : 'Sohila') 
                : (lang === 'ar' ? 'سعيد' : 'Saeed');
              
              let notifTitle = lang === 'ar' ? newest.titleAr : newest.titleEn;
              let notifDesc = lang === 'ar' ? newest.descAr : newest.descEn;
              
              // Apply male/female styling to notifications dynamically
              if (newest.type === 'buzz') {
                notifDesc = isPartnerFemale 
                  ? (lang === 'ar' ? `أرسلت لكِ ${partnerName} نبضة حب تفاعلية!` : `${partnerName} sent you a heartbeat pulse!`)
                  : (lang === 'ar' ? `أرسل لكَ ${partnerName} نبضة حب تفاعلية!` : `${partnerName} sent you a heartbeat pulse!`);
              } else if (newest.type === 'mood') {
                notifDesc = isPartnerFemale
                  ? (lang === 'ar' ? `قامت ${partnerName} بتحديث حالتها المزاجية.` : `${partnerName} updated her mood.`)
                  : (lang === 'ar' ? `قام ${partnerName} بتحديث حالته المزاجية.` : `${partnerName} updated his mood.`);
              } else if (newest.type === 'sticky_note') {
                notifDesc = isPartnerFemale
                  ? (lang === 'ar' ? `أضافت ${partnerName} ملحوظة حب على الحائط.` : `${partnerName} pinned a sticky note on the wall.`)
                  : (lang === 'ar' ? `أضاف ${partnerName} ملحوظة حب على الحائط.` : `${partnerName} pinned a sticky note on the wall.`);
              } else if (newest.type === 'daily_question') {
                notifDesc = isPartnerFemale
                  ? (lang === 'ar' ? `أجابت ${partnerName} على سؤال اليوم.` : `${partnerName} responded to daily question.`)
                  : (lang === 'ar' ? `أجاب ${partnerName} على سؤال اليوم.` : `${partnerName} responded to daily question.`);
              }

              triggerNativeNotification(notifTitle, notifDesc);

              // Only play sound and increment if not currently looking at the feed
              if (activeTab !== 'notifications') {
                setUnreadNotifications((prev) => prev + 1);
                playNotificationSound();
              }
            }
          }
        }
      } catch (err) {
        console.log('Error fetching live state at root level:', err);
      }
    };

    fetchLiveState();
    const interval = setInterval(fetchLiveState, 2500);
    return () => clearInterval(interval);
  }, [currentUserRole, lastNotificationId, activeTab]);
  
  // Shuffled Collections States for random order every time
  const [shuffledSongs, setShuffledSongs] = useState<Song[]>([]);
  const [shuffledVideos, setShuffledVideos] = useState<VideoItem[]>([]);
  const [shuffledGallery, setShuffledGallery] = useState<GalleryItem[]>([]);

  // Global Music Player States
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [globalVolume, setGlobalVolume] = useState(0.20); // 20% low but noticeable volume
  const globalAudioRef = useRef<HTMLVideoElement | null>(null);
  
  // Rotating circular couple photos states
  const [saeedPhotoIdx, setSaeedPhotoIdx] = useState(0);
  const [sohilaPhotoIdx, setSohilaPhotoIdx] = useState(0);

  // Content change trigger for reactivity
  const [contentTrigger, setContentTrigger] = useState(0);

  // Birthday celebration states
  const [isBirthdayMode, setIsBirthdayMode] = useState(false);
  const [birthdayName, setBirthdayName] = useState('');
  const [forceBirthdayPreview, setForceBirthdayPreview] = useState(false);

  const t = translations[lang];

  // SAEED AND SOHILA rotating photo urls
  const saeedPhotos = [
    'https://res.cloudinary.com/utefkiln/image/upload/v1784470798/WhatsApp_Image_2026-05-31_at_3.46.04_PM_junpuw.jpg',
    'https://res.cloudinary.com/utefkiln/image/upload/v1784470808/ChatGPT_Image_31_%D9%85%D8%A7%D9%8A%D9%88_2026_03_40_09_%D9%85_vlvo5k.png',
    'https://res.cloudinary.com/utefkiln/image/upload/v1784470864/000_y2ehqs.jpg',
    'https://res.cloudinary.com/utefkiln/image/upload/v1784490766/0_69_fjkxuf.jpg',
    'https://res.cloudinary.com/utefkiln/image/upload/v1784490768/retouch_%D9%A2%D9%A0%D9%A2%D9%A5%D9%A0%D9%A8%D9%A2%D9%A9%D9%A0%D9%A1%D9%A2%D9%A4%D9%A0%D9%A7%D9%A6%D9%A1_qe35xj.jpg',
    'https://res.cloudinary.com/utefkiln/image/upload/v1784490769/5564_kojd1v.jpg',
    'https://res.cloudinary.com/utefkiln/image/upload/v1784490773/.4_oc9mia.jpg',
    'https://res.cloudinary.com/utefkiln/image/upload/v1784490775/0_12_hdnngo.jpg',
    'https://res.cloudinary.com/utefkiln/image/upload/v1784490875/hjhjkjhnkjh_vjnmin.jpg',
    'https://res.cloudinary.com/utefkiln/image/upload/v1784490930/55916_piqfbr.jpg'
  ];

  const sohilaPhotos = [
    'https://res.cloudinary.com/utefkiln/image/upload/v1784470919/WhatsApp_Image_2026-07-14_at_1.22.32_AM_rgtj6f.jpg',
    'https://res.cloudinary.com/utefkiln/image/upload/v1784470921/WhatsApp_Image_2026-07-14_at_1.54.29_AM_2_k9l3nn.jpg',
    'https://res.cloudinary.com/utefkiln/image/upload/v1784470921/WhatsApp_Image_2026-07-14_at_1.54.30_AM_4_dt0ko5.jpg',
    'https://res.cloudinary.com/utefkiln/image/upload/v1784490476/WhatsApp_Image_2026-07-14_at_1.54.29_AM_1_owfjl8.jpg',
    'https://res.cloudinary.com/utefkiln/image/upload/v1784490477/WhatsApp_Image_2026-07-14_at_1.54.29_AM_2_maetb2.jpg',
    'https://res.cloudinary.com/utefkiln/image/upload/v1784490477/WhatsApp_Image_2026-07-14_at_1.54.29_AM_3_ungkcq.jpg',
    'https://res.cloudinary.com/utefkiln/image/upload/v1784490480/WhatsApp_Image_2026-07-14_at_1.54.29_AM_4_lh4rog.jpg',
    'https://res.cloudinary.com/utefkiln/image/upload/v1784490481/WhatsApp_Image_2026-07-14_at_1.22.32_AM_yuozdr.jpg',
    'https://res.cloudinary.com/utefkiln/image/upload/v1784490483/WhatsApp_Image_2026-07-14_at_1.22.33_AM_5_sgs6fy.jpg',
    'https://res.cloudinary.com/utefkiln/image/upload/v1784490485/WhatsApp_Image_2026-07-14_at_1.54.30_AM_1_yewlbl.jpg',
    'https://res.cloudinary.com/utefkiln/image/upload/v1784490486/WhatsApp_Image_2026-07-14_at_1.22.33_AM_3_qlfjp8.jpg',
    'https://res.cloudinary.com/utefkiln/image/upload/v1784490488/WhatsApp_Image_2026-07-14_at_1.54.30_AM_q7dvpg.jpg',
    'https://res.cloudinary.com/utefkiln/image/upload/v1784490496/WhatsApp_Image_2026-07-14_at_1.22.33_AM_1_b8agnb.jpg'
  ];

  // Rotate images every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSaeedPhotoIdx((prev) => (prev + 1) % saeedPhotos.length);
      setSohilaPhotoIdx((prev) => (prev + 1) % sohilaPhotos.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Time-based auto theme switching (Morning vs Night)
  useEffect(() => {
    if (!isAutoTheme) return;

    const checkThemeTime = () => {
      const hours = new Date().getHours();
      // Morning is defined as 6 AM to 6 PM, Night as 6 PM to 6 AM
      const currentMode = (hours >= 6 && hours < 18) ? 'light' : 'dark';
      setTheme(currentMode);
    };

    checkThemeTime();
    const interval = setInterval(checkThemeTime, 60000);
    return () => clearInterval(interval);
  }, [isAutoTheme]);

  // Sync document tailwind dark mode class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Birthday automatic activation
  useEffect(() => {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-indexed
    const day = now.getDate();

    // Saeed birthday: 20 March (03-20)
    // Sohila birthday: 15 August (08-15)
    if (month === 3 && day === 20) {
      setIsBirthdayMode(true);
      setBirthdayName('Saeed (Dodo)');
    } else if (month === 8 && day === 15) {
      setIsBirthdayMode(true);
      setBirthdayName('Sohila (SO)');
    } else {
      setIsBirthdayMode(false);
    }
  }, [contentTrigger]);

  const onDataChanged = () => {
    setContentTrigger((prev) => prev + 1);
  };

  const handleShareFactToChat = async (text: string) => {
    try {
      await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: currentUserRole,
          text
        })
      });
      onDataChanged();
      setActiveTab('chat');
      setIsKnowledgeBaseOpen(false);
    } catch (err) {
      console.error('Error sharing knowledge fact to chat:', err);
    }
  };

  useEffect(() => {
    const handleSynced = () => {
      onDataChanged();
    };
    window.addEventListener('datastore_synced', handleSynced);
    return () => window.removeEventListener('datastore_synced', handleSynced);
  }, []);

  // Shuffle collections on load and on any data change
  useEffect(() => {
    const loadedSongs = DataStore.getSongs();
    const shuffledS = shuffleArray(loadedSongs);
    setShuffledSongs(shuffledS);
    setShuffledVideos(shuffleArray(DataStore.getVideos()));
    setShuffledGallery(shuffleArray(DataStore.getGallery()));

    // Set initial song if none is loaded
    if (shuffledS.length > 0 && !currentSong) {
      setCurrentSong(shuffledS[0]);
    }
  }, [contentTrigger]);

  // Robust synchronization effect to control media play, pause, volume, and src changes.
  useEffect(() => {
    const player = globalAudioRef.current;
    if (!player) return;

    if (!currentSong) {
      player.pause();
      setIsPlaying(false);
      return;
    }

    // Normalized source URL check (safeguard against browser fully qualified path variations)
    const normalizedUrl = currentSong.url;
    if (!player.src || !player.src.includes(normalizedUrl)) {
      player.src = normalizedUrl;
      player.load();
    }

    player.volume = globalVolume;

    if (isPlaying) {
      player.play().catch((err) => {
        console.log('Playback start was blocked by browser autoplay rules or failed:', err);
        setIsPlaying(false);
      });
    } else {
      player.pause();
    }
  }, [currentSong, isPlaying, globalVolume]);

  const startGlobalMusic = () => {
    let songToPlay = currentSong;
    if (!songToPlay && shuffledSongs.length > 0) {
      songToPlay = shuffledSongs[0];
      setCurrentSong(songToPlay);
    }
    setIsPlaying(true);
  };

  const handleNextSong = () => {
    if (shuffledSongs.length === 0) return;
    const currentIndex = shuffledSongs.findIndex(s => s.id === (currentSong?.id || ''));
    const nextIndex = (currentIndex + 1) % shuffledSongs.length;
    setCurrentSong(shuffledSongs[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevSong = () => {
    if (shuffledSongs.length === 0) return;
    const currentIndex = shuffledSongs.findIndex(s => s.id === (currentSong?.id || ''));
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = shuffledSongs.length - 1;
    setCurrentSong(shuffledSongs[prevIndex]);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    let songToPlay = currentSong;
    if (!songToPlay && shuffledSongs.length > 0) {
      songToPlay = shuffledSongs[0];
      setCurrentSong(songToPlay);
    }
    setIsPlaying(prev => !prev);
  };

  const handleSelectSong = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(prev => !prev);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      
      if (lastLoggedSongRef.current !== song.id) {
        lastLoggedSongRef.current = song.id;
        const partnerNameAr = currentUserRole === 'Dodo' ? 'سعيد' : 'سهيلة';
        const partnerNameEn = currentUserRole === 'Dodo' ? 'Saeed' : 'Sohila';
        logPartnerActivity(
          'buzz',
          lang === 'ar' ? 'استماع لأغنية 🎵' : 'Listening to Song 🎵',
          lang === 'ar' ? 'Listening to Song 🎵' : 'Listening to Song 🎵',
          lang === 'ar' ? `استمع ${partnerNameAr} الآن للأغنية الرومانسية: "${song.title}" 🎵` : `${partnerNameEn} listened to the romantic song: "${song.title}" 🎵`,
          lang === 'ar' ? `استمع ${partnerNameAr} الآن للأغنية الرومانسية: "${song.title}" 🎵` : `${partnerNameEn} listened to the romantic song: "${song.title}" 🎵`
        );
      }
    }
  };

  const handleVolumeChange = (vol: number) => {
    setGlobalVolume(vol);
  };

  const handleLangToggle = () => {
    setLang((prev) => {
      const next = prev === 'en' ? 'ar' : 'en';
      localStorage.setItem('app_lang', next);
      return next;
    });
  };

  // Check this day in our story feature
  const [todayMemories, setTodayMemories] = useState<Memory[]>([]);
  useEffect(() => {
    const memoriesList = DataStore.getMemories();
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDate = today.getDate();

    const matches = memoriesList.filter((m) => {
      const memDate = new Date(m.date);
      return memDate.getMonth() === currentMonth && memDate.getDate() === currentDate;
    });

    setTodayMemories(matches);
  }, [contentTrigger]);

  // Calculate anniversary countdown live
  useEffect(() => {
    const updateCountdown = () => {
      const anniversaryDate = new Date('2026-07-03T00:00:00'); // Anniversary July 3, 2026
      const now = new Date();
      const diff = now.getTime() - anniversaryDate.getTime();
      const absDiff = Math.abs(diff);

      const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);

      setCountdownUnits({ days, hours, minutes, seconds });

      if (lang === 'ar') {
        setAnniversaryText(`منذ ارتباطنا: ${days} يوم و ${hours} ساعة و ${minutes} دقيقة و ${seconds} ثانية 💖`);
      } else {
        setAnniversaryText(`Since we connected: ${days}d ${hours}h ${minutes}m ${seconds}s 💖`);
      }
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [lang]);

  return (
    <div 
      className={`h-[100dvh] w-screen overflow-hidden transition-colors duration-1000 select-none text-neutral-800 dark:text-neutral-100 flex flex-col items-center justify-center relative ${
        lang === 'ar' ? 'rtl font-sans' : 'ltr font-sans'
      }`}
    >
      {/* Permanent Parallax Blur Background */}
      <ParallaxBackground isBlurred={!isLanding} />

      {/* Confetti celebration for birthday */}
      <BirthdayConfetti active={isBirthdayMode || forceBirthdayPreview || showConfetti} />

      {/* LANGUAGE & MANUAL THEME CONTROL BAR */}
      <div className="fixed top-4 right-4 left-4 z-40 max-w-md mx-auto">
        <div className="flex justify-between items-center gap-2 px-3 py-2 rounded-2xl bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.25)]">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleLangToggle}
              className="flex items-center gap-1.5 text-[11px] font-bold text-rose-gold-600 dark:text-rose-gold-300 uppercase tracking-wide font-serif px-2.5 py-1.5 rounded-xl hover:bg-rose-gold-50 dark:hover:bg-rose-gold-950/40 transition-colors cursor-pointer"
            >
              <Globe size={14} />
              {t.languageToggle}
            </button>

            <button
              onClick={() => setIsDirectUploadOpen(true)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-rose-gold-500 hover:bg-rose-gold-600 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm shadow-rose-gold-500/30"
              title={lang === 'ar' ? 'رفع صور وأغاني وفيديوهات مباشرة' : 'Upload Photos, Songs & Videos'}
            >
              <Upload size={13} />
              <span>{lang === 'ar' ? 'رفع' : 'Upload'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setIsAutoTheme(false);
                setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
              }}
              className="text-neutral-500 dark:text-neutral-300 hover:text-rose-gold-500 hover:bg-rose-gold-50 dark:hover:bg-rose-gold-950/40 transition-colors p-2 rounded-xl cursor-pointer"
            >
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>

            <button
              onClick={enterFullScreen}
              className="text-neutral-500 dark:text-neutral-300 hover:text-rose-gold-500 hover:bg-rose-gold-50 dark:hover:bg-rose-gold-950/40 transition-colors p-2 rounded-xl relative cursor-pointer"
              title={lang === 'ar' ? 'وضع الشاشة الكاملة مفعّل' : 'Fullscreen Mode Active'}
            >
              <Maximize size={15} />
              {isFullscreen && (
                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setIsAutoTheme(!isAutoTheme)}
              className={`text-[10px] font-extrabold px-2.5 py-1.5 rounded-xl transition-all uppercase tracking-wide cursor-pointer ${
                isAutoTheme
                  ? 'bg-rose-gold-500 text-white shadow-sm shadow-rose-gold-500/30 hover:bg-rose-gold-600'
                  : 'bg-neutral-100 dark:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-white/20'
              }`}
            >
              {isAutoTheme ? 'AUTO' : 'MANUAL'}
            </button>
          </div>
        </div>
      </div>

      {/* --- BIRTHDAY BANNER --- */}
      {(isBirthdayMode || forceBirthdayPreview) && (
        <div className="absolute top-20 left-4 right-4 z-40 max-w-sm mx-auto text-center">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/15 via-rose-gold-500/15 to-amber-500/15 border border-rose-gold-200 dark:border-rose-gold-900/40 shadow-lg backdrop-blur-md">
            <Sparkles className="text-rose-gold-500 mx-auto mb-1.5 animate-spin duration-5000" size={18} />
            <h3 className="font-serif text-sm font-bold text-neutral-900 dark:text-neutral-50">
              {t.birthdayModeActive}
            </h3>
            <p className="text-[11px] text-rose-gold-600 dark:text-rose-gold-300 font-bold mt-1">
              {t.happyBirthday} ({birthdayName || 'Saeed & Sohila'})
            </p>
          </div>
        </div>
      )}

      {/* USER SELECTOR WELCOME SCREEN */}
      <AnimatePresence>
        {showUserSelector && (
          <motion.div
            key="user-selector-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center bg-neutral-900/95 dark:bg-black/95 backdrop-blur-2xl overflow-y-auto"
          >
            {/* Absolute Language toggle inside selector */}
            <div className="absolute top-6 right-6 z-50">
              <button
                onClick={handleLangToggle}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-gold-300 hover:text-white uppercase tracking-widest font-serif bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-all cursor-pointer shadow-md"
              >
                <Globe size={13} />
                {t.languageToggle}
              </button>
            </div>

            <div className="max-w-xl w-full flex flex-col items-center">
              
              {/* Title & subtitle */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-gold-500/10 text-rose-gold-300 font-bold text-[11px] uppercase tracking-widest mb-3 border border-rose-gold-500/20">
                  <Sparkles size={11} className="text-[#d4af37] animate-pulse" />
                  <span>{lang === 'ar' ? 'بوابة الحب والذكريات' : 'Love & Memories Vault'}</span>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight leading-none mb-3">
                  {t.selectUserTitle}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
                  {t.selectUserIntro}
                </p>
              </div>

              {/* Two Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
                
                {/* Saeed (Dodo) Card */}
                <motion.button
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    requestNotificationPermission();
                    requestMediaPermissions();
                    setCurrentUserRole('Dodo');
                    localStorage.setItem('user_role', 'Dodo');
                    setShowUserSelector(false);
                    setIsLanding(false);
                    startGlobalMusic();
                  }}
                  className="rounded-[36px] bg-white/5 border border-white/10 p-6 flex flex-col items-center text-center transition-colors hover:border-rose-gold-500/50 hover:bg-white/10 group cursor-pointer shadow-lg relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-rose-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-rose-gold-300 shadow-xl mb-4 shrink-0 bg-neutral-900 group-hover:border-rose-gold-500 transition-all">
                    <img
                      src={saeedPhotos[0]}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      alt="Saeed"
                    />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-white group-hover:text-rose-gold-300 transition-colors">
                    {t.saeed}
                  </h3>
                  <span className="text-[10px] text-rose-gold-400 font-mono font-bold uppercase tracking-widest mt-0.5">
                    {t.dodo}
                  </span>
                  <p className="text-[11px] text-neutral-400 mt-3 leading-relaxed italic px-2">
                    {t.saeedWelcome}
                  </p>
                </motion.button>

                {/* Sohila (SO) Card */}
                <motion.button
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    requestNotificationPermission();
                    requestMediaPermissions();
                    setCurrentUserRole('SO');
                    localStorage.setItem('user_role', 'SO');
                    setShowUserSelector(false);
                    setIsLanding(false);
                    startGlobalMusic();
                  }}
                  className="rounded-[36px] bg-white/5 border border-white/10 p-6 flex flex-col items-center text-center transition-colors hover:border-rose-gold-500/50 hover:bg-white/10 group cursor-pointer shadow-lg relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-rose-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-rose-gold-300 shadow-xl mb-4 shrink-0 bg-neutral-900 group-hover:border-rose-gold-500 transition-all">
                    <img
                      src={sohilaPhotos[0]}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      alt="Sohila"
                    />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-white group-hover:text-rose-gold-300 transition-colors">
                    {t.sohila}
                  </h3>
                  <span className="text-[10px] text-rose-gold-400 font-mono font-bold uppercase tracking-widest mt-0.5">
                    {t.so}
                  </span>
                  <p className="text-[11px] text-neutral-400 mt-3 leading-relaxed italic px-2">
                    {t.sohilaWelcome}
                  </p>
                </motion.button>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INTRO LANDING SCREEN */}
      <AnimatePresence>
        {isLanding ? (
          <motion.div
            key="landing-screen"
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-30 flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="max-w-md w-full bg-cream-100/50 dark:bg-neutral-950/40 border border-white/30 dark:border-white/5 p-8 rounded-[48px] backdrop-blur-md shadow-2xl flex flex-col justify-between min-h-[460px]">
              
               {/* Pulsating decorative center element */}
              <div className="flex items-center justify-center gap-6 sm:gap-10 my-8">
                
                {/* Saeed Rotating Avatar */}
                <div className="relative">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-[#d4af37] shadow-xl shrink-0 bg-neutral-900">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={saeedPhotoIdx}
                        src={saeedPhotos[saeedPhotoIdx]}
                        referrerPolicy="no-referrer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="w-full h-full object-cover"
                      />
                    </AnimatePresence>
                  </div>
                  <div className="absolute -bottom-2 right-1/2 translate-x-1/2 bg-[#d4af37] text-white text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">
                    {t.saeedRole || 'DODO'}
                  </div>
                </div>

                <div className="p-3 bg-white/10 dark:bg-black/30 rounded-full text-rose-gold-500 shadow-lg border border-white/20 animate-pulse">
                  <Heart fill="currentColor" size={20} />
                </div>

                {/* Sohila Rotating Avatar */}
                <div className="relative">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-[#d4af37] shadow-xl shrink-0 bg-neutral-900">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={sohilaPhotoIdx}
                        src={sohilaPhotos[sohilaPhotoIdx]}
                        referrerPolicy="no-referrer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="w-full h-full object-cover"
                      />
                    </AnimatePresence>
                  </div>
                  <div className="absolute -bottom-2 right-1/2 translate-x-1/2 bg-[#d4af37] text-white text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">
                    {t.sohilaRole || 'SO'}
                  </div>
                </div>

              </div>

              {/* Elegant Counter Cards Grid (Since our connection: 15/09/2025) */}
              <div className="my-2 bg-white/30 dark:bg-black/25 backdrop-blur-md border border-white/40 dark:border-white/5 rounded-3xl p-4 shadow-md max-w-sm mx-auto w-full transition-all hover:scale-[1.01] shrink-0">
                <div className="flex items-center justify-center gap-1.5 text-rose-gold-500 dark:text-rose-gold-300 font-serif text-[11px] font-bold mb-3">
                  <Sparkles size={11} className="text-[#d4af37] animate-pulse" />
                  <span>{lang === 'ar' ? 'الوقت الذي عشناه معاً منذ ارتباطنا ♾️' : 'Time we lived together since we connected ♾️'}</span>
                </div>
                <div className="grid grid-cols-4 gap-2.5">
                  <div className="bg-white/50 dark:bg-black/35 rounded-xl py-2 px-1 text-center border border-white/20 dark:border-white/5 shadow-xs flex flex-col justify-center items-center">
                    <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white font-mono tracking-tight">{countdownUnits.days}</span>
                    <span className="text-[8px] text-neutral-400 dark:text-neutral-500 font-semibold mt-0.5">{lang === 'ar' ? 'يوم' : 'Days'}</span>
                  </div>
                  <div className="bg-white/50 dark:bg-black/35 rounded-xl py-2 px-1 text-center border border-white/20 dark:border-white/5 shadow-xs flex flex-col justify-center items-center">
                    <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white font-mono tracking-tight">{countdownUnits.hours}</span>
                    <span className="text-[8px] text-neutral-400 dark:text-neutral-500 font-semibold mt-0.5">{lang === 'ar' ? 'ساعة' : 'Hours'}</span>
                  </div>
                  <div className="bg-white/50 dark:bg-black/35 rounded-xl py-2 px-1 text-center border border-white/20 dark:border-white/5 shadow-xs flex flex-col justify-center items-center">
                    <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white font-mono tracking-tight">{countdownUnits.minutes}</span>
                    <span className="text-[8px] text-neutral-400 dark:text-neutral-500 font-semibold mt-0.5">{lang === 'ar' ? 'دقيقة' : 'Minutes'}</span>
                  </div>
                  <div className="bg-white/50 dark:bg-black/35 rounded-xl py-2 px-1 text-center border border-white/20 dark:border-white/5 shadow-xs flex flex-col justify-center items-center relative overflow-hidden">
                    <span className="text-sm sm:text-base font-bold text-rose-gold-500 dark:text-rose-gold-300 font-mono tracking-tight animate-pulse">{countdownUnits.seconds}</span>
                    <span className="text-[8px] text-neutral-400 dark:text-neutral-500 font-semibold mt-0.5">{lang === 'ar' ? 'ثانية' : 'Seconds'}</span>
                  </div>
                </div>
              </div>

              {/* Title welcome */}
              <div>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-950 dark:text-neutral-50 tracking-tight leading-none mb-2">
                  {t.title}
                </h1>
                <p className="text-xs uppercase tracking-widest text-rose-gold-500 font-semibold mb-4">
                  {t.togetherForever}
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed px-4">
                  {t.welcomeBack}
                </p>
              </div>

              {/* Action */}
              <button
                onClick={() => {
                  requestNotificationPermission();
                  requestMediaPermissions();
                  setIsLanding(false);
                  startGlobalMusic();
                }}
                className="mt-8 px-8 py-3.5 rounded-full bg-rose-gold-500 hover:bg-rose-gold-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.03] group mx-auto"
              >
                {t.enterButton}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>

            </div>
          </motion.div>
        ) : (
          /* CORE APPLICATION VIEWPORT */
          <motion.div
            key="application-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="w-full max-w-md sm:max-w-lg h-[100dvh] sm:h-[840px] sm:my-8 sm:rounded-[48px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.55)] sm:border border-white/20 dark:border-white/5 bg-cream-50/15 dark:bg-black/35 backdrop-blur-3xl relative overflow-hidden flex flex-col mx-auto"
          >
            {/* CONTENT AREA WITH CONDITIONAL SCROLLING */}
            <div className={`flex-1 ${(activeTab === 'home' || activeTab === 'reels') ? 'overflow-hidden flex flex-col justify-between p-4 pt-16 pb-24' : 'overflow-y-auto pt-20 pb-24 px-4 custom-scrollbar'}`}>
              
              {/* --- HOME PAGE TAB --- */}
              {activeTab === 'home' && (
                <div className="flex-1 flex flex-col justify-between h-full animate-fade-in">
                  
                  {/* Header Welcome Card */}
                  <div className="text-center pt-2 pb-1 flex flex-col items-center shrink-0">
                    <span className="text-[9px] font-bold text-rose-gold-500 uppercase tracking-[0.2em] font-mono">
                      {new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-neutral-50 tracking-tight mt-1 italic drop-shadow-sm flex items-center gap-1.5">
                      Saeed <span className="text-rose-gold-500 animate-pulse">❤️</span> Sohila
                    </h2>
                  </div>

                  {/* Compact Circular Couple Photos - Enlarged per request */}
                  <div className="flex items-center justify-center gap-6 my-3 shrink-0">
                    <div className="relative group transition-transform duration-300 hover:scale-105">
                      <img src={saeedPhotos[saeedPhotoIdx]} referrerPolicy="no-referrer" className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[#d4af37] shadow-lg bg-neutral-950" />
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#d4af37] text-white text-[8px] sm:text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
                        {lang === 'ar' ? 'دودي' : 'DODO'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-rose-gold-50 dark:bg-rose-gold-950/20 rounded-full text-rose-gold-500 border border-rose-gold-100 dark:border-rose-gold-950 animate-pulse">
                      <Heart fill="currentColor" size={18} />
                    </div>
                    <div className="relative group transition-transform duration-300 hover:scale-105">
                      <img src={sohilaPhotos[sohilaPhotoIdx]} referrerPolicy="no-referrer" className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[#d4af37] shadow-lg bg-neutral-950" />
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#d4af37] text-white text-[8px] sm:text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
                        {lang === 'ar' ? 'سو' : 'SO'}
                      </span>
                    </div>
                  </div>

                  {/* Elegant Counter Cards Grid (Since our connection: 15/09/2025) - Made smaller per request */}
                  <button
                    onClick={() => setActiveWidgetModal('timeline')}
                    className="my-1 bg-white/30 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/5 hover:border-rose-gold-400 rounded-2xl p-2.5 shadow-xs max-w-xs mx-auto w-full transition-all hover:scale-[1.01] active:scale-98 cursor-pointer shrink-0 block"
                  >
                    <div className="flex items-center justify-center gap-1 text-rose-gold-500 dark:text-rose-gold-300 font-serif text-[10px] font-bold mb-1.5">
                      <Sparkles size={10} className="text-[#d4af37] animate-pulse" />
                      <span>{lang === 'ar' ? 'الوقت الذي عشناه معاً منذ ارتباطنا ♾️' : 'Time we lived together since we connected ♾️'}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 px-1">
                      <div className="bg-white/45 dark:bg-black/30 rounded-lg py-1 px-0.5 text-center border border-white/10 dark:border-white/5 flex flex-col justify-center items-center">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white font-mono tracking-tight">{countdownUnits.days}</span>
                        <span className="text-[6.5px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">{lang === 'ar' ? 'يوم' : 'Days'}</span>
                      </div>
                      <div className="bg-white/45 dark:bg-black/30 rounded-lg py-1 px-0.5 text-center border border-white/10 dark:border-white/5 flex flex-col justify-center items-center">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white font-mono tracking-tight">{countdownUnits.hours}</span>
                        <span className="text-[6.5px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">{lang === 'ar' ? 'ساعة' : 'Hours'}</span>
                      </div>
                      <div className="bg-white/45 dark:bg-black/30 rounded-lg py-1 px-0.5 text-center border border-white/10 dark:border-white/5 flex flex-col justify-center items-center">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white font-mono tracking-tight">{countdownUnits.minutes}</span>
                        <span className="text-[6.5px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">{lang === 'ar' ? 'دقيقة' : 'Mins'}</span>
                      </div>
                      <div className="bg-white/45 dark:bg-black/30 rounded-lg py-1 px-0.5 text-center border border-white/10 dark:border-white/5 flex flex-col justify-center items-center relative overflow-hidden">
                        <span className="text-xs font-bold text-rose-gold-500 dark:text-rose-gold-300 font-mono tracking-tight animate-pulse">{countdownUnits.seconds}</span>
                        <span className="text-[6.5px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">{lang === 'ar' ? 'ثانية' : 'Secs'}</span>
                      </div>
                    </div>
                  </button>

                  {/* Action Button: Surprise Me */}
                  <div className="flex justify-center my-2 px-4 shrink-0 w-full max-w-sm mx-auto">
                    <SurpriseMe lang={lang} currentUserRole={currentUserRole} forceTriggerSignal={surpriseSignal} />
                  </div>

                  {/* Bento Grid */}
                  <div className="grid grid-cols-2 gap-3 w-full my-1 flex-1 overflow-y-auto custom-scrollbar pr-1 pb-12">
                    
                    {/* Knowledge Base Card (اعرفني أكتر ❤️) */}
                    <button
                      onClick={() => setIsKnowledgeBaseOpen(true)}
                      className="rounded-2xl glass p-3 border-2 border-rose-gold-400/50 dark:border-rose-gold-500/30 shadow-sm hover:scale-[1.01] active:scale-98 transition-all flex flex-col justify-between items-start text-left rtl:text-right cursor-pointer group h-full min-h-[90px] col-span-2 bg-gradient-to-r from-rose-gold-500/10 via-pink-500/10 to-purple-500/10"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">🧠</span>
                          <h4 className="font-serif text-xs font-bold text-neutral-950 dark:text-neutral-100 flex items-center gap-1.5">
                            <span>{lang === 'ar' ? 'اعرفني أكتر ❤️ (قاعدة المعرفة)' : 'Know Me Better ❤️ (Knowledge Base)'}</span>
                          </h4>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-gold-500 text-white font-extrabold">
                          {lang === 'ar' ? 'مؤشر المعرفة ❤️' : 'Knowledge Index'}
                        </span>
                      </div>
                      <div className="mt-1.5">
                        <p className="text-[10px] text-neutral-600 dark:text-neutral-300 font-medium">
                          {lang === 'ar' 
                            ? `سعيد يعرف عن سهيلة ${getPartnerKnowledgeScores().dodoKnowsSo}% | سهيلة تعرف عن سعيد ${getPartnerKnowledgeScores().soKnowsDodo}%`
                            : `Dodo knows SO ${getPartnerKnowledgeScores().dodoKnowsSo}% | SO knows Dodo ${getPartnerKnowledgeScores().soKnowsDodo}%`}
                        </p>
                      </div>
                    </button>
                    
                    {/* 1. Open When */}
                    <button
                      onClick={() => setActiveWidgetModal('envelope')}
                      className="rounded-2xl glass p-3 border border-white/30 dark:border-white/5 shadow-xs hover:scale-[1.02] active:scale-98 transition-all flex flex-col justify-between items-start text-left rtl:text-right cursor-pointer group h-full min-h-[90px]"
                    >
                      <span className="text-xl sm:text-2xl group-hover:animate-bounce">✉️</span>
                      <div>
                        <h4 className="font-serif text-xs font-bold text-neutral-950 dark:text-neutral-100">{t.envelopeTitle || 'Open When...'}</h4>
                        <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium mt-0.5">
                          {lang === 'ar' ? 'رسائل دافئة متبادلة' : 'Warm letters'}
                        </p>
                      </div>
                    </button>

                    {/* 2. Date Wheel */}
                    <button
                      onClick={() => setActiveWidgetModal('wheel')}
                      className="rounded-2xl glass p-3 border border-white/30 dark:border-white/5 shadow-xs hover:scale-[1.02] active:scale-98 transition-all flex flex-col justify-between items-start text-left rtl:text-right cursor-pointer group h-full min-h-[90px]"
                    >
                      <span className="text-xl sm:text-2xl group-hover:rotate-45 transition-transform duration-500">🎡</span>
                      <div>
                        <h4 className="font-serif text-xs font-bold text-neutral-950 dark:text-neutral-100">{t.dateWheelTitle || 'Date Spinner'}</h4>
                        <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium mt-0.5">
                          {lang === 'ar' ? 'دولاب الحظ الرومانسي' : 'Spin for destiny'}
                        </p>
                      </div>
                    </button>

                    {/* 3. Night Sky */}
                    <button
                      onClick={() => setActiveWidgetModal('stars')}
                      className="rounded-2xl glass p-3 border border-white/30 dark:border-white/5 shadow-xs hover:scale-[1.02] active:scale-98 transition-all flex flex-col justify-between items-start text-left rtl:text-right cursor-pointer group h-full min-h-[90px]"
                    >
                      <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">☄️</span>
                      <div>
                        <h4 className="font-serif text-xs font-bold text-neutral-950 dark:text-neutral-100">{t.nightSkyTitle || 'Our Star Sky'}</h4>
                        <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium mt-0.5">
                          {lang === 'ar' ? 'نجوم ذكرياتنا اللامعة' : 'Recall shared stars'}
                        </p>
                      </div>
                    </button>

                    {/* 4. Daily Question */}
                    <button
                      onClick={() => setActiveWidgetModal('question')}
                      className="rounded-2xl glass p-3 border border-white/30 dark:border-white/5 shadow-xs hover:scale-[1.02] active:scale-98 transition-all flex flex-col justify-between items-start text-left rtl:text-right cursor-pointer group h-full min-h-[90px]"
                    >
                      <span className="text-xl sm:text-2xl group-hover:animate-pulse">💭</span>
                      <div>
                        <h4 className="font-serif text-xs font-bold text-neutral-950 dark:text-neutral-100">{t.dailyQuestion || 'Daily Q&A'}</h4>
                        <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium mt-0.5">
                          {lang === 'ar' ? 'سؤال اليوم المتجدد' : 'Daily questions'}
                        </p>
                      </div>
                    </button>

                    {/* 4b. Daily Mood */}
                    <button
                      onClick={() => setActiveWidgetModal('mood-tracker')}
                      className="rounded-2xl glass p-3 border border-white/30 dark:border-white/5 shadow-xs hover:scale-[1.02] active:scale-98 transition-all flex flex-col justify-between items-start text-left rtl:text-right cursor-pointer group h-full min-h-[90px]"
                    >
                      <span className="text-xl sm:text-2xl group-hover:animate-bounce">🥰</span>
                      <div>
                        <h4 className="font-serif text-xs font-bold text-neutral-950 dark:text-neutral-100">{lang === 'ar' ? 'مزاج اليوم' : 'Daily Mood'}</h4>
                        <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium mt-0.5">
                          {lang === 'ar' ? 'قيّموا يومكم مع بعض' : 'Rate your day together'}
                        </p>
                      </div>
                    </button>

                    {/* 4c. Our Arcade */}
                    <button
                      onClick={() => setActiveWidgetModal('games')}
                      className="rounded-2xl glass p-3 border border-white/30 dark:border-white/5 shadow-xs hover:scale-[1.02] active:scale-98 transition-all flex flex-col justify-between items-start text-left rtl:text-right cursor-pointer group h-full min-h-[90px]"
                    >
                      <span className="text-xl sm:text-2xl group-hover:animate-bounce">🕹️</span>
                      <div>
                        <h4 className="font-serif text-xs font-bold text-neutral-950 dark:text-neutral-100">{lang === 'ar' ? 'الأركيد بتاعنا' : 'Our Arcade'}</h4>
                        <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium mt-0.5">
                          {lang === 'ar' ? 'ألعاب سريعة سعيد ضد سهيلة' : 'Quick games, Saeed vs Sohila'}
                        </p>
                      </div>
                    </button>

                    {/* 4d. Partner Card */}
                    <button
                      onClick={() => setActiveWidgetModal('player-card')}
                      className="rounded-2xl glass p-3 border border-white/30 dark:border-white/5 shadow-xs hover:scale-[1.02] active:scale-98 transition-all flex flex-col justify-between items-start text-left rtl:text-right cursor-pointer group h-full min-h-[90px]"
                    >
                      <span className="text-xl sm:text-2xl group-hover:animate-bounce">🃏</span>
                      <div>
                        <h4 className="font-serif text-xs font-bold text-neutral-950 dark:text-neutral-100">{lang === 'ar' ? 'كارت الشريك' : 'Partner Card'}</h4>
                        <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium mt-0.5">
                          {lang === 'ar' ? 'قيّم شريكك بأسلوب فيفا' : 'Rate your partner, FIFA-style'}
                        </p>
                      </div>
                    </button>

                    {/* 7. Achievements */}
                    <button
                      onClick={() => setActiveWidgetModal('achievements')}
                      className="rounded-2xl glass p-3 border border-white/30 dark:border-white/5 shadow-xs hover:scale-[1.02] active:scale-98 transition-all flex flex-col justify-between items-start text-left rtl:text-right cursor-pointer group h-full min-h-[90px]"
                    >
                      <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">🏆</span>
                      <div>
                        <h4 className="font-serif text-xs font-bold text-neutral-950 dark:text-neutral-100">{lang === 'ar' ? 'إنجازات حبنا' : 'Our Achievements'}</h4>
                        <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium mt-0.5">
                          {lang === 'ar' ? 'كأس التحديات والأوسمة' : 'Trophies and badges'}
                        </p>
                      </div>
                    </button>

                    {/* 8. Love Stats */}
                    <button
                      onClick={() => setActiveWidgetModal('stats')}
                      className="rounded-2xl glass p-3 border border-white/30 dark:border-white/5 shadow-xs hover:scale-[1.02] active:scale-98 transition-all flex flex-col justify-between items-start text-left rtl:text-right cursor-pointer group h-full min-h-[90px]"
                    >
                      <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">📊</span>
                      <div>
                        <h4 className="font-serif text-xs font-bold text-neutral-950 dark:text-neutral-100">{lang === 'ar' ? 'إحصائيات حبنا' : 'Love Stats'}</h4>
                        <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium mt-0.5">
                          {lang === 'ar' ? 'أرقام وحقائق قصتنا' : 'Our numbers'}
                        </p>
                      </div>
                    </button>

                  </div>

                </div>
              )}

            {/* --- MEMORIES TAB --- */}
            {activeTab === 'memories' && (() => {
              const allMemories = DataStore.getMemories().filter(
                (mem) => mem && mem.imageUrl && mem.imageUrl.trim() !== '' && !brokenMemoryImageIds.has(mem.id)
              );

              const groupedByDate: Record<string, Memory[]> = {};
              allMemories.forEach((mem) => {
                const rawDate = mem.date ? mem.date.trim() : '2026-07-03';
                if (!groupedByDate[rawDate]) {
                  groupedByDate[rawDate] = [];
                }
                groupedByDate[rawDate].push(mem);
              });

              const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
                return new Date(b).getTime() - new Date(a).getTime();
              });

              const formatDateLabel = (dateStr: string) => {
                try {
                  const dateObj = new Date(dateStr);
                  if (!isNaN(dateObj.getTime())) {
                    const options: Intl.DateTimeFormatOptions = {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    };
                    return dateObj.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', options);
                  }
                } catch (e) {
                  // fallback
                }
                return dateStr;
              };

              return (
                <div className="space-y-10 py-2 animate-fade-in">
                  <div className="text-center mb-8 relative">
                    <h3 className="font-serif text-3xl font-bold text-neutral-950 dark:text-neutral-50 mb-2">
                      {t.memories} 💖
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-2 max-w-md mx-auto leading-relaxed">
                      {lang === 'ar'
                        ? 'سجل ذكرياتنا الرومانسية مقسمة بحسب كل يوم 📅'
                        : 'Chronicle our romantic memories grouped day by day 📅'}
                    </p>

                    <div className="mt-5 flex justify-center gap-3 flex-wrap">
                      <button
                        onClick={() => setIsDirectUploadOpen(true)}
                        className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-gold-500 to-pink-500 hover:from-rose-gold-600 hover:to-pink-600 text-white font-bold text-xs flex items-center gap-2 shadow-md hover:scale-105 transition-all cursor-pointer"
                      >
                        <Plus size={16} />
                        <span>{lang === 'ar' ? 'إضافة ذكريات وصور جديدة 📸' : 'Add New Memories & Photos 📸'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedGalleryItemForMemory(null);
                          setIsGalleryToMemoryOpen(true);
                        }}
                        className="px-5 py-2.5 rounded-2xl bg-white/80 dark:bg-neutral-800/80 hover:bg-rose-gold-500/10 text-rose-gold-600 dark:text-rose-gold-400 font-bold text-xs flex items-center gap-2 border border-rose-gold-500/30 shadow-sm hover:scale-105 transition-all cursor-pointer"
                      >
                        <ImageIcon size={16} />
                        <span>{lang === 'ar' ? 'اختيار صورة من المعرض 🖼️' : 'Pick Photo from Gallery 🖼️'}</span>
                      </button>
                    </div>
                  </div>

                  {allMemories.length === 0 ? (
                    <div className="rounded-[36px] border border-dashed border-rose-gold-100 dark:border-rose-gold-950/40 p-12 text-center bg-white/20 dark:bg-black/10 max-w-md mx-auto">
                      <Sparkles className="text-rose-gold-300 mx-auto mb-3 animate-pulse" size={44} />
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 px-6 font-medium leading-relaxed">
                        {t.noContentAdded}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      {sortedDates.map((dateKey) => {
                        const groupMemories = groupedByDate[dateKey];
                        const formattedLabel = formatDateLabel(dateKey);

                        return (
                          <div key={`group-${dateKey}`} className="space-y-6">
                            {/* Date Group Header */}
                            <div className="flex items-center gap-3 pb-3 border-b border-rose-gold-200/60 dark:border-white/10">
                              <div className="w-10 h-10 rounded-2xl bg-rose-gold-500/10 text-rose-gold-600 dark:text-rose-gold-400 flex items-center justify-center font-bold text-lg shadow-xs">
                                📅
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-serif text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100">
                                    {formattedLabel}
                                  </h4>
                                  <span className="px-2.5 py-0.5 rounded-full bg-rose-gold-500/10 text-rose-gold-600 dark:text-rose-gold-400 text-xs font-mono font-bold">
                                    {dateKey}
                                  </span>
                                </div>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
                                  {lang === 'ar'
                                    ? `${groupMemories.length} ذكريات ومواقف مصورة`
                                    : `${groupMemories.length} memory photos`}
                                </p>
                              </div>
                            </div>

                            {/* Memories Grid for this date */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {groupMemories.map((mem, idx) => (
                                <div
                                  key={`mem-${mem.id || idx}-${idx}`}
                                  className="rounded-[28px] glass p-6 border border-white/50 dark:border-white/10 shadow-lg flex flex-col justify-between hover:scale-[1.01] transition-all duration-300"
                                >
                                  {mem.imageUrl && (
                                    <div className="rounded-2xl overflow-hidden bg-neutral-100/50 dark:bg-neutral-800/50 mb-6 flex items-center justify-center max-h-[420px] shadow-sm">
                                      <img
                                        src={mem.imageUrl}
                                        referrerPolicy="no-referrer"
                                        alt={mem.title}
                                        onError={() => {
                                          setBrokenMemoryImageIds(prev => new Set(prev).add(mem.id));
                                        }}
                                        className="w-full h-auto max-h-[420px] object-contain rounded-2xl"
                                      />
                                    </div>
                                  )}
                                  <div className="flex flex-col gap-3">
                                    <h4 className="font-serif text-lg font-bold text-neutral-900 dark:text-neutral-100 leading-snug">
                                      {mem.title}
                                    </h4>
                                    <div>
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-gold-500/10 text-rose-gold-600 dark:text-rose-gold-400 text-[11px] font-mono font-bold border border-rose-gold-500/20">
                                        📅 {mem.date}
                                      </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed pt-1">
                                      {mem.content}
                                    </p>

                                    <div className="pt-4 mt-2 border-t border-rose-gold-100/20 flex items-center justify-between">
                                      <button
                                        onClick={() => {
                                          if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذه الذكرى؟' : 'Are you sure you want to delete this memory?')) {
                                            const updated = DataStore.getMemories().filter(m => m.id !== mem.id);
                                            DataStore.saveMemories(updated, {
                                              type: 'buzz',
                                              titleAr: 'حذف ذكرى 🗑️',
                                              titleEn: 'Deleted Memory 🗑️',
                                              descAr: `تم حذف الذكرى "${mem.title}"`,
                                              descEn: `Deleted memory "${mem.title}"`
                                            });
                                            onDataChanged();
                                          }
                                        }}
                                        className="p-2 rounded-full text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                                        title={lang === 'ar' ? 'حذف هذه الذكرى' : 'Delete memory'}
                                      >
                                        <Trash2 size={16} />
                                      </button>

                                      <button
                                        onClick={async () => {
                                          try {
                                            await fetch('/api/chat/message', {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({
                                                sender: currentUserRole,
                                                text:
                                                  lang === 'ar'
                                                    ? `شاركت معك ذكرى: "${mem.title}"`
                                                    : `Shared a memory: "${mem.title}"`,
                                                sharedItem: {
                                                  type: 'memory',
                                                  id: mem.id,
                                                  title: mem.title,
                                                  subtitle: mem.date,
                                                  image: mem.imageUrl
                                                }
                                              })
                                            });
                                            onDataChanged();
                                            setActiveTab('chat');
                                          } catch (err) {
                                            console.error('Error sharing memory:', err);
                                          }
                                        }}
                                        className="text-xs font-bold text-rose-gold-600 dark:text-rose-gold-400 hover:text-rose-gold-700 bg-rose-gold-500/10 hover:bg-rose-gold-500/20 px-4 py-2 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                                      >
                                        <span>💬</span>
                                        <span>{lang === 'ar' ? 'مشاركة في المحادثة' : 'Share in Chat'}</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* --- REELS TAB --- */}
            {activeTab === 'reels' && (
              <div className="flex-1 flex flex-col justify-between h-full animate-fade-in relative">
                <div className="text-center mb-2 shrink-0">
                  <h3 className="font-serif text-3xl font-bold text-neutral-950 dark:text-neutral-50 flex items-center justify-center gap-2">
                    <Sparkles className="text-[#d4af37] animate-pulse" size={20} />
                    {t.reels}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {lang === 'ar' ? 'بكرة لقطاتنا وفيديوهاتنا القصيرة الرائعة.' : 'Our beautiful vertical short video stream.'}
                  </p>
                </div>

                <div className="flex-1 min-h-0 flex items-center justify-center">
                  <MemoryReel lang={lang} />
                </div>
              </div>
            )}

            {/* --- GALLERY TAB --- */}
            {activeTab === 'gallery' && (
              <div className="space-y-10 py-2 animate-fade-in">
                
                <div className="text-center mb-8">
                  <h3 className="font-serif text-3xl font-bold text-neutral-950 dark:text-neutral-50 mb-2">
                    {t.gallery}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                    {lang === 'ar' ? 'معرض صور وفيديوهات لقصة حبنا.' : 'A visual gallery of our shared stories, frozen in time.'}
                  </p>
                </div>

                {/* Photos organized into Albums by location + month/year */}
                <div className="pt-2">
                  <div className="text-center mb-6">
                    <h4 className="font-serif text-lg font-bold text-neutral-800 dark:text-neutral-200">
                      {lang === 'ar' ? 'معرض الصور الخاص بنا' : 'Our Photographs'}
                    </h4>
                  </div>

                  {shuffledGallery.length === 0 ? (
                    <div className="rounded-[36px] border border-dashed border-rose-gold-100 dark:border-rose-gold-950/40 p-12 text-center bg-white/20 dark:bg-black/10 max-w-md mx-auto">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                        {t.emptySection}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      {groupGalleryIntoAlbums(shuffledGallery).map((album) => (
                        <div key={album.key}>
                          {/* Album header */}
                          <div className="mb-3 flex items-center gap-2 justify-center">
                            <span className="text-sm font-bold text-rose-gold-600 dark:text-rose-gold-400">
                              📍 {album.location}
                            </span>
                            <span className="text-xs text-neutral-400">•</span>
                            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                              {lang === 'ar' ? album.monthYearLabelAr : album.monthYearLabelEn}
                            </span>
                          </div>

                          {/* Pinterest style Masonry Columns per album */}
                          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
                            {album.items.map((item) => (
                              <div key={item.id} className="relative break-inside-avoid rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/10 group shadow-sm hover:shadow-lg transition-all duration-300">
                                <img
                                  src={item.url}
                                  referrerPolicy="no-referrer"
                                  alt=""
                                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                                />

                                {/* Icon action overlay - appears on hover, keeps the card visually clean */}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button
                                    onClick={() => {
                                      setSelectedGalleryItemForMemory(item);
                                      setIsGalleryToMemoryOpen(true);
                                    }}
                                    className="w-8 h-8 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm shadow-sm text-rose-gold-600 dark:text-rose-gold-400 flex items-center justify-center hover:bg-rose-gold-500 hover:text-white transition-colors cursor-pointer"
                                    title={lang === 'ar' ? 'إضافة للذكريات' : 'Add to memories'}
                                  >
                                    <Heart size={14} />
                                  </button>
                                  <button
                                    onClick={() => setEditingGalleryItem(item)}
                                    className="w-8 h-8 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm shadow-sm text-neutral-600 dark:text-neutral-300 flex items-center justify-center hover:bg-neutral-700 hover:text-white transition-colors cursor-pointer"
                                    title={lang === 'ar' ? 'تعديل' : 'Edit'}
                                  >
                                    <Edit3 size={13} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (window.confirm(lang === 'ar' ? 'متأكد إنك عايز تمسح الصورة دي؟' : 'Are you sure you want to delete this photo?')) {
                                        DataStore.deleteGalleryItem(item.id);
                                        setContentTrigger((prev) => prev + 1);
                                      }
                                    }}
                                    className="w-8 h-8 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm shadow-sm text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                                    title={lang === 'ar' ? 'حذف' : 'Delete'}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>

                                {item.caption && (
                                  <div className="p-2.5">
                                    <p className="text-xs text-center text-neutral-600 dark:text-neutral-300 font-serif font-medium leading-snug">
                                      "{item.caption}"
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dedicated videos section */}
                <div className="border-t border-rose-gold-100/10 pt-8">
                  <div className="text-center mb-6">
                    <h4 className="font-serif text-lg font-bold text-neutral-800 dark:text-neutral-200">
                      {t.videosTitle}
                    </h4>
                  </div>

                  {shuffledVideos.length === 0 ? (
                    // Empty state requirement
                    <div className="rounded-[36px] border border-dashed border-rose-gold-100 dark:border-rose-gold-950/40 p-12 text-center bg-white/20 dark:bg-black/10 max-w-md mx-auto">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                        {t.emptySection}
                      </p>
                    </div>
                  ) : (
                    // Videos layout
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                      {shuffledVideos.map((vid) => (
                        <div key={vid.id} className="rounded-3xl glass p-3 border border-white/50 dark:border-white/10 shadow-xs">
                          <video src={vid.url} controls className="w-full rounded-2xl aspect-video bg-black" />
                          {vid.title && (
                            <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mt-2 text-center">
                              {vid.title}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* --- MUSIC TAB --- */}
            {activeTab === 'music' && (
              <div className="animate-fade-in">
                <MusicSection 
                  lang={lang}
                  currentSong={currentSong}
                  isPlaying={isPlaying}
                  onPlayPause={togglePlayPause}
                  onNext={handleNextSong}
                  onPrev={handlePrevSong}
                  shuffledSongs={shuffledSongs}
                  onSelectSong={handleSelectSong}
                  shuffledVideos={shuffledVideos}
                  shuffledGallery={shuffledGallery}
                  globalVolume={globalVolume}
                  onVolumeChange={handleVolumeChange}
                  currentUserRole={currentUserRole}
                  setActiveTab={setActiveTab}
                  onDataChanged={onDataChanged}
                />
              </div>
            )}

            {/* --- PROFILE TAB & VAULT CONFIG --- */}
            {activeTab === 'profile' && (
              <div className="space-y-12 animate-fade-in">
                
                <div className="text-center">
                  <h3 className="font-serif text-3xl font-bold text-neutral-950 dark:text-neutral-50">
                    {t.profile}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {lang === 'ar' ? 'ملفات سعيد وسهيلة الشخصية وحقائق ممتعة متبادلة.' : 'Private biographies and intimate facts about each other.'}
                  </p>
                </div>

                {/* Knowledge Base Hero Card */}
                <div className="max-w-4xl mx-auto rounded-[32px] bg-gradient-to-r from-rose-gold-500/20 via-pink-500/15 to-purple-500/20 p-6 border border-rose-gold-300/40 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 dir-rtl">
                  <div className="flex items-center gap-4 text-right">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-gold-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-rose-gold-500/30 shrink-0">
                      <Brain size={30} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-serif text-xl font-bold text-neutral-900 dark:text-white">
                          {lang === 'ar' ? 'اعرفني أكتر ❤️ (قاعدة المعرفة)' : 'Know Me Better ❤️ (Knowledge Base)'}
                        </h4>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-gold-500 text-white font-extrabold">
                          {lang === 'ar' ? 'معلومات حقيقية 🧠' : 'Real KB'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
                        {lang === 'ar' 
                          ? `سعيد يعرف عن سهيلة ${getPartnerKnowledgeScores().dodoKnowsSo}% | سهيلة تعرف عن سعيد ${getPartnerKnowledgeScores().soKnowsDodo}% — إجابات حقيقية محفوظة ومستعملة في كل أنحاء الموقع!`
                          : `Dodo knows SO ${getPartnerKnowledgeScores().dodoKnowsSo}% | SO knows Dodo ${getPartnerKnowledgeScores().soKnowsDodo}%`}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsKnowledgeBaseOpen(true)}
                    className="w-full md:w-auto py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-gold-500 to-pink-500 hover:from-rose-gold-600 hover:to-pink-600 text-white text-xs font-bold shadow-lg shadow-rose-gold-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                  >
                    <Brain size={18} />
                    <span>{lang === 'ar' ? 'افتح قاعدة المعرفة 🧠' : 'Open Knowledge Base 🧠'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {currentUserRole === 'Dodo' ? (
                    <>
                      {/* Saeed Profile Card (You) */}
                      <div className="rounded-[36px] glass p-6 md:p-8 border-2 border-rose-gold-500/40 dark:border-rose-gold-500/20 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[360px]">
                        <div className="absolute top-3 right-4 bg-rose-gold-500 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                          {lang === 'ar' ? 'أنت' : 'You'}
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <img src={saeedPhotos[0]} referrerPolicy="no-referrer" className="w-20 h-20 rounded-full object-cover border-2 border-rose-gold-200 shadow-md mb-4" alt="" />
                          <h4 className="font-serif text-lg font-bold text-neutral-900 dark:text-neutral-50">{t.saeed}</h4>
                          <span className="text-[10px] text-rose-gold-500 font-mono font-bold uppercase tracking-widest">{t.dodo}</span>
                          
                          {/* Bio */}
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4 leading-relaxed italic px-4">
                            {DataStore.getSaeedProfile().bio ? `"${DataStore.getSaeedProfile().bio}"` : t.emptyField}
                          </p>
                        </div>

                        <div className="mt-6 space-y-2 border-t border-rose-gold-100/10 pt-4 text-xs font-medium">
                          <div className="flex justify-between">
                            <span className="text-neutral-400">{t.zodiac}</span>
                            <span className="text-neutral-800 dark:text-neutral-200">{DataStore.getSaeedProfile().zodiac || '—'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">{t.favoriteSong}</span>
                            <span className="text-neutral-800 dark:text-neutral-200">{DataStore.getSaeedProfile().favoriteSong || '—'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">{t.loveLanguage}</span>
                            <span className="text-neutral-800 dark:text-neutral-200">{DataStore.getSaeedProfile().loveLanguage || '—'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Sohila Profile Card (Partner) */}
                      <div className="rounded-[36px] glass p-6 md:p-8 border border-white/50 dark:border-white/10 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[360px]">
                        <div className="absolute top-3 right-4 bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {lang === 'ar' ? 'الشريك' : 'Partner'}
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <img src={sohilaPhotos[0]} referrerPolicy="no-referrer" className="w-20 h-20 rounded-full object-cover border-2 border-rose-gold-200 shadow-md mb-4" alt="" />
                          <h4 className="font-serif text-lg font-bold text-neutral-900 dark:text-neutral-50">{t.sohila}</h4>
                          <span className="text-[10px] text-rose-gold-500 font-mono font-bold uppercase tracking-widest">{t.so}</span>
                          
                          {/* Bio */}
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4 leading-relaxed italic px-4">
                            {DataStore.getSohilaProfile().bio ? `"${DataStore.getSohilaProfile().bio}"` : t.emptyField}
                          </p>
                        </div>

                        <div className="mt-6 space-y-2 border-t border-rose-gold-100/10 pt-4 text-xs font-medium">
                          <div className="flex justify-between">
                            <span className="text-neutral-400">{t.zodiac}</span>
                            <span className="text-neutral-800 dark:text-neutral-200">{DataStore.getSohilaProfile().zodiac || '—'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">{t.favoriteSong}</span>
                            <span className="text-neutral-800 dark:text-neutral-200">{DataStore.getSohilaProfile().favoriteSong || '—'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">{t.loveLanguage}</span>
                            <span className="text-neutral-800 dark:text-neutral-200">{DataStore.getSohilaProfile().loveLanguage || '—'}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Sohila Profile Card (You) */}
                      <div className="rounded-[36px] glass p-6 md:p-8 border-2 border-rose-gold-500/40 dark:border-rose-gold-500/20 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[360px]">
                        <div className="absolute top-3 right-4 bg-rose-gold-500 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                          {lang === 'ar' ? 'أنتِ' : 'You'}
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <img src={sohilaPhotos[0]} referrerPolicy="no-referrer" className="w-20 h-20 rounded-full object-cover border-2 border-rose-gold-200 shadow-md mb-4" alt="" />
                          <h4 className="font-serif text-lg font-bold text-neutral-900 dark:text-neutral-50">{t.sohila}</h4>
                          <span className="text-[10px] text-rose-gold-500 font-mono font-bold uppercase tracking-widest">{t.so}</span>
                          
                          {/* Bio */}
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4 leading-relaxed italic px-4">
                            {DataStore.getSohilaProfile().bio ? `"${DataStore.getSohilaProfile().bio}"` : t.emptyField}
                          </p>
                        </div>

                        <div className="mt-6 space-y-2 border-t border-rose-gold-100/10 pt-4 text-xs font-medium">
                          <div className="flex justify-between">
                            <span className="text-neutral-400">{t.zodiac}</span>
                            <span className="text-neutral-800 dark:text-neutral-200">{DataStore.getSohilaProfile().zodiac || '—'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">{t.favoriteSong}</span>
                            <span className="text-neutral-800 dark:text-neutral-200">{DataStore.getSohilaProfile().favoriteSong || '—'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">{t.loveLanguage}</span>
                            <span className="text-neutral-800 dark:text-neutral-200">{DataStore.getSohilaProfile().loveLanguage || '—'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Saeed Profile Card (Partner) */}
                      <div className="rounded-[36px] glass p-6 md:p-8 border border-white/50 dark:border-white/10 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[360px]">
                        <div className="absolute top-3 right-4 bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {lang === 'ar' ? 'الشريك' : 'Partner'}
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <img src={saeedPhotos[0]} referrerPolicy="no-referrer" className="w-20 h-20 rounded-full object-cover border-2 border-rose-gold-200 shadow-md mb-4" alt="" />
                          <h4 className="font-serif text-lg font-bold text-neutral-900 dark:text-neutral-50">{t.saeed}</h4>
                          <span className="text-[10px] text-rose-gold-500 font-mono font-bold uppercase tracking-widest">{t.dodo}</span>
                          
                          {/* Bio */}
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4 leading-relaxed italic px-4">
                            {DataStore.getSaeedProfile().bio ? `"${DataStore.getSaeedProfile().bio}"` : t.emptyField}
                          </p>
                        </div>

                        <div className="mt-6 space-y-2 border-t border-rose-gold-100/10 pt-4 text-xs font-medium">
                          <div className="flex justify-between">
                            <span className="text-neutral-400">{t.zodiac}</span>
                            <span className="text-neutral-800 dark:text-neutral-200">{DataStore.getSaeedProfile().zodiac || '—'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">{t.favoriteSong}</span>
                            <span className="text-neutral-800 dark:text-neutral-200">{DataStore.getSaeedProfile().favoriteSong || '—'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">{t.loveLanguage}</span>
                            <span className="text-neutral-800 dark:text-neutral-200">{DataStore.getSaeedProfile().loveLanguage || '—'}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* ADMIN VAULT PANEL AT BOTTOM */}
                <div id="settings-portal" className="pt-12 border-t border-rose-gold-100/10">
                  <div className="text-center mb-6 flex items-center justify-center gap-3 flex-wrap">
                    <button
                      onClick={() => setForceBirthdayPreview(!forceBirthdayPreview)}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-full border shadow-sm tracking-widest uppercase transition-all ${
                        forceBirthdayPreview
                          ? 'bg-amber-500 border-amber-500 text-white animate-pulse'
                          : 'bg-white/50 border-white/20 text-neutral-500'
                      }`}
                    >
                      ✨ {lang === 'ar' ? 'معاينة وضع عيد الميلاد' : 'Toggle Birthday Mode Preview'}
                    </button>

                    <button
                      onClick={() => setShowUserSelector(true)}
                      className="text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/20 bg-rose-gold-500/10 hover:bg-rose-gold-500 text-rose-gold-600 hover:text-white shadow-sm tracking-widest uppercase transition-all flex items-center gap-1"
                    >
                      👤 {t.switchUser || 'Switch User'}
                    </button>
                  </div>
                  <AdminPanel lang={lang} onDataChanged={onDataChanged} />
                </div>

              </div>
            )}

            {/* --- CHAT TAB --- */}
            {activeTab === 'chat' && (
              <div className="animate-fade-in py-1">
                <ChatSection
                  lang={lang}
                  currentUserRole={currentUserRole}
                  liveState={liveState}
                  onDataChanged={onDataChanged}
                  setActiveTab={setActiveTab}
                  setActiveWidgetModal={setActiveWidgetModal}
                  setSelectedEnvelopeId={setSelectedEnvelopeId}
                  setSelectedQuestionId={setSelectedQuestionId}
                  setSelectedWheelItemName={setSelectedWheelItemName}
                  setSelectedAchievementId={setSelectedAchievementId}
                  setCurrentSong={setCurrentSong}
                  setIsPlaying={setIsPlaying}
                />
              </div>
            )}

            </div>

            {/* --- WIDGET MODALS --- */}
            {activeWidgetModal === 'envelope' && (
              <WidgetModal onClose={() => setActiveWidgetModal(null)} title={t.envelopeTitle || 'Open When...'}>
                <OpenWhenEnvelope lang={lang} initialEnvelopeId={selectedEnvelopeId} />
              </WidgetModal>
            )}
            {activeWidgetModal === 'wheel' && (
              <WidgetModal onClose={() => setActiveWidgetModal(null)} title={t.dateWheelTitle || 'Romantic Date Spinner'}>
                <DateGenerator lang={lang} currentUserRole={currentUserRole} initialItemName={selectedWheelItemName} />
              </WidgetModal>
            )}
            {activeWidgetModal === 'stars' && (
              <WidgetModal onClose={() => setActiveWidgetModal(null)} title={t.nightSkyTitle || 'Our Starry Night Sky'}>
                <NightSky lang={lang} />
              </WidgetModal>
            )}
            {activeWidgetModal === 'question' && (
              <WidgetModal onClose={() => setActiveWidgetModal(null)} title={t.dailyQuestion || 'Daily Question'}>
                <DailyQuestionSection lang={lang} currentUserRole={currentUserRole} initialQuestionId={selectedQuestionId} />
              </WidgetModal>
            )}
            {activeWidgetModal === 'mood-tracker' && (
              <WidgetModal onClose={() => setActiveWidgetModal(null)} title={lang === 'ar' ? 'مزاج اليوم 🥰' : 'Daily Mood 🥰'}>
                <DailyMoodSection lang={lang} currentUserRole={currentUserRole} />
              </WidgetModal>
            )}
            {activeWidgetModal === 'games' && (
              <WidgetModal onClose={() => setActiveWidgetModal(null)} title={lang === 'ar' ? 'الأركيد بتاعنا 🕹️' : 'Our Arcade 🕹️'}>
                <GamesSection lang={lang} currentUserRole={currentUserRole} />
              </WidgetModal>
            )}
            {activeWidgetModal === 'player-card' && (
              <WidgetModal onClose={() => setActiveWidgetModal(null)} title={lang === 'ar' ? 'كارت الشريك 🃏' : 'Partner Card 🃏'}>
                <PlayerCardSection lang={lang} currentRole={currentUserRole} />
              </WidgetModal>
            )}
            {activeWidgetModal === 'achievements' && (
              <WidgetModal onClose={() => setActiveWidgetModal(null)} title={lang === 'ar' ? 'منصة الإنجازات والأوسمة 🏆' : 'Our Achievements & Trophies 🏆'}>
                <AchievementsSection lang={lang} highlightedId={selectedAchievementId} />
              </WidgetModal>
            )}
            {activeWidgetModal === 'timeline' && (
              <WidgetModal onClose={() => setActiveWidgetModal(null)} title={lang === 'ar' ? 'رحلتنا الرومانسية' : 'Our Story Timeline'}>
                <TimelineCards lang={lang} />
              </WidgetModal>
            )}
            {activeWidgetModal === 'stats' && (
              <WidgetModal onClose={() => setActiveWidgetModal(null)} title={lang === 'ar' ? 'إحصائيات حبنا الرقمية 📊' : 'Our Love Live Stats 📊'}>
                <div className="p-2 space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                      {lang === 'ar' ? 'أرقام وإحصائيات مباشرة توثق كل لحظة عشناها معاً' : 'Live analytics documenting our shared journey'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-white/40 dark:bg-black/30 border border-white/30 dark:border-white/5 flex flex-col items-center text-center shadow-xs">
                      <span className="text-2xl mb-1">💖</span>
                      <span className="text-2xl font-black font-mono text-rose-gold-500">{countdownUnits.days}</span>
                      <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mt-1">{lang === 'ar' ? 'أيام حبنا' : 'Days Together'}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/40 dark:bg-black/30 border border-white/30 dark:border-white/5 flex flex-col items-center text-center shadow-xs">
                      <span className="text-2xl mb-1">📸</span>
                      <span className="text-2xl font-black font-mono text-rose-gold-500">{DataStore.getGallery().length}</span>
                      <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mt-1">{lang === 'ar' ? 'صور في معرضنا' : 'Shared Photos'}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/40 dark:bg-black/30 border border-white/30 dark:border-white/5 flex flex-col items-center text-center shadow-xs">
                      <span className="text-2xl mb-1">📖</span>
                      <span className="text-2xl font-black font-mono text-rose-gold-500">{DataStore.getMemories().length}</span>
                      <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mt-1">{lang === 'ar' ? 'ذكريات موثقة' : 'Recorded Memories'}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/40 dark:bg-black/30 border border-white/30 dark:border-white/5 flex flex-col items-center text-center shadow-xs">
                      <span className="text-2xl mb-1">🎵</span>
                      <span className="text-2xl font-black font-mono text-rose-gold-500">{DataStore.getSongs().length}</span>
                      <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mt-1">{lang === 'ar' ? 'أغاني وألحان' : 'Shared Songs'}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/40 dark:bg-black/30 border border-white/30 dark:border-white/5 flex flex-col items-center text-center shadow-xs">
                      <span className="text-2xl mb-1">🎬</span>
                      <span className="text-2xl font-black font-mono text-rose-gold-500">{DataStore.getVideos().length}</span>
                      <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mt-1">{lang === 'ar' ? 'مقاطع ريلز' : 'Reel Videos'}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/40 dark:bg-black/30 border border-white/30 dark:border-white/5 flex flex-col items-center text-center shadow-xs">
                      <span className="text-2xl mb-1">✉️</span>
                      <span className="text-2xl font-black font-mono text-rose-gold-500">{DataStore.getEnvelopes().length}</span>
                      <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mt-1">{lang === 'ar' ? 'رسائل دافئة' : 'Open When Letters'}</span>
                    </div>
                  </div>
                </div>
              </WidgetModal>
            )}

            {/* Gallery to Memory Modal */}
            <GalleryToMemoryModal
              isOpen={isGalleryToMemoryOpen}
              onClose={() => setIsGalleryToMemoryOpen(false)}
              lang={lang}
              initialGalleryItem={selectedGalleryItemForMemory}
              onSuccess={onDataChanged}
              onNavigateToMemories={() => setActiveTab('memories')}
            />

            {/* Knowledge Base Modal */}
            <KnowledgeBaseModal
              isOpen={isKnowledgeBaseOpen}
              onClose={() => setIsKnowledgeBaseOpen(false)}
              lang={lang}
              currentRole={currentUserRole}
              onDataChanged={onDataChanged}
              onShareToChat={(text) => handleShareFactToChat(text)}
            />

            {/* FLOATING GLASS NAVIGATION BAR */}
            <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-lg px-2 pointer-events-none">
              <div className="w-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-3xl py-2 px-1.5 flex justify-between items-center shadow-[0_10px_40px_-10px_rgba(0,0,0,0.35)] border border-white/50 dark:border-white/10 pointer-events-auto overflow-x-auto custom-scrollbar">
                
                {/* Home */}
                <button
                  onClick={() => setActiveTab('home')}
                  className={`flex flex-col items-center gap-0.5 flex-1 min-w-[48px] py-1.5 rounded-2xl transition-all cursor-pointer ${
                    activeTab === 'home' ? 'text-rose-gold-600 dark:text-rose-gold-300 bg-rose-gold-50 dark:bg-rose-gold-950/50 font-bold' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600'
                  }`}
                >
                  <Globe size={21} />
                  <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">{t.home}</span>
                </button>

                {/* Chat */}
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex flex-col items-center gap-0.5 flex-1 min-w-[48px] py-1.5 rounded-2xl transition-all cursor-pointer relative ${
                    activeTab === 'chat' ? 'text-rose-gold-600 dark:text-rose-gold-300 bg-rose-gold-50 dark:bg-rose-gold-950/50 font-bold' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600'
                  }`}
                >
                  <MessageSquare size={21} />
                  <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">{t.chat || (lang === 'ar' ? 'الشات' : 'Chat')}</span>
                  {liveState?.chatMessages?.length > 0 && activeTab !== 'chat' && (
                    <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-gold-500 animate-ping" />
                  )}
                </button>

                {/* Memories */}
                <button
                  onClick={() => setActiveTab('memories')}
                  className={`flex flex-col items-center gap-0.5 flex-1 min-w-[48px] py-1.5 rounded-2xl transition-all cursor-pointer ${
                    activeTab === 'memories' ? 'text-rose-gold-600 dark:text-rose-gold-300 bg-rose-gold-50 dark:bg-rose-gold-950/50 font-bold' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600'
                  }`}
                >
                  <Sparkles size={21} />
                  <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">{t.memories}</span>
                </button>

                {/* Reels */}
                <button
                  onClick={() => setActiveTab('reels')}
                  className={`flex flex-col items-center gap-0.5 flex-1 min-w-[48px] py-1.5 rounded-2xl transition-all cursor-pointer ${
                    activeTab === 'reels' ? 'text-rose-gold-600 dark:text-rose-gold-300 bg-rose-gold-50 dark:bg-rose-gold-950/50 font-bold' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600'
                  }`}
                >
                  <Film size={21} />
                  <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">{t.reels}</span>
                </button>

                {/* Center Heart Upload Trigger */}
                <div className="relative w-11 h-11 flex items-center justify-center shrink-0 mx-0.5">
                  <div className="absolute inset-0 bg-rose-gold-400/20 rounded-full animate-ping pointer-events-none" />
                  <button
                    onClick={() => setIsDirectUploadOpen(true)}
                    className="w-11 h-11 rounded-full bg-rose-gold-500 text-white flex items-center justify-center shadow-md shadow-rose-gold-500/40 border-2 border-white dark:border-neutral-900 transition-transform active:scale-95 cursor-pointer hover:bg-rose-gold-600"
                    title={lang === 'ar' ? 'رفع صور، أغاني، أو ذكريات 📤' : 'Upload Media & Memories 📤'}
                  >
                    <Upload size={20} className="stroke-[2.5]" />
                  </button>
                </div>

                {/* Gallery */}
                <button
                  onClick={() => setActiveTab('gallery')}
                  className={`flex flex-col items-center gap-0.5 flex-1 min-w-[48px] py-1.5 rounded-2xl transition-all cursor-pointer ${
                    activeTab === 'gallery' ? 'text-rose-gold-600 dark:text-rose-gold-300 bg-rose-gold-50 dark:bg-rose-gold-950/50 font-bold' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600'
                  }`}
                >
                  <ImageIcon size={21} />
                  <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">{t.gallery}</span>
                </button>

                {/* Music */}
                <button
                  onClick={() => setActiveTab('music')}
                  className={`flex flex-col items-center gap-0.5 flex-1 min-w-[48px] py-1.5 rounded-2xl transition-all cursor-pointer ${
                    activeTab === 'music' ? 'text-rose-gold-600 dark:text-rose-gold-300 bg-rose-gold-50 dark:bg-rose-gold-950/50 font-bold' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600'
                  }`}
                >
                  <Music size={21} />
                  <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">{lang === 'ar' ? 'الموسيقى' : 'Music'}</span>
                </button>

                {/* Profile */}
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex flex-col items-center gap-0.5 flex-1 min-w-[48px] py-1.5 rounded-2xl transition-all cursor-pointer ${
                    activeTab === 'profile' ? 'text-rose-gold-600 dark:text-rose-gold-300 bg-rose-gold-50 dark:bg-rose-gold-950/50 font-bold' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600'
                  }`}
                >
                  <User size={21} />
                  <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">{t.profile}</span>
                </button>

              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Direct Uploader Modal */}
      <DirectUploaderModal
        isOpen={isDirectUploadOpen}
        onClose={() => setIsDirectUploadOpen(false)}
        lang={lang}
        currentRole={currentUserRole}
        onSuccess={() => setContentTrigger((prev) => prev + 1)}
      />

      {/* Gallery Item Edit Modal */}
      {editingGalleryItem && (
        <WidgetModal
          onClose={() => setEditingGalleryItem(null)}
          title={lang === 'ar' ? 'تعديل بيانات الصورة ✏️' : 'Edit Photo Details ✏️'}
        >
          <GalleryEditForm
            item={editingGalleryItem}
            lang={lang}
            onSave={(updates) => {
              DataStore.updateGalleryItem(editingGalleryItem.id, updates);
              setContentTrigger((prev) => prev + 1);
              setEditingGalleryItem(null);
            }}
            onCancel={() => setEditingGalleryItem(null)}
          />
        </WidgetModal>
      )}

      {/* Hidden global music player video tag for maximal compatibility of webm/mp4 audio formats */}
      <video 
        ref={globalAudioRef} 
        onEnded={handleNextSong}
        className="hidden" 
        playsInline
      />

    </div>
  );
}

interface GalleryEditFormProps {
  item: GalleryItem;
  lang: Language;
  onSave: (updates: Partial<GalleryItem>) => void;
  onCancel: () => void;
}

function GalleryEditForm({ item, lang, onSave, onCancel }: GalleryEditFormProps) {
  const [caption, setCaption] = useState(item.caption || '');
  const [location, setLocation] = useState(item.location || '');
  const [date, setDate] = useState(item.date || new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-4">
      <img src={item.url} alt="" className="w-full h-40 object-cover rounded-2xl" />

      <div>
        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
          {lang === 'ar' ? 'المكان 📍' : 'Location 📍'}
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={lang === 'ar' ? 'مثال: الساحل الشمالي' : 'e.g. North Coast'}
          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white/60 dark:bg-neutral-800 text-sm font-medium focus:ring-2 focus:ring-rose-gold-400 outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
          {lang === 'ar' ? 'التاريخ 📅' : 'Date 📅'}
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white/60 dark:bg-neutral-800 text-sm font-medium focus:ring-2 focus:ring-rose-gold-400 outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
          {lang === 'ar' ? 'الوصف / التعليق 📝' : 'Caption 📝'}
        </label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white/60 dark:bg-neutral-800 text-sm font-medium focus:ring-2 focus:ring-rose-gold-400 outline-none resize-none"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm font-bold cursor-pointer"
        >
          {lang === 'ar' ? 'إلغاء' : 'Cancel'}
        </button>
        <button
          onClick={() => onSave({ caption, location, date })}
          className="flex-1 py-2.5 rounded-xl bg-rose-gold-500 hover:bg-rose-gold-600 text-white text-sm font-bold cursor-pointer"
        >
          {lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

interface WidgetModalProps {
  onClose: () => void;
  title: string;
  children: ReactNode;
}

function WidgetModal({ onClose, title, children }: WidgetModalProps) {
  return (
    <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-lg z-50 flex items-center justify-center p-4 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: "spring", duration: 0.45, bounce: 0.2 }}
        className="bg-white/95 dark:bg-neutral-900/95 w-full max-w-md rounded-[28px] border border-white/40 dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] relative flex flex-col justify-between max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
      >
        {/* Accent top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-rose-gold-400 via-rose-gold-500 to-rose-gold-600 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-neutral-100 dark:border-white/5 shrink-0">
          <h4 className="font-serif text-lg font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">{title}</h4>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-neutral-100 dark:bg-white/10 text-neutral-500 dark:text-neutral-300 hover:bg-rose-gold-100 hover:text-rose-gold-600 dark:hover:bg-rose-gold-950/50 dark:hover:text-rose-gold-300 active:scale-90 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar px-6 py-5">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

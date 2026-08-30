import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Image as ImageIcon, Video, Mic, Square, Trash2, Edit2, Reply, Pin, Search, 
  Smile, Share2, Heart, Star, HelpCircle, Film, Music, Compass, AlertCircle, X, Check, Eye
} from 'lucide-react';
import { Language, UserRole, ChatMessage } from '../types';
import { translations } from '../translations';
import { DataStore } from '../dataStore';

interface ChatSectionProps {
  lang: Language;
  currentUserRole: UserRole;
  liveState: any;
  onDataChanged: () => void;
  setActiveTab: (tab: 'home' | 'memories' | 'reels' | 'gallery' | 'music' | 'profile' | 'notifications' | 'chat') => void;
  setActiveWidgetModal: (modal: any) => void;
  setSelectedEnvelopeId: (id: string | null) => void;
  setSelectedQuestionId: (id: string | null) => void;
  setSelectedWheelItemName: (name: string | null) => void;
  setSelectedAchievementId: (id: string | null) => void;
  setCurrentSong: (song: any) => void;
  setIsPlaying: (playing: boolean) => void;
}

const EMOJI_PRESETS = ['❤️', '😂', '😍', '👍', '😢', '🎉', '🔥', '😘', '🌹', '♾️'];

const formatTimeAgo = (timestamp: number, lang: Language): string => {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);

  if (diffSec < 60) {
    return lang === 'ar' ? 'الآن' : 'Now';
  } else if (diffMin < 60) {
    return lang === 'ar' ? `منذ ${diffMin} د` : `${diffMin}m ago`;
  } else if (diffHrs < 24) {
    return lang === 'ar' ? `منذ ${diffHrs} سا` : `${diffHrs}h ago`;
  } else {
    const date = new Date(timestamp);
    return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  }
};

export default function ChatSection({
  lang,
  currentUserRole,
  liveState,
  onDataChanged,
  setActiveTab,
  setActiveWidgetModal,
  setSelectedEnvelopeId,
  setSelectedQuestionId,
  setSelectedWheelItemName,
  setSelectedAchievementId,
  setCurrentSong,
  setIsPlaying
}: ChatSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null);
  const [activeMessageIdMenu, setActiveMessageIdMenu] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSharePicker, setShowSharePicker] = useState(false);
  const [shareCategory, setShareCategory] = useState<'memories' | 'photos' | 'videos' | 'songs' | 'questions' | 'envelopes' | 'achievements'>('memories');
  
  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // Layout Scroll Ref
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const t = translations[lang];

  // Load chat messages from liveState
  useEffect(() => {
    if (liveState && liveState.chatMessages) {
      setMessages(liveState.chatMessages);
    }
  }, [liveState]);

  // Scroll to bottom when messages list updates
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [messages.length]);

  // Typing state update
  const typingTimeoutRef = useRef<any>(null);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    
    // Notify server of typing
    updateUserStatus(true, isRecording, showSharePicker);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      updateUserStatus(false, isRecording, showSharePicker);
    }, 2000);
  };

  const updateUserStatus = async (typing: boolean, recording: boolean, choosing: boolean) => {
    try {
      await fetch('/api/chat/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: currentUserRole, typing, recording, choosing })
      });
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Keep choosing status synced
  useEffect(() => {
    updateUserStatus(false, isRecording, showSharePicker);
  }, [showSharePicker]);

  // Send message API helper
  const sendMessage = async (payload: Partial<ChatMessage>) => {
    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: currentUserRole,
          ...payload
        })
      });
      if (res.ok) {
        setInputText('');
        setReplyingTo(null);
        setEditingMsg(null);
        setShowEmojiPicker(false);
        setShowSharePicker(false);
        updateUserStatus(false, false, false);
        onDataChanged(); // Trigger root reload
        setTimeout(() => scrollToBottom('smooth'), 100);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Send text message
  const handleSendText = () => {
    if (!inputText.trim()) return;
    
    if (editingMsg) {
      handleSaveEdit(editingMsg.id, inputText);
      return;
    }

    const payload: Partial<ChatMessage> = {
      text: inputText
    };

    if (replyingTo) {
      payload.replyToId = replyingTo.id;
      payload.replyToText = replyingTo.text || (replyingTo.mediaType ? `[${replyingTo.mediaType}]` : '[shared]');
      payload.replyToSender = replyingTo.sender;
    }

    sendMessage(payload);
  };

  // Edit Message
  const handleSaveEdit = async (id: string, text: string) => {
    try {
      const res = await fetch(`/api/chat/message/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        setInputText('');
        setEditingMsg(null);
        onDataChanged();
      }
    } catch (err) {
      console.error('Error editing message:', err);
    }
  };

  // Delete Message
  const handleDeleteMessage = async (id: string) => {
    // Optimistic UI update: remove immediately for instant response
    setMessages(prev => prev.filter(m => m.id !== id));
    setActiveMessageIdMenu(null);

    try {
      const res = await fetch(`/api/chat/message/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        onDataChanged();
      } else {
        console.error('Failed to delete message on server');
        onDataChanged();
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      onDataChanged();
    }
  };

  // React to Message
  const handleReactToMessage = async (id: string, emoji: string | null) => {
    try {
      const res = await fetch(`/api/chat/message/${id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: currentUserRole, emoji })
      });
      if (res.ok) {
        setActiveMessageIdMenu(null);
        onDataChanged();
      }
    } catch (err) {
      console.error('Error reacting to message:', err);
    }
  };

  // Pin/Unpin Message
  const handleTogglePinMessage = async (msg: ChatMessage) => {
    try {
      const res = await fetch(`/api/chat/message/${msg.id}/pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !msg.isPinned })
      });
      if (res.ok) {
        setActiveMessageIdMenu(null);
        onDataChanged();
      }
    } catch (err) {
      console.error('Error pinning message:', err);
    }
  };

  // Save chat message as memory
  const handleSaveToMemory = (msg: ChatMessage) => {
    if (!msg.text && !msg.mediaUrl) return;

    const memories = DataStore.getMemories();
    const newMemory = {
      id: 'mem-chat-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      title: lang === 'ar' ? 'ذكرى من محادثتنا 💬❤️' : 'Memory from our Chat 💬❤️',
      content: msg.text || (lang === 'ar' ? 'ملف مشترك من المحادثة.' : 'Shared file from chat.'),
      imageUrl: msg.mediaType === 'image' ? msg.mediaUrl : undefined,
      videoUrl: msg.mediaType === 'video' ? msg.mediaUrl : undefined
    };

    DataStore.saveMemories([newMemory, ...memories]);
    setActiveMessageIdMenu(null);
    onDataChanged();

    // Visual notification feedback
    alert(lang === 'ar' ? 'تم حفظ الرسالة كذكرى جميلة في قسم الذكريات! ✨📸' : 'Saved to Memories successfully! ✨📸');
  };

  // --- Voice Recording Logic ---
  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert(lang === 'ar' ? 'التسجيل الصوتي غير مدعوم في متصفحك الحالي.' : 'Voice recording not supported in your browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: 'audio/webm' };
      let recorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        // Fallback for Safari
        recorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Stop all stream tracks to release microphone
        stream.getTracks().forEach(track => track.stop());

        // Read audio as Base64 Data URL
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          const mins = Math.floor(recordingSeconds / 60);
          const secs = recordingSeconds % 60;
          const durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
          
          sendMessage({
            mediaUrl: base64Data,
            mediaType: 'voice',
            voiceDuration: durationStr
          });
        };
      };

      // Start recording timer
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

      recorder.start();
      setIsRecording(true);
      updateUserStatus(false, true, showSharePicker);
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert(lang === 'ar' ? 'فشل الوصول إلى الميكروفون.' : 'Could not access microphone.');
    }
  };

  const stopRecording = (cancel = false) => {
    if (!mediaRecorderRef.current || !isRecording) return;

    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    updateUserStatus(false, false, showSharePicker);

    if (cancel) {
      mediaRecorderRef.current.onstop = null; // Ignore onstop callback
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    } else {
      mediaRecorderRef.current.stop();
    }
  };

  // --- Image & Video File Select ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const limit = type === 'image' ? 8 * 1024 * 1024 : 15 * 1024 * 1024; // Limit base64 sizes
    if (file.size > limit) {
      alert(lang === 'ar' ? 'حجم الملف كبير جداً. يرجى اختيار ملف أصغر.' : 'File is too large. Please select a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      sendMessage({
        mediaUrl: base64Data,
        mediaType: type,
        text: file.name
      });
    };
  };

  // --- Deep Link Cards sharing handlers ---
  const handleShareItem = (itemType: string, itemId: string, itemTitle: string, itemSubTitle?: string, itemImg?: string) => {
    sendMessage({
      sharedItem: {
        type: itemType as any,
        id: itemId,
        title: itemTitle,
        subTitle: itemSubTitle,
        imageUrl: itemImg
      }
    });
  };

  // Trigger click on shared cards to launch actual features
  const handleSharedCardClick = (shared: any) => {
    const type = shared.type;
    const id = shared.id;

    if (type === 'envelope') {
      setSelectedEnvelopeId(id);
      setActiveWidgetModal('envelope');
    } else if (type === 'song') {
      const songs = DataStore.getSongs();
      const s = songs.find(x => x.id === id);
      if (s) {
        setCurrentSong(s);
        setIsPlaying(true);
        // Toggle music tab
        setActiveTab('music');
      }
    } else if (type === 'daily_question') {
      setSelectedQuestionId(id);
      setActiveWidgetModal('question');
    } else if (type === 'quiz') {
      setActiveWidgetModal('quiz');
    } else if (type === 'achievement') {
      setSelectedAchievementId(id);
      setActiveWidgetModal('achievements');
    } else if (type === 'memory') {
      setActiveTab('memories');
    } else if (type === 'photo') {
      setActiveTab('gallery');
    } else if (type === 'reel') {
      setActiveTab('reels');
    }
  };

  // Partner Info helper
  const partnerRole = currentUserRole === 'Dodo' ? 'SO' : 'Dodo';
  const partnerName = partnerRole === 'SO'
    ? (lang === 'ar' ? 'سهيلة' : 'Sohila')
    : (lang === 'ar' ? 'سعيد' : 'Saeed');
  
  const partnerStatus = partnerRole === 'SO' ? liveState?.soStatus : liveState?.dodoStatus;
  const partnerLastActiveStr = partnerRole === 'SO' ? liveState?.soLastActive : liveState?.dodoLastActive;

  const getPartnerPresenceHeader = () => {
    const now = Date.now();
    const activeTime = partnerLastActiveStr ? new Date(partnerLastActiveStr).getTime() : 0;
    const activeDiffMins = activeTime > 0 ? Math.floor((now - activeTime) / 60000) : 999999;
    const isOnline = activeDiffMins < 1;

    if (partnerStatus?.typing) {
      return {
        text: partnerRole === 'SO' ? 'تكتب الآن... ✍️' : 'يكتب الآن... ✍️',
        class: 'text-rose-gold-500 font-bold animate-pulse'
      };
    }
    if (partnerStatus?.recording) {
      return {
        text: partnerRole === 'SO' ? 'تسجل رسالة صوتية... 🎙️' : 'يسجل رسالة صوتية... 🎙️',
        class: 'text-rose-gold-500 font-bold animate-pulse'
      };
    }
    if (partnerStatus?.choosing) {
      return {
        text: partnerRole === 'SO' ? 'تختار بطاقة حب لمشاركتها... 💕' : 'يختار بطاقة حب لمشاركتها... 💕',
        class: 'text-rose-gold-400 font-medium'
      };
    }

    if (isOnline) {
      return {
        text: lang === 'ar' ? 'متصل الآن 🟢' : 'Online 🟢',
        class: 'text-emerald-500 font-bold'
      };
    } else {
      if (activeTime > 0) {
        const timeTextAr = activeDiffMins === 1 
          ? 'منذ دقيقة' 
          : activeDiffMins === 2 
            ? 'منذ دقيقتين' 
            : activeDiffMins <= 10 
              ? `منذ ${activeDiffMins} دقائق` 
              : `منذ ${activeDiffMins} دقيقة`;
        
        const timeTextEn = activeDiffMins === 1 
          ? '1 min ago' 
          : `${activeDiffMins} mins ago`;

        return {
          text: partnerRole === 'SO'
            ? (lang === 'ar' ? `كانت متصلة ${timeTextAr} 💤` : `Was online ${timeTextEn} 💤`)
            : (lang === 'ar' ? `كان متصلاً ${timeTextAr} 💤` : `Was online ${timeTextEn} 💤`),
          class: 'text-neutral-400 dark:text-neutral-500'
        };
      }
      return {
        text: lang === 'ar' ? 'غير متصل حالياً 💤' : 'Offline 💤',
        class: 'text-neutral-400'
      };
    }
  };

  const partnerHeaderStatus = getPartnerPresenceHeader();

  // Filter messages based on search term
  const filteredMessages = messages.filter(m => {
    if (!searchTerm) return true;
    return m.text?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Find the pinned message
  const pinnedMessage = messages.find(m => m.isPinned);

  // Scroll and highlight message helper
  const handleScrollToMessage = (id: string) => {
    const el = document.getElementById(`msg-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('highlight-pulse');
      setTimeout(() => el.classList.remove('highlight-pulse'), 2000);
    }
  };

  return (
    <div
      className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto rounded-[36px] overflow-hidden shadow-2xl animate-fade-in relative"
      style={{
        background: 'radial-gradient(120% 90% at 50% 0%, #1c1013 0%, #100a0c 55%, #0a0608 100%)'
      }}
    >
      {/* subtle continuous pink identity line down the side of the conversation */}
      <div className="pointer-events-none absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 w-px bg-gradient-to-b from-transparent via-rose-gold-500/25 to-transparent z-20" />

      {/* CHAT HEADER */}
      <div className="p-4 border-b border-white/5 bg-[rgba(20,12,15,0.82)] backdrop-blur-md flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={partnerRole === 'SO' 
                ? 'https://res.cloudinary.com/utefkiln/image/upload/v1784470919/WhatsApp_Image_2026-07-14_at_1.22.32_AM_rgtj6f.jpg'
                : 'https://res.cloudinary.com/utefkiln/image/upload/v1784470798/WhatsApp_Image_2026-05-31_at_3.46.04_PM_junpuw.jpg'
              } 
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-full object-cover border border-rose-gold-400/60 shadow-sm"
              alt=""
            />
            {partnerHeaderStatus.text.includes('🟢') && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#150d10] animate-pulse" />
            )}
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-neutral-50 flex items-center gap-1.5">
              <span>{partnerName}</span>
              <span className="text-xs">💖</span>
            </h4>
            <p className={`text-[10px] font-semibold tracking-wide ${partnerHeaderStatus.class}`}>
              {partnerHeaderStatus.text}
            </p>
          </div>
        </div>

        {/* Search Bar in Header */}
        <div className="flex items-center gap-2 max-w-[150px] md:max-w-[200px]">
          <div className="relative">
            <input 
              type="text"
              placeholder={lang === 'ar' ? 'بحث...' : 'Search...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs py-1.5 pl-7 pr-3 rounded-full bg-white/5 dark:bg-white/5 border border-white/10 focus:outline-none focus:border-rose-gold-400/60 font-medium text-neutral-100 placeholder:text-neutral-500"
            />
            <Search size={12} className="absolute left-2.5 top-2.5 text-neutral-500" />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-2 top-2.5 text-neutral-500 hover:text-neutral-300">
                <X size={10} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PINNED MESSAGE BANNER */}
      {pinnedMessage && (
        <div 
          onClick={() => handleScrollToMessage(pinnedMessage.id)}
          className="bg-rose-gold-950/30 px-4 py-2 border-b border-rose-gold-500/10 text-xs flex justify-between items-center cursor-pointer hover:bg-rose-gold-950/45 transition-all z-10 shrink-0"
        >
          <div className="flex items-center gap-2 text-rose-gold-300 font-bold truncate">
            <Pin size={12} className="shrink-0 rotate-45" />
            <span className="uppercase text-[9px] tracking-wider font-mono">{lang === 'ar' ? 'مثبتة' : 'Pinned'}:</span>
            <span className="truncate max-w-[250px] md:max-w-md font-medium">
              {pinnedMessage.text || `[${pinnedMessage.mediaType || 'Card'}]`}
            </span>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePinMessage(pinnedMessage);
            }} 
            className="p-1 rounded-full text-neutral-500 hover:text-rose-gold-300"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* MESSAGES LISTING */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-transparent"
      >
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center p-8 text-neutral-500">
            <div className="text-4xl mb-2">💌</div>
            <p className="text-xs font-medium">
              {searchTerm 
                ? (lang === 'ar' ? 'لم يتم العثور على أي نتائج مطابقة.' : 'No matching messages found.')
                : (lang === 'ar' ? 'ابدأ محادثتكم الخاصة الآن! اكتب شيئاً رومانسياً... 💕' : 'Start your romantic conversation now! Write something sweet... 💕')
              }
            </p>
          </div>
        ) : (
          (() => {
            let lastDayKey: string | null = null;
            return filteredMessages.map((msg) => {
            const isMe = msg.sender === currentUserRole;
            const messageSenderName = msg.sender === 'Dodo' ? (lang === 'ar' ? 'سعيد' : 'Saeed') : (lang === 'ar' ? 'سهيلة' : 'Sohila');
            const msgDate = new Date(msg.timestamp);
            const dayKey = msgDate.toDateString();
            const showDayMarker = dayKey !== lastDayKey;
            lastDayKey = dayKey;
            const dayLabel = msgDate.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });
            
            return (
              <React.Fragment key={msg.id}>
                {showDayMarker && (
                  <div className="flex items-center justify-center py-2">
                    <span className="text-[10px] font-semibold tracking-wide text-rose-gold-300/60">
                      ♡ {dayLabel} ♡
                    </span>
                  </div>
                )}
                <div 
                id={`msg-${msg.id}`}
                className={`flex flex-col max-w-[80%] sm:max-w-[72%] ${isMe ? 'self-end ml-auto rtl:mr-auto rtl:ml-0' : 'self-start mr-auto rtl:ml-auto rtl:mr-0'}`}
              >
                {/* Reply Indicator above bubble */}
                {msg.replyToId && (
                  <div 
                    onClick={() => handleScrollToMessage(msg.replyToId!)}
                    className="flex items-center gap-1.5 text-[10px] text-neutral-400 bg-white/5 px-2.5 py-1 rounded-t-2xl border-l-2 border-rose-gold-400/70 cursor-pointer hover:text-neutral-200 transition-colors self-start truncate max-w-full -mb-1"
                  >
                    <Reply size={8} />
                    <span className="font-bold">{msg.replyToSender === currentUserRole ? (lang === 'ar' ? 'أنت' : 'You') : partnerName}:</span>
                    <span className="truncate">{msg.replyToText}</span>
                  </div>
                )}

                {/* Message Bubble Container */}
                <div className="group relative flex items-center gap-2">
                  
                  {/* Left-side option triggers for Partner */}
                  {!isMe && (
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setActiveMessageIdMenu(activeMessageIdMenu === msg.id ? null : msg.id)}
                        className="p-1.5 rounded-full hover:bg-white/10 transition-all text-neutral-500 hover:text-rose-gold-400 cursor-pointer"
                        title={lang === 'ar' ? 'تفاعلات وخيارات' : 'Reactions & Options'}
                      >
                        <Smile size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-1.5 rounded-full hover:bg-red-950/40 text-neutral-500 hover:text-red-400 transition-all cursor-pointer"
                        title={lang === 'ar' ? 'حذف الرسالة' : 'Delete message'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}

                  {/* Bubble */}
                  <div className={`p-3.5 shadow-sm transition-all relative ${
                    isMe 
                      ? 'bg-gradient-to-br from-rose-gold-500 to-rose-gold-600 text-white rounded-[24px] rounded-tr-[6px]' 
                      : 'bg-[#171013] text-neutral-100 rounded-[24px] rounded-tl-[6px] border border-white/8'
                  }`}>
                    
                    {/* Important message badge */}
                    {msg.isPinned && (
                      <span className={`inline-flex items-center gap-1 mb-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        isMe ? 'bg-white/20 text-white' : 'bg-rose-gold-500/15 text-rose-gold-300'
                      }`}>
                        ❤️ {lang === 'ar' ? 'رسالة مميزة' : 'Special message'}
                      </span>
                    )}

                    {/* If editing, show indicator */}
                    {msg.isEdited && (
                      <span className="absolute -top-1.5 right-2 bg-neutral-800 text-neutral-400 text-[8px] font-bold px-1.5 py-0.2 rounded-full uppercase scale-90">
                        {lang === 'ar' ? 'معدلة' : 'edited'}
                      </span>
                    )}

                    {/* Render Image Media */}
                    {msg.mediaType === 'image' && msg.mediaUrl && (
                      <div className="mb-2 rounded-2xl overflow-hidden max-w-xs max-h-60 border border-white/10 relative group">
                        <img 
                          src={msg.mediaUrl} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          alt="" 
                        />
                        <a 
                          href={msg.mediaUrl} 
                          download={`photo_${msg.timestamp}.png`}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white text-xs gap-1 font-bold"
                        >
                          <Eye size={12} /> {lang === 'ar' ? 'عرض وحفظ' : 'View & Save'}
                        </a>
                      </div>
                    )}

                    {/* Render Video Media */}
                    {msg.mediaType === 'video' && msg.mediaUrl && (
                      <div className="mb-2 rounded-2xl overflow-hidden max-w-xs border border-white/10">
                        <video 
                          src={msg.mediaUrl} 
                          controls 
                          playsInline
                          className="w-full max-h-60 rounded-xl"
                        />
                      </div>
                    )}

                    {/* Render Voice Media */}
                    {msg.mediaType === 'voice' && msg.mediaUrl && (
                      <div className="mb-2 flex items-center gap-2 min-w-[200px] py-1">
                        <audio 
                          src={msg.mediaUrl} 
                          controls 
                          className="w-full max-h-12 scale-90 origin-left"
                        />
                        <span className="text-[10px] font-mono font-bold whitespace-nowrap opacity-70">
                          🎙️ {msg.voiceDuration || '0:00'}
                        </span>
                      </div>
                    )}

                    {/* Render Shared Card */}
                    {msg.sharedItem && (
                      <div 
                        onClick={() => handleSharedCardClick(msg.sharedItem)}
                        className={`rounded-2xl p-3 mb-2 border transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-left rtl:text-right ${
                          isMe
                            ? 'bg-white/20 hover:bg-white/30 border-white/30 text-white'
                            : 'bg-rose-gold-500/10 hover:bg-rose-gold-500/15 border-rose-gold-500/20 text-neutral-100'
                        }`}
                      >
                        <div className="flex gap-2 items-start">
                          <span className="text-lg">
                            {msg.sharedItem.type === 'memory' && '💖'}
                            {msg.sharedItem.type === 'photo' && '📸'}
                            {msg.sharedItem.type === 'video' && '🎥'}
                            {msg.sharedItem.type === 'reel' && '🎬'}
                            {msg.sharedItem.type === 'song' && '🎵'}
                            {msg.sharedItem.type === 'daily_question' && '❓'}
                            {msg.sharedItem.type === 'quiz' && '🏆'}
                            {msg.sharedItem.type === 'achievement' && '🌟'}
                            {msg.sharedItem.type === 'envelope' && '✉️'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-[11px] uppercase tracking-wider font-mono opacity-80 font-bold mb-0.5">
                              {msg.sharedItem.type}
                            </h5>
                            <h4 className="text-xs font-bold leading-snug truncate">
                              {msg.sharedItem.title}
                            </h4>
                            {msg.sharedItem.subTitle && (
                              <p className="text-[10px] opacity-75 mt-0.5 truncate leading-relaxed">
                                {msg.sharedItem.subTitle}
                              </p>
                            )}
                          </div>
                        </div>
                        {msg.sharedItem.imageUrl && (
                          <img 
                            src={msg.sharedItem.imageUrl} 
                            referrerPolicy="no-referrer"
                            className="w-full h-20 object-cover rounded-xl mt-2 border border-white/10"
                            alt="" 
                          />
                        )}
                        <div className={`mt-2.5 flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase ${isMe ? 'text-white' : 'text-rose-gold-500'}`}>
                          <span>👉</span>
                          <span>{lang === 'ar' ? 'اضغط لعرض العنصر داخل التطبيق' : 'Click to launch inside app'}</span>
                        </div>
                      </div>
                    )}

                    {/* Message Text (If present) */}
                    {msg.text && (
                      <p className="text-xs font-medium leading-relaxed break-words whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    )}

                    {/* Reactions Display */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="absolute -bottom-2 right-2 flex gap-1 bg-[#1c1416] border border-white/10 px-1.5 py-0.5 rounded-full shadow-md scale-95 z-10">
                        {Object.entries(msg.reactions).map(([role, emoji]) => (
                          <span 
                            key={role} 
                            title={role === 'Dodo' ? 'Saeed' : 'Sohila'} 
                            className="text-[10px]"
                          >
                            {emoji}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Time & Send Badge */}
                    <div className={`text-[8px] mt-1.5 text-right font-semibold font-mono tracking-wider ${isMe ? 'text-white/70' : 'text-[#8E7D83]'}`}>
                      {formatTimeAgo(msg.timestamp, lang)}
                    </div>
                  </div>

                  {/* Right-side option triggers for Me */}
                  {isMe && (
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-1.5 rounded-full hover:bg-red-950/40 text-neutral-500 hover:text-red-400 transition-all cursor-pointer"
                        title={lang === 'ar' ? 'حذف الرسالة' : 'Delete message'}
                      >
                        <Trash2 size={14} />
                      </button>
                      <button 
                        onClick={() => setActiveMessageIdMenu(activeMessageIdMenu === msg.id ? null : msg.id)}
                        className="p-1.5 rounded-full hover:bg-white/10 transition-all text-neutral-500 hover:text-rose-gold-400 cursor-pointer"
                        title={lang === 'ar' ? 'تفاعلات وخيارات' : 'Reactions & Options'}
                      >
                        <Smile size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* POPUP OPTIONS MENU FOR INDIVIDUAL MESSAGES */}
                {activeMessageIdMenu === msg.id && (
                  <div className={`mt-1 bg-[#171013] border border-white/10 rounded-3xl p-2.5 shadow-lg flex flex-col gap-1.5 z-20 min-w-[160px] animate-fade-in ${
                    isMe ? 'self-end ml-auto' : 'self-start mr-auto'
                  }`}>
                    
                    {/* Reactions Bar inside menu */}
                    <div className="flex justify-between items-center border-b border-white/10 pb-1.5 mb-1.5 gap-1">
                      {EMOJI_PRESETS.map(emoji => {
                        const hasReacted = msg.reactions?.[currentUserRole] === emoji;
                        return (
                          <button 
                            key={emoji}
                            onClick={() => handleReactToMessage(msg.id, hasReacted ? null : emoji)}
                            className={`p-1.5 text-sm rounded-full transition-all transform hover:scale-125 hover:bg-white/10 ${
                              hasReacted ? 'bg-rose-gold-500/20 border border-rose-gold-400' : ''
                            }`}
                          >
                            {emoji}
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold">
                      {/* Reply Button */}
                      <button 
                        onClick={() => {
                          setReplyingTo(msg);
                          setActiveMessageIdMenu(null);
                        }}
                        className="flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-white/10 text-neutral-300 transition-colors"
                      >
                        <Reply size={12} />
                        <span>{lang === 'ar' ? 'رد' : 'Reply'}</span>
                      </button>

                      {/* Save to Memory */}
                      {(msg.text || msg.mediaUrl) && (
                        <button 
                          onClick={() => handleSaveToMemory(msg)}
                          className="flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-white/10 text-rose-gold-400 transition-colors"
                        >
                          <Star size={12} fill="currentColor" />
                          <span>{lang === 'ar' ? 'حفظ كذكرى' : 'Save memory'}</span>
                        </button>
                      )}

                      {/* Pin/Unpin */}
                      <button 
                        onClick={() => handleTogglePinMessage(msg)}
                        className="flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-white/10 text-neutral-300 transition-colors"
                      >
                        <Pin size={12} className="rotate-45" />
                        <span>{msg.isPinned ? (lang === 'ar' ? 'إلغاء التثبيت' : 'Unpin') : (lang === 'ar' ? 'تثبيت' : 'Pin')}</span>
                      </button>

                      {/* Edit (Me Only, Text Only) */}
                      {isMe && msg.text && !msg.mediaUrl && !msg.sharedItem && (
                        <button 
                          onClick={() => {
                            setEditingMsg(msg);
                            setInputText(msg.text || '');
                            setActiveMessageIdMenu(null);
                          }}
                          className="flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-white/10 text-neutral-300 transition-colors"
                        >
                          <Edit2 size={12} />
                          <span>{lang === 'ar' ? 'تعديل' : 'Edit'}</span>
                        </button>
                      )}

                      {/* Delete Message Button */}
                      <button 
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-red-950/20 text-red-400 transition-colors col-span-2 font-bold"
                      >
                        <Trash2 size={12} />
                        <span>{lang === 'ar' ? 'حذف الرسالة 🗑️' : 'Delete Message 🗑️'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              </React.Fragment>
            );
          });
          })()
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* CHAT BOTTOM INPUT */}
      <div className="p-3 border-t border-white/5 bg-[rgba(20,12,15,0.82)] backdrop-blur-md z-10 shrink-0">
        
        {/* Reply Preview Banner inside Input area */}
        {replyingTo && (
          <div className="flex justify-between items-center bg-white/5 rounded-2xl px-3 py-1.5 mb-2 border-l-4 border-rose-gold-400/70 text-xs text-neutral-300 animate-fade-in font-medium">
            <div className="truncate pr-4 flex items-center gap-1.5">
              <Reply size={10} />
              <span>{lang === 'ar' ? 'الرد على' : 'Replying to'}</span>
              <span className="font-bold">{replyingTo.sender === currentUserRole ? (lang === 'ar' ? 'نفسك' : 'yourself') : partnerName}:</span>
              <span className="truncate italic opacity-80">
                {replyingTo.text || `[${replyingTo.mediaType || 'Card'}]`}
              </span>
            </div>
            <button onClick={() => setReplyingTo(null)} className="text-neutral-500 hover:text-neutral-300">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Edit Preview Banner */}
        {editingMsg && (
          <div className="flex justify-between items-center bg-rose-gold-500/10 rounded-2xl px-3 py-1.5 mb-2 border-l-4 border-rose-gold-500 text-xs text-rose-gold-300 animate-fade-in font-medium">
            <div className="truncate pr-4 flex items-center gap-1.5">
              <Edit2 size={10} />
              <span>{lang === 'ar' ? 'تعديل رسالتك:' : 'Editing your message:'}</span>
              <span className="truncate italic opacity-80">{editingMsg.text}</span>
            </div>
            <button 
              onClick={() => {
                setEditingMsg(null);
                setInputText('');
              }} 
              className="text-neutral-500 hover:text-neutral-300"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* INPUT ACTIONS LAYER */}
        <div className="flex items-center gap-2">
          
          {/* Share Item Button */}
          <button 
            type="button"
            onClick={() => {
              setShowSharePicker(!showSharePicker);
              setShowEmojiPicker(false);
            }}
            className={`p-2.5 rounded-full transition-all border ${
              showSharePicker 
                ? 'bg-rose-gold-500 text-white border-rose-gold-500' 
                : 'bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10'
            }`}
            title={lang === 'ar' ? 'مشاركة بطاقة 💌' : 'Share card 💌'}
          >
            <Share2 size={16} />
          </button>

          {/* Emoji Preset Shortcut Trigger */}
          <button 
            type="button"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowSharePicker(false);
            }}
            className={`p-2.5 rounded-full transition-all border ${
              showEmojiPicker 
                ? 'bg-rose-gold-500 text-white border-rose-gold-500' 
                : 'bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10'
            }`}
            title={lang === 'ar' ? 'رموز تعبيرية 🌸' : 'Emoji picker 🌸'}
          >
            <Smile size={16} />
          </button>

          {/* Text Input Container / Voice recording controls */}
          <div className="flex-1 relative flex items-center">
            {isRecording ? (
              // Voice Recording wave and timer
              <div className="flex-1 flex items-center justify-between px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-xs animate-pulse font-bold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
                  <span>
                    {lang === 'ar' ? 'جاري تسجيل رسالتك...' : 'Recording your voice...'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono">{`0:${recordingSeconds < 10 ? '0' : ''}${recordingSeconds}`}</span>
                  <button 
                    onClick={() => stopRecording(true)} 
                    className="p-1 hover:bg-red-500/20 rounded-full text-red-500"
                    title={lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  >
                    <X size={14} />
                  </button>
                  <button 
                    onClick={() => stopRecording(false)} 
                    className="p-1 hover:bg-emerald-500/20 rounded-full text-emerald-500"
                    title={lang === 'ar' ? 'إرسال' : 'Send'}
                  >
                    <Check size={14} />
                  </button>
                </div>
              </div>
            ) : (
              // Standard text input
              <input 
                type="text"
                placeholder={lang === 'ar' ? 'اكتب رسالة حب...' : 'Write a sweet message...'}
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendText();
                }}
                className="w-full text-xs py-2 px-4 rounded-full bg-white/5 border border-white/10 focus:outline-none focus:border-rose-gold-400/60 font-medium text-neutral-100 placeholder:text-neutral-500"
              />
            )}
          </div>

          {/* Media Attachments Menu & Voice Record Trigger */}
          {!isRecording && !inputText.trim() && (
            <div className="flex items-center gap-1.5 shrink-0">
              
              {/* Voice Record Mic Trigger */}
              <button 
                type="button"
                onClick={startRecording}
                className="p-2.5 rounded-full bg-white/5 text-neutral-300 border border-white/10 hover:bg-white/10 transition-colors"
                title={lang === 'ar' ? 'تسجيل رسالة صوتية 🎙️' : 'Record voice 🎙️'}
              >
                <Mic size={16} />
              </button>

              {/* Photo Upload Hidden Input */}
              <label className="p-2.5 rounded-full bg-white/5 text-neutral-300 border border-white/10 hover:bg-white/10 cursor-pointer transition-colors">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileSelect(e, 'image')}
                  className="hidden" 
                />
                <ImageIcon size={16} />
              </label>

              {/* Video Upload Hidden Input */}
              <label className="p-2.5 rounded-full bg-white/5 text-neutral-300 border border-white/10 hover:bg-white/10 cursor-pointer transition-colors">
                <input 
                  type="file" 
                  accept="video/*" 
                  onChange={(e) => handleFileSelect(e, 'video')}
                  className="hidden" 
                />
                <Video size={16} />
              </label>
            </div>
          )}

          {/* Send Action Trigger */}
          {(inputText.trim() || editingMsg) && !isRecording && (
            <button 
              onClick={handleSendText}
              className="p-2.5 rounded-full bg-gradient-to-br from-rose-gold-500 to-rose-gold-600 text-white hover:from-rose-gold-600 hover:to-rose-gold-700 transition-all shadow-md active:scale-95"
              title={lang === 'ar' ? 'إرسال ⚡' : 'Send ⚡'}
            >
              <Send size={16} />
            </button>
          )}

        </div>

        {/* CHAT EMOJI SHORTCUT PICKER DRAWER */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="mt-3 p-3 bg-[#171013]/95 border border-white/10 rounded-3xl flex justify-between items-center gap-1.5 flex-wrap max-w-full"
            >
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider pl-1.5">{lang === 'ar' ? 'سريعة:' : 'Quick:'}</span>
              {EMOJI_PRESETS.map(emoji => (
                <button 
                  key={emoji}
                  onClick={() => {
                    setInputText(prev => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="p-1.5 text-base rounded-full hover:bg-white/10 transition-all transform hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* DEEP INTEGRATION CARDS SHARE SELECTION DRAWER */}
        <AnimatePresence>
          {showSharePicker && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-3 p-4 bg-[#171013] border border-white/10 rounded-[28px] max-h-72 overflow-y-auto flex flex-col gap-3 relative shadow-inner"
            >
              {/* Category tabs inside card selector */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 border-b border-white/10 select-none shrink-0 scrollbar-none text-[10px] font-bold uppercase tracking-wide">
                {[
                  { key: 'memories', label: lang === 'ar' ? 'ذكرياتنا' : 'Memories', icon: '💖' },
                  { key: 'photos', label: lang === 'ar' ? 'الصور' : 'Photos', icon: '📸' },
                  { key: 'videos', label: lang === 'ar' ? 'الريلز' : 'Reels', icon: '🎬' },
                  { key: 'songs', label: lang === 'ar' ? 'الأغاني' : 'Songs', icon: '🎵' },
                  { key: 'questions', label: lang === 'ar' ? 'الأسئلة' : 'Questions', icon: '❓' },
                  { key: 'envelopes', label: lang === 'ar' ? 'الخطابات' : 'Letters', icon: '✉️' },
                  { key: 'achievements', label: lang === 'ar' ? 'الأوسمة' : 'Trophies', icon: '🏆' }
                ].map(cat => (
                  <button 
                    key={cat.key}
                    onClick={() => setShareCategory(cat.key as any)}
                    className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full border transition-all shrink-0 ${
                      shareCategory === cat.key 
                        ? 'bg-rose-gold-500 text-white border-rose-gold-500 shadow-sm' 
                        : 'bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Share Category Items list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto">
                {/* 1. Memories */}
                {shareCategory === 'memories' && DataStore.getMemories().map((item, idx) => (
                  <button 
                    key={`sh-mem-${item.id || idx}-${idx}`}
                    onClick={() => handleShareItem('memory', item.id, item.title, item.content.substring(0, 50) + '...', item.imageUrl)}
                    className="flex text-start gap-2.5 p-2 rounded-2xl bg-white/5 hover:bg-rose-gold-500/10 border border-white/10 transition-all font-medium text-xs leading-normal"
                  >
                    {item.imageUrl && (
                      <img src={item.imageUrl} referrerPolicy="no-referrer" className="w-10 h-10 rounded-xl object-cover shrink-0" alt="" />
                    )}
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-neutral-50 truncate">{item.title}</h4>
                      <p className="text-[10px] text-neutral-400 truncate mt-0.5">{item.content}</p>
                    </div>
                  </button>
                ))}

                {/* 2. Photos */}
                {shareCategory === 'photos' && DataStore.getGallery().map((item, idx) => (
                  <button 
                    key={`sh-pho-${item.id || idx}-${idx}`}
                    onClick={() => handleShareItem('photo', item.id, item.caption || (lang === 'ar' ? 'صورة رومانسية لنا 📸' : 'Romantic Photo 📸'), item.date, item.url)}
                    className="flex text-start gap-2.5 p-2 rounded-2xl bg-white/5 hover:bg-rose-gold-500/10 border border-white/10 transition-all font-medium text-xs leading-normal"
                  >
                    <img src={item.url} referrerPolicy="no-referrer" className="w-10 h-10 rounded-xl object-cover shrink-0" alt="" />
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-neutral-50 truncate">
                        {item.caption || (lang === 'ar' ? 'صورة للذكرى' : 'Gallery Photo')}
                      </h4>
                      <p className="text-[10px] text-neutral-400 truncate mt-0.5">{item.date}</p>
                    </div>
                  </button>
                ))}

                {/* 3. Videos */}
                {shareCategory === 'videos' && DataStore.getVideos().map((item, idx) => (
                  <button 
                    key={`sh-vid-${item.id || idx}-${idx}`}
                    onClick={() => handleShareItem('reel', item.id, item.title || (lang === 'ar' ? 'فيديو ريل مميز 📽️' : 'Video Reel 📽️'), item.date)}
                    className="flex text-start gap-2.5 p-2 rounded-2xl bg-white/5 hover:bg-rose-gold-500/10 border border-white/10 transition-all font-medium text-xs leading-normal"
                  >
                    <span className="text-xl p-2 bg-white/10 rounded-xl shrink-0">🎬</span>
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-neutral-50 truncate">
                        {item.title || (lang === 'ar' ? 'ريل حب' : 'Love Reel')}
                      </h4>
                      <p className="text-[10px] text-neutral-400 truncate mt-0.5">{item.date}</p>
                    </div>
                  </button>
                ))}

                {/* 4. Songs */}
                {shareCategory === 'songs' && DataStore.getSongs().map((item, idx) => (
                  <button 
                    key={`sh-sng-${item.id || idx}-${idx}`}
                    onClick={() => handleShareItem('song', item.id, item.title, item.artist, item.coverUrl)}
                    className="flex text-start gap-2.5 p-2 rounded-2xl bg-white/5 hover:bg-rose-gold-500/10 border border-white/10 transition-all font-medium text-xs leading-normal"
                  >
                    {item.coverUrl ? (
                      <img src={item.coverUrl} referrerPolicy="no-referrer" className="w-10 h-10 rounded-xl object-cover shrink-0" alt="" />
                    ) : (
                      <span className="text-xl p-2 bg-white/10 rounded-xl shrink-0">🎵</span>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-neutral-50 truncate">{item.title}</h4>
                      <p className="text-[10px] text-neutral-400 truncate mt-0.5">{item.artist}</p>
                    </div>
                  </button>
                ))}

                {/* 5. Questions */}
                {shareCategory === 'questions' && DataStore.getDailyQuestions().map((item, idx) => (
                  <button 
                    key={`sh-dq-${item.id || idx}-${idx}`}
                    onClick={() => handleShareItem('daily_question', item.id, lang === 'ar' ? item.questionAr : item.questionEn, item.dateStr)}
                    className="flex text-start gap-2.5 p-2 rounded-2xl bg-white/5 hover:bg-rose-gold-500/10 border border-white/10 transition-all font-medium text-xs leading-normal"
                  >
                    <span className="text-xl p-2 bg-white/10 rounded-xl shrink-0">❓</span>
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-neutral-50 truncate">
                        {lang === 'ar' ? item.questionAr : item.questionEn}
                      </h4>
                      <p className="text-[10px] text-neutral-400 truncate mt-0.5">{item.dateStr}</p>
                    </div>
                  </button>
                ))}

                {/* 6. Envelopes */}
                {shareCategory === 'envelopes' && DataStore.getEnvelopes().map((item, idx) => (
                  <button 
                    key={`sh-env-${item.id || idx}-${idx}`}
                    onClick={() => handleShareItem('envelope', item.id, lang === 'ar' ? item.titleAr : item.titleEn, lang === 'ar' ? 'خطاب افتح عندما...' : 'Open when letter')}
                    className="flex text-start gap-2.5 p-2 rounded-2xl bg-white/5 hover:bg-rose-gold-500/10 border border-white/10 transition-all font-medium text-xs leading-normal"
                  >
                    <span className="text-xl p-2 bg-white/10 rounded-xl shrink-0">{item.emoji || '✉️'}</span>
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-neutral-50 truncate">
                        {lang === 'ar' ? item.titleAr : item.titleEn}
                      </h4>
                      <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                        {lang === 'ar' ? 'افتح عندما...' : 'Open When Letter'}
                      </p>
                    </div>
                  </button>
                ))}

                {/* 7. Achievements */}
                {shareCategory === 'achievements' && [
                  { id: 'ach-first-buzz', titleAr: 'نبضة حب متبادلة ⚡', titleEn: 'First Love Connection ⚡', desc: 'Love heartbeat sent' },
                  { id: 'ach-sticky-note', titleAr: 'ورقة لاصقة ملونة 📌', titleEn: 'Beautiful Love Note 📌', desc: 'Note pinned to wall' },
                  { id: 'ach-love-quiz', titleAr: 'اختبار الحب المتكامل 🏆', titleEn: 'Love Quiz Conquerors 🏆', desc: 'Love quiz complete' },
                  { id: 'ach-daily-question', titleAr: 'سؤال اليوم المشترك ❓', titleEn: 'Shared Question ❓', desc: 'Daily question answer' }
                ].map(item => (
                  <button 
                    key={item.id}
                    onClick={() => handleShareItem('achievement', item.id, lang === 'ar' ? item.titleAr : item.titleEn, item.desc)}
                    className="flex text-start gap-2.5 p-2 rounded-2xl bg-white/5 hover:bg-rose-gold-500/10 border border-white/10 transition-all font-medium text-xs leading-normal"
                  >
                    <span className="text-xl p-2 bg-white/10 rounded-xl shrink-0">⭐</span>
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-neutral-50 truncate">
                        {lang === 'ar' ? item.titleAr : item.titleEn}
                      </h4>
                      <p className="text-[10px] text-neutral-400 truncate mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}

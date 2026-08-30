import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, X, ArrowRight, ArrowLeft, Star, Trash2, Edit2, Image as ImageIcon,
  Mic, FileText, Upload, Check, ChevronUp, ChevronDown, Search, MessageCircle,
  Calendar, Save, AlertCircle
} from 'lucide-react';
import { Language, UserRole, ChatMemoryConversation, ChatMemoryMessage } from '../types';
import { DataStore } from '../dataStore';

interface ChatMemoriesSectionProps {
  lang: Language;
  currentUserRole: UserRole;
  liveState: any;
  onDataChanged: () => void;
}

type ViewMode = 'list' | 'create' | 'detail';
type CreateStep = 'meta' | 'method' | 'manual' | 'import-paste' | 'import-review';

interface DraftMessage {
  tempId: string;
  sender: 'Dodo' | 'SO';
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'voice' | 'video';
  voiceDuration?: string;
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:MM (24h)
  isImportant: boolean;
}

const uid = () => Date.now() + '-' + Math.random().toString(36).substr(2, 6);

const todayStr = () => new Date().toISOString().split('T')[0];
const nowTimeStr = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

function makeEmptyDraft(defaultSender: 'Dodo' | 'SO', dateStr: string): DraftMessage {
  return {
    tempId: uid(),
    sender: defaultSender,
    text: '',
    dateStr: dateStr || todayStr(),
    timeStr: nowTimeStr(),
    isImportant: false
  };
}

// --- WhatsApp export text parser ---
// Handles the common export formats:
//   [20/8/2026, 10:42 PM] Saeed: message text
//   20/8/2026, 10:42 PM - Saeed: message text
//   [20/8/2026, 22:42:10] Saeed: message text
// Multi-line messages (continuation lines with no leading timestamp) are appended
// to the previous message.
interface ParsedRawMessage {
  rawSender: string;
  timestamp: number;
  dateStr: string;
  timeStr: string;
  text: string;
}

function parseWhatsAppExport(raw: string): { messages: ParsedRawMessage[]; senderNames: string[] } {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');

  // Matches both "[date, time] Name:" and "date, time - Name:" styles
  const lineRegex = /^[\[\u200e]*\s*(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp]\.?[Mm]\.?)?\s*\]?\s*[-–]?\s*([^:]{1,60}):\s*([\s\S]*)$/;

  const messages: ParsedRawMessage[] = [];
  const senderSet = new Set<string>();

  lines.forEach((line) => {
    const cleaned = line.replace(/\u200e|\u200f/g, '').trim();
    if (!cleaned) return;

    const match = cleaned.match(lineRegex);
    if (match) {
      const [, d1, d2, yRaw, hRaw, min, sec, ampm, senderRaw, textRaw] = match;

      let year = parseInt(yRaw, 10);
      if (year < 100) year += 2000;

      // WhatsApp exports are day/month by default in most locales (as in the user's example)
      const day = parseInt(d1, 10);
      const month = parseInt(d2, 10);

      let hour = parseInt(hRaw, 10);
      const minute = parseInt(min, 10);
      const second = sec ? parseInt(sec, 10) : 0;

      if (ampm) {
        const isPM = /p/i.test(ampm);
        if (isPM && hour < 12) hour += 12;
        if (!isPM && hour === 12) hour = 0;
      }

      const dateObj = new Date(year, month - 1, day, hour, minute, second);
      const sender = senderRaw.trim();
      senderSet.add(sender);

      messages.push({
        rawSender: sender,
        timestamp: dateObj.getTime(),
        dateStr: `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`,
        timeStr: `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`,
        text: (textRaw || '').trim()
      });
    } else if (messages.length > 0) {
      // Continuation of the previous message (multi-line message body)
      messages[messages.length - 1].text += '\n' + cleaned;
    }
  });

  return { messages, senderNames: Array.from(senderSet) };
}

export default function ChatMemoriesSection({
  lang,
  currentUserRole,
  liveState,
  onDataChanged
}: ChatMemoriesSectionProps) {
  const [conversations, setConversations] = useState<ChatMemoryConversation[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // --- Create flow state ---
  const [createStep, setCreateStep] = useState<CreateStep>('meta');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDate, setDraftDate] = useState(todayStr());
  const [draftCover, setDraftCover] = useState<string | undefined>(undefined);
  const [draftMessages, setDraftMessages] = useState<DraftMessage[]>([]);

  // Import sub-flow
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [parsedRaw, setParsedRaw] = useState<ParsedRawMessage[]>([]);
  const [senderMap, setSenderMap] = useState<{ [rawName: string]: 'Dodo' | 'SO' }>({});
  const [reviewMessages, setReviewMessages] = useState<DraftMessage[]>([]);

  // --- Edit conversation meta modal (title/date/cover) ---
  const [editMetaConv, setEditMetaConv] = useState<ChatMemoryConversation | null>(null);
  const [editMetaTitle, setEditMetaTitle] = useState('');
  const [editMetaDate, setEditMetaDate] = useState('');
  const [editMetaCover, setEditMetaCover] = useState<string | undefined>(undefined);

  // --- Detail view state ---
  const [showImportantOnly, setShowImportantOnly] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageDraft, setEditingMessageDraft] = useState<DraftMessage | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerDraft, setComposerDraft] = useState<DraftMessage>(makeEmptyDraft(currentUserRole, todayStr()));

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);
  const nameOf = (role: 'Dodo' | 'SO') => (role === 'Dodo' ? t('سعيد', 'Saeed') : t('سهيلة', 'Sohila'));

  useEffect(() => {
    if (liveState && liveState.chatMemories) {
      setConversations(liveState.chatMemories);
    } else {
      setConversations(DataStore.getChatMemories());
    }
  }, [liveState]);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) || null,
    [conversations, selectedId]
  );

  // ---------- Helpers ----------
  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const draftToMessage = (d: DraftMessage, order: number): ChatMemoryMessage => {
    const [h, m] = d.timeStr.split(':').map((x) => parseInt(x, 10) || 0);
    const [y, mo, da] = d.dateStr.split('-').map((x) => parseInt(x, 10));
    const ts = new Date(y || new Date().getFullYear(), (mo || 1) - 1, da || 1, h || 0, m || 0).getTime();
    return {
      id: 'chatmemmsg-' + uid(),
      sender: d.sender,
      text: d.text?.trim() || undefined,
      mediaUrl: d.mediaUrl,
      mediaType: d.mediaType,
      voiceDuration: d.voiceDuration,
      timestamp: ts,
      isImportant: d.isImportant,
      order
    };
  };

  const resetCreateFlow = () => {
    setCreateStep('meta');
    setDraftTitle('');
    setDraftDate(todayStr());
    setDraftCover(undefined);
    setDraftMessages([]);
    setImportText('');
    setImportError('');
    setParsedRaw([]);
    setSenderMap({});
    setReviewMessages([]);
  };

  const openCreateFlow = () => {
    resetCreateFlow();
    setViewMode('create');
  };

  const cancelCreateFlow = () => {
    resetCreateFlow();
    setViewMode('list');
  };

  const openConversation = (id: string) => {
    setSelectedId(id);
    setShowImportantOnly(false);
    setEditingMessageId(null);
    setComposerOpen(false);
    setViewMode('detail');
  };

  const backToList = () => {
    setViewMode('list');
    setSelectedId(null);
  };

  const openEditMeta = (conv: ChatMemoryConversation) => {
    setEditMetaConv(conv);
    setEditMetaTitle(conv.title);
    setEditMetaDate(conv.date);
    setEditMetaCover(conv.coverImageUrl);
  };

  const saveEditMeta = () => {
    if (!editMetaConv) return;
    DataStore.updateChatMemoryConversation(editMetaConv.id, {
      title: draftTitleOrFallback(editMetaTitle),
      date: editMetaDate || todayStr(),
      coverImageUrl: editMetaCover
    });
    setEditMetaConv(null);
    onDataChanged();
  };

  const draftTitleOrFallback = (v: string) => (v.trim() ? v.trim() : t('محادثة بدون عنوان', 'Untitled conversation'));

  const handleDeleteConversation = (conv: ChatMemoryConversation) => {
    const confirmMsg = t(
      `هل أنت متأكد من حذف محادثة "${conv.title}"؟ لا يمكن التراجع عن هذا.`,
      `Are you sure you want to delete "${conv.title}"? This cannot be undone.`
    );
    if (!confirm(confirmMsg)) return;
    DataStore.deleteChatMemoryConversation(conv.id);
    if (selectedId === conv.id) backToList();
    onDataChanged();
  };

  const conversationCover = (conv: ChatMemoryConversation): string | undefined => {
    if (conv.coverImageUrl) return conv.coverImageUrl;
    const firstImg = conv.messages.find((m) => m.mediaType === 'image' && m.mediaUrl);
    return firstImg?.mediaUrl;
  };

  const formatDateLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    } catch (e) {}
    return dateStr;
  };

  // ---------- Manual entry (create flow) handlers ----------
  const addDraftRow = () => {
    const lastSender = draftMessages.length > 0 ? draftMessages[draftMessages.length - 1].sender : currentUserRole;
    const nextSender: 'Dodo' | 'SO' = lastSender === 'Dodo' ? 'SO' : 'Dodo';
    setDraftMessages((prev) => [...prev, makeEmptyDraft(nextSender, draftDate)]);
  };

  const updateDraftRow = (tempId: string, updates: Partial<DraftMessage>) => {
    setDraftMessages((prev) => prev.map((d) => (d.tempId === tempId ? { ...d, ...updates } : d)));
  };

  const removeDraftRow = (tempId: string) => {
    setDraftMessages((prev) => prev.filter((d) => d.tempId !== tempId));
  };

  const moveDraftRow = (tempId: string, dir: -1 | 1) => {
    setDraftMessages((prev) => {
      const idx = prev.findIndex((d) => d.tempId === tempId);
      const newIdx = idx + dir;
      if (idx < 0 || newIdx < 0 || newIdx >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
  };

  const handleDraftImageSelect = async (tempId: string, file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      alert(t('حجم الصورة كبير جداً (الحد الأقصى 8 ميجا).', 'Image is too large (8MB max).'));
      return;
    }
    const b64 = await readFileAsBase64(file);
    updateDraftRow(tempId, { mediaUrl: b64, mediaType: 'image' });
  };

  const handleDraftVoiceSelect = async (tempId: string, file: File) => {
    if (file.size > 15 * 1024 * 1024) {
      alert(t('حجم الملف الصوتي كبير جداً (الحد الأقصى 15 ميجا).', 'Audio file is too large (15MB max).'));
      return;
    }
    const b64 = await readFileAsBase64(file);
    // Try to read duration from the audio file itself
    const audioEl = document.createElement('audio');
    audioEl.src = b64;
    audioEl.addEventListener('loadedmetadata', () => {
      if (isFinite(audioEl.duration)) {
        const mins = Math.floor(audioEl.duration / 60);
        const secs = Math.floor(audioEl.duration % 60);
        updateDraftRow(tempId, { voiceDuration: `${mins}:${secs < 10 ? '0' : ''}${secs}` });
      }
    });
    updateDraftRow(tempId, { mediaUrl: b64, mediaType: 'voice' });
  };

  const finalizeManualSave = () => {
    if (!draftMessages.length) return;
    const finalTitle = draftTitleOrFallback(draftTitle);
    const messages = draftMessages
      .slice()
      .sort((a, b) => {
        const ta = new Date(`${a.dateStr}T${a.timeStr}`).getTime();
        const tb = new Date(`${b.dateStr}T${b.timeStr}`).getTime();
        return ta - tb;
      })
      .map((d, idx) => draftToMessage(d, idx));
    DataStore.createChatMemoryConversation(finalTitle, draftDate, messages, draftCover);
    onDataChanged();
    resetCreateFlow();
    setViewMode('list');
  };

  // ---------- WhatsApp import handlers ----------
  const handleImportFileSelect = async (file: File) => {
    const text = await file.text();
    setImportText(text);
  };

  const runParse = () => {
    setImportError('');
    if (!importText.trim()) {
      setImportError(t('الصق نص المحادثة أولاً أو ارفع ملف TXT.', 'Paste the conversation text first or upload a TXT file.'));
      return;
    }
    const { messages, senderNames } = parseWhatsAppExport(importText);
    if (messages.length === 0) {
      setImportError(
        t(
          'لم يتم التعرف على أي رسائل في النص. تأكد إنه نص Export حقيقي من واتساب.',
          'No messages were recognized in this text. Make sure it is a real WhatsApp export.'
        )
      );
      return;
    }
    setParsedRaw(messages);
    const initialMap: { [rawName: string]: 'Dodo' | 'SO' } = {};
    senderNames.forEach((name, idx) => {
      initialMap[name] = idx === 0 ? currentUserRole : (currentUserRole === 'Dodo' ? 'SO' : 'Dodo');
    });
    setSenderMap(initialMap);
    setCreateStep('import-review');
  };

  // Recompute review messages whenever the sender mapping or parsed data changes
  useEffect(() => {
    if (createStep !== 'import-review') return;
    const mapped: DraftMessage[] = parsedRaw.map((p) => ({
      tempId: 'imp-' + p.timestamp + '-' + Math.random().toString(36).substr(2, 4),
      sender: senderMap[p.rawSender] || currentUserRole,
      text: p.text,
      dateStr: p.dateStr,
      timeStr: p.timeStr,
      isImportant: false
    }));
    setReviewMessages(mapped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedRaw, senderMap, createStep]);

  const detectedSenderNames = useMemo(() => Array.from(new Set(parsedRaw.map((p) => p.rawSender))), [parsedRaw]);

  const finalizeImportSave = () => {
    if (!reviewMessages.length) return;
    const finalTitle = draftTitleOrFallback(draftTitle);
    const messages = reviewMessages.map((d, idx) => draftToMessage(d, idx));
    DataStore.createChatMemoryConversation(finalTitle, draftDate, messages, draftCover);
    onDataChanged();
    resetCreateFlow();
    setViewMode('list');
  };

  // ---------- Detail view: message-level handlers ----------
  const toggleImportant = (msgId: string) => {
    if (!selectedConversation) return;
    DataStore.toggleChatMemoryMessageImportant(selectedConversation.id, msgId);
    onDataChanged();
  };

  const deleteMessage = (msgId: string) => {
    if (!selectedConversation) return;
    if (!confirm(t('حذف هذه الرسالة؟', 'Delete this message?'))) return;
    DataStore.deleteChatMemoryMessage(selectedConversation.id, msgId);
    onDataChanged();
  };

  const startEditMessage = (msg: ChatMemoryMessage) => {
    const d = new Date(msg.timestamp);
    setEditingMessageId(msg.id);
    setEditingMessageDraft({
      tempId: msg.id,
      sender: msg.sender,
      text: msg.text || '',
      mediaUrl: msg.mediaUrl,
      mediaType: msg.mediaType as any,
      voiceDuration: msg.voiceDuration,
      dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      timeStr: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
      isImportant: !!msg.isImportant
    });
  };

  const saveEditMessage = () => {
    if (!selectedConversation || !editingMessageDraft) return;
    const [h, m] = editingMessageDraft.timeStr.split(':').map((x) => parseInt(x, 10) || 0);
    const [y, mo, da] = editingMessageDraft.dateStr.split('-').map((x) => parseInt(x, 10));
    const ts = new Date(y, (mo || 1) - 1, da || 1, h || 0, m || 0).getTime();
    DataStore.updateChatMemoryMessage(selectedConversation.id, editingMessageDraft.tempId, {
      sender: editingMessageDraft.sender,
      text: editingMessageDraft.text?.trim() || undefined,
      mediaUrl: editingMessageDraft.mediaUrl,
      mediaType: editingMessageDraft.mediaType,
      voiceDuration: editingMessageDraft.voiceDuration,
      timestamp: ts,
      isImportant: editingMessageDraft.isImportant
    });
    setEditingMessageId(null);
    setEditingMessageDraft(null);
    onDataChanged();
  };

  const moveMessage = (msgId: string, dir: -1 | 1) => {
    if (!selectedConversation) return;
    const ordered = [...selectedConversation.messages].sort((a, b) => a.order - b.order);
    const idx = ordered.findIndex((m) => m.id === msgId);
    const newIdx = idx + dir;
    if (idx < 0 || newIdx < 0 || newIdx >= ordered.length) return;
    [ordered[idx], ordered[newIdx]] = [ordered[newIdx], ordered[idx]];
    DataStore.reorderChatMemoryMessages(selectedConversation.id, ordered.map((m) => m.id));
    onDataChanged();
  };

  const submitComposer = () => {
    if (!selectedConversation) return;
    if (!composerDraft.text.trim() && !composerDraft.mediaUrl) return;
    const newMsg = draftToMessage(composerDraft, 0); // order gets recalculated inside addMessagesToChatMemory
    DataStore.addMessagesToChatMemory(selectedConversation.id, [newMsg]);
    onDataChanged();
    setComposerDraft(makeEmptyDraft(currentUserRole, todayStr()));
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleScrollToMessage = (id: string) => {
    setShowImportantOnly(false);
    setTimeout(() => {
      const el = document.getElementById(`chatmem-msg-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('highlight-pulse');
        setTimeout(() => el.classList.remove('highlight-pulse'), 2000);
      }
    }, 150);
  };

  // ---------- Derived data for render ----------
  const [listSearch, setListSearch] = useState('');
  const filteredConversations = conversations
    .filter((c) => !listSearch || c.title.toLowerCase().includes(listSearch.toLowerCase()))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const detailMessagesSorted = useMemo(() => {
    if (!selectedConversation) return [];
    return [...selectedConversation.messages].sort((a, b) => a.order - b.order);
  }, [selectedConversation]);

  const importantMessages = useMemo(
    () => detailMessagesSorted.filter((m) => m.isImportant),
    [detailMessagesSorted]
  );

  const groupedByDay = useMemo(() => {
    const groups: { dateKey: string; msgs: ChatMemoryMessage[] }[] = [];
    detailMessagesSorted.forEach((m) => {
      const d = new Date(m.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const last = groups[groups.length - 1];
      if (last && last.dateKey === key) {
        last.msgs.push(m);
      } else {
        groups.push({ dateKey: key, msgs: [m] });
      }
    });
    return groups;
  }, [detailMessagesSorted]);

  useEffect(() => {
    if (viewMode === 'detail') {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }), 50);
    }
  }, [viewMode, selectedId]);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="animate-fade-in">
      {/* ===================== LIST VIEW ===================== */}
      {viewMode === 'list' && (
        <div className="space-y-8 py-2">
          <div className="text-center mb-4 relative">
            <h3 className="font-serif text-3xl font-bold text-neutral-950 dark:text-neutral-50 mb-2">
              {t('محادثاتنا المهمة', 'Our Important Chats')} 💬
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-2 max-w-md mx-auto leading-relaxed">
              {t(
                'احفظوا أجزاء من محادثاتكم المهمة على واتساب وشوفوها بتصميم شبيه بالأصلي 💌',
                'Save important parts of your WhatsApp chats and revisit them in a familiar chat view 💌'
              )}
            </p>
            <div className="mt-5 flex justify-center gap-3 flex-wrap">
              <button
                onClick={openCreateFlow}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-gold-500 to-pink-500 hover:from-rose-gold-600 hover:to-pink-600 text-white font-bold text-xs flex items-center gap-2 shadow-md hover:scale-105 transition-all cursor-pointer"
              >
                <Plus size={16} />
                <span>{t('إضافة محادثة مهمة', 'Add Important Conversation')}</span>
              </button>
            </div>
            {conversations.length > 0 && (
              <div className="mt-4 max-w-xs mx-auto relative">
                <input
                  type="text"
                  value={listSearch}
                  onChange={(e) => setListSearch(e.target.value)}
                  placeholder={t('ابحث عن محادثة...', 'Search conversations...')}
                  className="w-full text-xs py-2 pl-8 pr-3 rounded-full bg-white/50 dark:bg-black/30 border border-neutral-300/40 focus:outline-none focus:border-rose-gold-400 font-medium"
                />
                <Search size={12} className="absolute left-3 top-2.5 text-neutral-400" />
              </div>
            )}
          </div>

          {filteredConversations.length === 0 ? (
            <div className="rounded-[36px] border border-dashed border-rose-gold-100 dark:border-rose-gold-950/40 p-12 text-center bg-white/20 dark:bg-black/10 max-w-md mx-auto">
              <MessageCircle className="text-rose-gold-300 mx-auto mb-3" size={44} />
              <p className="text-xs text-neutral-500 dark:text-neutral-400 px-6 font-medium leading-relaxed">
                {conversations.length === 0
                  ? t(
                      'مفيش محادثات محفوظة لسه. ابدأوا بإضافة أول محادثة مهمة بينكم! 💕',
                      'No saved conversations yet. Add your first important chat! 💕'
                    )
                  : t('لا توجد نتائج مطابقة للبحث.', 'No matching results.')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredConversations.map((conv) => {
                const cover = conversationCover(conv);
                return (
                  <div
                    key={conv.id}
                    className="rounded-[28px] glass border border-white/50 dark:border-white/10 shadow-lg overflow-hidden hover:scale-[1.02] transition-all duration-300 flex flex-col"
                  >
                    <div className="h-32 bg-gradient-to-br from-rose-gold-100 to-pink-100 dark:from-rose-gold-950/30 dark:to-pink-950/20 flex items-center justify-center relative overflow-hidden">
                      {cover ? (
                        <img src={cover} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="" />
                      ) : (
                        <span className="text-4xl">💬</span>
                      )}
                      <div className="absolute top-2 rtl:right-2 ltr:left-2 flex gap-1">
                        <button
                          onClick={() => openEditMeta(conv)}
                          className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all cursor-pointer"
                          title={t('تعديل بيانات المحادثة', 'Edit conversation info')}
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteConversation(conv)}
                          className="p-1.5 rounded-full bg-black/30 hover:bg-red-500/70 text-white transition-all cursor-pointer"
                          title={t('حذف المحادثة', 'Delete conversation')}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <h4 className="font-serif text-base font-bold text-neutral-900 dark:text-neutral-100 leading-snug line-clamp-2">
                        {conv.title}
                      </h4>
                      <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-gold-500/10 text-rose-gold-600 dark:text-rose-gold-400 font-bold">
                          📅 {conv.date}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-neutral-500/10 text-neutral-500 dark:text-neutral-400 font-bold">
                          💬 {conv.messages.length}
                        </span>
                        {conv.messages.some((m) => m.isImportant) && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-500 font-bold flex items-center gap-1">
                            <Star size={10} className="fill-amber-400 stroke-amber-400" />
                            {conv.messages.filter((m) => m.isImportant).length}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => openConversation(conv.id)}
                        className="mt-auto pt-3 w-full text-center text-xs font-bold text-rose-gold-600 dark:text-rose-gold-400 hover:text-rose-gold-700 bg-rose-gold-500/10 hover:bg-rose-gold-500/20 px-4 py-2.5 rounded-2xl transition-all cursor-pointer"
                      >
                        {t('فتح المحادثة 💌', 'Open Conversation 💌')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================== CREATE FLOW ===================== */}
      {viewMode === 'create' && (
        <div className="max-w-2xl mx-auto py-2 space-y-6">
          {/* Step indicator + back/cancel */}
          <div className="flex items-center justify-between">
            <button
              onClick={cancelCreateFlow}
              className="p-2 rounded-full hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 text-neutral-500 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
            <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {t('محادثة مهمة جديدة', 'New Important Conversation')} 💬
            </h3>
            <div className="w-8" />
          </div>

          {/* --- Step: meta (title/date/cover) --- */}
          {createStep === 'meta' && (
            <div className="rounded-[28px] glass border border-white/50 dark:border-white/10 shadow-lg p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-600 dark:text-neutral-300 block mb-1.5">
                  {t('عنوان المحادثة', 'Conversation Title')}
                </label>
                <input
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder={t('مثال: أول مرة قولنا بحبك', 'e.g. The first time we said "I love you"')}
                  className="w-full text-sm py-2.5 px-4 rounded-2xl bg-white/60 dark:bg-black/30 border border-neutral-300/40 focus:outline-none focus:border-rose-gold-400 font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-600 dark:text-neutral-300 block mb-1.5">
                  {t('تاريخ المحادثة', 'Conversation Date')}
                </label>
                <input
                  type="date"
                  value={draftDate}
                  onChange={(e) => setDraftDate(e.target.value)}
                  className="w-full text-sm py-2.5 px-4 rounded-2xl bg-white/60 dark:bg-black/30 border border-neutral-300/40 focus:outline-none focus:border-rose-gold-400 font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-600 dark:text-neutral-300 block mb-1.5">
                  {t('صورة غلاف (اختياري)', 'Cover Image (optional)')}
                </label>
                <div className="flex items-center gap-3">
                  {draftCover && (
                    <img src={draftCover} className="w-14 h-14 rounded-xl object-cover border border-neutral-200/50" alt="" />
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/60 dark:bg-black/30 border border-dashed border-neutral-300/60 text-xs font-bold text-neutral-500 cursor-pointer hover:border-rose-gold-400 transition-all">
                    <ImageIcon size={14} />
                    <span>{t('اختر صورة', 'Choose Image')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 8 * 1024 * 1024) {
                          alert(t('حجم الصورة كبير جداً.', 'Image is too large.'));
                          return;
                        }
                        setDraftCover(await readFileAsBase64(file));
                      }}
                    />
                  </label>
                  {draftCover && (
                    <button onClick={() => setDraftCover(undefined)} className="text-neutral-400 hover:text-red-500">
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={() => setCreateStep('method')}
                className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-rose-gold-500 to-pink-500 text-white font-bold text-sm shadow-md hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{t('التالي', 'Next')}</span>
                {lang === 'ar' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </button>
            </div>
          )}

          {/* --- Step: method choice --- */}
          {createStep === 'method' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setDraftMessages([makeEmptyDraft(currentUserRole, draftDate)]);
                  setCreateStep('manual');
                }}
                className="rounded-[28px] glass border border-white/50 dark:border-white/10 shadow-lg p-6 text-center hover:scale-[1.02] hover:border-rose-gold-300 transition-all cursor-pointer flex flex-col items-center gap-3"
              >
                <Edit2 className="text-rose-gold-500" size={32} />
                <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  {t('إدخال يدوي', 'Manual Entry')}
                </h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {t('أضف كل رسالة بنفسك وحدد صاحبها والوقت', 'Add each message yourself with sender and time')}
                </p>
              </button>
              <button
                onClick={() => setCreateStep('import-paste')}
                className="rounded-[28px] glass border border-white/50 dark:border-white/10 shadow-lg p-6 text-center hover:scale-[1.02] hover:border-rose-gold-300 transition-all cursor-pointer flex flex-col items-center gap-3"
              >
                <Upload className="text-rose-gold-500" size={32} />
                <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  {t('استيراد من واتساب', 'Import from WhatsApp')}
                </h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {t('الصق نص Export وهنرتبه تلقائياً', 'Paste an export and we\u2019ll organize it automatically')}
                </p>
              </button>
              <button
                onClick={() => setCreateStep('meta')}
                className="sm:col-span-2 text-xs font-bold text-neutral-400 hover:text-neutral-600 py-2 cursor-pointer"
              >
                {t('رجوع', 'Back')}
              </button>
            </div>
          )}

          {/* --- Step: manual entry --- */}
          {createStep === 'manual' && (
            <div className="space-y-4">
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {draftMessages.map((d, idx) => (
                  <div
                    key={d.tempId}
                    className="rounded-2xl glass border border-white/40 dark:border-white/10 p-3.5 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex rounded-full overflow-hidden border border-neutral-300/40 text-[11px] font-bold">
                        {(['Dodo', 'SO'] as const).map((role) => (
                          <button
                            key={role}
                            onClick={() => updateDraftRow(d.tempId, { sender: role })}
                            className={`px-3 py-1.5 transition-all cursor-pointer ${
                              d.sender === role
                                ? 'bg-rose-gold-500 text-white'
                                : 'bg-white/50 dark:bg-black/20 text-neutral-500'
                            }`}
                          >
                            {nameOf(role)}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveDraftRow(d.tempId, -1)}
                          disabled={idx === 0}
                          className="p-1 rounded-full text-neutral-400 hover:text-rose-gold-500 disabled:opacity-20 cursor-pointer"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          onClick={() => moveDraftRow(d.tempId, 1)}
                          disabled={idx === draftMessages.length - 1}
                          className="p-1 rounded-full text-neutral-400 hover:text-rose-gold-500 disabled:opacity-20 cursor-pointer"
                        >
                          <ChevronDown size={14} />
                        </button>
                        <button
                          onClick={() => updateDraftRow(d.tempId, { isImportant: !d.isImportant })}
                          className={`p-1.5 rounded-full transition-all cursor-pointer ${
                            d.isImportant ? 'text-amber-500' : 'text-neutral-300 hover:text-amber-400'
                          }`}
                          title={t('رسالة مهمة', 'Important message')}
                        >
                          <Star size={14} className={d.isImportant ? 'fill-amber-400' : ''} />
                        </button>
                        <button
                          onClick={() => removeDraftRow(d.tempId)}
                          className="p-1.5 rounded-full text-neutral-400 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={d.dateStr}
                        onChange={(e) => updateDraftRow(d.tempId, { dateStr: e.target.value })}
                        className="flex-1 text-[11px] py-1.5 px-2.5 rounded-xl bg-white/50 dark:bg-black/20 border border-neutral-300/30 focus:outline-none focus:border-rose-gold-400"
                      />
                      <input
                        type="time"
                        value={d.timeStr}
                        onChange={(e) => updateDraftRow(d.tempId, { timeStr: e.target.value })}
                        className="flex-1 text-[11px] py-1.5 px-2.5 rounded-xl bg-white/50 dark:bg-black/20 border border-neutral-300/30 focus:outline-none focus:border-rose-gold-400"
                      />
                    </div>

                    <textarea
                      value={d.text}
                      onChange={(e) => updateDraftRow(d.tempId, { text: e.target.value })}
                      placeholder={t('نص الرسالة...', 'Message text...')}
                      rows={2}
                      className="w-full text-xs py-2 px-3 rounded-xl bg-white/50 dark:bg-black/20 border border-neutral-300/30 focus:outline-none focus:border-rose-gold-400 resize-none"
                    />

                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/50 dark:bg-black/20 border border-neutral-300/30 text-[10px] font-bold text-neutral-500 cursor-pointer hover:border-rose-gold-400 transition-all">
                        <ImageIcon size={12} />
                        <span>{t('صورة', 'Image')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleDraftImageSelect(d.tempId, file);
                          }}
                        />
                      </label>
                      <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/50 dark:bg-black/20 border border-neutral-300/30 text-[10px] font-bold text-neutral-500 cursor-pointer hover:border-rose-gold-400 transition-all">
                        <Mic size={12} />
                        <span>{t('صوت', 'Voice')}</span>
                        <input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleDraftVoiceSelect(d.tempId, file);
                          }}
                        />
                      </label>
                      {d.mediaUrl && d.mediaType === 'image' && (
                        <div className="relative">
                          <img src={d.mediaUrl} className="w-10 h-10 rounded-lg object-cover" alt="" />
                          <button
                            onClick={() => updateDraftRow(d.tempId, { mediaUrl: undefined, mediaType: undefined })}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5"
                          >
                            <X size={8} />
                          </button>
                        </div>
                      )}
                      {d.mediaUrl && d.mediaType === 'voice' && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-full">
                          <Mic size={10} /> {d.voiceDuration || t('ملف صوتي', 'Audio file')}
                          <button
                            onClick={() => updateDraftRow(d.tempId, { mediaUrl: undefined, mediaType: undefined, voiceDuration: undefined })}
                            className="text-red-400 hover:text-red-600"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addDraftRow}
                className="w-full py-2.5 rounded-2xl border border-dashed border-rose-gold-300/60 text-rose-gold-500 font-bold text-xs hover:bg-rose-gold-50/40 dark:hover:bg-rose-gold-950/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus size={14} />
                {t('إضافة رسالة', 'Add Message')}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setCreateStep('method')}
                  className="flex-1 py-3 rounded-2xl bg-white/60 dark:bg-black/30 text-neutral-500 font-bold text-xs border border-neutral-300/40 cursor-pointer"
                >
                  {t('رجوع', 'Back')}
                </button>
                <button
                  onClick={finalizeManualSave}
                  disabled={draftMessages.length === 0}
                  className="flex-[2] py-3 rounded-2xl bg-gradient-to-r from-rose-gold-500 to-pink-500 text-white font-bold text-xs shadow-md hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save size={14} />
                  {t('حفظ المحادثة', 'Save Conversation')}
                </button>
              </div>
            </div>
          )}

          {/* --- Step: import - paste text --- */}
          {createStep === 'import-paste' && (
            <div className="space-y-4">
              <div className="rounded-[28px] glass border border-white/50 dark:border-white/10 shadow-lg p-5 space-y-3">
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {t(
                    'من واتساب: افتح المحادثة ← ⋮ ← المزيد ← تصدير محادثة ← بدون وسائط، ثم الصق النص هنا أو ارفع الملف الناتج.',
                    'In WhatsApp: open the chat → ⋮ → More → Export chat → without media, then paste the text here or upload the resulting file.'
                  )}
                </p>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={t(
                    '[20/8/2026, 10:42 PM] سعيد: انتي عارفة اني بحبك؟\n[20/8/2026, 10:43 PM] سهيلة: عارفة 🥹❤️',
                    '[8/20/2026, 10:42 PM] Saeed: Do you know I love you?\n[8/20/2026, 10:43 PM] Sohila: I know 🥹❤️'
                  )}
                  rows={8}
                  dir="auto"
                  className="w-full text-xs py-3 px-3.5 rounded-2xl bg-white/50 dark:bg-black/20 border border-neutral-300/30 focus:outline-none focus:border-rose-gold-400 resize-none font-mono"
                />
                <label className="flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-white/50 dark:bg-black/20 border border-dashed border-neutral-300/50 text-xs font-bold text-neutral-500 cursor-pointer hover:border-rose-gold-400 transition-all">
                  <FileText size={14} />
                  <span>{t('أو ارفع ملف .txt', 'Or upload a .txt file')}</span>
                  <input
                    type="file"
                    accept=".txt,text/plain"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImportFileSelect(file);
                    }}
                  />
                </label>
                {importError && (
                  <div className="flex items-center gap-2 text-[11px] text-red-500 font-bold bg-red-500/10 px-3 py-2 rounded-xl">
                    <AlertCircle size={13} />
                    <span>{importError}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCreateStep('method')}
                  className="flex-1 py-3 rounded-2xl bg-white/60 dark:bg-black/30 text-neutral-500 font-bold text-xs border border-neutral-300/40 cursor-pointer"
                >
                  {t('رجوع', 'Back')}
                </button>
                <button
                  onClick={runParse}
                  className="flex-[2] py-3 rounded-2xl bg-gradient-to-r from-rose-gold-500 to-pink-500 text-white font-bold text-xs shadow-md hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{t('متابعة ومعاينة', 'Continue & Review')}</span>
                  {lang === 'ar' ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                </button>
              </div>
            </div>
          )}

          {/* --- Step: import - review & sender mapping --- */}
          {createStep === 'import-review' && (
            <div className="space-y-4">
              <div className="rounded-[28px] glass border border-white/50 dark:border-white/10 shadow-lg p-4 space-y-3">
                <h4 className="text-xs font-bold text-neutral-600 dark:text-neutral-300">
                  {t('مين مين في المحادثة؟', 'Who is who in this chat?')}
                </h4>
                {detectedSenderNames.map((rawName) => (
                  <div key={rawName} className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-bold text-neutral-700 dark:text-neutral-200 truncate">{rawName}</span>
                    <select
                      value={senderMap[rawName] || currentUserRole}
                      onChange={(e) =>
                        setSenderMap((prev) => ({ ...prev, [rawName]: e.target.value as 'Dodo' | 'SO' }))
                      }
                      className="text-xs py-1.5 px-3 rounded-xl bg-white/60 dark:bg-black/30 border border-neutral-300/40 font-bold cursor-pointer"
                    >
                      <option value="Dodo">{nameOf('Dodo')}</option>
                      <option value="SO">{nameOf('SO')}</option>
                    </select>
                  </div>
                ))}
                <p className="text-[10px] text-neutral-400">
                  {t(
                    `تم التعرف على ${parsedRaw.length} رسالة. راجعهم تحت وعدّل أو احذف أي رسالة قبل الحفظ.`,
                    `${parsedRaw.length} messages recognized. Review below and edit or delete any message before saving.`
                  )}
                </p>
              </div>

              <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                {reviewMessages.map((d) => (
                  <div
                    key={d.tempId}
                    className="rounded-2xl glass border border-white/40 dark:border-white/10 p-3 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          d.sender === 'Dodo'
                            ? 'bg-blue-500/10 text-blue-500'
                            : 'bg-pink-500/10 text-pink-500'
                        }`}
                      >
                        {nameOf(d.sender)}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {d.dateStr} · {d.timeStr}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            setReviewMessages((prev) =>
                              prev.map((m) => (m.tempId === d.tempId ? { ...m, isImportant: !m.isImportant } : m))
                            )
                          }
                          className={`p-1 rounded-full cursor-pointer ${
                            d.isImportant ? 'text-amber-500' : 'text-neutral-300 hover:text-amber-400'
                          }`}
                        >
                          <Star size={13} className={d.isImportant ? 'fill-amber-400' : ''} />
                        </button>
                        <button
                          onClick={() => setReviewMessages((prev) => prev.filter((m) => m.tempId !== d.tempId))}
                          className="p-1 rounded-full text-neutral-400 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={d.text}
                      dir="auto"
                      onChange={(e) =>
                        setReviewMessages((prev) =>
                          prev.map((m) => (m.tempId === d.tempId ? { ...m, text: e.target.value } : m))
                        )
                      }
                      rows={1}
                      className="w-full text-xs py-1.5 px-2.5 rounded-lg bg-white/50 dark:bg-black/20 border border-neutral-300/20 focus:outline-none focus:border-rose-gold-400 resize-none"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCreateStep('import-paste')}
                  className="flex-1 py-3 rounded-2xl bg-white/60 dark:bg-black/30 text-neutral-500 font-bold text-xs border border-neutral-300/40 cursor-pointer"
                >
                  {t('رجوع', 'Back')}
                </button>
                <button
                  onClick={finalizeImportSave}
                  disabled={reviewMessages.length === 0}
                  className="flex-[2] py-3 rounded-2xl bg-gradient-to-r from-rose-gold-500 to-pink-500 text-white font-bold text-xs shadow-md hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save size={14} />
                  {t('حفظ المحادثة', 'Save Conversation')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== DETAIL VIEW (WhatsApp-style) ===================== */}
      {viewMode === 'detail' && selectedConversation && (
        <div className="flex flex-col h-[calc(100vh-140px)] max-w-3xl mx-auto rounded-[36px] glass border border-white/20 dark:border-white/5 overflow-hidden shadow-xl relative">
          {/* Header */}
          <div className="p-4 border-b border-white/20 dark:border-neutral-900 bg-white/40 dark:bg-black/20 backdrop-blur-md flex justify-between items-center z-10 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={backToList}
                className="p-2 rounded-full hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 text-neutral-500 transition-all cursor-pointer shrink-0"
              >
                {lang === 'ar' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              </button>
              <div className="min-w-0">
                <h4 className="font-serif text-sm font-bold text-neutral-900 dark:text-neutral-50 truncate">
                  {selectedConversation.title}
                </h4>
                <p className="text-[10px] text-neutral-400 font-semibold">
                  {t('سعيد', 'Saeed')} ❤️ {t('سهيلة', 'Sohila')} · {selectedConversation.messages.length} {t('رسالة', 'messages')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setShowImportantOnly((v) => !v)}
                className={`p-2 rounded-full transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold ${
                  showImportantOnly
                    ? 'bg-amber-400/20 text-amber-500'
                    : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 text-neutral-400'
                }`}
                title={t('الرسائل المهمة', 'Important messages')}
              >
                <Star size={16} className={showImportantOnly ? 'fill-amber-400' : ''} />
              </button>
              <button
                onClick={() => openEditMeta(selectedConversation)}
                className="p-2 rounded-full hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 text-neutral-400 transition-all cursor-pointer"
              >
                <Edit2 size={15} />
              </button>
              <button
                onClick={() => handleDeleteConversation(selectedConversation)}
                className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-950/40 text-neutral-400 hover:text-red-500 transition-all cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Important-only filtered list */}
          {showImportantOnly ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white/5 dark:bg-black/10">
              <p className="text-[10px] uppercase tracking-wider font-mono font-bold text-amber-500 mb-2">
                ⭐ {t('الرسائل المهمة', 'Important Messages')} ({importantMessages.length})
              </p>
              {importantMessages.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-8">
                  {t('لسه معلمتوش أي رسالة كمهمة ⭐', 'No messages starred as important yet ⭐')}
                </p>
              ) : (
                importantMessages.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleScrollToMessage(m.id)}
                    className="w-full text-start p-3 rounded-2xl bg-amber-400/5 hover:bg-amber-400/10 border border-amber-400/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">{nameOf(m.sender)}</span>
                      <span className="text-[9px] font-mono text-neutral-400">
                        {new Date(m.timestamp).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 truncate">
                      {m.text || `[${m.mediaType}]`}
                    </p>
                  </button>
                ))
              )}
            </div>
          ) : (
            /* Full chat view */
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/5 dark:bg-black/10">
              {detailMessagesSorted.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center p-8 text-neutral-400">
                  <div className="text-4xl mb-2">💌</div>
                  <p className="text-xs font-medium">
                    {t('لسه مفيش رسائل في المحادثة دي. أضف أول رسالة تحت 👇', 'No messages yet. Add the first one below 👇')}
                  </p>
                </div>
              ) : (
                groupedByDay.map((group) => (
                  <div key={group.dateKey} className="space-y-4">
                    <div className="flex justify-center">
                      <span className="text-[10px] font-bold text-neutral-500 bg-white/60 dark:bg-black/30 px-3 py-1 rounded-full shadow-sm">
                        {formatDateLabel(group.dateKey)}
                      </span>
                    </div>
                    {group.msgs.map((msg) => {
                      const isMe = msg.sender === currentUserRole;
                      const isEditing = editingMessageId === msg.id;
                      return (
                        <div
                          key={msg.id}
                          id={`chatmem-msg-${msg.id}`}
                          className={`flex flex-col max-w-[80%] ${
                            isMe ? 'self-end ml-auto rtl:mr-auto rtl:ml-0' : 'self-start mr-auto rtl:ml-auto rtl:mr-0'
                          }`}
                        >
                          {isEditing && editingMessageDraft ? (
                            <div className="rounded-2xl p-3 bg-white/80 dark:bg-neutral-900/80 border border-rose-gold-300 space-y-2 min-w-[220px]">
                              <div className="flex gap-2">
                                <input
                                  type="date"
                                  value={editingMessageDraft.dateStr}
                                  onChange={(e) =>
                                    setEditingMessageDraft((p) => (p ? { ...p, dateStr: e.target.value } : p))
                                  }
                                  className="flex-1 text-[10px] py-1 px-2 rounded-lg bg-white/60 dark:bg-black/30 border border-neutral-300/30"
                                />
                                <input
                                  type="time"
                                  value={editingMessageDraft.timeStr}
                                  onChange={(e) =>
                                    setEditingMessageDraft((p) => (p ? { ...p, timeStr: e.target.value } : p))
                                  }
                                  className="flex-1 text-[10px] py-1 px-2 rounded-lg bg-white/60 dark:bg-black/30 border border-neutral-300/30"
                                />
                              </div>
                              <textarea
                                value={editingMessageDraft.text}
                                dir="auto"
                                onChange={(e) =>
                                  setEditingMessageDraft((p) => (p ? { ...p, text: e.target.value } : p))
                                }
                                rows={2}
                                className="w-full text-xs py-1.5 px-2.5 rounded-lg bg-white/60 dark:bg-black/30 border border-neutral-300/30 resize-none"
                              />
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingMessageId(null);
                                    setEditingMessageDraft(null);
                                  }}
                                  className="flex-1 text-[10px] font-bold py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
                                >
                                  {t('إلغاء', 'Cancel')}
                                </button>
                                <button
                                  onClick={saveEditMessage}
                                  className="flex-1 text-[10px] font-bold py-1.5 rounded-lg bg-rose-gold-500 text-white flex items-center justify-center gap-1"
                                >
                                  <Check size={11} /> {t('حفظ', 'Save')}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="group relative flex items-center gap-1.5">
                              {!isMe && (
                                <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                  <MsgActionButtons
                                    msg={msg}
                                    onStar={() => toggleImportant(msg.id)}
                                    onEdit={() => startEditMessage(msg)}
                                    onDelete={() => deleteMessage(msg.id)}
                                  />
                                </div>
                              )}
                              <div
                                className={`rounded-3xl p-3.5 shadow-sm relative ${
                                  isMe
                                    ? 'bg-rose-gold-500 text-white rounded-tr-none'
                                    : 'bg-white/80 dark:bg-neutral-900/80 text-neutral-900 dark:text-neutral-100 rounded-tl-none border border-white/20 dark:border-white/5'
                                }`}
                              >
                                {msg.isImportant && (
                                  <span className="absolute -top-2 -right-2 bg-amber-400 text-white rounded-full p-1 shadow">
                                    <Star size={9} className="fill-white" />
                                  </span>
                                )}
                                {msg.mediaType === 'image' && msg.mediaUrl && (
                                  <div className="mb-2 rounded-2xl overflow-hidden max-w-xs max-h-60 border border-white/10">
                                    <img src={msg.mediaUrl} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="" />
                                  </div>
                                )}
                                {msg.mediaType === 'video' && msg.mediaUrl && (
                                  <div className="mb-2 rounded-2xl overflow-hidden max-w-xs border border-white/10">
                                    <video src={msg.mediaUrl} controls playsInline className="w-full max-h-60 rounded-xl" />
                                  </div>
                                )}
                                {msg.mediaType === 'voice' && msg.mediaUrl && (
                                  <div className="mb-2 flex items-center gap-2 min-w-[200px] py-1">
                                    <audio src={msg.mediaUrl} controls className="w-full max-h-12 scale-90 origin-left" />
                                    <span className="text-[10px] font-mono font-bold whitespace-nowrap opacity-70">
                                      🎙️ {msg.voiceDuration || '0:00'}
                                    </span>
                                  </div>
                                )}
                                {msg.text && (
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap" dir="auto">
                                    {msg.text}
                                  </p>
                                )}
                                <p
                                  className={`text-[9px] font-mono mt-1.5 text-right rtl:text-left ${
                                    isMe ? 'text-white/70' : 'text-neutral-400'
                                  }`}
                                >
                                  {new Date(msg.timestamp).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              {isMe && (
                                <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                  <MsgActionButtons
                                    msg={msg}
                                    onStar={() => toggleImportant(msg.id)}
                                    onEdit={() => startEditMessage(msg)}
                                    onDelete={() => deleteMessage(msg.id)}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Composer: add a new (historical) message to this saved conversation */}
          <div className="p-3 border-t border-white/20 dark:border-neutral-900 bg-white/40 dark:bg-black/20 backdrop-blur-md shrink-0 space-y-2">
            {composerOpen && (
              <div className="flex gap-2 items-center">
                <div className="flex rounded-full overflow-hidden border border-neutral-300/40 text-[10px] font-bold shrink-0">
                  {(['Dodo', 'SO'] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => setComposerDraft((p) => ({ ...p, sender: role }))}
                      className={`px-2.5 py-1.5 transition-all cursor-pointer ${
                        composerDraft.sender === role ? 'bg-rose-gold-500 text-white' : 'bg-white/50 dark:bg-black/20 text-neutral-500'
                      }`}
                    >
                      {nameOf(role)}
                    </button>
                  ))}
                </div>
                <input
                  type="date"
                  value={composerDraft.dateStr}
                  onChange={(e) => setComposerDraft((p) => ({ ...p, dateStr: e.target.value }))}
                  className="text-[10px] py-1.5 px-2 rounded-xl bg-white/50 dark:bg-black/20 border border-neutral-300/30 shrink-0"
                />
                <input
                  type="time"
                  value={composerDraft.timeStr}
                  onChange={(e) => setComposerDraft((p) => ({ ...p, timeStr: e.target.value }))}
                  className="text-[10px] py-1.5 px-2 rounded-xl bg-white/50 dark:bg-black/20 border border-neutral-300/30 shrink-0"
                />
                <label className="p-1.5 rounded-full bg-white/50 dark:bg-black/20 border border-neutral-300/30 text-neutral-400 cursor-pointer hover:text-rose-gold-500 shrink-0">
                  <ImageIcon size={13} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 8 * 1024 * 1024) {
                        alert(t('حجم الصورة كبير جداً.', 'Image is too large.'));
                        return;
                      }
                      setComposerDraft((p) => ({ ...p, mediaUrl: undefined, mediaType: undefined }));
                      const b64 = await readFileAsBase64(file);
                      setComposerDraft((p) => ({ ...p, mediaUrl: b64, mediaType: 'image' }));
                    }}
                  />
                </label>
                <button
                  onClick={() => setComposerDraft((p) => ({ ...p, isImportant: !p.isImportant }))}
                  className={`p-1.5 rounded-full shrink-0 cursor-pointer ${
                    composerDraft.isImportant ? 'text-amber-500' : 'text-neutral-300 hover:text-amber-400'
                  }`}
                >
                  <Star size={14} className={composerDraft.isImportant ? 'fill-amber-400' : ''} />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setComposerOpen((v) => !v)}
                className="p-2.5 rounded-full bg-white/60 dark:bg-black/30 text-neutral-400 hover:text-rose-gold-500 transition-all cursor-pointer shrink-0"
                title={t('خيارات إضافية', 'More options')}
              >
                <Plus size={16} className={composerOpen ? 'rotate-45 transition-transform' : 'transition-transform'} />
              </button>
              <input
                type="text"
                value={composerDraft.text}
                dir="auto"
                onChange={(e) => setComposerDraft((p) => ({ ...p, text: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitComposer();
                }}
                placeholder={t('أضف رسالة لهذه المحادثة...', 'Add a message to this conversation...')}
                className="flex-1 text-sm py-2.5 px-4 rounded-full bg-white/60 dark:bg-black/30 border border-neutral-300/40 focus:outline-none focus:border-rose-gold-400"
              />
              <button
                onClick={submitComposer}
                className="p-2.5 rounded-full bg-rose-gold-500 hover:bg-rose-gold-600 text-white transition-all cursor-pointer shrink-0"
              >
                <Save size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== EDIT CONVERSATION META MODAL ===================== */}
      <AnimatePresence>
        {editMetaConv && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setEditMetaConv(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-[28px] glass border border-white/50 dark:border-white/10 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {t('تعديل بيانات المحادثة', 'Edit Conversation Info')}
                </h4>
                <button onClick={() => setEditMetaConv(null)} className="text-neutral-400 hover:text-neutral-600 cursor-pointer">
                  <X size={16} />
                </button>
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-600 dark:text-neutral-300 block mb-1.5">
                  {t('العنوان', 'Title')}
                </label>
                <input
                  type="text"
                  value={editMetaTitle}
                  onChange={(e) => setEditMetaTitle(e.target.value)}
                  className="w-full text-sm py-2 px-3.5 rounded-2xl bg-white/60 dark:bg-black/30 border border-neutral-300/40 focus:outline-none focus:border-rose-gold-400 font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-600 dark:text-neutral-300 block mb-1.5">
                  {t('التاريخ', 'Date')}
                </label>
                <input
                  type="date"
                  value={editMetaDate}
                  onChange={(e) => setEditMetaDate(e.target.value)}
                  className="w-full text-sm py-2 px-3.5 rounded-2xl bg-white/60 dark:bg-black/30 border border-neutral-300/40 focus:outline-none focus:border-rose-gold-400 font-medium"
                />
              </div>
              <div className="flex items-center gap-3">
                {editMetaCover && (
                  <img src={editMetaCover} className="w-12 h-12 rounded-xl object-cover border border-neutral-200/50" alt="" />
                )}
                <label className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/60 dark:bg-black/30 border border-dashed border-neutral-300/60 text-xs font-bold text-neutral-500 cursor-pointer hover:border-rose-gold-400 transition-all">
                  <ImageIcon size={13} />
                  <span>{t('تغيير الغلاف', 'Change Cover')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setEditMetaCover(await readFileAsBase64(file));
                    }}
                  />
                </label>
              </div>
              <button
                onClick={saveEditMeta}
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-rose-gold-500 to-pink-500 text-white font-bold text-xs shadow-md hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Save size={14} />
                {t('حفظ التعديلات', 'Save Changes')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Small helper: hover action buttons shown next to a message bubble in the detail view
function MsgActionButtons({
  msg,
  onStar,
  onEdit,
  onDelete
}: {
  msg: ChatMemoryMessage;
  onStar: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <>
      <button
        onClick={onStar}
        className={`p-1.5 rounded-full hover:bg-amber-100 dark:hover:bg-amber-950/30 transition-all cursor-pointer ${
          msg.isImportant ? 'text-amber-500' : 'text-neutral-400 hover:text-amber-500'
        }`}
        title={msg.isImportant ? 'إلغاء التمييز' : 'تمييز كمهمة'}
      >
        <Star size={13} className={msg.isImportant ? 'fill-amber-400' : ''} />
      </button>
      <button
        onClick={onEdit}
        className="p-1.5 rounded-full hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 text-neutral-400 hover:text-rose-gold-500 transition-all cursor-pointer"
        title="تعديل"
      >
        <Edit2 size={13} />
      </button>
      <button
        onClick={onDelete}
        className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-950/40 text-neutral-400 hover:text-red-500 transition-all cursor-pointer"
        title="حذف"
      >
        <Trash2 size={13} />
      </button>
    </>
  );
}

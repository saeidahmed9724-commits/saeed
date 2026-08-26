import React, { useState, useEffect } from 'react';
import { HelpCircle, Check, EyeOff, Sparkles, Edit3 } from 'lucide-react';
import { Language, DailyQuestion, UserRole } from '../types';
import { DataStore } from '../dataStore';
import { translations } from '../translations';

interface DailyQuestionProps {
  lang: Language;
  currentUserRole: UserRole;
  initialQuestionId?: string | null;
}

export default function DailyQuestionSection({ lang, currentUserRole, initialQuestionId }: DailyQuestionProps) {
  const t = translations[lang];
  
  // States
  const [questions, setQuestions] = useState<DailyQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<DailyQuestion | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [serverAnswers, setServerAnswers] = useState<any>(null);

  const partnerRole: UserRole = currentUserRole === 'Dodo' ? 'SO' : 'Dodo';
  const myName = currentUserRole === 'Dodo' ? (lang === 'ar' ? 'سعيد' : 'Saeed') : (lang === 'ar' ? 'سهيلة' : 'Sohila');
  const partnerName = currentUserRole === 'Dodo' ? (lang === 'ar' ? 'سهيلة' : 'Sohila') : (lang === 'ar' ? 'سعيد' : 'Saeed');

  // WhatsApp helper sending to partner
  const getWhatsAppUrl = (text: string) => {
    if (!currentQuestion) return '';
    const questionText = lang === 'ar' ? currentQuestion.questionAr : currentQuestion.questionEn;
    const partnerPhone = currentUserRole === 'Dodo' ? '201210834803' : '201225854231';
    
    const formattedMsg = lang === 'ar'
      ? `*سؤال اليوم:* ${questionText}\n*إجابة ${myName}:* ${text}`
      : `*Daily Question:* ${questionText}\n*${myName}'s Answer:* ${text}`;
      
    return `https://wa.me/${partnerPhone}?text=${encodeURIComponent(formattedMsg)}`;
  };

  useEffect(() => {
    // Load question database
    const loadQuestions = () => {
      const allQuestions = DataStore.getDailyQuestions();
      setQuestions(allQuestions);

      if (allQuestions.length > 0) {
        if (initialQuestionId) {
          const found = allQuestions.find((q) => q.id === initialQuestionId);
          if (found) {
            setCurrentQuestion(found);
            return;
          }
        }
        if (!currentQuestion) {
          const randomIndex = Math.floor(Math.random() * allQuestions.length);
          setCurrentQuestion(allQuestions[randomIndex]);
        } else {
          // Refresh current question with updated answers if available
          const updatedCurrent = allQuestions.find((q) => q.id === currentQuestion.id);
          if (updatedCurrent) {
            setCurrentQuestion(updatedCurrent);
          }
        }
      } else {
        setCurrentQuestion(null);
      }
    };

    loadQuestions();
    window.addEventListener('datastore_synced', loadQuestions);
    return () => window.removeEventListener('datastore_synced', loadQuestions);
  }, [initialQuestionId]);

  // Poll for real-time live answers to connect partner's devices instantly
  useEffect(() => {
    const fetchAnswers = async () => {
      if (!currentQuestion) return;
      try {
        const res = await fetch('/api/interaction-state');
        if (res.ok) {
          const data = await res.json();
          if (data.loveQuizAnswers && data.loveQuizAnswers[currentQuestion.id]) {
            setServerAnswers(data.loveQuizAnswers[currentQuestion.id]);
          } else {
            setServerAnswers(null);
          }
        }
      } catch (err) {
        console.log('Error fetching daily question state:', err);
      }
    };

    fetchAnswers();
    const interval = setInterval(fetchAnswers, 3000);
    return () => clearInterval(interval);
  }, [currentQuestion]);

  const handleRandomQuestion = (allQs: DailyQuestion[] = questions) => {
    if (allQs.length === 0) return;
    const randomIndex = Math.floor(Math.random() * allQs.length);
    setCurrentQuestion(allQs[randomIndex]);
    setServerAnswers(null);
    setIsEditing(false);
  };

  const finalDodoAnswer = serverAnswers?.dodoAnswer || currentQuestion?.answerDodo;
  const finalSOAnswer = serverAnswers?.soAnswer || currentQuestion?.answerSO;

  const myAnswer = currentUserRole === 'Dodo' ? finalDodoAnswer : finalSOAnswer;
  const partnerAnswer = currentUserRole === 'Dodo' ? finalSOAnswer : finalDodoAnswer;
  const isRevealed = !!(myAnswer && partnerAnswer);

  // Sync answer text and submission state when currentQuestion or serverAnswers change
  useEffect(() => {
    if (currentQuestion) {
      const serverDodo = serverAnswers?.dodoAnswer;
      const serverSO = serverAnswers?.soAnswer;

      const currentMyAns = currentUserRole === 'Dodo'
        ? (serverDodo || currentQuestion.answerDodo)
        : (serverSO || currentQuestion.answerSO);

      if (currentMyAns) {
        setAnswerText(currentMyAns);
        setHasSubmitted(true);
      } else {
        setAnswerText('');
        setHasSubmitted(false);
      }
    } else {
      setAnswerText('');
      setHasSubmitted(false);
    }
  }, [currentQuestion, currentUserRole, serverAnswers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion || !answerText.trim()) return;

    // Build updated question for local store
    const updatedQ: DailyQuestion = {
      ...currentQuestion,
      answerDodo: currentUserRole === 'Dodo' ? answerText.trim() : currentQuestion.answerDodo,
      answerSO: currentUserRole === 'SO' ? answerText.trim() : currentQuestion.answerSO
    };

    // Save back to DataStore
    const allQuestions = DataStore.getDailyQuestions();
    const index = allQuestions.findIndex((q) => q.id === currentQuestion.id);
    if (index !== -1) {
      allQuestions[index] = updatedQ;
    } else {
      allQuestions.push(updatedQ);
    }
    
    DataStore.saveDailyQuestions(allQuestions);
    setQuestions(allQuestions);
    setCurrentQuestion(updatedQ);
    setHasSubmitted(true);
    setIsEditing(false);

    // Send answer to backend server for live partner connection
    fetch('/api/interaction-state/quiz-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId: currentQuestion.id,
        role: currentUserRole,
        answer: answerText.trim(),
        questionAr: currentQuestion.questionAr,
        questionEn: currentQuestion.questionEn
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.state?.loveQuizAnswers?.[currentQuestion.id]) {
        setServerAnswers(data.state.loveQuizAnswers[currentQuestion.id]);
      }
    })
    .catch(err => console.log('Error posting quiz answer:', err));

    // Send via WhatsApp if enabled
    if (sendWhatsApp) {
      const url = getWhatsAppUrl(answerText.trim());
      if (url) {
        window.open(url, '_blank');
      }
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-2">
      {!currentQuestion ? (
        // No Question State
        <div className="text-center py-6">
          <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
            {lang === 'ar' 
              ? 'لا توجد أسئلة مضافة بعد. أضف سؤال اليوم في إعدادات قبو الحب بالأسفل!'
              : 'No daily questions added yet. Add today\'s question inside the Love Vault Settings below!'}
          </p>
        </div>
      ) : (
        <div>
          {/* Random Question Header & Trigger */}
          <div className="flex flex-col items-center justify-center gap-2 mb-5 select-none">
            <span className="text-[10px] font-bold text-rose-gold-500 uppercase tracking-widest block">
              {lang === 'ar' ? 'سؤال عشوائي' : 'Random Question'}
            </span>
            <button
              onClick={() => handleRandomQuestion()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-rose-gold-50/80 dark:bg-rose-gold-950/30 text-rose-gold-600 dark:text-rose-gold-300 hover:bg-rose-gold-100 dark:hover:bg-rose-gold-900/50 hover:scale-102 active:scale-98 transition-all duration-300 text-xs font-bold border border-rose-gold-200/40 dark:border-rose-gold-900/30 shadow-sm"
              title={lang === 'ar' ? 'سؤال عشوائي جديد' : 'New Random Question'}
            >
              <span>🎲</span>
              <span>{lang === 'ar' ? 'اختر سؤالاً عشوائياً جديداً' : 'Choose New Random Question'}</span>
            </button>
          </div>

          {/* Question Text */}
          <h4 className="font-serif text-lg md:text-xl font-bold text-center text-neutral-900 dark:text-neutral-50 mb-4 px-2 min-h-[3rem] flex items-center justify-center">
            {lang === 'ar' ? currentQuestion.questionAr : currentQuestion.questionEn}
          </h4>

          {/* Active User Badge */}
          <div className="text-center mb-5 px-3 py-2 rounded-xl bg-rose-gold-50 dark:bg-rose-gold-950/30 border border-rose-gold-200/50 text-xs font-bold text-rose-gold-600 dark:text-rose-gold-300 flex items-center justify-center gap-2">
            <span>👤</span>
            <span>
              {lang === 'ar'
                ? `مسجل باسم: ${myName} - قم بوضع إجابتك ليراها ${partnerName}`
                : `Logged in as: ${myName} - Submit your response to share with ${partnerName}`}
            </span>
          </div>

          {/* Logic Flow Content */}
          <div className="animate-fade-in">
            {isRevealed ? (
              /* Both have answered */
              <div className="space-y-4 animate-fade-in">
                <div className="text-center mb-2 flex items-center justify-center gap-1.5 text-rose-gold-500 font-bold text-xs uppercase tracking-widest font-serif">
                  <Sparkles size={14} />
                  {lang === 'ar' ? 'كلاكما أجاب على هذا السؤال! 🎉' : 'Both of you answered! 🎉'}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* My Answer */}
                  <div className="p-4 rounded-2xl bg-rose-gold-50/60 dark:bg-rose-gold-950/30 border border-rose-gold-200/50 dark:border-rose-gold-900/30 relative flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-rose-gold-600 dark:text-rose-gold-400 uppercase tracking-wider font-mono block mb-1">
                        {lang === 'ar' ? `إجابتك (${myName})` : `Your Answer (${myName})`}
                      </span>
                      <p className="text-sm text-neutral-800 dark:text-neutral-200 font-serif font-medium italic">
                        "{myAnswer}"
                      </p>
                    </div>
                  </div>

                  {/* Partner Answer */}
                  <div className="p-4 rounded-2xl bg-white/80 dark:bg-black/30 border border-neutral-200 dark:border-white/10 relative flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-rose-gold-500 dark:text-rose-gold-400 uppercase tracking-wider font-mono block mb-1">
                        {lang === 'ar' ? `إجابة ${partnerName}` : `${partnerName}'s Answer`}
                      </span>
                      <p className="text-sm text-neutral-800 dark:text-neutral-200 font-serif font-medium italic">
                        "{partnerAnswer}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-rose-gold-600 dark:text-rose-gold-400 font-bold hover:underline cursor-pointer"
                  >
                    <Edit3 size={14} />
                    <span>{lang === 'ar' ? 'تعديل إجابتي' : 'Edit my answer'}</span>
                  </button>
                </div>
              </div>
            ) : hasSubmitted && !isEditing ? (
              /* I have answered, waiting for partner */
              <div className="p-6 rounded-2xl bg-rose-gold-50 dark:bg-rose-gold-950/20 border border-rose-gold-100 dark:border-rose-gold-900/30 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
                  <Check size={22} />
                </div>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">
                  {lang === 'ar' ? 'تم حفظ إجابتك بنجاح ✨' : 'Answer Saved Successfully ✨'}
                </p>
                <div className="my-3 p-3 bg-white/80 dark:bg-black/30 rounded-xl border border-rose-gold-200/50 max-w-sm w-full">
                  <span className="text-[10px] font-bold text-rose-gold-500 block mb-0.5">
                    {lang === 'ar' ? `إجابتك (${myName}):` : `Your Answer (${myName}):`}
                  </span>
                  <p className="text-xs font-medium italic text-neutral-700 dark:text-neutral-200">
                    "{myAnswer}"
                  </p>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                  {lang === 'ar'
                    ? `في انتظار إجابة ${partnerName} لكشف الإجابتين معاً!`
                    : `Waiting for ${partnerName}'s answer to reveal both together!`}
                </p>

                <div className="flex items-center gap-3 flex-wrap justify-center">
                  <a
                    href={getWhatsAppUrl(myAnswer)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba56] text-white text-xs font-bold shadow-md transition-all duration-300"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 1.981 14.117.954 11.487.955c-5.434 0-9.858 4.37-9.862 9.8-.001 1.761.464 3.481 1.347 5.018l-.995 3.637 3.73-.977zm11.367-6.525c-.321-.16-.1.897-.321-.16-.3-.15-1.77-.875-2.036-.972-.266-.097-.46-.145-.653.145-.193.29-.748.943-.917 1.137-.169.194-.338.218-.659.058-.321-.16-1.355-.5-2.581-1.593-.954-.852-1.6-1.904-1.787-2.227-.188-.323-.02-.497.14-.657.145-.143.32-.375.48-.563.16-.188.214-.323.32-.539.107-.216.054-.403-.027-.564-.08-.16-.653-1.573-.895-2.152-.236-.569-.475-.492-.653-.5-.169-.008-.362-.01-.555-.01s-.507.072-.772.361c-.266.29-1.013.991-1.013 2.415 0 1.424 1.037 2.796 1.182 2.99.145.193 2.04 3.115 4.94 4.373.689.3 1.228.48 1.648.614.693.22 1.324.19 1.823.115.556-.083 1.705-.697 1.946-1.371.24-.675.24-1.253.169-1.371-.071-.118-.266-.192-.587-.352z"/>
                    </svg>
                    {lang === 'ar' ? `إرسال الرد إلى ${partnerName} عبر الواتساب 💬` : `Send reply to ${partnerName} via WhatsApp 💬`}
                  </a>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold text-neutral-600 dark:text-neutral-300 transition-all cursor-pointer"
                  >
                    <Edit3 size={14} />
                    <span>{lang === 'ar' ? 'تعديل الإجابة' : 'Edit answer'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Write/Edit Answer Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {partnerAnswer && (
                  <div className="p-3 mb-3 text-center rounded-2xl bg-rose-gold-500/10 border border-rose-gold-500/20 text-rose-gold-600 dark:text-rose-gold-300 font-bold text-xs flex items-center justify-center gap-2 animate-pulse">
                    <span>🔓</span>
                    <span>
                      {lang === 'ar' 
                        ? `${partnerName} جاوب(ت) خلاص! اكتب إجابتك عشان الإجابات تظهر مع بعض!` 
                        : `${partnerName} has already answered! Respond now to reveal both answers!`}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    {lang === 'ar' ? `اكتب إجابتك يا ${myName} ✍️:` : `Write your answer, ${myName} ✍️:`}
                  </label>
                  <textarea
                    rows={3}
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder={t.yourAnswerPlaceholder}
                    required
                    className="w-full p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-rose-gold-500/20 text-sm font-medium text-neutral-800 dark:text-neutral-100"
                  />
                </div>
                
                <div className="flex items-center gap-2 px-1">
                  <label className="relative flex items-center gap-2.5 cursor-pointer select-none text-xs text-neutral-600 dark:text-neutral-300 font-semibold">
                    <input
                      type="checkbox"
                      checked={sendWhatsApp}
                      onChange={(e) => setSendWhatsApp(e.target.checked)}
                      className="rounded border-neutral-300 dark:border-neutral-700 text-rose-gold-500 focus:ring-rose-gold-500/20 h-4.5 w-4.5 accent-rose-gold-500"
                    />
                    <span>
                      {lang === 'ar' ? `إرسال الرد إلى ${partnerName} عبر الواتساب تلقائياً 💬` : `Send reply to ${partnerName} via WhatsApp automatically 💬`}
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-full bg-rose-gold-500 hover:bg-rose-gold-600 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer"
                  >
                    {t.submitAnswer}
                  </button>

                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-5 py-3 rounded-full border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer"
                    >
                      {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

